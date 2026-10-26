import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAdminSession } from '@/lib/admin-auth';
import { processTelegramOrderAction } from '@/lib/orderVerificationService';

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized. Admin session required.' }, { status: 401 });
    }

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
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized. Admin session required.' }, { status: 401 });
    }
    if (!['OWNER', 'ADMIN'].includes(session.role)) {
      return NextResponse.json({ error: 'Forbidden. Admin role required to approve or cancel orders.' }, { status: 403 });
    }

    const { orderId, action } = await request.json();

    if (!orderId || !action) {
      return NextResponse.json({ error: 'orderId and action are required' }, { status: 400 });
    }

    if (action === 'APPROVE') {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
      });

      if (!order) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }

      const result = await processTelegramOrderAction({
        orderNumber: order.orderNumber,
        action: 'CONFIRMED',
        adminName: session.name || session.email || 'Admin',
      });

      if (!result.success) {
        return NextResponse.json({ error: result.error || 'Failed to approve order' }, { status: 500 });
      }

      return NextResponse.json({ success: true, order: result.order });
    }

    if (action === 'CANCEL') {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
      });

      if (!order) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }

      const result = await processTelegramOrderAction({
        orderNumber: order.orderNumber,
        action: 'INVALID',
        adminName: session.name || session.email || 'Admin',
      });

      if (!result.success) {
        return NextResponse.json({ error: result.error || 'Failed to cancel order' }, { status: 500 });
      }

      return NextResponse.json({ success: true, order: result.order });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Admin order update error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

