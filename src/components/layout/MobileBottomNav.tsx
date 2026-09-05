'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Grid, Wrench, ShoppingCart, MessageCircle, User } from 'lucide-react';
import { useCart } from '@/components/cart/CartProvider';
import { useCartStore } from '@/lib/cart-store';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { totalCount } = useCart();
  const zustandTotal = useCartStore((state) => state.totalItems());
  const toggleCartDrawer = useCartStore((state) => state.toggleCart);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Hide on admin routes
  if (pathname?.startsWith('/admin')) return null;

  const displayCount = totalCount || zustandTotal;

  const navItems = [
    { label: 'Home', href: '/', icon: Home, exact: true },
    { label: 'Shop', href: '/shop', icon: Grid, exact: false },
    { label: 'Tools', href: '/tools', icon: Wrench, exact: false },
    { label: 'Account', href: '/account', icon: User, exact: false },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border-t border-slate-200/80 dark:border-white/[0.08] px-2 py-2 flex items-center justify-around select-none no-print print:hidden">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);

        return (
          <Link
            key={item.label}
            href={item.href}
            className={`flex flex-col items-center gap-1 text-[10px] font-bold transition-colors ${
              isActive
                ? 'text-violet-600 dark:text-violet-400'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span>{item.label}</span>
          </Link>
        );
      })}

      {/* Cart Trigger with live Badge */}
      <button
        onClick={toggleCartDrawer}
        className="flex flex-col items-center gap-1 text-[10px] font-bold text-slate-500 dark:text-slate-400 relative"
      >
        <div className="relative">
          <ShoppingCart className="w-5 h-5" />
          {mounted && displayCount > 0 && (
            <span className="absolute -top-1.5 -right-2 bg-rose-500 text-white font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center animate-pulse shadow-sm">
              {displayCount}
            </span>
          )}
        </div>
        <span>Cart</span>
      </button>

      {/* WhatsApp Help */}
      <a
        href="https://wa.me/8801410699879?text=Hello%20SolutionsBD,%20I%20need%20help%20with%20an%20order."
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-col items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400"
      >
        <MessageCircle className="w-5 h-5 fill-emerald-500 text-emerald-500" />
        <span>Chat</span>
      </a>
    </nav>
  );
}
