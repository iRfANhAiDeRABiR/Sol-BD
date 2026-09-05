import React, { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { getCustomerSession } from '@/lib/customer-auth';
import CustomerAuthClient from '@/components/auth/CustomerAuthClient';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Create Account | SolutionsBD Customer Portal',
  description: 'Create a free customer account on SolutionsBD for instant digital software delivery.',
};

export default async function CustomerRegisterPage(
  props: {
    searchParams: Promise<{ redirect?: string }>;
  }
) {
  const searchParams = await props.searchParams;
  const session = await getCustomerSession();
  if (session) {
    redirect(searchParams.redirect || '/account');
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <Suspense fallback={<div className="w-full max-w-md h-96 rounded-3xl bg-slate-100 dark:bg-slate-800/50 animate-pulse" />}>
        <CustomerAuthClient defaultTab="register" />
      </Suspense>
    </div>
  );
}

