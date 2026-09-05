import React from 'react';
import ShopPage from '@/app/shop/page';

interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    q?: string;
    sort?: string;
  }>;
}

export const revalidate = 0;

export default async function CategoryFilterPage(props: CategoryPageProps) {
  const searchParams = await props.searchParams;
  const params = await props.params;
  return (
    <ShopPage
      searchParams={Promise.resolve({
        cat: params.slug,
        q: searchParams.q,
        sort: searchParams.sort,
      })}
    />
  );
}

