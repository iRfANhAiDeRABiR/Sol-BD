import React from 'react';
import prisma from '@/lib/prisma';
import ProductCard from '@/components/product/ProductCard';
import ShopSortSelect from '@/components/shop/ShopSortSelect';
import CategoryProductSection from '@/components/shop/CategoryProductSection';
import { ProductType } from '@/lib/types';
import Link from 'next/link';
import { Search } from 'lucide-react';

export const revalidate = 0;

interface ShopPageProps {
  searchParams?: Promise<{
    cat?: string;
    q?: string;
    sort?: string;
  }>;
}

export default async function ShopPage(props: ShopPageProps) {
  const searchParams = (await props.searchParams) || {};
  const selectedCat = searchParams.cat ? decodeURIComponent(searchParams.cat) : 'all';
  const query = searchParams.q ? decodeURIComponent(searchParams.q) : '';
  const sort = searchParams.sort || 'newest';

  const [categories, totalProductCount] = await Promise.all([
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: [
        { sortOrder: 'asc' },
        { name: 'asc' },
      ],
      include: {
        _count: {
          select: { products: true },
        },
      },
    }),
    prisma.product.count({
      where: { status: 'ACTIVE' },
    }),
  ]);

  // Build filter query
  const where: any = {
    status: 'ACTIVE',
  };
  if (selectedCat !== 'all' && !query) {
    where.category = { slug: selectedCat };
  }
  if (query) {
    where.OR = [
      { title: { contains: query } },
      { description: { contains: query } },
      { summary: { contains: query } },
      { brand: { contains: query } },
      { tags: { contains: query } },
      { category: { name: { contains: query } } },
    ];
  }

  const rawProducts = await prisma.product.findMany({
    where,
    include: {
      variants: true,
      category: true,
    },
    orderBy: [
      { sortOrder: 'asc' },
      { createdAt: 'desc' },
    ],
  });

  // Deduplicate products by id and normalized title
  const seenIds = new Set<string>();
  const seenTitles = new Set<string>();
  const uniqueProducts = (rawProducts as unknown as (ProductType & { createdAt?: Date })[]).filter((p) => {
    const titleKey = p.title.trim().toLowerCase();
    if (seenIds.has(p.id) || seenTitles.has(titleKey)) return false;
    seenIds.add(p.id);
    seenTitles.add(titleKey);
    return true;
  });

  // Sort products
  const sortedProducts = [...uniqueProducts].sort((a, b) => {
    if (sort === 'priority') {
      const orderA = a.sortOrder ?? 0;
      const orderB = b.sortOrder ?? 0;
      if (orderA !== orderB) {
        if (orderA === 0) return 1;
        if (orderB === 0) return -1;
        return orderA - orderB;
      }
      return 0;
    }
    if (sort === 'price_low') {
      const minA = Math.min(...(a.variants?.map((v) => v.price) || [0]));
      const minB = Math.min(...(b.variants?.map((v) => v.price) || [0]));
      return minA - minB;
    }
    if (sort === 'price_high') {
      const minA = Math.min(...(a.variants?.map((v) => v.price) || [0]));
      const minB = Math.min(...(b.variants?.map((v) => v.price) || [0]));
      return minB - minA;
    }
    if (sort === 'name_asc') {
      return a.title.localeCompare(b.title);
    }
    if (sort === 'name_desc') {
      return b.title.localeCompare(a.title);
    }
    if (sort === 'rating') {
      return (b.rating || 0) - (a.rating || 0);
    }
    if (sort === 'featured') {
      return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
    }
    // Default: 'newest' (with individual sort priority if assigned)
    const orderA = a.sortOrder ?? 0;
    const orderB = b.sortOrder ?? 0;
    if (orderA !== orderB && (orderA > 0 || orderB > 0)) {
      if (orderA === 0) return 1;
      if (orderB === 0) return -1;
      return orderA - orderB;
    }

    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return dateB - dateA;
  });

  const activeCategory = selectedCat !== 'all' ? categories.find((c) => c.slug === selectedCat) : null;

  return (
    <div className="max-w-[1440px] mx-auto px-3 sm:px-5 py-6 space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl p-6 sm:p-8 bg-gradient-to-r from-violet-700 via-indigo-700 to-blue-700 dark:from-violet-950 dark:via-indigo-950 dark:to-slate-900 text-white shadow-xl relative overflow-hidden border border-violet-500/20">
        {/* Ambient subtle glow decoration */}
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-sky-400/15 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-2 max-w-xl">
          <span className="text-xs font-black uppercase tracking-wider text-amber-300 bg-black/25 backdrop-blur-sm border border-amber-300/30 px-3 py-1 rounded-full inline-block shadow-sm">
            Official Store
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white drop-shadow-sm">
            {activeCategory ? activeCategory.name : 'সকল ডিজিটাল সফটওয়্যার ও লাইসেন্স'}
          </h1>
          <p className="text-xs sm:text-sm text-indigo-100 dark:text-slate-300 leading-relaxed font-medium">
            {activeCategory?.description ||
              'জেনুইন উইন্ডোজ, মাইক্রোসফট অফিস, আইডিএম এবং অ্যান্টিভাইরাস লাইসেন্স কি সর্বনিম্ন মূল্যে তাৎক্ষণিক অটোমেটেড ডেলিভারিসহ।'}
          </p>
        </div>
      </div>

      {/* Filter, Sort, and Search Bar */}
      <div className="flex flex-col gap-3 bg-white/95 dark:bg-[#0f172a]/95 p-3.5 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] shadow-sm backdrop-blur-xl">
        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full pb-1">
          <Link
            href={sort !== 'newest' ? `/shop?sort=${sort}` : '/shop'}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedCat === 'all'
                ? 'bg-violet-600 text-white shadow-md shadow-violet-500/25'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            All Categories ({totalProductCount})
          </Link>
          {categories.map((c) => {
            const count = c._count?.products;
            const catUrl = `/shop?cat=${c.slug}${sort !== 'newest' ? `&sort=${sort}` : ''}`;
            return (
              <Link
                key={c.id}
                href={catUrl}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCat === c.slug
                    ? 'bg-violet-600 text-white shadow-md shadow-violet-500/25'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {c.name} {count !== undefined && <span className="opacity-70 text-[11px]">({count})</span>}
              </Link>
            );
          })}
        </div>

        {/* Bottom controls: Search, Sort & Counter */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-2 border-t border-slate-100 dark:border-white/[0.05]">
          <div className="text-xs font-bold text-slate-400 order-3 sm:order-1">
            Showing <span className="text-violet-600 dark:text-violet-400 font-extrabold">{sortedProducts.length}</span> {sortedProducts.length === 1 ? 'product' : 'products'}
          </div>

          <div className="flex items-center gap-2 order-2 flex-wrap sm:flex-nowrap">
            {/* Search Input Form */}
            <form
              action="/shop"
              method="GET"
              className="flex items-center gap-2.5 flex-1 sm:w-80 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-white/[0.08] rounded-xl px-4 py-2.5 focus-within:border-violet-500 transition-colors"
            >
              {sort !== 'newest' && (
                <input type="hidden" name="sort" value={sort} />
              )}
              <Search className="w-4.5 h-4.5 text-slate-400 shrink-0" />
              <input
                type="text"
                name="q"
                defaultValue={query}
                placeholder="Search products..."
                className="bg-transparent text-sm w-full outline-none font-medium text-slate-800 dark:text-white placeholder:text-slate-400"
              />
            </form>

            {/* Sort Selector */}
            <ShopSortSelect currentSort={sort} />
          </div>
        </div>
      </div>

      {/* Products Display */}
      {sortedProducts.length === 0 ? (
        <div className="text-center py-16 bg-white/95 dark:bg-[#0f172a]/95 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] space-y-3">
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
            কোনো প্রোডাক্ট খুঁজে পাওয়া যায়নি (No products found)
          </p>
          <Link
            href="/shop"
            className="brand-gradient-btn text-white text-xs font-bold px-4 py-2 rounded-xl inline-block"
          >
            Clear Filters
          </Link>
        </div>
      ) : selectedCat === 'all' && !query ? (
        /* Expand all categories (each category showing up to 2 rows of products) */
        <div className="space-y-6">
          {categories.map((c) => {
            const catProducts = sortedProducts.filter(
              (p) => p.categoryId === c.id || p.category?.slug === c.slug
            );
            if (catProducts.length === 0) return null;

            return (
              <CategoryProductSection
                key={c.id}
                category={c}
                products={catProducts}
                currentSort={sort}
              />
            );
          })}

          {/* Fallback for uncategorized products if any */}
          {(() => {
            const uncategorized = sortedProducts.filter(
              (p) => !categories.some((c) => c.id === p.categoryId || c.slug === p.category?.slug)
            );
            if (uncategorized.length === 0) return null;
            return (
              <CategoryProductSection
                key="other"
                category={{
                  id: 'other',
                  name: 'Other Software Licenses',
                  slug: 'other',
                  description: 'Additional genuine digital software licenses',
                }}
                products={uncategorized}
                currentSort={sort}
              />
            );
          })()}
        </div>
      ) : (
        /* Single category or search query filtered view */
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              {query
                ? `Search Results for "${query}"`
                : activeCategory?.name || 'Filtered Products'}
            </h2>
            <Link
              href="/shop"
              className="text-xs font-bold text-violet-600 dark:text-violet-400 hover:underline"
            >
              View All Categories (Expanded)
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {sortedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

