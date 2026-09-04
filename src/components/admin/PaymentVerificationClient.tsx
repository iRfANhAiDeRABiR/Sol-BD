'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ExternalLink,
  Phone,
  MessageSquare,
  Search,
  Clock,
  ShieldCheck,
  Eye,
} from 'lucide-react';
import { formatPrice, formatDate } from '@/lib/utils';
import StatusBadge from './StatusBadge';
import { verifyPayment } from '@/app/admin/actions';
import { toast } from 'sonner';

interface PaymentItem {
  id: string;
  paymentMethod: string;
  paymentStatus: string;
  amount: number;
  transactionId: string | null;
  senderPhone: string | null;
  paymentProofUrl: string | null;
  verifiedAt: Date | string | null;
  verifiedBy?: { name: string | null; email: string } | null;
  rejectionReason: string | null;
  createdAt: Date | string;
  order: {
    id: string;
    orderNumber: string;
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    totalAmount: number;
    items: Array<{
      id: string;
      productName: string | null;
      variantName: string | null;
      quantity: number;
    }>;
  };
  isDuplicateTrx?: boolean;
}

export default function PaymentVerificationClient({
  initialPayments,
}: {
  initialPayments: PaymentItem[];
}) {
  const [payments, setPayments] = useState(initialPayments);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'PENDING' | 'VERIFIED' | 'REJECTED' | 'ALL'>('PENDING');
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Rejection modal state
  const [rejectingPayment, setRejectingPayment] = useState<PaymentItem | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Proof image modal
  const [viewProofUrl, setViewProofUrl] = useState<string | null>(null);

  const filteredPayments = payments.filter((p) => {
    const matchesTab =
      activeTab === 'ALL'
        ? true
        : activeTab === 'PENDING'
        ? ['PENDING', 'SUBMITTED'].includes(p.paymentStatus)
        : p.paymentStatus === activeTab;

    const term = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !term ||
      (p.transactionId && p.transactionId.toLowerCase().includes(term)) ||
      (p.senderPhone && p.senderPhone.toLowerCase().includes(term)) ||
      p.order.orderNumber.toLowerCase().includes(term) ||
      p.order.customerName.toLowerCase().includes(term);

    return matchesTab && matchesSearch;
  });

  const handleApprove = async (paymentId: string) => {
    setProcessingId(paymentId);
    try {
      const res = await verifyPayment(paymentId, 'VERIFIED');
      if (res?.error) throw new Error(res.error);

      toast.success('Payment verified! Digital license key released.');
      setPayments((prev) =>
        prev.map((item) =>
          item.id === paymentId
            ? { ...item, paymentStatus: 'VERIFIED', verifiedAt: new Date() }
            : item
        )
      );
    } catch (err: any) {
      toast.error(err.message || 'Approval failed.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectingPayment) return;
    setProcessingId(rejectingPayment.id);
    try {
      const res = await verifyPayment(rejectingPayment.id, 'REJECTED', rejectionReason);
      if (res?.error) throw new Error(res.error);

      toast.success('Payment marked as rejected.');
      setPayments((prev) =>
        prev.map((item) =>
          item.id === rejectingPayment.id
            ? { ...item, paymentStatus: 'REJECTED', rejectionReason }
            : item
        )
      );
      setRejectingPayment(null);
      setRejectionReason('');
    } catch (err: any) {
      toast.error(err.message || 'Rejection failed.');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Toolbar & Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search TrxID, sender number, customer name, order #..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/[0.08] text-xs focus:outline-none focus:ring-2 focus:ring-violet-500/50"
          />
        </div>

        {/* Tab Filters */}
        <div className="flex gap-2">
          {(['PENDING', 'VERIFIED', 'REJECTED', 'ALL'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                activeTab === tab
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/[0.08] text-slate-600 dark:text-slate-400 hover:bg-slate-50'
              }`}
            >
              {tab === 'PENDING'
                ? 'Pending Review'
                : tab === 'VERIFIED'
                ? 'Verified'
                : tab === 'REJECTED'
                ? 'Rejected'
                : 'All Payments'}
            </button>
          ))}
        </div>
      </div>

      {/* Payments Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-white/[0.08] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200/80 dark:border-white/[0.05]">
              <tr>
                <th className="px-5 py-3.5">TrxID & Gateway</th>
                <th className="px-5 py-3.5">Sender Number</th>
                <th className="px-5 py-3.5">Order & Customer</th>
                <th className="px-5 py-3.5">Amount</th>
                <th className="px-5 py-3.5">Status / Audit</th>
                <th className="px-5 py-3.5 text-right">Verification Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04]">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-400">
                    <Clock className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
                    No payments found matching this filter.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => {
                  const isPending = ['PENDING', 'SUBMITTED'].includes(p.paymentStatus);
                  const isWorking = processingId === p.id;

                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* TrxID & Gateway */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-sm text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                            {p.transactionId || 'No TrxID'}
                          </span>

                          {p.isDuplicateTrx && (
                            <span
                              title="Warning: This TrxID was used in another payment!"
                              className="px-1.5 py-0.5 rounded bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-400 font-bold text-[10px] flex items-center gap-0.5 animate-pulse"
                            >
                              <AlertTriangle className="w-3 h-3" />
                              Duplicate TrxID!
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-bold text-violet-600 dark:text-violet-400 uppercase">
                            {p.paymentMethod.replace('_', ' ')}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {formatDate(p.createdAt)}
                          </span>
                        </div>
                      </td>

                      {/* Sender Number */}
                      <td className="px-5 py-4 font-mono font-bold text-slate-800 dark:text-slate-200">
                        {p.senderPhone ? (
                          <div className="flex items-center gap-1.5">
                            <span>{p.senderPhone}</span>
                            <a
                              href={`https://wa.me/${p.senderPhone.replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Chat with sender on WhatsApp"
                              className="text-emerald-500 hover:text-emerald-600"
                            >
                              <MessageSquare className="w-3 h-3" />
                            </a>
                          </div>
                        ) : (
                          <span className="text-slate-400 font-sans">—</span>
                        )}
                      </td>

                      {/* Order & Customer */}
                      <td className="px-5 py-4">
                        <Link
                          href={`/admin/orders/${p.order.id}`}
                          className="font-mono font-bold text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1"
                        >
                          <span>{p.order.orderNumber}</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                        <div className="font-semibold text-slate-900 dark:text-white mt-0.5">
                          {p.order.customerName}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {p.order.items.map((i) => i.productName).join(', ')}
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="px-5 py-4 font-black text-slate-900 dark:text-white text-sm">
                        {formatPrice(p.amount)}
                      </td>

                      {/* Status / Audit Trail */}
                      <td className="px-5 py-4 space-y-1">
                        <StatusBadge status={p.paymentStatus} size="sm" />
                        {p.verifiedBy && (
                          <div className="text-[10px] text-slate-400">
                            By {p.verifiedBy.name || 'Admin'}
                          </div>
                        )}
                        {p.rejectionReason && (
                          <div className="text-[10px] text-rose-500 italic">
                            Reason: {p.rejectionReason}
                          </div>
                        )}
                      </td>

                      {/* Verification Actions */}
                      <td className="px-5 py-4 text-right">
                        {isPending ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleApprove(p.id)}
                              disabled={isWorking}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all active:scale-95 disabled:opacity-50"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>{isWorking ? 'Verifying...' : 'Approve & Release'}</span>
                            </button>

                            <button
                              onClick={() => {
                                setRejectingPayment(p);
                                setRejectionReason('');
                              }}
                              disabled={isWorking}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-rose-100 hover:text-rose-600 text-slate-600 dark:text-slate-300 font-bold text-xs transition-colors"
                              title="Reject Payment"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Reject</span>
                            </button>
                          </div>
                        ) : p.paymentStatus === 'VERIFIED' ? (
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center justify-end gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Approved
                          </span>
                        ) : (
                          <span className="text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center justify-end gap-1">
                            <XCircle className="w-3.5 h-3.5" />
                            Rejected
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reject Modal */}
      {rejectingPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/[0.08] rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Reject Payment Confirmation
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Order{' '}
              <strong className="text-slate-900 dark:text-white font-mono">
                {rejectingPayment.order.orderNumber}
              </strong>{' '}
              will be marked as <span className="text-rose-600 font-bold">CANCELLED</span> and no
              keys will be released.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Reason for Rejection
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. TrxID not found on merchant statement, amount mismatch..."
                rows={3}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/[0.08] text-xs focus:outline-none focus:ring-2 focus:ring-violet-500/50"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setRejectingPayment(null)}
                className="px-3 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition-all active:scale-95"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

