import React from 'react';
import prisma from '@/lib/prisma';
import OrdersTable from '@/components/admin/OrdersTable';
import { Package } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      items: true,
      payments: true,
    },
  });

  const formattedOrders = orders.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    customerName: o.customerName,
    customerEmail: o.customerEmail,
    customerPhone: o.customerPhone,
    totalAmount: o.totalAmount,
    paymentStatus: o.paymentStatus,
    paymentMethod: o.paymentMethod,
    paymentTrxId: o.paymentTrxId,
    senderPhone: o.senderPhone,
    orderStatus: o.orderStatus,
    createdAt: o.createdAt,
    itemsCount: o.items.length,
  }));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-violet-600 dark:text-violet-400 bg-violet-500/10 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5" />
              Orders & Fulfillments
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
            All Customer Orders ({orders.length})
          </h1>
        </div>
      </div>

      {/* Orders Filter & Table */}
      <OrdersTable initialOrders={formattedOrders} />
    </div>
  );
}

