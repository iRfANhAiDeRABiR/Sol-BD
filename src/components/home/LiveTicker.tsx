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
      <div
        className="rounded-2xl px-3 sm:px-4 py-2.5 flex items-center gap-3 overflow-hidden border"
        style={{
          background: 'var(--glass-bg)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          borderColor: 'var(--glass-border)',
          boxShadow: 'var(--glass-shadow)',
        }}
      >
        {/* Left Live Badge */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-white text-[10.5px] font-black uppercase tracking-wider"
            style={{
              background: 'linear-gradient(135deg, hsl(0,80%,55%), hsl(15,90%,55%))',
              animation: 'livePulse 2.2s infinite ease-in-out',
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
            <span>LIVE</span>
          </div>
          <span className="hidden sm:inline text-xs font-bold font-sora text-slate-800 dark:text-slate-200">
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
                className="flex items-center gap-2 text-xs font-semibold whitespace-nowrap hover:text-violet-600 transition-colors"
              >
                <span>{deal.tag}</span>
                <span className="text-slate-800 dark:text-slate-200 font-bold">{deal.name}</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">{deal.price}</span>
                <span className="text-[10px] font-black text-rose-500 bg-rose-500/10 px-1.5 py-0.5 rounded-full">
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
          className="hidden md:flex items-center gap-1 text-xs font-bold text-violet-600 dark:text-violet-400 hover:scale-105 transition-transform flex-shrink-0 whitespace-nowrap"
        >
          <span>All Deals</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
