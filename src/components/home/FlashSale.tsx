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
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header with Countdown Timer */}
      <div className="bg-gradient-to-r from-red-500 via-orange-500 to-amber-500 rounded-2xl p-4 sm:p-5 text-white shadow-lg mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-center sm:text-left">
          <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center flex-shrink-0">
            <Flame className="w-7 h-7 text-yellow-200 fill-yellow-200 animate-bounce" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2 justify-center sm:justify-start">
              <span>ফ্ল্যাশ সেল অফার</span>
              <span className="text-xs bg-white text-red-600 font-extrabold px-2 py-0.5 rounded-md uppercase">
                Up to 60% OFF
              </span>
            </h2>
            <p className="text-xs text-orange-100 font-medium">
              সীমিত সময়ের বিশেষ ছাড়ে অরিজিনাল সফটওয়্যার লাইসেন্স কিনুন
            </p>
          </div>
        </div>

        {/* Live Countdown Clock */}
        <div className="flex items-center gap-2 bg-black/30 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20">
          <Clock className="w-4 h-4 text-amber-300 animate-spin" />
          <span className="text-xs font-bold text-amber-200 uppercase tracking-wider mr-1">
            Ends In:
          </span>
          <div className="flex items-center gap-1 font-mono font-black text-sm sm:text-base">
            <span className="bg-white text-slate-950 px-2 py-0.5 rounded shadow">
              {String(timeLeft.hours).padStart(2, '0')}
            </span>
            <span>:</span>
            <span className="bg-white text-slate-950 px-2 py-0.5 rounded shadow">
              {String(timeLeft.minutes).padStart(2, '0')}
            </span>
            <span>:</span>
            <span className="bg-white text-slate-950 px-2 py-0.5 rounded shadow">
              {String(timeLeft.seconds).padStart(2, '0')}
            </span>
          </div>
        </div>
      </div>

      {/* Grid of Flash Sale Products */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {flashProducts.slice(0, 4).map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

