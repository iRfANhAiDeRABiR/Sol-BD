import React from 'react';
import prisma from '@/lib/prisma';
import PaymentVerificationClient from '@/components/admin/PaymentVerificationClient';
import { CreditCard } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminPaymentsPage() {
  const payments = await prisma.payment.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      order: {
        include: {
          items: true,
        },
      },
      verifiedBy: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  // Calculate duplicate TrxIDs
  const trxCounts: Record<string, number> = {};
  for (const p of payments) {
    if (p.transactionId && p.transactionId.trim()) {
      const trx = p.transactionId.trim().toUpperCase();
      trxCounts[trx] = (trxCounts[trx] || 0) + 1;
    }
  }

  const enrichedPayments = payments.map((p) => {
    const trx = p.transactionId?.trim().toUpperCase();
    const isDuplicate = Boolean(trx && trxCounts[trx] > 1);
    return {
      ...p,
      isDuplicateTrx: isDuplicate,
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5" />
              MFS Merchant Verification
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
            Manual Payment Review Queue
          </h1>
        </div>
      </div>

      <PaymentVerificationClient initialPayments={enrichedPayments} />
    </div>
  );
}

