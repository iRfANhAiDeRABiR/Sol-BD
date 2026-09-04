'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Sparkles,
  Zap,
  HelpCircle,
  FileText,
  Tag,
  CheckCircle2,
  ExternalLink,
  Save,
} from 'lucide-react';
import { PRESET_PRODUCT_IMAGES } from '@/lib/preset-images';
import { createProductAction, updateProductAction, deleteProductAction } from '@/app/admin/actions';
import { formatImageUrl } from '@/lib/utils';
import { toast } from 'sonner';

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
}

interface ProductVariantItem {
  id?: string;
  name: string;
  price: number | string;
  originalPrice?: number | string | null;
  validity: string;
  licenseType: string;
  stock?: number;
  initialKeys?: string;
}

interface ProductItemData {
  id?: string;
  title: string;
  slug: string;
  brand: string;
  categoryId: string;
  summary: string | null;
  description: string;
  image: string;
  deliveryType: string;
  status?: string;
  sortOrder?: number;
  isFeatured: boolean;
  isFlashSale: boolean;
  tags: string;
  variants: ProductVariantItem[];
}

interface FormVariant {
  id?: string;
  name: string;
  price: string;
  originalPrice: string;
  validity: string;
  licenseType: string;
  stock: number;
  initialKeys: string;
}

interface FormState {
  title: string;
  slug: string;
  brand: string;
  categoryId: string;
  summary: string;
  description: string;
  image: string;
  deliveryType: string;
  status: string;
  sortOrder: number;
  isFeatured: boolean;
  isFlashSale: boolean;
  tags: string;
  variants: FormVariant[];
}

