'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import ProductCard from '@/components/product/ProductCard';
import { ProductType } from '@/lib/types';
import {
  Monitor,
  FileText,
  Download,
  ShieldCheck,
  Palette,
  Lock,
  Cloud,
  Layers,
  Sparkles,
  Package,
  FolderKanban,
  ArrowRight,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface CategoryProductSectionProps {
  category: {
    id: string;
    name: string;
    slug: string;
    icon?: string | null;
    description?: string | null;
  };
  products: ProductType[];
  currentSort?: string;
}

function getCategoryIcon(iconName?: string | null) {
  const icon = iconName?.toLowerCase() || '';
  if (icon.includes('monitor') || icon.includes('window') || icon.includes('os')) {
    return <Monitor className="w-5 h-5 text-blue-500" />;
  }
  if (icon.includes('file') || icon.includes('office') || icon.includes('word')) {
    return <FileText className="w-5 h-5 text-orange-500" />;
  }
  if (icon.includes('shield') || icon.includes('anti') || icon.includes('sec')) {
    return <ShieldCheck className="w-5 h-5 text-red-500" />;
  }
  if (icon.includes('download') || icon.includes('util') || icon.includes('tool') || icon.includes('idm')) {
    return <Download className="w-5 h-5 text-emerald-500" />;
  }
  if (icon.includes('palette') || icon.includes('design') || icon.includes('adobe') || icon.includes('creative')) {
    return <Palette className="w-5 h-5 text-purple-500" />;
  }
  if (icon.includes('lock') || icon.includes('vpn') || icon.includes('priv')) {
    return <Lock className="w-5 h-5 text-indigo-500" />;
  }
  if (icon.includes('cloud') || icon.includes('drive') || icon.includes('store')) {
    return <Cloud className="w-5 h-5 text-cyan-500" />;
  }
  if (icon.includes('project') || icon.includes('kanban') || icon.includes('task')) {
    return <FolderKanban className="w-5 h-5 text-amber-500" />;
  }
  return <Sparkles className="w-5 h-5 text-blue-500" />;
}

export default function CategoryProductSection({
  category,
  products,
  currentSort = 'newest',
}: CategoryProductSectionProps) {
  const [expanded, setExpanded] = useState(false);

  // Up to 2 rows of products (4 products per row on desktop = 8 products)
  const MAX_TWO_ROWS = 8;
  const hasMoreThanTwoRows = products.length > MAX_TWO_ROWS;
  const displayedProducts = expanded || !hasMoreThanTwoRows ? products : products.slice(0, MAX_TWO_ROWS);

  const categoryUrl = `/shop?cat=${category.slug}${currentSort !== 'newest' ? `&sort=${currentSort}` : ''}`;

  return (
    <section
      id={`cat-${category.slug}`}
      className="scroll-mt-20 space-y-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs"
    >
      {/* Category Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            {getCategoryIcon(category.icon || category.name)}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                {category.name}
              </h2>
              <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {products.length} {products.length === 1 ? 'item' : 'items'}
              </span>
              {hasMoreThanTwoRows && !expanded && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
                  Showing 2 rows
                </span>
              )}
            </div>
            {category.description && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                {category.description}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          {hasMoreThanTwoRows && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1"
            >
              <span>{expanded ? 'Collapse to 2 rows' : `View all ${products.length}`}</span>
              {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          )}

          <Link
            href={categoryUrl}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-xs shadow-blue-600/20 transition-all flex items-center gap-1 group"
          >
            <span>Only {category.name}</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>

      {/* 2-Row Product Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3 md:gap-4">
        {displayedProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Expand Bar if more than 2 rows exist */}
      {hasMoreThanTwoRows && !expanded && (
        <div className="pt-2 text-center">
          <button
            onClick={() => setExpanded(true)}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
          >
            <span>+ Expand remaining {products.length - MAX_TWO_ROWS} products in {category.name}</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </section>
  );
}

