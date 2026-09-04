import React from 'react';
import Link from 'next/link';
import { Plus, CheckCircle, Package, Layers, Users, ExternalLink, Key } from 'lucide-react';

interface QuickActionDockProps {
  pendingPaymentsCount: number;
}

export default function QuickActionDock({ pendingPaymentsCount }: QuickActionDockProps) {
  const actions = [
    {
      label: 'New Product',
      href: '/admin/products/new',
      icon: Plus,
      color: 'bg-violet-600 hover:bg-violet-700 text-white shadow-violet-500/20',
      badge: null,
    },
    {
      label: 'Verify TrxIDs',
      href: '/admin/payments',
      icon: CheckCircle,
      color: 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20',
      badge: pendingPaymentsCount > 0 ? `${pendingPaymentsCount} Pending` : null,
    },
    {
      label: 'Order Queue',
      href: '/admin/orders',
      icon: Package,
      color: 'bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white',
      badge: null,
    },
    {
      label: 'Categories',
      href: '/admin/categories',
      icon: Layers,
      color: 'bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/[0.08]',
      badge: null,
    },
    {
      label: 'Customer CRM',
      href: '/admin/customers',
      icon: Users,
      color: 'bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/[0.08]',
      badge: null,
    },
    {
      label: 'Storefront',
      href: '/',
      target: '_blank',
      icon: ExternalLink,
      color: 'bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/[0.08]',
      badge: null,
    },
  ];

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
      {actions.map((act) => {
        const Icon = act.icon;
        return (
          <Link
            key={act.label}
            href={act.href}
            target={act.target}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 whitespace-nowrap ${act.color}`}
          >
            <Icon className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{act.label}</span>
            {act.badge && (
              <span className="bg-red-500 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full animate-pulse">
                {act.badge}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
}