export default function ProductFormClient({
  categories,
  initialProduct,
}: {
  categories: CategoryItem[];
  initialProduct?: ProductItemData;
}) {
  const router = useRouter();
  const isEditing = Boolean(initialProduct?.id);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(Boolean(initialProduct?.slug));

  const [form, setForm] = useState<FormState>({
    title: initialProduct?.title || '',
    slug: initialProduct?.slug || '',
    brand: initialProduct?.brand || 'Microsoft',
    categoryId: initialProduct?.categoryId || categories[0]?.id || '',
    summary: initialProduct?.summary || '',
    description: initialProduct?.description || '',
    image: initialProduct?.image || PRESET_PRODUCT_IMAGES[0]?.url || '',
    deliveryType: initialProduct?.deliveryType || 'INSTANT_AUTO',
    status: initialProduct?.status || 'ACTIVE',
    sortOrder: initialProduct?.sortOrder ?? 0,
    isFeatured: initialProduct?.isFeatured ?? true,
    isFlashSale: initialProduct?.isFlashSale ?? false,
    tags: initialProduct?.tags || 'software, genuine, instant delivery',
    variants: initialProduct?.variants?.length
      ? initialProduct.variants.map((v) => ({
          id: v.id,
          name: v.name,
          price: String(v.price),
          originalPrice: v.originalPrice ? String(v.originalPrice) : '',
          validity: v.validity || 'Lifetime',
          licenseType: v.licenseType || 'LICENSE_KEY',
          stock: v.stock || 0,
          initialKeys: '',
        }))
      : [
          {
            name: '1 PC - Retail Lifetime Key',
            price: '999',
            originalPrice: '1800',
            validity: 'Lifetime',
            licenseType: 'LICENSE_KEY',
            stock: 0,
            initialKeys: '',
          },
        ],
  });

  // Variant Helpers
  const addVariant = () => {
    setForm((prev) => ({
      ...prev,
      variants: [
        ...prev.variants,
        {
          name: '',
          price: '999',
          originalPrice: '',
          validity: 'Lifetime',
          licenseType: 'LICENSE_KEY',
          stock: 0,
          initialKeys: '',
        },
      ],
    }));
  };

  const removeVariant = (index: number) => {
    if (form.variants.length <= 1) {
      toast.error('Product must have at least one variant.');
      return;
    }
    setForm((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index),
    }));
  };

  const updateVariant = (index: number, field: string, value: any) => {
    setForm((prev) => {
      const updated = [...prev.variants];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, variants: updated };
    });
  };

  // Pre-Fill Templates
  const applyTemplate = (type: string) => {
    if (type === 'win11') {
      setForm({
        title: 'Windows 11 Pro Retail License Key',
        slug: 'windows-11-pro-retail-key',
        brand: 'Microsoft',
        categoryId: categories.find((c) => c.slug === 'windows')?.id || categories[0]?.id || '',
        summary: 'Original 25-digit retail product key for Windows 11 Pro 64/32 Bit. Lifetime activation.',
        description: `### Windows 11 Pro Retail Key\nBuy original Windows 11 Pro Retail Key with instant automated delivery.\n\n#### Activation Steps:\n1. Open Settings > System > Activation.\n2. Click "Change product key".\n3. Paste the 25-digit key and click Activate!`,
        image: PRESET_PRODUCT_IMAGES.find((p) => p.id === 'win11')?.url || PRESET_PRODUCT_IMAGES[0].url,
        deliveryType: 'INSTANT_AUTO',
        status: 'ACTIVE',
        sortOrder: form.sortOrder,
        isFeatured: true,
        isFlashSale: true,
        tags: 'windows 11, retail key, lifetime, instant',
        variants: [
          {
            name: '1 PC - Retail Lifetime',
            price: '999',
            originalPrice: '1800',
            validity: 'Lifetime',
            licenseType: 'LICENSE_KEY',
            stock: 0,
            initialKeys: 'W11PR-XXXXX-XXXXX-XXXXX-XXXXX',
          },
          {
            name: '2 PC Bundle - Retail Lifetime',
            price: '1799',
            originalPrice: '3200',
            validity: 'Lifetime',
            licenseType: 'LICENSE_KEY',
            stock: 0,
            initialKeys: '',
          },
        ],
      });
    } else if (type === 'office') {
      setForm({
        title: 'Microsoft Office 365 Personal (1 Year / 1 User)',
        slug: 'microsoft-office-365-personal-1yr',
        brand: 'Microsoft',
        categoryId: categories.find((c) => c.slug === 'office')?.id || categories[0]?.id || '',
        summary: 'Word, Excel, PowerPoint + 1TB OneDrive Cloud Storage on personal email.',
        description: `### Microsoft Office 365 Personal\nFull desktop & mobile productivity suite with 1TB OneDrive cloud storage.\n\n#### Activation:\nDirectly redeemed on your own personal Microsoft account via setup.office.com.`,
        image: PRESET_PRODUCT_IMAGES.find((p) => p.id === 'office2024')?.url || PRESET_PRODUCT_IMAGES[0].url,
        deliveryType: 'INSTANT_AUTO',
        status: 'ACTIVE',
        sortOrder: form.sortOrder,
        isFeatured: true,
        isFlashSale: false,
        tags: 'office 365, word, excel, onedrive',
        variants: [
          {
            name: '1 Year Subscription (1 User + 1TB Cloud)',
            price: '1299',
            originalPrice: '2500',
            validity: '1 Year',
            licenseType: 'LICENSE_KEY',
            stock: 0,
            initialKeys: 'OFF365-1YR-AAAAA-BBBBB-CCCCC',
          },
        ],
      });
    } else if (type === 'idm') {
      setForm({
        title: 'Internet Download Manager (IDM) 1 PC Lifetime',
        slug: 'idm-lifetime-official-license',
        brand: 'Tonec IDM',
        categoryId: categories.find((c) => c.slug === 'utility')?.id || categories[0]?.id || '',
        summary: '100% Genuine official IDM license key with 3 years free updates.',
        description: `### Official IDM License\nExperience blazing 5x faster download speeds with Tonec IDM.\n\n#### Activation Steps:\n1. Download IDM from official site.\n2. Click Registration > enter Name, Email, and Serial Key.`,
        image: PRESET_PRODUCT_IMAGES.find((p) => p.id === 'idm')?.url || PRESET_PRODUCT_IMAGES[0].url,
        deliveryType: 'INSTANT_AUTO',
        status: 'ACTIVE',
        sortOrder: form.sortOrder,
        isFeatured: true,
        isFlashSale: true,
        tags: 'idm, download manager, lifetime',
        variants: [
          {
            name: '1 PC - Lifetime Official Serial',
            price: '1899',
            originalPrice: '2800',
            validity: 'Lifetime',
            licenseType: 'LICENSE_KEY',
            stock: 0,
            initialKeys: 'IDM-88991-KEY01-TX772',
          },
        ],
      });
    }
    toast.success(`Loaded ${type.toUpperCase()} template!`);
  };

  const handleDeleteProduct = async () => {
    if (!initialProduct?.id) return;
    if (!confirm(`Are you sure you want to permanently delete "${form.title}"?`)) return;

    setDeleting(true);
    try {
      const res = await deleteProductAction(initialProduct.id);
      if (res?.error) throw new Error(res.error);
      toast.success('Product deleted.');
      router.push('/admin/products');
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete product.');
    } finally {
      setDeleting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.brand || !form.image) {
      toast.error('Please enter Title, Brand, and Image.');
      return;
    }

    setSubmitting(true);
    try {
      if (initialProduct?.id) {
        const res = await updateProductAction({
          id: initialProduct.id,
          ...form,
          variants: form.variants.map((v) => ({
            ...v,
            price: Number(v.price),
            originalPrice: v.originalPrice ? Number(v.originalPrice) : undefined,
          })),
        });

        if (res?.error) throw new Error(res.error);

        toast.success(`Product "${form.title}" updated successfully!`);
        router.push('/admin/products');
      } else {
        const res = await createProductAction({
          ...form,
          variants: form.variants.map((v) => ({
            ...v,
            price: Number(v.price),
            originalPrice: v.originalPrice ? Number(v.originalPrice) : undefined,
          })),
        });

        if (res?.error) throw new Error(res.error);

        toast.success(`Product "${form.title}" created successfully!`);
        router.push('/admin/products');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to save product.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="p-2 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                {isEditing ? `Edit Product: ${form.title}` : 'Create New Digital Product'}
              </h1>
              {isEditing && (
                <span
                  className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                    form.status === 'ACTIVE'
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                      : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                  }`}
                >
                  {form.status}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              {isEditing
                ? 'Update specifications, pricing, variants, and append digital license keys'
                : 'Configure product details, preset assets, and initial digital license pool'}
            </p>
          </div>
        </div>

        {/* Actions or Quick Pre-fill Templates */}
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Link
                href={`/product/${form.slug}`}
                target="_blank"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-slate-900 text-xs font-bold text-violet-600 dark:text-violet-400 hover:bg-slate-50 transition-colors shadow-sm"
              >
                <span>Live Page</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
              <button
                type="button"
                onClick={handleDeleteProduct}
                disabled={deleting}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-rose-200 dark:border-rose-900/40 bg-rose-50 dark:bg-rose-950/30 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-100 transition-colors shadow-sm disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </>
          ) : (
            <div className="hidden sm:flex items-center gap-1.5">
              <span className="text-xs text-slate-400 font-bold mr-1">Quick Templates:</span>
              <button
                type="button"
                onClick={() => applyTemplate('win11')}
                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-violet-100 dark:hover:bg-violet-950 text-[11px] font-bold text-violet-600 dark:text-violet-400 border border-slate-200 dark:border-white/[0.06] transition-colors"
              >
                Win 11
              </button>
              <button
                type="button"
                onClick={() => applyTemplate('office')}
                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-violet-100 dark:hover:bg-violet-950 text-[11px] font-bold text-violet-600 dark:text-violet-400 border border-slate-200 dark:border-white/[0.06] transition-colors"
              >
                Office 365
              </button>
              <button
                type="button"
                onClick={() => applyTemplate('idm')}
                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-violet-100 dark:hover:bg-violet-950 text-[11px] font-bold text-violet-600 dark:text-violet-400 border border-slate-200 dark:border-white/[0.06] transition-colors"
              >
                IDM Lifetime
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Form Fields */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card: Basic Details */}
          <div className="rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-white/[0.08] p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
              Basic Product Information
            </h3>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Product Title *
                </label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => {
                    const newTitle = e.target.value;
                    setForm((prev) => ({
                      ...prev,
                      title: newTitle,
                      slug: isSlugManuallyEdited
                        ? prev.slug
                        : newTitle
                            .toLowerCase()
                            .trim()
                            .replace(/[^\w\s-]/g, '')
                            .replace(/[\s_-]+/g, '-')
                            .replace(/^-+|-+$/g, ''),
                    }));
                  }}
                  placeholder="e.g. Windows 11 Pro Retail License Key"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/[0.08] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                />
              </div>

              {/* Product URL Slug Field */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <span>Product URL Slug (Permalink) *</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const generated = form.title
                        .toLowerCase()
                        .trim()
                        .replace(/[^\w\s-]/g, '')
                        .replace(/[\s_-]+/g, '-')
                        .replace(/^-+|-+$/g, '');
                      setIsSlugManuallyEdited(true);
                      setForm((prev) => ({ ...prev, slug: generated }));
                      toast.success(`Slug auto-generated: ${generated}`);
                    }}
                    className="text-[11px] font-bold text-violet-600 dark:text-violet-400 hover:underline inline-flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Auto-generate from Title</span>
                  </button>
                </div>
                <div className="flex items-center rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/[0.08] focus-within:ring-2 focus-within:ring-violet-500/50 overflow-hidden">
                  <span className="px-3 text-xs font-mono font-bold text-slate-400 border-r border-slate-200 dark:border-white/[0.08] bg-slate-100/70 dark:bg-slate-800/80 select-none py-2.5">
                    /product/
                  </span>
                  <input
                    type="text"
                    required
                    value={form.slug}
                    onChange={(e) => {
                      setIsSlugManuallyEdited(true);
                      setForm({
                        ...form,
                        slug: e.target.value
                          .toLowerCase()
                          .replace(/[^\w\s-]/g, '')
                          .replace(/\s+/g, '-'),
                      });
                    }}
                    placeholder="e.g. microsoft-project-2024"
                    className="flex-1 px-3 py-2.5 bg-transparent text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none"
                  />
                  {form.slug && (
                    <Link
                      href={`/product/${form.slug}`}
                      target="_blank"
                      className="px-3 py-2.5 text-xs font-bold text-violet-600 dark:text-violet-400 hover:text-violet-700 flex items-center gap-1 border-l border-slate-200 dark:border-white/[0.08]"
                      title="Preview this product URL"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Controls the live storefront URL: <code className="text-violet-600 dark:text-violet-400 font-mono font-bold">/product/{form.slug || '[slug]'}</code>
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Brand / Developer *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.brand}
                    onChange={(e) => setForm({ ...form, brand: e.target.value })}
                    placeholder="e.g. Microsoft, Adobe, Tonec"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/[0.08] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Category *
                  </label>
                  <select
                    value={form.categoryId}
                    onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/[0.08] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Catalog Status
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/[0.08] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                  >
                    <option value="ACTIVE">🟢 Active (Live on Store)</option>
                    <option value="DRAFT">🟡 Draft (Hidden from Store)</option>
                    <option value="ARCHIVED">⚪ Archived</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Short Summary
                </label>
                <input
                  type="text"
                  value={form.summary}
                  onChange={(e) => setForm({ ...form, summary: e.target.value })}
                  placeholder="One line highlight shown on cards and search..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/[0.08] text-xs focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Full Description & Activation Guide (Markdown Supported)
                </label>
                <textarea
                  rows={6}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="### Product Highlights&#10;- Feature 1&#10;&#10;#### Activation Steps:&#10;1. Step one..."
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/[0.08] text-xs font-mono focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                />
              </div>
            </div>
          </div>

          {/* Card: Variants Builder */}
          <div className="rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-white/[0.08] p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                  Pricing, Editions & Stock Pool
                </h3>
                <p className="text-[11px] text-slate-400">
                  Add multiple packages (e.g. 1 PC Lifetime, Family 6 Users)
                </p>
              </div>
              <button
                type="button"
                onClick={addVariant}
                className="flex items-center gap-1 text-xs font-bold text-violet-600 dark:text-violet-400 hover:underline"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Variant</span>
              </button>
            </div>

            <div className="space-y-4">
              {form.variants.map((v, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-white/[0.06] space-y-3 relative"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase text-slate-400">
                      Variant #{idx + 1}
                    </span>
                    {form.variants.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeVariant(idx)}
                        className="text-rose-500 hover:text-rose-700 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-0.5">
                        Variant Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={v.name}
                        onChange={(e) => updateVariant(idx, 'name', e.target.value)}
                        placeholder="e.g. 1 PC Retail Lifetime"
                        className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/[0.08] text-xs font-semibold"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-0.5">
                        Validity
                      </label>
                      <input
                        type="text"
                        value={v.validity}
                        onChange={(e) => updateVariant(idx, 'validity', e.target.value)}
                        placeholder="e.g. Lifetime, 1 Year"
                        className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/[0.08] text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-0.5">
                        Selling Price (BDT) *
                      </label>
                      <input
                        type="number"
                        required
                        value={v.price}
                        onChange={(e) => updateVariant(idx, 'price', e.target.value)}
                        placeholder="999"
                        className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/[0.08] text-xs font-bold text-violet-600"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-0.5">
                        Original Price (BDT)
                      </label>
                      <input
                        type="number"
                        value={v.originalPrice}
                        onChange={(e) => updateVariant(idx, 'originalPrice', e.target.value)}
                        placeholder="1800"
                        className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/[0.08] text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-0.5">
                        Delivery Type
                      </label>
                      <select
                        value={v.licenseType}
                        onChange={(e) => updateVariant(idx, 'licenseType', e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/[0.08] text-xs"
                      >
                        <option value="LICENSE_KEY">License Key</option>
                        <option value="ACCOUNT_INVITE">Account Invite</option>
                        <option value="SHARED_ACCOUNT">Login Credentials</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-0.5">
                      Initial License Keys (1 per line - optional)
                    </label>
                    <textarea
                      rows={2}
                      value={v.initialKeys}
                      onChange={(e) => updateVariant(idx, 'initialKeys', e.target.value)}
                      placeholder="XXXXX-XXXXX-XXXXX-XXXXX&#10;YYYYY-YYYYY-YYYYY-YYYYY"
                      className="w-full font-mono text-[11px] p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/[0.08]"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Image Picker & Settings */}
        <div className="space-y-6">
          {/* Preset Image Picker */}
          <div className="rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-white/[0.08] p-5 shadow-sm space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
              Product Thumbnail & Image
            </h3>

            {/* Selected Preview */}
            <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-white/[0.08]">
              {form.image ? (
                <Image src={formatImageUrl(form.image)} alt="Preview" fill className="object-cover" />
              ) : (
                <div className="flex items-center justify-center h-full text-xs text-slate-400">
                  No image selected
                </div>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                Custom Image URL
              </label>
              <input
                type="url"
                value={form.image}
                onChange={(e) => setForm({ ...form, image: e.target.value })}
                placeholder="https://..."
                className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/[0.08] text-xs"
              />
            </div>

            {/* Preset selector */}
            <div className="pt-2 border-t border-slate-100 dark:border-white/[0.05]">
              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-2">
                Click a Preset To Apply:
              </span>
              <div className="grid grid-cols-4 gap-2">
                {PRESET_PRODUCT_IMAGES.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setForm({ ...form, image: preset.url })}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      form.image === preset.url
                        ? 'border-violet-600 scale-105 shadow-md'
                        : 'border-transparent hover:opacity-80'
                    }`}
                  >
                    <Image src={preset.url} alt={preset.name} fill className="object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Visibility & Badges */}
          <div className="rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-white/[0.08] p-5 shadow-sm space-y-3 text-xs">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
              Badges & Promotions
            </h3>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isFeatured}
                onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                className="rounded text-violet-600 focus:ring-violet-500"
              />
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                Feature on Homepage (ফিচার্ড)
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isFlashSale}
                onChange={(e) => setForm({ ...form, isFlashSale: e.target.checked })}
                className="rounded text-violet-600 focus:ring-violet-500"
              />
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                Include in Flash Deals (ফ্ল্যাশ সেল)
              </span>
            </label>

            <div>
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Sort Priority (# Display Order)
              </label>
              <input
                type="number"
                min={0}
                value={form.sortOrder}
                onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })}
                placeholder="0"
                className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/[0.08] text-xs font-mono font-bold"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Lower numbers (e.g. 1, 2, 3) appear first across catalog listings. 0 = default.
              </p>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                SEO Tags (comma-separated)
              </label>
              <input
                type="text"
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                placeholder="windows 11, pro, retail key"
                className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/[0.08] text-xs"
              />
            </div>
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-black text-sm shadow-lg shadow-violet-600/25 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isEditing ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            <span>
              {submitting
                ? isEditing
                  ? 'Saving Changes...'
                  : 'Creating Product...'
                : isEditing
                ? 'Save Product Changes'
                : 'Publish Product to Store'}
            </span>
          </button>
        </div>
      </div>
    </form>
  );
}

