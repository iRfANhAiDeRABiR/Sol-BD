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
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* 1. Clean Top Header: Title on Left, Sort Dropdown on Right */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-violet-600 dark:text-violet-400" />
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              জনপ্রিয় সফটওয়্যার ও লাইসেন্স
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            সবচেয়ে বেশি বিক্রিত এবং রেটেড অরিজিনাল সফটওয়্যার সমূহ
          </p>
        </div>

        {/* Quick Sort Dropdown */}
        <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/[0.08] rounded-xl px-3 py-1.5 shadow-sm self-start sm:self-auto shrink-0">
          <ArrowUpDown className="w-3.5 h-3.5 text-violet-500 shrink-0" />
          <span className="text-[11px] font-bold text-slate-500 shrink-0">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            aria-label="Sort products on home grid"
            className="bg-transparent text-xs font-bold text-slate-800 dark:text-white outline-none cursor-pointer"
          >
            <option value="featured" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">✨ Featured</option>
            <option value="priority" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">🔢 Display Priority</option>
            <option value="newest" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">🕒 Newest</option>
            <option value="price_asc" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">💲 Price: Low to High</option>
            <option value="price_desc" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">💲 Price: High to Low</option>
            <option value="name_asc" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">🔤 Name: A to Z</option>
            <option value="name_desc" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">🔤 Name: Z to A</option>
            <option value="rating" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">⭐ Top Rated</option>
          </select>
        </div>
      </div>

      {/* 2. Dedicated Full-Width Category Pill Navigation Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 no-scrollbar sm:flex-wrap">
        <button
          onClick={() => setSelectedCat('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
            selectedCat === 'all'
              ? 'bg-violet-600 text-white shadow-md shadow-violet-500/25 ring-2 ring-violet-500/20'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          <span>All</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
              selectedCat === 'all'
                ? 'bg-white/20 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
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
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
                isSelected
                  ? 'bg-violet-600 text-white shadow-md shadow-violet-500/25 ring-2 ring-violet-500/20'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>{cat.name}</span>
              {count > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 3. Product Grid */}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {sorted.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}
