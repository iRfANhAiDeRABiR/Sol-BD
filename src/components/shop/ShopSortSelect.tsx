'use client';

import React from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { ArrowUpDown } from 'lucide-react';

interface ShopSortSelectProps {
  currentSort?: string;
}

export default function ShopSortSelect({ currentSort = 'newest' }: ShopSortSelectProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSort = e.target.value;
    const params = new URLSearchParams(searchParams.toString());
    
    if (newSort === 'newest') {
      params.delete('sort');
    } else {
      params.set('sort', newSort);
    }

    const queryString = params.toString();
    router.push(`${pathname}${queryString ? `?${queryString}` : ''}`);
  };

  return (
    <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-white/[0.08] rounded-xl px-2.5 py-1.5 focus-within:border-violet-500 transition-colors">
      <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
      <span className="text-[11px] font-bold text-slate-500 shrink-0">Sort:</span>
      <select
        value={currentSort}
        onChange={handleSortChange}
        aria-label="Sort products"
        className="bg-transparent text-xs font-bold text-slate-800 dark:text-white outline-none cursor-pointer pr-1"
      >
        <option value="newest" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
          🕒 Default / Newest
        </option>
        <option value="priority" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
          🔢 Display Priority
        </option>
        <option value="featured" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
          ✨ Featured
        </option>
        <option value="price_low" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
          💲 Price: Low to High
        </option>
        <option value="price_high" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
          💲 Price: High to Low
        </option>
        <option value="name_asc" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
          🔤 Name: A to Z
        </option>
        <option value="name_desc" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
          🔤 Name: Z to A
        </option>
        <option value="rating" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
          ⭐ Highest Rated
        </option>
      </select>
    </div>
  );
}

