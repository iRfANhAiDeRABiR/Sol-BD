import React from 'react';
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import ProductFormClient from '@/components/admin/ProductFormClient';

export const dynamic = 'force-dynamic';

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage(props: EditProductPageProps) {
  const params = await props.params;
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id: params.id },
      include: {
        category: true,
        variants: {
          include: {
            _count: {
              select: {
                licenseKeys: {
                  where: { status: 'AVAILABLE' },
                },
              },
            },
          },
        },
      },
    }),
    prisma.category.findMany({
      orderBy: { sortOrder: 'asc' },
      select: { id: true, name: true, slug: true },
    }),
  ]);

  if (!product) {
    notFound();
  }

  // Format tags
  let tagsStr = '';
  try {
    const parsed = JSON.parse(product.tags);
    if (Array.isArray(parsed)) {
      tagsStr = parsed.join(', ');
    } else {
      tagsStr = product.tags;
    }
  } catch {
    tagsStr = product.tags;
  }

  const formattedProduct = {
    id: product.id,
    title: product.title,
    slug: product.slug,
    brand: product.brand,
    categoryId: product.categoryId,
    summary: product.summary || '',
    description: product.description,
    image: product.image,
    deliveryType: product.deliveryType,
    status: product.status,
    isFeatured: product.isFeatured,
    isFlashSale: product.isFlashSale,
    tags: tagsStr,
    variants: product.variants.map((v) => ({
      id: v.id,
      name: v.name,
      price: v.price,
      originalPrice: v.originalPrice,
      validity: v.validity,
      licenseType: v.licenseType,
      stock: v._count?.licenseKeys ?? v.stock,
      initialKeys: '',
    })),
  };

  return <ProductFormClient categories={categories} initialProduct={formattedProduct} />;
}

