import React from 'react';
import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import OrderDetailClient from '@/components/admin/OrderDetailClient';

export const dynamic = 'force-dynamic';

export default async function AdminOrderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const order = await prisma.order.findUnique({
    where: { id: params.id },
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
      payments: {
        include: {
          verifiedBy: true,
        },
      },
    },
  });

  if (!order) {
    notFound();
  }

  return <OrderDetailClient order={order} />;
}

