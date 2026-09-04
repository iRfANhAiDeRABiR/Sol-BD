'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ChevronRight,
  Search,
  MessageCircle,
  Bell,
  Menu,
  Sparkles,
} from 'lucide-react';
import ThemeToggle from '@/components/theme/ThemeToggle';

interface AdminHeaderProps {
  adminName?: string;
  pendingReviewsCount?: number;
}

const routeTitleMap: Record<string, string> = {
  '/admin': 'Executive Dashboard',
  '/admin/orders': 'Orders & Transactions',
  '/admin/payments': 'Payment Verification Queue',
  '/admin/products': 'Products & Inventory',
  '/admin/products/new': 'Add New Digital Product',
  '/admin/categories': 'Category Management',
  '/admin/customers': 'Customer CRM & Marketing',
};

export default function AdminHeader({ adminName, pendingReviewsCount = 0 }: AdminHeaderProps) {
  const pathname = usePathname();
  const currentTitle = routeTitleMap[pathname] || 'Control Center';

  return (
    <header className="sticky top-0 z-20 h-16 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200/80 dark:border-white/[0.08] px-4 sm:px-6 flex items-center justify-between">
      {/* Left: Breadcrumbs / Title */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-xs">
          <Link
            href="/admin"
            className="font-bold text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            Admin
          </Link>
          {pathname !== '/admin' && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-extrabold text-slate-900 dark:text-white capitalize">
                {currentTitle}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Direct WhatsApp Merchant Assistant */}
        <a
          href="https://wa.me/8801410699879"
          target="_blank"
          rel="noopener noreferrer"
          title="Direct WhatsApp Support: +8801410699879"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 transition-all active:scale-95"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          <span>WhatsApp Merchant</span>
        </a>

        {/* Verification Alert Indicator */}
        {pendingReviewsCount > 0 && (
          <Link
            href="/admin/payments"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-500/15 border border-amber-500/30 animate-pulse"
          >
            <Bell className="w-3.5 h-3.5 text-amber-600" />
            <span>{pendingReviewsCount} TrxID pending</span>
          </Link>
        )}

        {/* Modern Day/Night Switch */}
        <ThemeToggle />
      </div>
    </header>
  );
}

