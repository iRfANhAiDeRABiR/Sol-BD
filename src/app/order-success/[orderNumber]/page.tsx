import React from 'react';
import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import OrderSuccessClientView from './OrderSuccessClientView';
import { OrderType } from '@/lib/types';
import type { Metadata } from 'next';
import { getAdminSession } from '@/lib/admin-auth';
import { getCustomerSession } from '@/lib/customer-auth';

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
  const adminSession = await getAdminSession();
  const customerSession = await getCustomerSession();

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

  // Authorization check: Is the viewer the owner of this order or an admin?
  const isOwner = Boolean(
    (customerSession && (
      (order.userId && customerSession.id === order.userId) ||
      customerSession.email.toLowerCase() === order.customerEmail.toLowerCase()
    )) ||
    adminSession
  );

  // If unauthorized visitor accesses an order, redact sensitive software license keys and PII
  const safeOrder = {
    ...order,
    deliveredKeys: isOwner ? order.deliveredKeys : '[]',
    customerPhone: isOwner
      ? order.customerPhone
      : order.customerPhone.length > 6
      ? `${order.customerPhone.slice(0, 3)}****${order.customerPhone.slice(-3)}`
      : '***',
    customerEmail: isOwner
      ? order.customerEmail
      : `${order.customerEmail.slice(0, 2)}***@***`,
  };

  return <OrderSuccessClientView order={safeOrder as unknown as OrderType} />;
}

