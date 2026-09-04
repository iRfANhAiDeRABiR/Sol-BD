import React from 'react';
import prisma from '@/lib/prisma';
import CustomerCRMClient from '@/components/admin/CustomerCRMClient';
import { Users } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminCustomersPage() {
  const [orders, subscribers] = await Promise.all([
    prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        customerEmail: true,
        customerName: true,
        customerPhone: true,
        totalAmount: true,
        paymentStatus: true,
        createdAt: true,
      },
    }),
    prisma.subscriber.findMany({
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  // Aggregate Customer LTV & order counts by email
  const customerMap = new Map<
    string,
    {
      email: string;
      name: string;
      phone: string;
      totalOrders: number;
      totalSpent: number;
      lastOrderDate: Date;
    }
  >();

  for (const o of orders) {
    const email = o.customerEmail.toLowerCase().trim();
    const existing = customerMap.get(email);

    if (existing) {
      existing.totalOrders += 1;
      if (o.paymentStatus === 'PAID') {
        existing.totalSpent += o.totalAmount;
      }
      if (new Date(o.createdAt) > new Date(existing.lastOrderDate)) {
        existing.lastOrderDate = o.createdAt;
      }
    } else {
      customerMap.set(email, {
        email,
        name: o.customerName,
        phone: o.customerPhone,
        totalOrders: 1,
        totalSpent: o.paymentStatus === 'PAID' ? o.totalAmount : 0,
        lastOrderDate: o.createdAt,
      });
    }
  }

  const customersList = Array.from(customerMap.values()).sort(
    (a, b) => b.totalSpent - a.totalSpent
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-teal-600 dark:text-teal-400 bg-teal-500/10 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              Customer Relationship & Audience
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
            Customer Directory & CRM
          </h1>
        </div>
      </div>

      <CustomerCRMClient
        customers={customersList}
        initialSubscribers={subscribers}
      />
    </div>
  );
}

