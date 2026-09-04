'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Plus,
  Search,
  ExternalLink,
  Trash2,
  Edit,
  Key,
  Layers,
  Sparkles,
  Package,
  Filter,
  ArrowUpDown,
} from 'lucide-react';
import { formatPrice, formatImageUrl } from '@/lib/utils';
import { deleteProductAction, uploadLicenseKeys, updateProductSortOrderAction } from '@/app/admin/actions';
import ProductImportExport from './ProductImportExport';
import { toast } from 'sonner';

interface ProductItem {
  id: string;
  title: string;
  slug: string;
  brand: string;
  image: string;
  category: { id: string; name: string };
  isFeatured: boolean;
  isFlashSale: boolean;
  deliveryType: string;
  sortOrder?: number;
  variants: Array<{
    id: string;
    name: string;
    price: number;
    originalPrice: number | null;
    stock: number;
    licenseType: string;
    _count?: { licenseKeys: number };
  }>;
}

export default function ProductsListClient({
  initialProducts,
}: {
  initialProducts: ProductItem[];
}) {
  const [products, setProducts] = useState(initialProducts);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('default');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  // Bulk Add Keys Modal
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [selectedVariantId, setSelectedVariantId] = useState('');
  const [rawKeysInput, setRawKeysInput] = useState('');
  const [importingKeys, setImportingKeys] = useState(false);

  const handleUpdateSortOrder = async (productId: string, newOrder: number) => {
    setUpdatingOrderId(productId);
    try {
      const res = await updateProductSortOrderAction(productId, newOrder);
      if (res?.error) throw new Error(res.error);
      toast.success('Display priority order updated!');
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, sortOrder: newOrder } : p))
      );
    } catch (err: any) {
      toast.error(err.message || 'Failed to update priority order.');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const distinctCategories = Array.from(
    new Set(products.map((p) => p.category?.name).filter(Boolean))
  ).sort();

  const filteredProducts = products.filter((p) => {
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !term ||
      p.title.toLowerCase().includes(term) ||
      p.brand.toLowerCase().includes(term) ||
      p.category?.name?.toLowerCase().includes(term);

    const matchesCategory =
      categoryFilter === 'all' || p.category?.name === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'order_asc') return (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
    if (sortBy === 'order_desc') return (b.sortOrder ?? 0) - (a.sortOrder ?? 0);
    if (sortBy === 'title_asc') return a.title.localeCompare(b.title);
    if (sortBy === 'title_desc') return b.title.localeCompare(a.title);
    if (sortBy === 'brand_asc') return a.brand.localeCompare(b.brand);
    if (sortBy === 'category_asc')
      return (a.category?.name || '').localeCompare(b.category?.name || '');

    // Price sorting
    const minPriceA = Math.min(...(a.variants?.map((v) => v.price) || [0]));
    const minPriceB = Math.min(...(b.variants?.map((v) => v.price) || [0]));
    if (sortBy === 'price_asc') return minPriceA - minPriceB;
    if (sortBy === 'price_desc') return minPriceB - minPriceA;

    // Stock sorting
    const stockA = a.variants?.reduce((sum, v) => sum + (v.stock || 0), 0) || 0;
    const stockB = b.variants?.reduce((sum, v) => sum + (v.stock || 0), 0) || 0;
    if (sortBy === 'stock_asc') return stockA - stockB;
    if (sortBy === 'stock_desc') return stockB - stockA;

    // Default: Sort by individual priority first (if set), then newest
    const orderA = a.sortOrder ?? 0;
    const orderB = b.sortOrder ?? 0;
    if (orderA !== orderB && (orderA > 0 || orderB > 0)) {
      if (orderA === 0) return 1;
      if (orderB === 0) return -1;
      return orderA - orderB;
    }

    return 0; // Default
  });

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    setDeletingId(id);
    try {
      const res = await deleteProductAction(id);
      if (res?.error) throw new Error(res.error);

      toast.success('Product deleted successfully.');
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete product.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleUploadKeys = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVariantId || !rawKeysInput.trim()) {
      toast.error('Please choose a variant and paste license keys.');
      return;
    }

    setImportingKeys(true);
    try {
      const res = await uploadLicenseKeys(selectedVariantId, rawKeysInput);
      if (res?.error || res?.count === undefined) throw new Error(res?.error || 'Upload failed.');

      toast.success(`Successfully uploaded ${res.count} license keys!`);
      setBulkModalOpen(false);
      setRawKeysInput('');
    } catch (err: any) {
      toast.error(err.message || 'Upload failed.');
    } finally {
      setImportingKeys(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search products, brand, or category..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/[0.08] text-xs focus:outline-none focus:ring-2 focus:ring-violet-500/50"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <ProductImportExport />

          <button
            onClick={() => setBulkModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white shadow-sm transition-all active:scale-95"
          >
            <Key className="w-3.5 h-3.5 text-amber-400" />
            <span>Restock Keys</span>
          </button>

          <Link
            href="/admin/products/new"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-violet-600 hover:bg-violet-700 text-white shadow-md shadow-violet-600/20 transition-all active:scale-95 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </Link>
        </div>
      </div>

      {/* Filter & Sort Controls Row */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white/80 dark:bg-slate-900/80 p-3 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] shadow-sm backdrop-blur-md">
        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
          {/* Category Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Filter className="w-3.5 h-3.5 text-violet-500" />
            <span className="font-bold text-[11px]">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              aria-label="Filter products by category"
              className="px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/[0.08] text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value="all">All Categories ({products.length})</option>
              {distinctCategories.map((c) => (
                <option key={c} value={c}>
                  {c} ({products.filter((p) => p.category?.name === c).length})
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <ArrowUpDown className="w-3.5 h-3.5 text-violet-500" />
            <span className="font-bold text-[11px]">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sort products"
              className="px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/[0.08] text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value="default">🕒 Default / Storefront</option>
              <option value="order_asc">🔢 Priority (# Low → High)</option>
              <option value="order_desc">🔢 Priority (# High → Low)</option>
              <option value="title_asc">🔤 Title (A → Z)</option>
              <option value="title_desc">🔤 Title (Z → A)</option>
              <option value="price_asc">💲 Price (Low → High)</option>
              <option value="price_desc">💲 Price (High → Low)</option>
              <option value="stock_asc">📦 Stock (Low → High / Restock)</option>
              <option value="stock_desc">📦 Stock (High → Low)</option>
              <option value="category_asc">🏷️ Category (A → Z)</option>
              <option value="brand_asc">🏢 Brand (A → Z)</option>
            </select>
          </div>
        </div>

        <div className="text-xs font-bold text-slate-400 self-end sm:self-center">
          Showing <span className="text-violet-600 dark:text-violet-400 font-extrabold">{sortedProducts.length}</span> of {products.length} products
        </div>
      </div>

      {/* Product Cards Grid */}
      {sortedProducts.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] space-y-2">
          <p className="text-xs font-bold text-slate-400">No products match your search/filter criteria.</p>
          {(searchTerm || categoryFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setCategoryFilter('all');
                setSortBy('default');
              }}
              className="text-xs text-violet-600 dark:text-violet-400 font-bold underline"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedProducts.map((p) => {
            const totalStock = p.variants.reduce((acc, v) => acc + (v.stock || 0), 0);

          return (
            <div
              key={p.id}
              className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] p-4 shadow-sm space-y-3 flex flex-col justify-between hover:border-violet-500/30 transition-all"
            >
              <div className="space-y-3">
                {/* Header with image */}
                <div className="flex gap-3">
                  <Link
                    href={`/admin/products/${p.id}`}
                    className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0 border border-slate-200/60 dark:border-white/[0.06] hover:opacity-90 transition-opacity"
                    title="Edit Product"
                  >
                    <Image src={formatImageUrl(p.image)} alt={p.title} fill className="object-cover" />
                  </Link>

                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-black uppercase tracking-wider text-violet-600 dark:text-violet-400">
                      {p.brand} • {p.category.name}
                    </span>
                    <Link
                      href={`/admin/products/${p.id}`}
                      className="block text-xs font-bold text-slate-900 dark:text-white line-clamp-2 mt-0.5 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
                      title="Edit Product"
                    >
                      {p.title}
                    </Link>

                    <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                      {/* Individual Display Priority Input */}
                      <div
                        className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg border border-slate-200 dark:border-white/[0.08]"
                        title="Set individual display priority order. Lower numbers appear first on storefront."
                      >
                        <span className="text-[10px] font-mono font-bold text-violet-600 dark:text-violet-400">#Order</span>
                        <input
                          type="number"
                          min={0}
                          key={`order-${p.id}-${p.sortOrder ?? 0}`}
                          defaultValue={p.sortOrder ?? 0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              (e.target as HTMLInputElement).blur();
                            }
                          }}
                          onBlur={(e) => {
                            const val = parseInt(e.target.value) || 0;
                            if (val !== (p.sortOrder ?? 0)) {
                              handleUpdateSortOrder(p.id, val);
                            }
                          }}
                          disabled={updatingOrderId === p.id}
                          className="w-10 bg-transparent text-[11px] font-mono font-black text-slate-800 dark:text-slate-100 outline-none text-center focus:bg-violet-500/15 rounded transition-colors"
                        />
                      </div>

                      {p.isFeatured && (
                        <span className="text-[9px] bg-amber-500/10 text-amber-700 dark:text-amber-300 font-bold px-1.5 py-0.5 rounded border border-amber-500/20">
                          Featured
                        </span>
                      )}
                      {p.isFlashSale && (
                        <span className="text-[9px] bg-rose-500/10 text-rose-700 dark:text-rose-300 font-bold px-1.5 py-0.5 rounded border border-rose-500/20">
                          Flash Deal
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Variants List & Stock Info */}
                <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-2.5 space-y-1.5 text-xs border border-slate-100 dark:border-white/[0.04]">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">
                    Variants & Stock Pool:
                  </span>
                  {p.variants.map((v) => (
                    <div
                      key={v.id}
                      className="flex justify-between items-center text-slate-700 dark:text-slate-300 text-[11px]"
                    >
                      <span className="truncate pr-2 font-medium">{v.name}</span>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <span className="font-extrabold text-violet-600 dark:text-violet-400">
                          {formatPrice(v.price)}
                        </span>
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold ${
                            v.stock > 0
                              ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20'
                          }`}
                        >
                          {v.stock} in stock
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-white/[0.05] text-xs">
                <Link
                  href={`/product/${p.slug}`}
                  target="_blank"
                  className="text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1 font-semibold"
                >
                  <span>Live Page</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>

                <div className="flex items-center gap-1">
                  <Link
                    href={`/admin/products/${p.id}`}
                    className="flex items-center gap-1 text-violet-600 dark:text-violet-400 hover:text-violet-700 px-2 py-1 rounded-lg hover:bg-violet-50 dark:hover:bg-violet-950/30 transition-colors font-bold text-xs"
                    title="Edit Product Details"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </Link>
                  <button
                    onClick={() => {
                      if (p.variants[0]) {
                        setSelectedVariantId(p.variants[0].id);
                        setBulkModalOpen(true);
                      }
                    }}
                    className="text-amber-500 hover:text-amber-600 p-1.5 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors"
                    title="Add Keys to Variant"
                  >
                    <Key className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(p.id, p.title)}
                    disabled={deletingId === p.id}
                    className="text-slate-400 hover:text-rose-500 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                    title="Delete Product"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    )}

      {/* Restock Keys Modal */}
      {bulkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <form
            onSubmit={handleUploadKeys}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/[0.08] rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-2xl animate-in fade-in zoom-in-95"
          >
            <div className="flex items-center gap-2">
              <Key className="w-5 h-5 text-amber-500" />
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Bulk Upload License Keys
              </h3>
            </div>
            <p className="text-xs text-slate-400">
              Paste keys line-by-line. They will be added to the automated instant delivery pool.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Target Product Variant
              </label>
              <select
                value={selectedVariantId}
                onChange={(e) => setSelectedVariantId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/[0.08] text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
              >
                <option value="">-- Choose Product Variant --</option>
                {products.flatMap((p) =>
                  p.variants.map((v) => (
                    <option key={v.id} value={v.id}>
                      {p.title} - {v.name} ({v.stock} in stock)
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                License Key Codes (1 per line)
              </label>
              <textarea
                value={rawKeysInput}
                onChange={(e) => setRawKeysInput(e.target.value)}
                rows={6}
                placeholder="XXXXX-XXXXX-XXXXX-XXXXX&#10;YYYYY-YYYYY-YYYYY-YYYYY"
                className="w-full font-mono text-xs p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/[0.08] focus:outline-none focus:ring-2 focus:ring-violet-500/50"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setBulkModalOpen(false)}
                className="px-3 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={importingKeys}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-violet-600 hover:bg-violet-700 text-white shadow-md shadow-violet-600/20 transition-all active:scale-95 disabled:opacity-50"
              >
                {importingKeys ? 'Importing...' : 'Upload & Restock Keys'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

