import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
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

    const totalRevenue = orders
      .filter((o) => o.paymentStatus === 'PAID')
      .reduce((sum, o) => sum + o.totalAmount, 0);

    const pendingCount = orders.filter((o) => o.paymentStatus === 'PENDING').length;
    const completedCount = orders.filter((o) => o.orderStatus === 'COMPLETED').length;

    const totalAvailableKeys = await prisma.licenseKey.count({
      where: { status: 'AVAILABLE' },
    });

    return NextResponse.json({
      orders,
      stats: {
        totalRevenue,
        totalOrders: orders.length,
        pendingCount,
        completedCount,
        totalAvailableKeys,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { orderId, action } = await request.json();

    if (!orderId || !action) {
      return NextResponse.json({ error: 'orderId and action are required' }, { status: 400 });
    }

    if (action === 'APPROVE') {
      // Find order and items
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { items: true },
      });

      if (!order) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }

      // Allocate keys
      const allocatedKeysList: Array<{ variantName: string; keyCode: string }> = [];

      await prisma.$transaction(async (tx) => {
        for (const item of order.items) {
          if (!item.variantId) continue;

          const availableKeys = await tx.licenseKey.findMany({
            where: {
              variantId: item.variantId,
              status: 'AVAILABLE',
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

          if (variant) {
            await tx.productVariant.update({
              where: { id: variant.id },
              data: {
                stock: Math.max(0, variant.stock - item.quantity),
              },
            });
          }
        }

        await tx.order.update({
          where: { id: order.id },
          data: {
            paymentStatus: 'PAID',
            orderStatus: 'COMPLETED',
            deliveredKeys: JSON.stringify(allocatedKeysList),
          },
        });
      });

      return NextResponse.json({ success: true, allocatedKeysList });
    }

    if (action === 'CANCEL') {
      await prisma.order.update({
        where: { id: orderId },
        data: {
          orderStatus: 'CANCELLED',
          paymentStatus: 'FAILED',
        },
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Admin order update error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

