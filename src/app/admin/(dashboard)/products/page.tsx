import React from 'react';
import prisma from '@/lib/prisma';
import ProductsListClient from '@/components/admin/ProductsListClient';
import { Tag } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: [
      { sortOrder: 'asc' },
      { createdAt: 'desc' },
    ],
    include: {
      category: {
        select: { id: true, name: true },
      },
      variants: {
        orderBy: { price: 'asc' },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-violet-600 dark:text-violet-400 bg-violet-500/10 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5" />
              Product Catalog PIM
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
            Active Digital Software & Subscriptions ({products.length})
          </h1>
        </div>
      </div>

      <ProductsListClient initialProducts={products} />
    </div>
  );
}

