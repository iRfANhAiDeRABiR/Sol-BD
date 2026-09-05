import React from 'react';
import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import ProductClientView from './ProductClientView';
import { ProductType } from '@/lib/types';
import type { Metadata } from 'next';

interface Props {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const decodedSlug = decodeURIComponent(params.slug);
  const product = await prisma.product.findFirst({
    where: {
      OR: [
        { slug: params.slug },
        { slug: decodedSlug },
      ],
    },
  });

  if (!product) {
    return {
      title: 'Product Not Found | SolutionsBD',
    };
  }

  return {
    title: `${product.title} Price in Bangladesh | SolutionsBD`,
    description: `Buy original ${product.title} in Bangladesh with instant automated delivery. 100% genuine retail activation key.`,
  };
}

export default async function ProductDetailPage(props: Props) {
  const params = await props.params;
  const decodedSlug = decodeURIComponent(params.slug);
  const product = await prisma.product.findFirst({
    where: {
      OR: [
        { slug: params.slug },
        { slug: decodedSlug },
      ],
    },
    include: {
      variants: true,
      category: true,
    },
  });

  if (!product) {
    notFound();
  }

  const related = await prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      id: { not: product.id },
    },
    include: {
      variants: true,
    },
    take: 4,
  });

  return (
    <ProductClientView
      product={product as unknown as ProductType}
      relatedProducts={related as unknown as ProductType[]}
    />
  );
}

