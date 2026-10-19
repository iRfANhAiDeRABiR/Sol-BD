'use client';

import React, { useState } from 'react';
import ProductCard from '@/components/product/ProductCard';
import { ProductType, CategoryType } from '@/lib/types';
import { Sparkles, ArrowUpDown, Layers } from 'lucide-react';

interface ProductGridProps {
  products: ProductType[];
  categories: CategoryType[];
}

export default function ProductGrid({ products, categories }: ProductGridProps) {
  const [selectedCat, setSelectedCat] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('featured');

  const filtered =
    selectedCat === 'all'
      ? products
      : products.filter(
          (p) =>
            p.category?.slug === selectedCat ||
            p.categoryId === selectedCat ||
            p.category?.id === selectedCat
        );

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'priority') {
      const orderA = a.sortOrder ?? 0;
      const orderB = b.sortOrder ?? 0;
      if (orderA !== orderB) {
        if (orderA === 0) return 1;
        if (orderB === 0) return -1;
        return orderA - orderB;
      }
      return 0;
    }
    if (sortBy === 'price_asc') {
      const minA = Math.min(...(a.variants?.map((v) => v.price) || [0]));
      const minB = Math.min(...(b.variants?.map((v) => v.price) || [0]));
      return minA - minB;
    }
    if (sortBy === 'price_desc') {
      const minA = Math.min(...(a.variants?.map((v) => v.price) || [0]));
      const minB = Math.min(...(b.variants?.map((v) => v.price) || [0]));
      return minB - minA;
    }
    if (sortBy === 'name_asc') {
      return a.title.localeCompare(b.title);
    }
    if (sortBy === 'name_desc') {
      return b.title.localeCompare(a.title);
    }
    if (sortBy === 'rating') {
      return (b.rating || 0) - (a.rating || 0);
    }
    if (sortBy === 'newest') {
      return 0; // Default order
    }
    // Default 'featured': Sort by individual sort priority first if set
    const orderA = a.sortOrder ?? 0;
    const orderB = b.sortOrder ?? 0;
    if (orderA !== orderB && (orderA > 0 || orderB > 0)) {
      if (orderA === 0) return 1;
      if (orderB === 0) return -1;
      return orderA - orderB;
    }
    return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
  });

  return (
    <section className="max-w-[1800px] mx-auto px-2 sm:px-4 lg:px-6 py-8">
      {/* 1. Header Matching Shahed Store Typography */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-violet-500" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-violet-600 dark:text-violet-400 font-sora">
              Verified Digital Store
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black font-sora tracking-tight text-slate-900 dark:text-white">
            Top{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, hsl(243,75%,59%), hsl(263,70%,58%))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Selling Products
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            সবচেয়ে বেশি বিক্রিত এবং গ্রাহক প্রশংসিত ১০০% জেনুইন সফটওয়্যার
          </p>
        </div>

        {/* Quick Sort Dropdown */}
        <div
          className="flex items-center gap-1.5 rounded-xl px-3 py-2 border shadow-xs self-start sm:self-auto shrink-0"
          style={{
            background: 'var(--glass-bg)',
            borderColor: 'var(--glass-border)',
          }}
        >
          <ArrowUpDown className="w-3.5 h-3.5 text-violet-500 shrink-0" />
          <span className="text-[11px] font-bold text-slate-500 shrink-0">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            aria-label="Sort products on home grid"
            className="bg-transparent text-xs font-bold text-slate-800 dark:text-white outline-none cursor-pointer"
          >
            <option value="featured" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
              ✨ Featured
            </option>
            <option value="priority" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
              🔢 Display Priority
            </option>
            <option value="newest" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
              🕒 Newest
            </option>
            <option value="price_asc" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
              💲 Price: Low to High
            </option>
            <option value="price_desc" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
              💲 Price: High to Low
            </option>
            <option value="name_asc" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
              🔤 Name: A to Z
            </option>
            <option value="name_desc" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
              🔤 Name: Z to A
            </option>
            <option value="rating" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
              ⭐ Top Rated
            </option>
          </select>
        </div>
      </div>

      {/* 2. Category Pill Navigation Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 no-scrollbar sm:flex-wrap">
        <button
          onClick={() => setSelectedCat('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 hover:scale-105 ${
            selectedCat === 'all'
              ? 'text-white shadow-md'
              : 'text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-white/[0.08] hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
          style={{
            background:
              selectedCat === 'all'
                ? 'linear-gradient(135deg, hsl(258,78%,55%), hsl(200,90%,45%))'
                : 'var(--glass-bg)',
            boxShadow:
              selectedCat === 'all' ? '0 4px 16px hsla(258,78%,55%,0.30)' : 'none',
          }}
        >
          <span>All Products</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
              selectedCat === 'all'
                ? 'bg-white/20 text-white'
                : 'bg-slate-200/60 dark:bg-slate-800 text-slate-500'
            }`}
          >
            {products.length}
          </span>
        </button>

        {categories.map((cat) => {
          const count = products.filter(
            (p) =>
              p.category?.slug === cat.slug ||
              p.categoryId === cat.id ||
              p.category?.id === cat.id
          ).length;

          const isSelected = selectedCat === cat.slug;

          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCat(cat.slug)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 hover:scale-105 ${
                isSelected
                  ? 'text-white shadow-md'
                  : 'text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-white/[0.08] hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              style={{
                background: isSelected
                  ? 'linear-gradient(135deg, hsl(258,78%,55%), hsl(200,90%,45%))'
                  : 'var(--glass-bg)',
                boxShadow: isSelected ? '0 4px 16px hsla(258,78%,55%,0.30)' : 'none',
              }}
            >
              <span>{cat.name}</span>
              {count > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-200/60 dark:bg-slate-800 text-slate-500'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 3. Modern Multi-Column Product Grid (2 columns on mobile, 3 on tablet, 4 on desktop, 5 on wide) */}
      {sorted.length === 0 ? (
        <div className="text-center py-16 bg-white/40 dark:bg-slate-900/40 rounded-3xl border border-slate-200 dark:border-white/[0.08] p-8 space-y-3">
          <Layers className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
            এই ক্যাটাগরিতে কোনো পণ্য পাওয়া যায়নি (No products found)
          </p>
          <button
            onClick={() => setSelectedCat('all')}
            className="text-xs font-bold text-violet-600 dark:text-violet-400 hover:underline"
          >
            সবগুলো পণ্য দেখুন (View All Products)
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5 gap-3 md:gap-4">
          {sorted.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}
