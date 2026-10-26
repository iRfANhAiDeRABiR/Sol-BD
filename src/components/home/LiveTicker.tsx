'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function LiveTicker() {
  const deals = [
    { name: 'Windows 11 Pro', price: '৳999', discount: '-45%', tag: '🔥' },
    { name: 'Office 2021 Pro Plus', price: '৳1,399', discount: '-42%', tag: '📦' },
    { name: 'IDM Lifetime Official', price: '৳1,899', discount: '-32%', tag: '⚡' },
    { name: 'Office 365 5-Device 1-Year', price: '৳1,999', discount: '-50%', tag: '☁️' },
    { name: 'Kaspersky Internet Security', price: '৳650', discount: '-35%', tag: '🛡️' },
    { name: 'Windows 10 Pro Retail', price: '৳799', discount: '-40%', tag: '💻' },
  ];

  return (
    <div className="max-w-[1800px] mx-auto px-2 sm:px-4 lg:px-6 my-2">
      <div className="rounded-2xl px-3 sm:px-4 py-2.5 flex items-center gap-3 overflow-hidden border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 shadow-xs">
        {/* Left Live Badge */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-white text-[10px] font-bold uppercase tracking-wider bg-rose-600 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
            <span>LIVE</span>
          </div>
          <span className="hidden sm:inline text-xs font-semibold text-slate-800 dark:text-slate-200">
            Today&#39;s Deals:
          </span>
        </div>

        {/* Center Marquee */}
        <div className="flex-1 overflow-hidden mask-fade-edges offer-marquee">
          <div className="offer-marquee-track flex items-center gap-6">
            {deals.concat(deals).map((deal, idx) => (
              <Link
                key={idx}
                href="/shop"
                className="flex items-center gap-2 text-xs font-semibold whitespace-nowrap hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <span>{deal.tag}</span>
                <span className="text-slate-800 dark:text-slate-200 font-bold">{deal.name}</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">{deal.price}</span>
                <span className="text-[10px] font-bold text-rose-600 bg-rose-500/10 px-1.5 py-0.5 rounded-full">
                  {deal.discount}
                </span>
                <span className="text-slate-300 dark:text-slate-700 ml-2">•</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Right Action */}
        <Link
          href="/shop"
          className="hidden md:flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors flex-shrink-0 whitespace-nowrap"
        >
          <span>All Deals</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}

