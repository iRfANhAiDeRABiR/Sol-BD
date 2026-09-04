'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  CreditCard,
  Tag,
  Layers,
  Users,
  ExternalLink,
  ShieldCheck,
  LogOut,
  Sparkles,
} from 'lucide-react';
import StatusBadge from './StatusBadge';
import { logoutAdminAction } from '@/app/admin/actions';

interface AdminSidebarProps {
  adminName: string;
  adminEmail: string;
  adminRole: string;
  pendingOrdersCount?: number;
  pendingPaymentsCount?: number;
}

export default function AdminSidebar({
  adminName,
  adminEmail,
  adminRole,
  pendingOrdersCount = 0,
  pendingPaymentsCount = 0,
}: AdminSidebarProps) {
  const pathname = usePathname();

  const navItems = [
    {
      label: 'Overview',
      href: '/admin',
      icon: LayoutDashboard,
      exact: true,
      badge: null,
    },
    {
      label: 'Orders',
      href: '/admin/orders',
      icon: Package,
      exact: false,
      badge: pendingOrdersCount > 0 ? pendingOrdersCount : null,
      badgeColor: 'bg-violet-500/20 text-violet-600 dark:text-violet-400',
    },
    {
      label: 'Payment Review',
      href: '/admin/payments',
      icon: CreditCard,
      exact: false,
      badge: pendingPaymentsCount > 0 ? `${pendingPaymentsCount} Review` : null,
      badgeColor: 'bg-amber-500 text-white font-black',
    },
    {
      label: 'Products Catalog',
      href: '/admin/products',
      icon: Tag,
      exact: false,
      badge: null,
    },
    {
      label: 'Categories',
      href: '/admin/categories',
      icon: Layers,
      exact: false,
      badge: null,
    },
    {
      label: 'Users & Customers',
      href: '/admin/customers',
      icon: Users,
      exact: false,
      badge: null,
    },
  ];

  return (
    <aside className="w-64 flex-shrink-0 flex flex-col justify-between h-screen sticky top-0 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-r border-slate-200/80 dark:border-white/[0.08] p-4 select-none z-30">
      {/* Top Header & Brand */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2 pt-2">
          <Link href="/admin" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-sky-500 flex items-center justify-center text-white shadow-md shadow-violet-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-1">
                SolutionsBD
                <span className="text-[9px] px-1.5 py-0.2 rounded font-mono font-bold bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20">
                  PRO
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-semibold block -mt-0.5">
                Admin Control Engine
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation List */}
        <nav className="space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-3 block mb-2">
            Main Management
          </span>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all group ${
                  isActive
                    ? 'bg-violet-600 text-white shadow-md shadow-violet-600/20 dark:bg-violet-600 dark:text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.05] hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-violet-500'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full ${
                      item.badgeColor || 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Storefront Quick View */}
        <div className="pt-2 border-t border-slate-100 dark:border-white/[0.05]">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.05] transition-all group"
          >
            <div className="flex items-center gap-3">
              <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-violet-500" />
              <span>Live Storefront</span>
            </div>
            <span className="text-[10px] text-slate-400">Open ↗</span>
          </Link>
        </div>
      </div>

      {/* Admin User Card & Logout */}
      <div className="pt-4 border-t border-slate-200/80 dark:border-white/[0.08] space-y-3">
        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/60 dark:border-white/[0.05] flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-violet-600/10 text-violet-600 dark:text-violet-400 border border-violet-500/20 flex items-center justify-center font-black text-xs flex-shrink-0">
              {adminName ? adminName.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">
                {adminName || 'Admin'}
              </span>
              <span className="text-[10px] text-slate-400 block truncate">
                {adminEmail || 'admin@solutionsbd.com'}
              </span>
            </div>
          </div>
          <StatusBadge status={adminRole || 'OWNER'} size="sm" showDot={false} />
        </div>

        <form action={logoutAdminAction}>
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </form>
      </div>
    </aside>
  );
}

