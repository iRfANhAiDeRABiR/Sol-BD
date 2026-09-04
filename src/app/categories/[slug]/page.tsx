import React from 'react';
import ShopPage from '@/app/shop/page';

interface CategoryPageProps {
  params: {
    slug: string;
  };
  searchParams: {
    q?: string;
    sort?: string;
  };
}

export const revalidate = 0;

export default async function CategoryFilterPage({
  params,
  searchParams,
}: CategoryPageProps) {
  return (
    <ShopPage
      searchParams={{
        cat: params.slug,
        q: searchParams.q,
        sort: searchParams.sort,
      }}
    />
  );
}

