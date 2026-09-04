'use client';

import React, { useState } from 'react';
import { Layers, Plus, Trash2, Tag, ShieldAlert, Edit, Search, ArrowUpDown, ArrowDownAZ, ArrowUpAZ, Hash } from 'lucide-react';
import { createCategoryAction, updateCategoryAction, deleteCategoryAction } from '@/app/admin/actions';
import { toast } from 'sonner';

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string | null;
  sortOrder: number;
  _count: { products: number };
}

export default function CategoryManagerClient({
  initialCategories,
}: {
  initialCategories: CategoryItem[];
}) {
  const [categories, setCategories] = useState(initialCategories);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'order' | 'name_asc' | 'name_desc' | 'products_desc' | 'products_asc'>('order');

  const [form, setForm] = useState({
    name: '',
    slug: '',
    icon: 'Monitor',
    description: '',
    sortOrder: 0,
  });

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setForm({ name: '', slug: '', icon: 'Monitor', description: '', sortOrder: categories.length + 1 });
    setShowModal(true);
  };

  const handleOpenEdit = (cat: CategoryItem) => {
    setEditingCategory(cat);
    setForm({
      name: cat.name,
      slug: cat.slug,
      icon: cat.icon || 'Monitor',
      description: cat.description || '',
      sortOrder: cat.sortOrder ?? 0,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) {
      toast.error('Category name is required.');
      return;
    }

    setSubmitting(true);
    try {
      if (editingCategory) {
        const res = await updateCategoryAction({
          id: editingCategory.id,
          name: form.name,
          slug: form.slug,
          icon: form.icon,
          description: form.description,
          sortOrder: Number(form.sortOrder || 0),
        });
        if (res?.error || !res?.category) throw new Error(res?.error || 'Failed to update category.');

        toast.success('Category updated successfully!');
        setCategories((prev) =>
          prev.map((c) =>
            c.id === editingCategory.id
              ? {
                  ...c,
                  name: res.category.name,
                  slug: res.category.slug,
                  icon: res.category.icon,
                  description: res.category.description,
                  sortOrder: res.category.sortOrder,
                }
              : c
          )
        );
        setShowModal(false);
      } else {
        const res = await createCategoryAction({
          ...form,
          sortOrder: Number(form.sortOrder || 0),
        });
        if (res?.error || !res?.category) throw new Error(res?.error || 'Failed to create category.');

        toast.success('Category created successfully!');
        setCategories((prev) => [
          ...prev,
          {
            id: res.category.id,
            name: res.category.name,
            slug: res.category.slug,
            icon: res.category.icon,
            description: res.category.description,
            sortOrder: res.category.sortOrder,
            _count: { products: 0 },
          },
        ]);
        setShowModal(false);
      }
      setForm({ name: '', slug: '', icon: 'Monitor', description: '', sortOrder: 0 });
    } catch (err: any) {
      toast.error(err.message || 'Failed to save category.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string, productCount: number) => {
    if (productCount > 0) {
      toast.error(`Cannot delete "${name}": It currently has ${productCount} active products assigned.`);
      return;
    }

    if (!confirm(`Are you sure you want to delete category "${name}"?`)) return;

    setDeletingId(id);
    try {
      const res = await deleteCategoryAction(id);
      if (res?.error) throw new Error(res.error);

      toast.success('Category deleted.');
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete category.');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredCategories = categories.filter((c) => {
    const q = searchTerm.toLowerCase().trim();
    return (
      !q ||
      c.name.toLowerCase().includes(q) ||
      c.slug.toLowerCase().includes(q) ||
      (c.description && c.description.toLowerCase().includes(q))
    );
  });

  const sortedCategories = [...filteredCategories].sort((a, b) => {
    if (sortBy === 'name_asc') return a.name.localeCompare(b.name);
    if (sortBy === 'name_desc') return b.name.localeCompare(a.name);
    if (sortBy === 'products_desc') return b._count.products - a._count.products;
    if (sortBy === 'products_asc') return a._count.products - b._count.products;
    return (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
  });

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400">
            Catalog taxonomy and storefront navigation groups
          </h2>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-violet-600 hover:bg-violet-700 text-white shadow-md shadow-violet-600/20 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>New Category</span>
        </button>
      </div>

      {/* Search & Sort Controls Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white/80 dark:bg-slate-900/80 p-3 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] shadow-sm backdrop-blur-md">
        <div className="relative flex-1 w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search categories by name or slug..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/[0.08] text-xs focus:outline-none focus:ring-2 focus:ring-violet-500/50"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <ArrowUpDown className="w-3.5 h-3.5 text-violet-500" />
            <span className="font-bold text-[11px] hidden sm:inline">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              aria-label="Sort categories"
              className="px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/[0.08] text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value="order">🔢 Priority (# Order)</option>
              <option value="name_asc">🔤 Name (A → Z)</option>
              <option value="name_desc">🔤 Name (Z → A)</option>
              <option value="products_desc">📈 Most Products</option>
              <option value="products_asc">📉 Least Products</option>
            </select>
          </div>

          <span className="text-xs font-bold text-slate-400 border-l border-slate-200 dark:border-slate-800 pl-2">
            {sortedCategories.length} / {categories.length}
          </span>
        </div>
      </div>

      {/* Grid of Categories */}
      {sortedCategories.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] text-slate-400 text-xs font-bold">
          No categories found matching &quot;{searchTerm}&quot;
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedCategories.map((cat) => (
            <div
              key={cat.id}
              className="rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-white/[0.08] p-5 shadow-sm flex flex-col justify-between space-y-4 hover:border-violet-500/30 transition-all"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center font-bold">
                    <Layers className="w-4 h-4" />
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full" title="Display Priority Order">
                      #{cat.sortOrder ?? 0}
                    </span>
                    <span className="text-[11px] font-mono font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full text-slate-600 dark:text-slate-300">
                      {cat._count.products} products
                    </span>
                  </div>
                </div>

              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  {cat.name}
                </h3>
                <code className="text-[11px] text-violet-600 dark:text-violet-400">/{cat.slug}</code>
              </div>

              {cat.description && (
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                  {cat.description}
                </p>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-white/[0.05] flex items-center justify-between text-xs">
              <span className="text-slate-400 text-[11px]">
                {cat._count.products > 0 ? `${cat._count.products} products` : 'No products'}
              </span>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleOpenEdit(cat)}
                  className="flex items-center gap-1 text-violet-600 dark:text-violet-400 hover:text-violet-700 px-2 py-1 rounded-lg hover:bg-violet-50 dark:hover:bg-violet-950/30 transition-colors font-bold text-xs"
                  title="Edit Category"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(cat.id, cat.name, cat._count.products)}
                  disabled={deletingId === cat.id}
                  className="text-slate-400 hover:text-rose-500 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                  title={
                    cat._count.products > 0
                      ? 'Cannot delete: Products assigned'
                      : 'Delete Category'
                  }
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    )}

      {/* Category Modal (Create / Edit) */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <form
            onSubmit={handleSubmit}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/[0.08] rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl animate-in fade-in zoom-in-95"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                {editingCategory ? `Edit Category: ${editingCategory.name}` : 'Create New Store Category'}
              </h3>
              {editingCategory && (
                <span className="text-[10px] font-mono bg-violet-500/10 text-violet-600 dark:text-violet-400 px-2 py-0.5 rounded-full font-bold">
                  {editingCategory._count.products} products
                </span>
              )}
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      name: e.target.value,
                      slug: editingCategory
                        ? form.slug
                        : e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                    })
                  }
                  placeholder="e.g. AI & Cloud Services"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/[0.08] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  URL Slug
                </label>
                <input
                  type="text"
                  required
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  placeholder="ai-cloud-services"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/[0.08] text-xs font-mono focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Sort Priority (# Display Order)
                </label>
                <input
                  type="number"
                  min={0}
                  value={form.sortOrder}
                  onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/[0.08] text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Lower numbers (e.g. 1, 2, 3) appear first across storefront navigation and category filters.
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Short description for SEO and category headers..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/[0.08] text-xs focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-3 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-violet-600 hover:bg-violet-700 text-white shadow-md shadow-violet-600/20 transition-all active:scale-95 disabled:opacity-50"
              >
                {submitting
                  ? 'Saving...'
                  : editingCategory
                  ? 'Save Category Changes'
                  : 'Create Category'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

