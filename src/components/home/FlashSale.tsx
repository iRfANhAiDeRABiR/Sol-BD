'use client';

import React, { useState, useEffect } from 'react';
import { Flame, Clock, Zap } from 'lucide-react';
import ProductCard from '@/components/product/ProductCard';
import { ProductType } from '@/lib/types';

interface FlashSaleProps {
  products: ProductType[];
}

export default function FlashSale({ products }: FlashSaleProps) {
  const [timeLeft, setTimeLeft] = useState({
    hours: 14,
    minutes: 32,
    seconds: 45,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: 59, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 24, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const flashProducts = products.filter((p) => p.isFlashSale);
  if (flashProducts.length === 0) return null;

  return (
    <section className="max-w-[1800px] mx-auto px-2 sm:px-4 lg:px-6 py-6">
      {/* Header with Countdown Timer */}
      <div className="rounded-2xl p-4 sm:p-5 text-white shadow-sm mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800">
        <div className="flex items-center gap-3 text-center sm:text-left">
          <div className="w-11 h-11 rounded-xl bg-rose-500/15 border border-rose-500/20 flex items-center justify-center flex-shrink-0">
            <Flame className="w-6 h-6 text-rose-500 fill-rose-500" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold font-sora tracking-tight flex items-center gap-2.5 justify-center sm:justify-start">
              <span>ফ্ল্যাশ সেল অফার</span>
              <span className="text-[11px] bg-rose-600 text-white font-bold px-2.5 py-0.5 rounded-full uppercase shadow-xs">
                Up to 60% OFF
              </span>
            </h2>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              সীমিত সময়ের বিশেষ ছাড়ে অরিজিনাল সফটওয়্যার লাইসেন্স কিনুন
            </p>
          </div>
        </div>

        {/* Live Countdown Clock */}
        <div className="flex items-center gap-2.5 bg-slate-800/90 px-3.5 py-2 rounded-xl border border-slate-700/80">
          <Clock className="w-4 h-4 text-amber-400" />
          <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider mr-1">
            Ends In:
          </span>
          <div className="flex items-center gap-1.5 font-mono font-bold text-xs sm:text-sm">
            <span className="bg-slate-950 text-white px-2 py-0.5 rounded border border-slate-800 shadow-xs">
              {String(timeLeft.hours).padStart(2, '0')}
            </span>
            <span className="text-slate-500">:</span>
            <span className="bg-slate-950 text-white px-2 py-0.5 rounded border border-slate-800 shadow-xs">
              {String(timeLeft.minutes).padStart(2, '0')}
            </span>
            <span className="text-slate-500">:</span>
            <span className="bg-slate-950 text-white px-2 py-0.5 rounded border border-slate-800 shadow-xs">
              {String(timeLeft.seconds).padStart(2, '0')}
            </span>
          </div>
        </div>
      </div>

      {/* Grid of Flash Sale Products - 2 cols on mobile */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {flashProducts.slice(0, 4).map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

