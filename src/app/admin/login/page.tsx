import React from 'react';
import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/admin-auth';
import AdminLoginClient from '@/components/admin/AdminLoginClient';

export const metadata = {
  title: 'Admin Sign In | SolutionsBD',
  description: 'Administrative sign in portal for SolutionsBD Store Engine',
};

export default async function AdminLoginPage() {
  const session = await getAdminSession();
  if (session) {
    redirect('/admin');
  }

  return <AdminLoginClient />;
}

