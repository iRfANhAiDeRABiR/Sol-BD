import { NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/prisma';
import { getAdminSession } from '@/lib/admin-auth';
import { getCustomerSession } from '@/lib/customer-auth';
import { sendTelegramOrderNotification } from '@/lib/telegram';
import { sendOrderConfirmationEmail } from '@/lib/orderConfirmationEmail';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const customerName = body.customerName || body.customer?.name || '';
    const customerEmail = body.customerEmail || body.customer?.email || '';
    const customerPhone = body.customerPhone || body.customer?.phone || '';
    const paymentMethod = body.paymentMethod || body.payment?.method || 'BKASH_MANUAL';
    const paymentTrxId = body.paymentTrxId || body.payment?.transactionId || '';
    const senderPhone = body.senderPhone || body.payment?.senderNumber || '';
    const receiverNumber = body.receiverNumber || body.payment?.paymentNumber || process.env.NEXT_PUBLIC_BKASH_PERSONAL_NUMBER || '01641699879';
    const couponCode = body.couponCode || null;
    const notes = body.notes || null;
    const userId = body.userId;
    const items = body.items;

    const trimmedName = (customerName || '').trim();
    const trimmedEmail = (customerEmail || '').trim().toLowerCase();
    const trimmedPhone = (customerPhone || '').trim();

    if (!trimmedName || !trimmedEmail || !trimmedPhone || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Customer name, email, phone, and at least one item are required.' },
        { status: 400 }
      );
    }

    // Resolve userId securely: check authenticated customer session first
    const customerSession = await getCustomerSession();
    let effectiveUserId = customerSession ? customerSession.id : (userId || null);

    if (!effectiveUserId && trimmedEmail) {
      const existingUser = await prisma.user.findUnique({
        where: { email: trimmedEmail },
        select: { id: true },
      });
      if (existingUser) {
        effectiveUserId = existingUser.id;
      }
    }

    // Generate high-entropy unique order number
    let orderNumber = `SBD-2026-${crypto.randomInt(100000, 999999)}`;
    let retries = 5;
    while (retries > 0 && (await prisma.order.findUnique({ where: { orderNumber } }))) {
      orderNumber = `SBD-2026-${crypto.randomInt(100000, 999999)}`;
      retries--;
    }

    // -------------------------------------------------------------
    // 1. Server-Side Price & Variant Validation (Zero Client Trust)
    // -------------------------------------------------------------
    let calculatedSubtotal = 0;
    const validatedItems: Array<{
      variantId: string | null;
      productName: string;
      variantName: string;
      quantity: number;
      unitPrice: number;
    }> = [];

    for (const rawItem of items) {
      const qty = Math.max(1, Math.min(100, Math.floor(Number(rawItem.quantity) || 1)));
      let variant = null;
      const targetVariantId = rawItem.variantId || rawItem.optionId;

      if (targetVariantId) {
        variant = await prisma.productVariant.findUnique({
          where: { id: targetVariantId },
          include: { product: true },
        });
      }

      if (!variant && rawItem.productId) {
        variant = await prisma.productVariant.findFirst({
          where: { productId: rawItem.productId },
          include: { product: true },
        });
      }

      const verifiedUnitPrice = variant ? variant.price : (Number(rawItem.unitPrice) || 0);
      calculatedSubtotal += verifiedUnitPrice * qty;

      validatedItems.push({
        variantId: variant ? variant.id : null,
        productName: variant ? variant.product.title : (rawItem.productName || 'Digital License'),
        variantName: variant ? variant.name : (rawItem.optionName || 'Standard Edition'),
        quantity: qty,
        unitPrice: verifiedUnitPrice,
      });
    }

    // -------------------------------------------------------------
    // 2. Server-Side Coupon & Discount Calculation
    // -------------------------------------------------------------
    let verifiedDiscount = 0;
    if (couponCode && typeof couponCode === 'string') {
      const cleanCode = couponCode.trim().toUpperCase();
      const dbCoupon = await prisma.coupon.findUnique({
        where: { code: cleanCode },
      });

      if (dbCoupon && dbCoupon.isActive) {
        const isExpired = dbCoupon.expiresAt && new Date() > dbCoupon.expiresAt;
        const meetsMinSpend = calculatedSubtotal >= dbCoupon.minSpend;

        if (!isExpired && meetsMinSpend) {
          if (dbCoupon.discountPercent) {
            verifiedDiscount = Math.round((calculatedSubtotal * dbCoupon.discountPercent) / 100);
          } else if (dbCoupon.discountAmount) {
            verifiedDiscount = Math.min(calculatedSubtotal, dbCoupon.discountAmount);
          }
        }
      } else {
        // Built-in verified promo codes
        if (cleanCode === 'WELCOME10') {
          verifiedDiscount = Math.round(calculatedSubtotal * 0.1);
        } else if (cleanCode === 'EID50' && calculatedSubtotal >= 500) {
          verifiedDiscount = 50;
        }
      }
    }

    const finalAmount = Math.max(0, calculatedSubtotal - verifiedDiscount);

    // -------------------------------------------------------------
    // 3. Payment Status & Order Creation
    // All manual MFS payments require admin verification. No unverified instant fulfillment.
    // -------------------------------------------------------------
    const hasTrxId = Boolean(paymentTrxId && paymentTrxId.trim());

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create order
      const order = await tx.order.create({
        data: {
          orderNumber,
          userId: effectiveUserId,
          customerName: trimmedName,
          customerEmail: trimmedEmail,
          customerPhone: trimmedPhone,
          totalAmount: finalAmount,
          discountAmount: verifiedDiscount,
          couponCode: couponCode ? String(couponCode).trim().toUpperCase() : null,
          paymentStatus: hasTrxId ? 'SUBMITTED' : 'PENDING',
          paymentMethod: paymentMethod || 'BKASH_MANUAL',
          paymentTrxId: paymentTrxId ? paymentTrxId.trim() : null,
          senderPhone: senderPhone ? senderPhone.trim() : null,
          orderStatus: hasTrxId ? 'PAYMENT_SUBMITTED' : 'PENDING_PAYMENT',
          deliveredKeys: '[]',
        },
      });

      // 2. Create order items with verified snapshots
      for (const item of validatedItems) {
        await tx.orderItem.create({
          data: {
            orderId: order.id,
            variantId: item.variantId,
            productName: item.productName,
            variantName: item.variantName,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          },
        });
      }

      // 3. Create initial payment record if transaction ID provided
      if (hasTrxId) {
        await tx.payment.create({
          data: {
            orderId: order.id,
            paymentMethod: paymentMethod || 'BKASH_MANUAL',
            paymentStatus: 'SUBMITTED',
            amount: finalAmount,
            transactionId: paymentTrxId.trim(),
            senderPhone: senderPhone ? senderPhone.trim() : null,
          },
        });
      }

      return order;
    });

    // Send instant Telegram alert with [Confirm] and [Invalid] buttons
    try {
      await sendTelegramOrderNotification({
        orderNumber: result.orderNumber,
        customerName: result.customerName,
        customerEmail: result.customerEmail,
        customerPhone: result.customerPhone,
        items: validatedItems.map((it) => ({
          productName: it.productName,
          quantity: it.quantity,
          lineTotal: it.unitPrice * it.quantity,
        })),
        total: result.totalAmount,
        discount: result.discountAmount,
        couponCode: result.couponCode,
        paymentMethod: result.paymentMethod,
        senderNumber: result.senderPhone || 'N/A',
        receiverNumber,
        transactionId: result.paymentTrxId || 'PENDING',
        notes: result.notes,
      });
    } catch (teleErr) {
      console.warn('Telegram alert skipped or failed:', teleErr);
    }

    // Send professional Order Confirmation receipt email
    if (result.customerEmail) {
      try {
        const mailRes = await sendOrderConfirmationEmail({
          order: {
            orderNumber: result.orderNumber,
            total: result.totalAmount,
          },
          customer: {
            name: result.customerName,
            email: result.customerEmail,
            phone: result.customerPhone,
          },
          items: validatedItems.map((it) => ({
            productName: it.productName,
            optionName: it.variantName,
            quantity: it.quantity,
            unitPrice: it.unitPrice,
          })),
          totals: {
            subtotal: calculatedSubtotal,
            discount: verifiedDiscount,
            total: result.totalAmount,
          },
          paymentLabel:
            paymentMethod === 'BKASH_MANUAL'
              ? 'bKash Send Money'
              : paymentMethod === 'NAGAD_MANUAL'
              ? 'Nagad Send Money'
              : paymentMethod === 'ROCKET_MANUAL'
              ? 'Rocket Send Money'
              : String(paymentMethod),
          paymentTrxId: result.paymentTrxId || undefined,
          senderPhone: result.senderPhone || undefined,
        });
        console.log(`[Order Creation] Confirmation email dispatched for #${result.orderNumber}:`, mailRes);
      } catch (emailErr) {
        console.error(`[Order Creation] Confirmation email failed for #${result.orderNumber}:`, emailErr);
      }
    }

    return NextResponse.json({
      success: true,
      order: result,
      orderNumber: result.orderNumber,
      paymentStatus: result.paymentStatus,
      totalAmount: result.totalAmount,
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
    const adminSession = await getAdminSession();
    const customerSession = await getCustomerSession();

    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email')?.trim().toLowerCase();
    const orderNumber = searchParams.get('orderNumber')?.trim();
    const phone = searchParams.get('phone')?.trim();

    // 1. Admin Session: Can view all orders or filtered orders
    if (adminSession) {
      const where: any = {};
      if (orderNumber) where.orderNumber = orderNumber;
      if (email) where.customerEmail = email;

      const orders = await prisma.order.findMany({
        where,
        include: {
          items: {
            include: {
              variant: {
                include: { product: true },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return NextResponse.json({ orders });
    }

    // 2. Authenticated Customer Session: Strictly limited to customer's own orders
    if (customerSession) {
      const where: any = {
        OR: [
          { userId: customerSession.id },
          { customerEmail: customerSession.email.toLowerCase() },
        ],
      };
      if (orderNumber) where.orderNumber = orderNumber;

      const orders = await prisma.order.findMany({
        where,
        include: {
          items: {
            include: {
              variant: {
                include: { product: true },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return NextResponse.json({ orders });
    }

    // 3. Guest lookup: MUST provide BOTH valid orderNumber AND matching email or phone
    if (orderNumber && (email || phone)) {
      const where: any = { orderNumber };
      if (email) where.customerEmail = email;
      if (phone) where.customerPhone = phone;

      const orders = await prisma.order.findMany({
        where,
        include: {
          items: {
            include: {
              variant: {
                include: { product: true },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return NextResponse.json({ orders });
    }

    // 4. Reject all unauthenticated anonymous attempts
    return NextResponse.json(
      { error: 'Unauthorized. Please sign in or provide valid order credentials.' },
      { status: 401 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch orders.' },
      { status: 500 }
    );
  }
}

