'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  Copy,
  Check,
  Zap,
  Printer,
  ShieldCheck,
  Clock,
  MessageCircle,
  Key,
  ArrowRight,
} from 'lucide-react';
import { OrderType } from '@/lib/types';
import { formatPrice, formatDate } from '@/lib/utils';
import { toast } from 'sonner';

interface OrderSuccessClientViewProps {
  order: OrderType;
}

export default function OrderSuccessClientView({
  order,
}: OrderSuccessClientViewProps) {
  const [copiedKeyIndex, setCopiedKeyIndex] = useState<number | null>(null);

  const deliveredKeys: Array<{ variantName: string; keyCode: string }> =
    order.deliveredKeys ? JSON.parse(order.deliveredKeys) : [];

  const handleCopyKey = (key: string, index: number) => {
    navigator.clipboard.writeText(key);
    setCopiedKeyIndex(index);
    toast.success('License key copied to clipboard!');
    setTimeout(() => setCopiedKeyIndex(null), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  const isPaid = order.paymentStatus === 'PAID';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Top Success Banner */}
      <div className="text-center space-y-3 bg-white/95 dark:bg-[#0f172a]/95 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-white/[0.08] shadow-sm">
        <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-9 h-9" />
        </div>
        <div>
          <span className="text-xs font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/50 dark:border-emerald-800/30 px-3 py-1 rounded-full">
            {isPaid ? 'Payment Confirmed • Keys Dispatched' : 'Order Received • Under Review'}
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-2">
            ধন্যবাদ! আপনার অর্ডারটি গৃহীত হয়েছে
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
            অর্ডার নম্বর:{' '}
            <strong className="font-mono text-violet-700 dark:text-violet-400 font-black">
              {order.orderNumber}
            </strong>
          </p>
        </div>
      </div>

      {/* INSTANT KEY REVEAL VAULT (If Paid) */}
      {isPaid ? (
        <div className="glass-card rounded-3xl p-6 sm:p-8 border-2 border-violet-500/30 bg-gradient-to-br from-violet-50/50 via-white to-sky-50/50 dark:from-violet-950/20 dark:via-[#0f172a] dark:to-sky-950/20 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-violet-100 dark:border-white/[0.08] pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-violet-600 text-white flex items-center justify-center">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  আপনার ডিজিটাল লাইসেন্স কি (Your License Keys)
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  ক্লিক করে কপি করুন এবং সফটওয়্যার অ্যাক্টিভেট করুন
                </p>
              </div>
            </div>
            <span className="bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-black px-3 py-1 rounded-full flex items-center gap-1 w-fit">
              <Zap className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              Auto Delivered
            </span>
          </div>

          {/* Keys List */}
          <div className="space-y-4">
            {deliveredKeys.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                লাইসেন্স কি বরাদ্দ হচ্ছে, অনুগ্রহ করে কয়েক সেকেন্ড অপেক্ষা করুন।
              </p>
            ) : (
              deliveredKeys.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] shadow-sm space-y-2"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                    <span>{item.variantName}</span>
                    <span className="text-violet-600 dark:text-violet-400">Key #{idx + 1}</span>
                  </div>

                  {/* License Code Display Box */}
                  <div className="flex items-center justify-between gap-2 bg-slate-900 text-amber-300 font-mono text-sm sm:text-base font-black px-4 py-3 rounded-xl border border-slate-800 tracking-wider overflow-x-auto select-all">
                    <span>{item.keyCode}</span>
                    <button
                      onClick={() => handleCopyKey(item.keyCode, idx)}
                      className="flex items-center gap-1 bg-white/15 hover:bg-white/25 text-white text-xs px-3 py-1.5 rounded-lg transition-colors font-sans flex-shrink-0"
                    >
                      {copiedKeyIndex === idx ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-300">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Key</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Activation Notice */}
          <div className="bg-white/80 dark:bg-slate-900/80 rounded-2xl p-4 border border-violet-200 dark:border-violet-800/40 text-xs text-slate-600 dark:text-slate-300 space-y-1">
            <h4 className="font-bold text-slate-800 dark:text-white">অ্যাক্টিভেশন সহায়তা:</h4>
            <p>
              উইন্ডোজ বা সফটওয়্যার ওপেন করে সেটিংস থেকে লাইসেন্স কি-টি প্রবেশ করান।
              কোনো প্রকার সমস্যায় আমাদের WhatsApp নম্বরে স্ক্রিনশট পাঠিয়ে সহায়তা নিন।
            </p>
          </div>
        </div>
      ) : (
        /* Manual MFS Pending Verification Box */
        <div className="bg-amber-50 dark:bg-amber-950/30 rounded-3xl p-6 sm:p-8 border border-amber-200 dark:border-amber-800/40 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center">
              <Clock className="w-5 h-5 animate-spin" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-amber-950 dark:text-amber-200">
                ম্যানুয়াল পেমেন্ট ভেরিফিকেশন চলছে (Verification Pending)
              </h2>
              <p className="text-xs text-amber-800 dark:text-amber-300">
                আপনার প্রদত্ত TrxID:{' '}
                <strong className="font-mono">{order.paymentTrxId || 'N/A'}</strong>
              </p>
            </div>
          </div>

          <p className="text-xs text-amber-900 dark:text-amber-200/90 leading-relaxed">
            আমরা সাধারণত <strong>৫ থেকে ১৫ মিনিটের মধ্যে</strong> bKash/Nagad ট্রানজেকশন ভেরিফাই করে লাইসেন্স কি আপনার ইমেইলে পাঠিয়ে দেই এবং ড্যাশবোর্ডে উন্মুক্ত করি।
          </p>

          <a
            href={`https://wa.me/8801410699879?text=Hello%20SolutionsBD,%20I%20have%20placed%20Order%20${order.orderNumber}%20with%20TrxID%20${order.paymentTrxId}.%20Please%20verify.`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            <span>দ্রুত ভেরিফিকেশনের জন্য WhatsApp এ মেসেজ দিন</span>
          </a>
        </div>
      )}

      {/* Order Details Invoice Card */}
      <div className="bg-white/95 dark:bg-[#0f172a]/95 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-white/[0.08] shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.08] pb-4">
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white">ইনভয়েস সারসংক্ষেপ</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">{formatDate(order.createdAt)}</p>
          </div>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 px-3 py-1.5 rounded-xl transition-colors border border-slate-200/60 dark:border-white/[0.08]"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Invoice</span>
          </button>
        </div>

        {/* Customer & Order Metadata */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-400 dark:text-slate-500 block text-[11px]">ক্রেতার নাম:</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">{order.customerName}</span>
          </div>
          <div>
            <span className="text-slate-400 dark:text-slate-500 block text-[11px]">ইমেইল:</span>
            <span className="font-bold text-slate-800 dark:text-slate-200 break-all">{order.customerEmail}</span>
          </div>
          <div>
            <span className="text-slate-400 dark:text-slate-500 block text-[11px]">মোবাইল:</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">{order.customerPhone}</span>
          </div>
          <div>
            <span className="text-slate-400 dark:text-slate-500 block text-[11px]">পেমেন্ট মেথড:</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">{order.paymentMethod}</span>
          </div>
        </div>

        {/* Pricing */}
        <div className="pt-4 border-t border-slate-100 dark:border-white/[0.08] flex items-center justify-between text-sm">
          <span className="font-bold text-slate-700 dark:text-slate-300">পরিশোধিত মোট মূল্য:</span>
          <span className="text-lg font-black text-violet-700 dark:text-violet-400">
            {formatPrice(order.totalAmount)}
          </span>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <Link
          href="/my-licenses"
          className="text-xs font-bold text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 flex items-center gap-1"
        >
          <span>আমার সকল লাইসেন্স কি দেখুন (License Vault)</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
        <Link
          href="/shop"
          className="brand-gradient-btn text-white text-xs font-bold px-5 py-2.5 rounded-xl inline-block"
        >
          আরও সফটওয়্যার ব্রাউজ করুন
        </Link>
      </div>
    </div>
  );
}

