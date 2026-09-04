import React from 'react';
import prisma from '@/lib/prisma';
import CustomerCRMClient from '@/components/admin/CustomerCRMClient';
import { Users } from 'lucide-react';
import { getAdminSession } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export default async function AdminCustomersPage() {
  const [session, users, orders, subscribers] = await Promise.all([
    getAdminSession(),
    prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        orders: {
          orderBy: { createdAt: 'desc' },
          include: {
            items: true,
            payments: true,
          },
        },
      },
    }),
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
              User Control & CRM Suite
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
            Users, Customers & Audience
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Supervise all registered user activities, order histories, license delivery records, and toggle account access/suspension.
          </p>
        </div>
      </div>

      <CustomerCRMClient
        currentAdminId={session?.id}
        initialUsers={users}
        customers={customersList}
        initialSubscribers={subscribers}
      />
    </div>
  );
}


