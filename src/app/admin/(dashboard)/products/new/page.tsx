import React from 'react';
import prisma from '@/lib/prisma';
import ProductFormClient from '@/components/admin/ProductFormClient';

export const dynamic = 'force-dynamic';

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: 'asc' },
    select: { id: true, name: true, slug: true },
  });

  return <ProductFormClient categories={categories} />;
}

