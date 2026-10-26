import prisma from "@/lib/prisma";
import { sendOrderStatusEmail, type OrderStatusAction, type DeliveredKeyInfo } from "@/lib/orderStatusEmail";

export interface ProcessTelegramOrderActionResult {
  success: boolean;
  orderNumber: string;
  action: OrderStatusAction;
  order?: any;
  alreadyProcessed?: boolean;
  emailSent?: boolean;
  error?: string;
}

export async function processTelegramOrderAction({
  orderNumber,
  action,
  adminName = "Telegram Bot / Admin",
}: {
  orderNumber: string;
  action: OrderStatusAction;
  adminName?: string;
}): Promise<ProcessTelegramOrderActionResult> {
  try {
    const cleanRef = orderNumber.trim();

    // 1. Fetch current order with items and payments
    const existingOrder = await prisma.order.findUnique({
      where: { orderNumber: cleanRef },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: true,
              },
            },
          },
        },
        payments: true,
      },
    });

    if (!existingOrder) {
      console.warn(`[processTelegramOrderAction] Order #${cleanRef} not found.`);
      return { success: false, orderNumber: cleanRef, action, error: "Order not found" };
    }

    const wasAlreadyConfirmed =
      existingOrder.orderStatus === "COMPLETED" &&
      existingOrder.paymentStatus === "PAID";

    const wasAlreadyInvalid =
      existingOrder.paymentStatus === "FAILED" ||
      existingOrder.orderStatus === "CANCELLED";

    let updatedOrder;
    let allocatedKeysList: DeliveredKeyInfo[] = [];

    // Parse existing keys if any
    try {
      if (existingOrder.deliveredKeys) {
        const parsed = JSON.parse(existingOrder.deliveredKeys);
        if (Array.isArray(parsed) && parsed.length > 0) {
          allocatedKeysList = parsed;
        }
      }
    } catch {
      // Ignore
    }

    if (action === "CONFIRMED") {
      await prisma.$transaction(async (tx) => {
        // If keys haven't been allocated yet, allocate them
        if (allocatedKeysList.length === 0) {
          for (const item of existingOrder.items) {
            if (!item.variantId) continue;

            const availableKeys = await tx.licenseKey.findMany({
              where: {
                variantId: item.variantId,
                status: "AVAILABLE",
              },
              take: item.quantity,
            });

            const variant = await tx.productVariant.findUnique({
              where: { id: item.variantId },
              include: { product: true },
            });

            for (const k of availableKeys) {
              await tx.licenseKey.update({
                where: { id: k.id },
                data: {
                  status: "SOLD",
                  orderId: existingOrder.id,
                  soldAt: new Date(),
                },
              });

              allocatedKeysList.push({
                variantName: `${variant?.product.title || "Software"} (${variant?.name || "Standard"})`,
                keyCode: k.keyCode,
              });
            }

            if (variant && availableKeys.length > 0) {
              await tx.productVariant.update({
                where: { id: variant.id },
                data: {
                  stock: Math.max(0, variant.stock - availableKeys.length),
                },
              });
            }
          }
        }

        // Update Order
        updatedOrder = await tx.order.update({
          where: { id: existingOrder.id },
          data: {
            orderStatus: "COMPLETED",
            paymentStatus: "PAID",
            deliveredKeys: JSON.stringify(allocatedKeysList),
          },
          include: {
            items: {
              include: {
                variant: {
                  include: {
                    product: true,
                  },
                },
              },
            },
            payments: true,
          },
        });

        // Update or create Payment
        if (existingOrder.payments.length > 0) {
          await tx.payment.updateMany({
            where: { orderId: existingOrder.id },
            data: {
              paymentStatus: "VERIFIED",
              verifiedAt: new Date(),
            },
          });
        } else {
          await tx.payment.create({
            data: {
              orderId: existingOrder.id,
              paymentMethod: existingOrder.paymentMethod,
              paymentStatus: "VERIFIED",
              amount: existingOrder.totalAmount,
              transactionId: existingOrder.paymentTrxId || "VERIFIED_MANUAL",
              senderPhone: existingOrder.senderPhone,
              verifiedAt: new Date(),
            },
          });
        }
      });
    } else {
      // INVALID / CANCELLED
      await prisma.$transaction(async (tx) => {
        updatedOrder = await tx.order.update({
          where: { id: existingOrder.id },
          data: {
            orderStatus: "CANCELLED",
            paymentStatus: "FAILED",
          },
          include: {
            items: {
              include: {
                variant: {
                  include: {
                    product: true,
                  },
                },
              },
            },
            payments: true,
          },
        });

        if (existingOrder.payments.length > 0) {
          await tx.payment.updateMany({
            where: { orderId: existingOrder.id },
            data: {
              paymentStatus: "REJECTED",
              rejectionReason: `Rejected as Invalid TrxID by ${adminName}`,
            },
          });
        } else {
          await tx.payment.create({
            data: {
              orderId: existingOrder.id,
              paymentMethod: existingOrder.paymentMethod,
              paymentStatus: "REJECTED",
              amount: existingOrder.totalAmount,
              transactionId: existingOrder.paymentTrxId || "INVALID",
              senderPhone: existingOrder.senderPhone,
              rejectionReason: `Rejected as Invalid TrxID by ${adminName}`,
            },
          });
        }
      });
    }

    const orderToUse = updatedOrder || existingOrder;

    // Send customer email notification
    let emailSent = false;
    if (orderToUse.customerEmail) {
      try {
        const emailRes = await sendOrderStatusEmail({
          order: {
            orderNumber: orderToUse.orderNumber,
            customerName: orderToUse.customerName,
            customerEmail: orderToUse.customerEmail,
            customerPhone: orderToUse.customerPhone,
            subtotal: orderToUse.totalAmount + (orderToUse.discountAmount || 0),
            discount: orderToUse.discountAmount || 0,
            total: orderToUse.totalAmount,
            deliveredKeys: orderToUse.deliveredKeys,
            items: orderToUse.items,
            payments: orderToUse.payments,
            paymentMethod: orderToUse.paymentMethod,
            paymentTrxId: orderToUse.paymentTrxId,
            senderPhone: orderToUse.senderPhone,
          },
          action,
          allocatedKeys: allocatedKeysList,
        });
        emailSent = emailRes.success;
        console.log(`[processTelegramOrderAction] Status email (${action}) result:`, emailRes);
      } catch (err) {
        console.error(`[processTelegramOrderAction] Error sending status email for #${cleanRef}:`, err);
      }
    }

    return {
      success: true,
      orderNumber: cleanRef,
      action,
      order: orderToUse,
      alreadyProcessed: action === "CONFIRMED" ? wasAlreadyConfirmed : wasAlreadyInvalid,
      emailSent,
    };
  } catch (err: any) {
    console.error(`[processTelegramOrderAction] Error processing order #${orderNumber}:`, err);
    return {
      success: false,
      orderNumber,
      action,
      error: err.message,
    };
  }
}

