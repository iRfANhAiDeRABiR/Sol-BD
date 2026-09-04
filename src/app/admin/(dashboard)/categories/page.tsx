import React from 'react';
import prisma from '@/lib/prisma';
import CategoryManagerClient from '@/components/admin/CategoryManagerClient';
import { Layers } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: [
      { sortOrder: 'asc' },
      { name: 'asc' },
    ],
    include: {
      _count: {
        select: { products: true },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-violet-600 dark:text-violet-400 bg-violet-500/10 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              Store Taxonomy
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
            Product Categories ({categories.length})
          </h1>
        </div>
      </div>

      <CategoryManagerClient initialCategories={categories} />
    </div>
  );
}

