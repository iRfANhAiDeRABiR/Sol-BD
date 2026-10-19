import React from 'react';
import prisma from '@/lib/prisma';
import HeroBanner from '@/components/home/HeroBanner';
import LiveTicker from '@/components/home/LiveTicker';
import FlashSale from '@/components/home/FlashSale';
import CategorySection from '@/components/home/CategorySection';
import ProductGrid from '@/components/home/ProductGrid';
import WhyChooseUs from '@/components/home/WhyChooseUs';
import TestimonialsSection from '@/components/home/TestimonialsSection';
import FAQSection from '@/components/home/FAQSection';
import ContactSection from '@/components/home/ContactSection';
import NewsletterSection from '@/components/home/NewsletterSection';
import { ProductType, CategoryType } from '@/lib/types';

export const revalidate = 0; // Fresh dynamic data on every request

export default async function HomePage() {
  let categories: CategoryType[] = [];
  let products: ProductType[] = [];

  try {
    const rawCategories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: [
        { sortOrder: 'asc' },
        { name: 'asc' },
      ],
    });
    categories = rawCategories as unknown as CategoryType[];

    const rawProducts = await prisma.product.findMany({
      where: { status: 'ACTIVE' },
      include: {
        variants: true,
        category: true,
      },
      orderBy: [
        { sortOrder: 'asc' },
        { createdAt: 'desc' },
      ],
    });
    const seen = new Set<string>();
    products = (rawProducts as unknown as ProductType[]).filter((p) => {
      const key = p.title.trim().toLowerCase();
      if (seen.has(p.id) || seen.has(key)) return false;
      seen.add(p.id);
      seen.add(key);
      return true;
    });
  } catch (error) {
    console.error('Error fetching homepage catalog:', error);
  }

  return (
    <div className="space-y-6">
      <HeroBanner />
      <LiveTicker />
      <CategorySection categories={categories} />
      <FlashSale products={products} />
      <ProductGrid products={products} categories={categories} />
      <WhyChooseUs />
      <TestimonialsSection />
      <NewsletterSection />
      <FAQSection />
      <ContactSection />
    </div>
  );
}

