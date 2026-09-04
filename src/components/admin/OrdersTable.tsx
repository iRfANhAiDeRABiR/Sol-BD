'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Download,
  Filter,
  ArrowRight,
  Package,
  Phone,
  MessageSquare,
  ExternalLink,
} from 'lucide-react';
import { formatPrice, formatDate } from '@/lib/utils';
import StatusBadge from './StatusBadge';

interface OrderItemData {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  totalAmount: number;
  paymentStatus: string;
  paymentMethod: string;
  paymentTrxId?: string | null;
  senderPhone?: string | null;
  orderStatus: string;
  createdAt: string | Date;
  itemsCount: number;
}

export default function OrdersTable({ initialOrders }: { initialOrders: OrderItemData[] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredOrders = initialOrders.filter((o) => {
    const matchesFilter =
      statusFilter === 'ALL'
        ? true
        : statusFilter === 'PENDING'
        ? ['PENDING_PAYMENT', 'PAYMENT_SUBMITTED'].includes(o.orderStatus)
        : o.orderStatus === statusFilter;

    const term = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !term ||
      o.orderNumber.toLowerCase().includes(term) ||
      o.customerName.toLowerCase().includes(term) ||
      o.customerPhone.toLowerCase().includes(term) ||
      o.customerEmail.toLowerCase().includes(term) ||
      (o.paymentTrxId && o.paymentTrxId.toLowerCase().includes(term));

    return matchesFilter && matchesSearch;
  });

  const handleExportCSV = () => {
    const headers = [
      'Order Number',
      'Date',
      'Customer Name',
      'Email',
      'Phone',
      'Total (BDT)',
      'Payment Method',
      'TrxID',
      'Payment Status',
      'Order Status',
    ];

    const rows = filteredOrders.map((o) => [
      o.orderNumber,
      new Date(o.createdAt).toLocaleDateString(),
      `"${o.customerName.replace(/"/g, '""')}"`,
      o.customerEmail,
      o.customerPhone,
      o.totalAmount,
      o.paymentMethod,
      o.paymentTrxId || '',
      o.paymentStatus,
      o.orderStatus,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `solutionsbd_orders_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Search & Export Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by order #, customer, phone, or TrxID..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/[0.08] text-xs focus:outline-none focus:ring-2 focus:ring-violet-500/50"
          />
        </div>

        {/* CSV Export & Filter status */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/[0.08] text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm active:scale-95"
          >
            <Download className="w-3.5 h-3.5 text-violet-500" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { label: 'All Orders', value: 'ALL' },
          { label: 'Pending Review', value: 'PENDING' },
          { label: 'Completed', value: 'COMPLETED' },
          { label: 'Cancelled', value: 'CANCELLED' },
        ].map((f) => (
          <button
            key={f.value}
            onClick={() => setStatusFilter(f.value)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
              statusFilter === f.value
                ? 'bg-violet-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/[0.08] text-slate-600 dark:text-slate-400 hover:bg-slate-50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Table Card */}
      <div className="rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-white/[0.08] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200/80 dark:border-white/[0.05]">
              <tr>
                <th className="px-5 py-3.5">Order ID</th>
                <th className="px-5 py-3.5">Customer & Phone</th>
                <th className="px-5 py-3.5">Method</th>
                <th className="px-5 py-3.5">TrxID / Sender</th>
                <th className="px-5 py-3.5">Total</th>
                <th className="px-5 py-3.5">Payment</th>
                <th className="px-5 py-3.5">Fulfillment</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04]">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-slate-400">
                    <Package className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
                    No orders matching the current filter.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors group"
                  >
                    <td className="px-5 py-4 font-mono font-bold text-violet-600 dark:text-violet-400">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="hover:underline flex items-center gap-1"
                      >
                        {order.orderNumber}
                      </Link>
                      <span className="block text-[10px] font-sans text-slate-400 mt-0.5">
                        {formatDate(order.createdAt)}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {order.customerName}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                        <span>{order.customerPhone}</span>
                        {/* Direct WhatsApp Chat Action */}
                        <a
                          href={`https://wa.me/${order.customerPhone.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Chat on WhatsApp"
                          className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 font-bold flex items-center gap-0.5"
                        >
                          <MessageSquare className="w-3 h-3" />
                        </a>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[11px] font-mono font-semibold">
                        {order.paymentMethod.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="px-5 py-4 font-mono text-[11px]">
                      {order.paymentTrxId ? (
                        <div>
                          <span className="font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded">
                            {order.paymentTrxId}
                          </span>
                          {order.senderPhone && (
                            <span className="block text-slate-400 text-[10px] mt-0.5">
                              Sender: {order.senderPhone}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    <td className="px-5 py-4 font-black text-slate-900 dark:text-white text-sm">
                      {formatPrice(order.totalAmount)}
                    </td>

                    <td className="px-5 py-4">
                      <StatusBadge status={order.paymentStatus} size="sm" />
                    </td>

                    <td className="px-5 py-4">
                      <StatusBadge status={order.orderStatus} size="sm" />
                    </td>

                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="inline-flex items-center gap-1 text-slate-500 hover:text-violet-600 dark:hover:text-violet-400 font-bold text-xs"
                      >
                        <span>Manage</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

