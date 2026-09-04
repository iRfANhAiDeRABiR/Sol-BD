import React from 'react';
import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/admin-auth';
import prisma from '@/lib/prisma';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';

export const metadata = {
  title: 'Admin Control Center | SolutionsBD',
  description: 'Enterprise E-Commerce Management Suite',
};

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();

  if (!session) {
    redirect('/admin/login');
  }

  // Fetch live pending counts for badges
  const [pendingOrdersCount, pendingPaymentsCount] = await Promise.all([
    prisma.order.count({
      where: {
        orderStatus: { in: ['PENDING_PAYMENT', 'PAYMENT_SUBMITTED', 'PROCESSING'] },
      },
    }),
    prisma.payment.count({
      where: {
        paymentStatus: { in: ['PENDING', 'SUBMITTED'] },
      },
    }),
  ]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 flex">
      {/* Collapsible / Sticky Sidebar */}
      <AdminSidebar
        adminName={session.name}
        adminEmail={session.email}
        adminRole={session.role}
        pendingOrdersCount={pendingOrdersCount}
        pendingPaymentsCount={pendingPaymentsCount}
      />

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader
          adminName={session.name}
          pendingReviewsCount={pendingPaymentsCount}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}

