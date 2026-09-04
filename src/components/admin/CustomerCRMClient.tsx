'use client';

import React, { useState } from 'react';
import {
  Users,
  Mail,
  Phone,
  MessageSquare,
  Download,
  Search,
  CheckCircle2,
  XCircle,
  ExternalLink,
} from 'lucide-react';
import { formatPrice, formatDate } from '@/lib/utils';
import { toggleSubscriberAction } from '@/app/admin/actions';
import { toast } from 'sonner';

interface CustomerRecord {
  email: string;
  name: string;
  phone: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: Date | string;
}

interface SubscriberRecord {
  id: string;
  email: string;
  source: string;
  isActive: boolean;
  createdAt: Date | string;
}

interface CustomerCRMProps {
  customers: CustomerRecord[];
  initialSubscribers: SubscriberRecord[];
}

export default function CustomerCRMClient({
  customers,
  initialSubscribers,
}: CustomerCRMProps) {
  const [activeTab, setActiveTab] = useState<'customers' | 'subscribers'>('customers');
  const [searchTerm, setSearchTerm] = useState('');
  const [subscribers, setSubscribers] = useState(initialSubscribers);

  const filteredCustomers = customers.filter((c) => {
    const term = searchTerm.toLowerCase().trim();
    return (
      !term ||
      c.name.toLowerCase().includes(term) ||
      c.email.toLowerCase().includes(term) ||
      c.phone.toLowerCase().includes(term)
    );
  });

  const filteredSubscribers = subscribers.filter((s) => {
    const term = searchTerm.toLowerCase().trim();
    return !term || s.email.toLowerCase().includes(term) || s.source.toLowerCase().includes(term);
  });

  const handleToggleSub = async (id: string) => {
    try {
      const res = await toggleSubscriberAction(id);
      if (res?.error) throw new Error(res.error);

      setSubscribers((prev) =>
        prev.map((s) => (s.id === id ? { ...s, isActive: !s.isActive } : s))
      );
      toast.success('Subscriber status updated.');
    } catch (err: any) {
      toast.error(err.message || 'Toggle failed.');
    }
  };

  const exportSubscribersCSV = () => {
    const headers = ['Email', 'Source', 'Status', 'Subscribed At'];
    const rows = filteredSubscribers.map((s) => [
      s.email,
      s.source,
      s.isActive ? 'Active' : 'Unsubscribed',
      new Date(s.createdAt).toLocaleDateString(),
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `solutionsbd_newsletter_subscribers_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Top Controls: Search & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={
              activeTab === 'customers'
                ? 'Search customer name, email, or phone...'
                : 'Search subscriber email...'
            }
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/[0.08] text-xs focus:outline-none focus:ring-2 focus:ring-violet-500/50"
          />
        </div>

        {/* Tab Selector & Export */}
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200/60 dark:border-white/[0.06]">
            <button
              onClick={() => setActiveTab('customers')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'customers'
                  ? 'bg-white dark:bg-slate-900 text-violet-600 dark:text-violet-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>Purchasing Customers ({customers.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('subscribers')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'subscribers'
                  ? 'bg-white dark:bg-slate-900 text-violet-600 dark:text-violet-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>Newsletter Subscribers ({subscribers.length})</span>
            </button>
          </div>

          {activeTab === 'subscribers' && (
            <button
              onClick={exportSubscribersCSV}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/[0.08] text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition-colors shadow-sm"
            >
              <Download className="w-3.5 h-3.5 text-violet-500" />
              <span>Export CSV</span>
            </button>
          )}
        </div>
      </div>

      {/* Tab 1: Customers Table */}
      {activeTab === 'customers' && (
        <div className="rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-white/[0.08] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200/80 dark:border-white/[0.05]">
                <tr>
                  <th className="px-5 py-3.5">Customer Name</th>
                  <th className="px-5 py-3.5">Phone & WhatsApp</th>
                  <th className="px-5 py-3.5">Email</th>
                  <th className="px-5 py-3.5">Completed Orders</th>
                  <th className="px-5 py-3.5">Lifetime Spend</th>
                  <th className="px-5 py-3.5 text-right">Last Purchase</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04]">
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center text-slate-400">
                      No customer records found.
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((c, idx) => {
                    const cleanPhone = c.phone.replace(/[^0-9]/g, '');
                    return (
                      <tr
                        key={idx}
                        className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="px-5 py-4 font-bold text-slate-900 dark:text-white">
                          {c.name}
                        </td>

                        <td className="px-5 py-4 font-mono font-bold text-slate-800 dark:text-slate-200">
                          <div className="flex items-center gap-2">
                            <span>{c.phone}</span>
                            <a
                              href={`https://wa.me/${cleanPhone}?text=Hello%20${encodeURIComponent(
                                c.name
                              )},%20greetings%20from%20SolutionsBD!`}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Chat on WhatsApp"
                              className="text-emerald-500 hover:text-emerald-600"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </td>

                        <td className="px-5 py-4 text-slate-600 dark:text-slate-400">
                          <a
                            href={`mailto:${c.email}`}
                            className="hover:text-violet-600 hover:underline"
                          >
                            {c.email}
                          </a>
                        </td>

                        <td className="px-5 py-4">
                          <span className="font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full">
                            {c.totalOrders} orders
                          </span>
                        </td>

                        <td className="px-5 py-4 font-black text-violet-600 dark:text-violet-400 text-sm">
                          {formatPrice(c.totalSpent)}
                        </td>

                        <td className="px-5 py-4 text-right text-slate-400">
                          {formatDate(c.lastOrderDate)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Newsletter Subscribers Table */}
      {activeTab === 'subscribers' && (
        <div className="rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-white/[0.08] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200/80 dark:border-white/[0.05]">
                <tr>
                  <th className="px-5 py-3.5">Email Address</th>
                  <th className="px-5 py-3.5">Acquisition Source</th>
                  <th className="px-5 py-3.5">Subscription Status</th>
                  <th className="px-5 py-3.5">Subscribed Date</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04]">
                {filteredSubscribers.map((s) => (
                  <tr
                    key={s.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="px-5 py-4 font-bold text-slate-900 dark:text-white">
                      {s.email}
                    </td>

                    <td className="px-5 py-4">
                      <span className="font-mono text-[11px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded uppercase text-slate-600 dark:text-slate-300">
                        {s.source}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          s.isActive
                            ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                            : 'bg-slate-500/10 text-slate-500'
                        }`}
                      >
                        {s.isActive ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                            <span>Active</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 text-slate-400" />
                            <span>Unsubscribed</span>
                          </>
                        )}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-slate-400">
                      {formatDate(s.createdAt)}
                    </td>

                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => handleToggleSub(s.id)}
                        className="text-[11px] font-bold text-slate-500 hover:text-violet-600 dark:hover:text-violet-400 underline"
                      >
                        {s.isActive ? 'Deactivate' : 'Reactivate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

