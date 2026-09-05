'use client';

import React, { useState } from 'react';
import { Search, Key, Copy, Check, Clock, ShieldCheck, Download, AlertCircle } from 'lucide-react';
import { OrderType } from '@/lib/types';
import { formatPrice, formatDate } from '@/lib/utils';
import { toast } from 'sonner';

export default function MyLicensesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [verificationInput, setVerificationInput] = useState('');
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  React.useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setCurrentUser(data.user);
          // Automatically load customer's own vault
          setLoading(true);
          fetch('/api/orders')
            .then((r) => r.json())
            .then((resData) => {
              if (resData.orders) {
                setOrders(resData.orders);
                setHasSearched(true);
              }
            })
            .catch(() => {})
            .finally(() => setLoading(false));
        }
      })
      .catch(() => {});
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      toast.error('Please enter your Order Number (e.g. SBD-2026-XXXXXX).');
      return;
    }

    if (!currentUser && !verificationInput.trim()) {
      toast.error('Please enter the Phone Number or Email used during checkout.');
      return;
    }

    setLoading(true);
    setHasSearched(true);

    try {
      let url = `/api/orders?orderNumber=${encodeURIComponent(searchTerm.trim())}`;
      if (verificationInput.trim()) {
        const isEmail = verificationInput.includes('@');
        url += isEmail
          ? `&email=${encodeURIComponent(verificationInput.trim())}`
          : `&phone=${encodeURIComponent(verificationInput.trim())}`;
      }

      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Verification failed. Please check order details.');
        setOrders([]);
      } else if (data.orders) {
        setOrders(data.orders);
      } else {
        setOrders([]);
      }
    } catch (err) {
      toast.error('Failed to lookup orders.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(text);
    toast.success('Key copied to clipboard!');
    setTimeout(() => setCopiedKey(null), 3000);
  };

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-5 py-10 space-y-8">
      {/* Page Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center mx-auto shadow-md">
          <Key className="w-6 h-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          ডিজিটাল লাইসেন্স ভল্ট (My Licenses Vault)
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          {currentUser
            ? `স্বাগতম ${currentUser.name || currentUser.email}! নিচে আপনার অ্যাকাউন্টের সকল লাইসেন্স প্রদর্শিত হচ্ছে।`
            : 'আপনার ক্রয়কৃত লাইসেন্স কি দেখতে আপনার অর্ডার নম্বর ও মোবাইল নম্বর দিন, অথবা লগইন করুন।'}
        </p>
      </div>

      {/* Search Box */}
      <div className="bg-white/95 dark:bg-[#0f172a]/95 p-4 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-white/[0.08] shadow-sm backdrop-blur-xl">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Order Number (e.g. SBD-2026-123456)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 text-xs sm:text-sm border border-slate-200 dark:border-white/[0.08] rounded-2xl outline-none focus:border-violet-500 bg-slate-50/80 dark:bg-slate-800 text-slate-800 dark:text-white placeholder:text-slate-400 font-medium"
            />
          </div>
          {!currentUser && (
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Phone or Email (e.g. 017XXXXXXXX)"
                value={verificationInput}
                onChange={(e) => setVerificationInput(e.target.value)}
                className="w-full px-4 py-3 text-xs sm:text-sm border border-slate-200 dark:border-white/[0.08] rounded-2xl outline-none focus:border-violet-500 bg-slate-50/80 dark:bg-slate-800 text-slate-800 dark:text-white placeholder:text-slate-400 font-medium"
              />
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="brand-gradient-btn text-white text-xs sm:text-sm font-bold px-6 py-3 rounded-2xl transition-transform active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <span>Searching...</span> : <span>খুঁজুন (Search Vault)</span>}
          </button>
        </form>
      </div>

      {/* Search Results */}
      {hasSearched && (
        <div className="space-y-6">
          {orders.length === 0 ? (
            <div className="text-center py-12 bg-white/95 dark:bg-[#0f172a]/95 rounded-3xl border border-slate-200/80 dark:border-white/[0.08] p-6 space-y-2">
              <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
              <h3 className="font-bold text-slate-800 dark:text-white text-sm">কোনো লাইসেন্স পাওয়া যায়নি</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                প্রদত্ত ইমেইল বা অর্ডার নম্বরটি সঠিক কি না অনুগ্রহ করে যাচাই করে পুনরায় চেষ্টা করুন।
              </p>
            </div>
          ) : (
            orders.map((order) => {
              const deliveredKeys: Array<{ variantName: string; keyCode: string }> =
                order.deliveredKeys ? JSON.parse(order.deliveredKeys) : [];
              const isPaid = order.paymentStatus === 'PAID';

              return (
                <div
                  key={order.id}
                  className="bg-white/95 dark:bg-[#0f172a]/95 rounded-3xl border border-slate-200/80 dark:border-white/[0.08] p-5 sm:p-6 shadow-sm space-y-5 backdrop-blur-xl"
                >
                  {/* Order header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-white/[0.08] pb-3">
                    <div>
                      <span className="font-mono text-xs font-black text-violet-700 dark:text-violet-300 bg-violet-50 dark:bg-violet-950/60 px-2 py-0.5 rounded">
                        {order.orderNumber}
                      </span>
                      <span className="text-xs text-slate-400 ml-2">
                        {formatDate(order.createdAt)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[11px] font-black px-2.5 py-0.5 rounded-full ${
                          isPaid
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                            : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                        }`}
                      >
                        {isPaid ? 'PAID • DELIVERED' : 'PENDING VERIFICATION'}
                      </span>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                        {formatPrice(order.totalAmount)}
                      </span>
                    </div>
                  </div>

                  {/* Delivered Keys */}
                  {isPaid ? (
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <Key className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
                        <span>ডিজিটাল লাইসেন্স কোড:</span>
                      </h4>

                      {deliveredKeys.map((k, idx) => (
                        <div
                          key={idx}
                          className="bg-slate-900 text-amber-300 font-mono text-xs sm:text-sm font-black p-3.5 rounded-xl border border-slate-800 flex items-center justify-between gap-2"
                        >
                          <div>
                            <span className="text-[10px] text-slate-400 font-sans block">
                              {k.variantName}
                            </span>
                            <span>{k.keyCode}</span>
                          </div>
                          <button
                            onClick={() => copyToClipboard(k.keyCode)}
                            className="bg-white/10 hover:bg-white/20 text-white text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 font-sans flex-shrink-0"
                          >
                            {copiedKey === k.keyCode ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span className="text-emerald-300">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-amber-50 dark:bg-amber-950/30 p-4 rounded-2xl border border-amber-200 dark:border-amber-800/40 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
                      <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                      <p>
                        এই অর্ডারটির পেমেন্ট ভেরিফিকেশন চলছে। ভেরিফিকেশন সম্পন্ন হলে লাইসেন্স কি স্বয়ংক্রিয়ভাবে এখানে দৃশ্যমান হবে।
                      </p>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

