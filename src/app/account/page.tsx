import React from 'react';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { getCustomerSession, clearCustomerSession } from '@/lib/customer-auth';
import CustomerDashboardClient from '@/components/account/CustomerDashboardClient';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'My Account & Licenses Vault | SolutionsBD',
  description: 'Manage your genuine software license keys, order tracking timeline, and profile.',
};

export default async function CustomerAccountPage() {
  const session = await getCustomerSession();

  if (!session) {
    redirect('/login?redirect=/account');
  }

  // Fetch complete user profile from database
  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      role: true,
      isActive: true,
      walletBalance: true,
      loyaltyPoints: true,
      createdAt: true,
    },
  });

  if (!user || user.isActive === false) {
    await clearCustomerSession();
    redirect('/login?suspended=1');
  }

  // Fetch all orders matching customer ID or customer email
  const orders = await prisma.order.findMany({
    where: {
      OR: [
        { userId: user.id },
        { customerEmail: user.email.toLowerCase() },
      ],
    },
    orderBy: { createdAt: 'desc' },
    include: {
      items: {
        include: {
          variant: {
            include: {
              product: {
                select: { id: true, title: true, slug: true, image: true },
              },
            },
          },
        },
      },
    },
  });

  return (
    <div className="min-h-screen py-6 sm:py-10">
      <CustomerDashboardClient
        initialUser={{
          ...user,
          createdAt: user.createdAt.toISOString(),
        }}
        initialOrders={orders.map((o) => ({
          ...o,
          createdAt: o.createdAt.toISOString(),
          updatedAt: o.updatedAt.toISOString(),
        }))}
      />
    </div>
  );
}
