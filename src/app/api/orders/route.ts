import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      customerName,
      customerEmail,
      customerPhone,
      items,
      paymentMethod,
      paymentTrxId,
      senderPhone,
      couponCode,
      discountAmount = 0,
      userId,
    } = body;

    if (!customerName || !customerEmail || !customerPhone || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Customer name, email, phone, and at least one item are required.' },
        { status: 400 }
      );
    }

    // Resolve userId if not provided by checking if customerEmail belongs to an existing user
    let effectiveUserId = userId || null;
    if (!effectiveUserId && customerEmail) {
      const existingUser = await prisma.user.findUnique({
        where: { email: customerEmail.trim().toLowerCase() },
        select: { id: true },
      });
      if (existingUser) {
        effectiveUserId = existingUser.id;
      }
    }

    // Generate unique order number (e.g. SBD-2026-7842)
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `SBD-2026-${randomSuffix}`;

    // Calculate subtotal
    const subtotal = items.reduce(
      (sum: number, i: any) => sum + i.unitPrice * i.quantity,
      0
    );
    const finalAmount = Math.max(0, subtotal - discountAmount);

    // Is this an automated instant payment? (bKash online gateway or wallet)
    const isInstantPayment = paymentMethod === 'BKASH_ONLINE';

    // Execute atomic transaction: Create Order + OrderItems + Allocate License Keys if paid
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create order
      const order = await tx.order.create({
        data: {
          orderNumber,
          userId: effectiveUserId,
          customerName,
          customerEmail,
          customerPhone,
          totalAmount: finalAmount,
          discountAmount,
          couponCode: couponCode || null,
          paymentStatus: isInstantPayment ? 'PAID' : 'PENDING',
          paymentMethod,
          paymentTrxId: paymentTrxId || (isInstantPayment ? `BKASH-TXN-${Date.now()}` : null),
          senderPhone: senderPhone || null,
          orderStatus: isInstantPayment ? 'COMPLETED' : 'PROCESSING',
          deliveredKeys: '[]',
        },
      });

      // 2. Create order items
      for (const item of items) {
        await tx.orderItem.create({
          data: {
            orderId: order.id,
            variantId: item.variantId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          },
        });
      }

      // 3. Allocate digital license keys if instant payment
      const allocatedKeysList: Array<{ variantName: string; keyCode: string }> = [];

      if (isInstantPayment) {
        for (const item of items) {
          // Fetch available keys from pool
          const availableKeys = await tx.licenseKey.findMany({
            where: {
              variantId: item.variantId,
              status: 'AVAILABLE',
            },
            take: item.quantity,
          });

          // Fetch variant name for nice label
          const variant = await tx.productVariant.findUnique({
            where: { id: item.variantId },
            include: { product: true },
          });

          for (const k of availableKeys) {
            await tx.licenseKey.update({
              where: { id: k.id },
              data: {
                status: 'SOLD',
                orderId: order.id,
                soldAt: new Date(),
              },
            });

            allocatedKeysList.push({
              variantName: `${variant?.product.title} (${variant?.name})`,
              keyCode: k.keyCode,
            });
          }

          // Decrement stock count
          if (variant) {
            await tx.productVariant.update({
              where: { id: variant.id },
              data: {
                stock: Math.max(0, variant.stock - item.quantity),
              },
            });
          }
        }

        // Update order with allocated keys
        await tx.order.update({
          where: { id: order.id },
          data: {
            deliveredKeys: JSON.stringify(allocatedKeysList),
          },
        });
      }

      return { order, allocatedKeysList };
    });

    return NextResponse.json({
      success: true,
      order: result.order,
      orderNumber: result.order.orderNumber,
      paymentStatus: result.order.paymentStatus,
      deliveredKeys: result.allocatedKeysList,
    });
  } catch (error: any) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process order.' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const orderNumber = searchParams.get('orderNumber');

    const where: any = {};
    if (orderNumber) where.orderNumber = orderNumber;
    if (email) where.customerEmail = email;

    const orders = await prisma.order.findMany({
      where,
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
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ orders });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch orders.' },
      { status: 500 }
    );
  }
}

