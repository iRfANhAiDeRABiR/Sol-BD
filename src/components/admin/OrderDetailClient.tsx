'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Printer,
  Copy,
  Check,
  Phone,
  Mail,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Key,
} from 'lucide-react';
import { formatPrice, formatDate } from '@/lib/utils';
import StatusBadge from './StatusBadge';
import { updateOrderStatus } from '@/app/admin/actions';
import { toast } from 'sonner';

interface OrderDetailClientProps {
  order: any;
}

export default function OrderDetailClient({ order }: OrderDetailClientProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(order.orderStatus);
  const [adminNotes, setAdminNotes] = useState(order.notes || '');

  const deliveredKeys = (() => {
    try {
      return JSON.parse(order.deliveredKeys || '[]');
    } catch {
      return [];
    }
  })();

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(text);
    toast.success('License key copied to clipboard!');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const res = await updateOrderStatus(order.id, selectedStatus, adminNotes);
      if (res?.error) throw new Error(res.error);
      toast.success('Order status updated successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update order.');
    } finally {
      setUpdating(false);
    }
  };

  const cleanPhone = order.customerPhone.replace(/[^0-9]/g, '');
  const waUrl = `https://wa.me/${cleanPhone}?text=Hello%20${encodeURIComponent(
    order.customerName
  )},%20regarding%20your%20SolutionsBD%20Order%20%23${order.orderNumber}...`;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/orders"
            className="p-2 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono">
                {order.orderNumber}
              </h1>
              <StatusBadge status={order.orderStatus} size="sm" />
            </div>
            <span className="text-xs text-slate-400">
              Placed on {formatDate(order.createdAt)}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/[0.08] text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
          >
            <Printer className="w-3.5 h-3.5 text-violet-500" />
            <span>Print Invoice</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Details & Right Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Line Items & Customer & Payment */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items Snapshot Card */}
          <div className="rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-white/[0.08] p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
              Purchased Digital Items Snapshot
            </h3>

            <div className="divide-y divide-slate-100 dark:divide-white/[0.05]">
              {order.items.map((item: any) => (
                <div key={item.id} className="py-3 flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-900 dark:text-white block text-sm">
                      {item.productName || 'Digital License'}
                    </span>
                    <span className="text-violet-600 dark:text-violet-400 font-semibold block">
                      {item.variantName || 'Standard'}
                    </span>
                    <span className="text-slate-400 text-[11px]">
                      Quantity: {item.quantity} × {formatPrice(item.unitPrice)}
                    </span>
                  </div>
                  <div className="font-black text-slate-900 dark:text-white text-sm">
                    {formatPrice(item.unitPrice * item.quantity)}
                  </div>
                </div>
              ))}
            </div>

            {/* Financial Breakdown Summary */}
            <div className="pt-3 border-t border-slate-100 dark:border-white/[0.05] space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {formatPrice(order.totalAmount + (order.discountAmount || 0))}
                </span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                  <span>Coupon Discount ({order.couponCode || 'PROMO'})</span>
                  <span>-{formatPrice(order.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-black text-slate-900 dark:text-white pt-2 border-t border-slate-100 dark:border-white/[0.05]">
                <span>Total Amount Charged</span>
                <span className="text-violet-600 dark:text-violet-400">
                  {formatPrice(order.totalAmount)}
                </span>
              </div>
            </div>
          </div>

          {/* Delivered Keys Vault Card */}
          <div className="rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-white/[0.08] p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                  Delivered Digital Keys & Credentials
                </h3>
              </div>
              <span className="text-[11px] font-bold text-slate-400">
                {deliveredKeys.length} allocated
              </span>
            </div>

            {deliveredKeys.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-white/[0.08] text-center text-xs text-slate-400">
                No license keys allocated yet. Approve payment or set order status to COMPLETED to release keys.
              </div>
            ) : (
              <div className="space-y-2">
                {deliveredKeys.map((k: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-white/[0.06] flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        {k.variantName || 'Digital License Key'}
                      </span>
                      <code className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm break-all">
                        {k.keyCode}
                      </code>
                    </div>

                    <button
                      onClick={() => handleCopy(k.keyCode)}
                      className="p-2 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-white/[0.1] hover:bg-slate-50 text-slate-600 dark:text-slate-200 transition-colors flex-shrink-0"
                      title="Copy Key"
                    >
                      {copiedKey === k.keyCode ? (
                        <Check className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Customer Info & Status Manager */}
        <div className="space-y-6">
          {/* Customer CRM Card */}
          <div className="rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-white/[0.08] p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">
              Customer Identity & Contact
            </h3>

            <div className="space-y-2.5 text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">
                  Customer Name
                </span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {order.customerName}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">
                  Phone Number
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <a
                    href={`tel:${order.customerPhone}`}
                    className="font-mono font-bold text-slate-900 dark:text-white hover:underline flex items-center gap-1"
                  >
                    <Phone className="w-3 h-3 text-slate-400" />
                    <span>{order.customerPhone}</span>
                  </a>
                </div>
              </div>

              {/* Direct WhatsApp Action Link */}
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-sm transition-all active:scale-95"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Message on WhatsApp</span>
              </a>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">
                  Email Address
                </span>
                <a
                  href={`mailto:${order.customerEmail}`}
                  className="font-medium text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1 mt-0.5"
                >
                  <Mail className="w-3 h-3" />
                  <span className="truncate">{order.customerEmail}</span>
                </a>
              </div>
            </div>
          </div>

          {/* Payment Details Card */}
          <div className="rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-white/[0.08] p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">
                Payment Verification
              </h3>
              <StatusBadge status={order.paymentStatus} size="sm" />
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Method</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {order.paymentMethod}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Transaction ID</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {order.paymentTrxId || '—'}
                </span>
              </div>
              {order.senderPhone && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Sender Number</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300">
                    {order.senderPhone}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Status Transition Control Form */}
          <form
            onSubmit={handleStatusSubmit}
            className="rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-white/[0.08] p-5 shadow-sm space-y-4"
          >
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">
              Manage Order Status
            </h3>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Current Fulfillment State
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/[0.08] text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
              >
                <option value="PENDING_PAYMENT">PENDING_PAYMENT</option>
                <option value="PAYMENT_SUBMITTED">PAYMENT_SUBMITTED</option>
                <option value="PROCESSING">PROCESSING</option>
                <option value="COMPLETED">COMPLETED (Auto Allocate Keys)</option>
                <option value="CANCELLED">CANCELLED</option>
                <option value="REFUNDED">REFUNDED</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Internal Admin Notes
              </label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={3}
                placeholder="Add private staff notes..."
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/[0.08] text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
              />
            </div>

            <button
              type="submit"
              disabled={updating}
              className="w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs shadow-md shadow-violet-600/20 transition-all active:scale-95 disabled:opacity-50"
            >
              {updating ? 'Updating...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

