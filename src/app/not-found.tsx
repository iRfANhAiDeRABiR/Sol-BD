'use client';

import React from 'react';
import Link from 'next/link';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 text-center">
      <div className="max-w-md space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-violet-100 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center mx-auto text-3xl font-black shadow-sm">
          404
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            পৃষ্ঠাটি খুঁজে পাওয়া যায়নি
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            আপনি যে পৃষ্ঠাটি খুঁজছেন তা হয়তো সরানো হয়েছে অথবা লিংকটি সঠিক নয়।
          </p>
        </div>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className="brand-gradient-btn text-white text-xs sm:text-sm font-bold px-6 py-3 rounded-2xl flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
          >
            <Home className="w-4 h-4" />
            <span>হোমে ফিরে যান</span>
          </Link>
          <Link
            href="/shop"
            className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-bold px-5 py-3 rounded-2xl flex items-center gap-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>শপ দেখুন</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
