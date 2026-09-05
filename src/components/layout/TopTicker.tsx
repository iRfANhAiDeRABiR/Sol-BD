'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Phone, Mail, Sparkles, Star, ShieldCheck, Zap } from 'lucide-react';

export default function TopTicker() {
  const pathname = usePathname();
  if (pathname?.startsWith('/admin')) return null;
  return (
    <div className="w-full bg-slate-900 dark:bg-slate-950 text-white text-[11px] font-medium py-1.5 px-2 sm:px-3 border-b border-purple-500/20 relative z-50 overflow-hidden no-print print:hidden">
      <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-3">
        {/* Left: Quick Contact */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <a
            href="tel:+8801410699879"
            className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 transition-all px-2.5 py-1 rounded-full text-emerald-400 font-semibold"
          >
            <Phone className="w-3 h-3 text-emerald-400" />
            <span>01410-699879</span>
          </a>
          <a
            href="mailto:info@solutionsbd.com"
            className="hidden md:flex items-center gap-1.5 bg-white/10 hover:bg-white/20 transition-all px-2.5 py-1 rounded-full text-slate-300"
          >
            <Mail className="w-3 h-3 text-purple-400" />
            <span>info@solutionsbd.com</span>
          </a>
        </div>

        {/* Center: Running Marquee with Bengali Offer & Trust Signals */}
        <div className="flex-1 overflow-hidden mask-fade-edges mx-2">
          <div className="flex items-center gap-8 whitespace-nowrap animate-marquee">
            <span className="flex items-center gap-2 text-amber-300 font-bold">
              <Sparkles className="w-3.5 h-3.5 text-yellow-400 animate-pulse" />
              বিশেষ অফার! bKash পেমেন্টে ইনস্ট্যান্ট অটো ডেলিভারি ও ১০% ক্যাশব্যাক!
            </span>
            <span className="text-slate-500">•</span>
            <span className="flex items-center gap-1 text-emerald-300">
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              ১০ সেকেন্ডে অটো লাইসেন্স কি ডেলিভারি
            </span>
            <span className="text-slate-500">•</span>
            <span className="flex items-center gap-1 text-yellow-300">
              <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
              ৫০,০০০+ গ্রাহকের বিশ্বস্ত ডিজিটাল শপ
            </span>
            <span className="text-slate-500">•</span>
            <span className="flex items-center gap-1 text-blue-300">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              ১০০% জেনুইন রিটেইল ও অফিশিয়াল লাইসেন্স
            </span>

            {/* Repeat for seamless continuous loop */}
            <span className="flex items-center gap-2 text-amber-300 font-bold">
              <Sparkles className="w-3.5 h-3.5 text-yellow-400 animate-pulse" />
              বিশেষ অফার! bKash পেমেন্টে ইনস্ট্যান্ট অটো ডেলিভারি ও ১০% ক্যাশব্যাক!
            </span>
            <span className="text-slate-500">•</span>
            <span className="flex items-center gap-1 text-emerald-300">
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              ১০ সেকেন্ডে অটো লাইসেন্স কি ডেলিভারি
            </span>
          </div>
        </div>

        {/* Right: Guarantee Pills */}
        <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
          <span className="flex items-center gap-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full text-[10px] font-bold">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            Verified
          </span>
          <span className="flex items-center gap-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full text-[10px] font-bold">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            4.9/5 Rating
          </span>
        </div>
      </div>
    </div>
  );
}
