import React from 'react';
import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import OrderSuccessClientView from './OrderSuccessClientView';
import { OrderType } from '@/lib/types';
import type { Metadata } from 'next';

interface Props {
  params: {
    orderNumber: string;
  };
}

export const metadata: Metadata = {
  title: 'Order Confirmation | SolutionsBD',
  description: 'Your digital software order confirmation and instant license key delivery.',
};

export default async function OrderSuccessPage({ params }: Props) {
  const order = await prisma.order.findUnique({
    where: { orderNumber: params.orderNumber },
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
  });

  if (!order) {
    notFound();
  }

  return <OrderSuccessClientView order={order as unknown as OrderType} />;
}

