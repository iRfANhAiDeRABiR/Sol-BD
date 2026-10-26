import type { Metadata } from 'next';
import { DownloadsPageClient } from '@/components/downloads/DownloadsPageClient';
import { getSoftwareDownloads } from '@/lib/software-downloads-store';
import { getCustomerSession } from '@/lib/customer-auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Official Software Download Center in Bangladesh | SolutionsBD',
  description:
    'অফিসিয়াল এবং নিরাপদ মাইক্রোসফট সফটওয়্যার ডাউনলোড লিঙ্কসমূহ। Office 2024, Office 365, Windows 11 Pro, Windows 10 Pro, Visio, Project সরাসরি অফিশিয়াল মাইক্রোসফট সিডিএন (CDN) থেকে ডাউনলোড করুন।',
  keywords: [
    'Software download Bangladesh',
    'Office 2024 download BD',
    'Office 365 download',
    'Windows 11 Pro ISO download Bangladesh',
    'Windows 10 Pro ISO',
    'Visio download',
    'Project download',
    'SolutionsBD software download',
    'সফটওয়্যার ডাউনলোড বাংলাদেশ',
  ],
  alternates: {
    canonical: 'https://solutionsbd.com/downloads',
  },
  openGraph: {
    title: 'Official Software Download Center in Bangladesh | SolutionsBD',
    description:
      'Safe, official Microsoft software download links in Bangladesh directly from official CDNs.',
    url: 'https://solutionsbd.com/downloads',
    siteName: 'SolutionsBD',
    type: 'website',
    locale: 'en_BD',
  },
};

export default async function DownloadsPage() {
  const items = await getSoftwareDownloads({ activeOnly: true });

  let initialUserVerified = false;
  let verifiedOrderNumber: string | null = null;
  let userLoggedIn = false;

  try {
    const customer = await getCustomerSession();

    if (customer?.email) {
      userLoggedIn = true;
      const confirmedOrder = await prisma.order.findFirst({
        where: {
          customerEmail: customer.email,
          OR: [
            { orderStatus: 'COMPLETED' },
            { orderStatus: 'PAID' },
            { paymentStatus: 'PAID' },
          ],
        },
        select: { orderNumber: true },
        orderBy: { createdAt: 'desc' },
      });

      if (confirmedOrder) {
        initialUserVerified = true;
        verifiedOrderNumber = confirmedOrder.orderNumber;
      }
    }
  } catch (err) {
    console.error('DownloadsPage user check error:', err);
  }

  return (
    <DownloadsPageClient
      initialItems={items}
      initialUserVerified={initialUserVerified}
      initialVerifiedOrderNumber={verifiedOrderNumber}
      initialUserLoggedIn={userLoggedIn}
    />
  );
}
