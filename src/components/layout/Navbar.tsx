'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  ShoppingCart,
  Search,
  Menu,
  X,
  User,
  Key,
  ShoppingBag,
  LogOut,
  ChevronDown,
  Sparkles,
  Zap,
  MessageCircle,
  Package,
  Wrench,
  Flame,
} from 'lucide-react';
import { useCartStore } from '@/lib/cart-store';
import ThemeToggle from '@/components/theme/ThemeToggle';
import { useCart } from '@/components/cart/CartProvider';
import { logoutCustomerAction } from '@/app/actions/customer-auth';
import { toast } from 'sonner';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { totalCount } = useCart();
  const zustandTotal = useCartStore((state) => state.totalItems());
  const toggleCart = useCartStore((state) => state.toggleCart);

  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [customer, setCustomer] = useState<{ id: string; name: string; email: string } | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);

    // Ctrl+K keyboard shortcut to focus search
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Fetch customer session whenever pathname changes
  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setCustomer(data.user);
        } else {
          setCustomer(null);
        }
      })
      .catch(() => setCustomer(null));
  }, [pathname]);

  // Click outside to close account dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (pathname?.startsWith('/admin') || pathname?.startsWith('/checkout/payment')) return null;

  const totalItems = totalCount || zustandTotal;

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'All Products', href: '/shop' },
    { name: 'Tools', href: '/tools', badge: 'Free' },
    { name: 'Downloads', href: '/downloads' },
    { name: 'About', href: '/about' },
  ];

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const input = form.elements.namedItem('q') as HTMLInputElement;
    const val = input?.value.trim();
    if (val) {
      router.push(`/shop?q=${encodeURIComponent(val)}`);
    } else {
      router.push('/shop');
    }
  };

  const handleLogout = async () => {
    setDropdownOpen(false);
    try {
      await logoutCustomerAction();
      setCustomer(null);
      toast.success('Signed out successfully.');
      router.push('/');
      router.refresh();
    } catch {
      toast.error('Failed to sign out.');
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full px-2 sm:px-4 py-2 pointer-events-none no-print print:hidden">
      <nav
        className="transition-all duration-300 rounded-2xl mx-auto w-full max-w-[1800px] pointer-events-auto border"
        style={{
          background: 'var(--glass-bg)',
          backdropFilter: 'blur(28px) saturate(200%)',
          WebkitBackdropFilter: 'blur(28px) saturate(200%)',
          borderColor: 'var(--glass-border)',
          boxShadow: 'var(--glass-shadow)',
        }}
      >
        <div className="px-3 sm:px-6">
          <div className="flex items-center justify-between h-[68px] gap-2 lg:gap-4">
            {/* Brand Logo - Sleek Modern Tech Accent */}
            <Link href="/" className="flex items-center flex-shrink-0 group select-none">
              <div className="flex items-center gap-3">
                <div className="relative flex-shrink-0 flex items-center justify-center">
                  <div
                    className="absolute inset-[-1.5px] rounded-2xl pointer-events-none"
                    style={{
                      background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
                      borderRadius: '18px',
                      padding: '1.5px',
                    }}
                  />
                  <div
                    className="h-12 w-12 rounded-2xl flex items-center justify-center relative overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 shadow-sm group-hover:scale-105 transition-transform"
                  >
                    <Image
                      src="/logo.png"
                      alt="SolutionsBD Logo"
                      width={44}
                      height={44}
                      className="w-[82%] h-[82%] object-contain relative z-10"
                      priority
                    />
                  </div>
                </div>

                <div className="flex flex-col leading-none select-none">
                  <div className="text-[1.5rem] sm:text-[1.65rem] font-black flex items-baseline font-sora tracking-[-0.025em]">
                    <span className="text-slate-900 dark:text-white">Solutions</span>
                    <span
                      className="ml-[0.25em]"
                      style={{
                        backgroundImage: 'linear-gradient(135deg, #2563eb 0%, #38bdf8 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                      }}
                    >
                      BD
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-[4px]">
                    <div
                      className="h-[1.5px] w-4 rounded-full"
                      style={{ background: 'linear-gradient(90deg, #2563eb, transparent)' }}
                    />
                    <span className="text-[9px] font-semibold tracking-[0.14em] uppercase font-fira text-slate-500 dark:text-slate-400">
                      solutionsbd.com
                    </span>
                    <div
                      className="h-[1.5px] w-4 rounded-full"
                      style={{ background: 'linear-gradient(90deg, transparent, #38bdf8)' }}
                    />
                  </div>
                </div>
              </div>
            </Link>

            {/* Desktop Search Bar */}
            <form
              action="/shop"
              method="GET"
              onSubmit={handleSearchSubmit}
              className="hidden lg:flex flex-1 min-w-0 max-w-[440px] items-center gap-2 rounded-xl border px-3.5 py-2 text-left transition-all group overflow-hidden border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20"
            >
              <Search className="w-4 h-4 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex-shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                name="q"
                placeholder="Search products, Windows, Office..."
                className="text-sm bg-transparent outline-none flex-1 min-w-0 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 font-medium"
              />
            </form>

            {/* Nav Links */}
            <div className="hidden lg:flex items-center gap-1 min-w-0 flex-shrink">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all duration-200 font-semibold text-xs lg:text-sm whitespace-nowrap ${
                      isActive
                        ? 'text-blue-600 dark:text-blue-400 bg-blue-50/90 dark:bg-blue-950/40 border border-blue-500/20 shadow-xs'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/60 border border-transparent'
                    }`}
                  >
                    <span>{link.name}</span>
                    {link.badge && (
                      <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-md bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Right Action Buttons */}
            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
              {/* Day/Night Theme Switch */}
              <ThemeToggle />

              {/* Customer Account Button / Dropdown */}
              {customer ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 text-slate-700 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700"
                  >
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center text-[10px] font-black">
                      {(customer.name || customer.email)[0].toUpperCase()}
                    </div>
                    <span className="hidden sm:inline max-w-[90px] truncate">{customer.name || 'Account'}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {customer.name || 'Customer'}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate">{customer.email}</p>
                      </div>

                      <Link
                        href="/account"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-blue-600 dark:hover:text-blue-400"
                      >
                        <User className="w-4 h-4 text-blue-600" />
                        <span>My Account</span>
                      </Link>

                      <Link
                        href="/account"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-blue-600 dark:hover:text-blue-400"
                      >
                        <ShoppingBag className="w-4 h-4 text-blue-600" />
                        <span>My Orders</span>
                      </Link>

                      <Link
                        href="/account"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-blue-600 dark:hover:text-blue-400"
                      >
                        <Key className="w-4 h-4 text-amber-500" />
                        <span>Licenses Vault</span>
                      </Link>

                      <div className="border-t border-slate-100 dark:border-slate-800 my-1" />

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/login"
                  className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-500/30"
                >
                  <User className="w-4 h-4" />
                  <span>Login</span>
                </Link>
              )}

              {/* Shopping Cart Pill Button */}
              <button
                onClick={toggleCart}
                aria-label="Open cart"
                className="relative flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white transition-all bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-sm shadow-blue-500/20 active:scale-[0.98]"
              >
                <ShoppingCart className="w-4 h-4" />
                <span className="hidden sm:inline">Cart</span>
                {mounted && totalItems > 0 && (
                  <span className="bg-white text-blue-600 text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center -ml-0.5 shadow-sm">
                    {totalItems}
                  </span>
                )}
              </button>

              {/* Mobile Hamburger Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2.5 rounded-xl transition-colors text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                aria-label="Open navigation menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Expanded Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden overflow-hidden border-t px-3 py-4 border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl">
            {/* Welcome Account Card */}
            <div className="w-full rounded-2xl p-4 mb-3 relative overflow-hidden text-white bg-gradient-to-br from-slate-900 via-slate-850 to-blue-950 border border-slate-850 shadow-md">
              <div className="relative flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-blue-600/20 border border-blue-400/30 text-blue-300">
                  <User className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-blue-300">Welcome</p>
                  <p className="text-sm font-bold truncate">
                    {customer ? customer.name : 'Sign in to your account'}
                  </p>
                  <p className="text-[11px] text-slate-300 truncate">
                    {customer ? customer.email : 'Track orders & download license keys'}
                  </p>
                </div>
                {!customer && (
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 text-white shadow-sm hover:bg-blue-500 transition-colors"
                  >
                    Login
                  </Link>
                )}
              </div>
            </div>

            {/* Quick Action Buttons Grid */}
            <div className="grid grid-cols-4 gap-2 mb-3">
              <Link
                href="/account"
                onClick={() => setMobileMenuOpen(false)}
                className="aspect-square rounded-2xl flex flex-col items-center justify-center gap-1.5 p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-blue-500/30 transition-all"
              >
                <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <Package className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-semibold text-slate-700 dark:text-slate-300">Orders</span>
              </Link>

              <Link
                href="/account"
                onClick={() => setMobileMenuOpen(false)}
                className="aspect-square rounded-2xl flex flex-col items-center justify-center gap-1.5 p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-blue-500/30 transition-all"
              >
                <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <Key className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-semibold text-slate-700 dark:text-slate-300">Keys</span>
              </Link>

              <Link
                href="/tools"
                onClick={() => setMobileMenuOpen(false)}
                className="aspect-square rounded-2xl flex flex-col items-center justify-center gap-1.5 p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-blue-500/30 transition-all"
              >
                <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <Wrench className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-semibold text-slate-700 dark:text-slate-300">Tools</span>
              </Link>

              <Link
                href="/shop"
                onClick={() => setMobileMenuOpen(false)}
                className="aspect-square rounded-2xl flex flex-col items-center justify-center gap-1.5 p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-blue-500/30 transition-all"
              >
                <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  <Flame className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-semibold text-slate-700 dark:text-slate-300">Deals</span>
              </Link>
            </div>

            {/* Mobile Search Input */}
            <form
              action="/shop"
              method="GET"
              onSubmit={(e) => {
                setMobileMenuOpen(false);
                handleSearchSubmit(e);
              }}
              className="flex items-center gap-2.5 bg-slate-100 dark:bg-slate-900 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 mb-3 focus-within:border-blue-500"
            >
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                name="q"
                placeholder="Search products..."
                className="bg-transparent text-sm w-full outline-none font-medium text-slate-900 dark:text-white placeholder:text-slate-400"
              />
            </form>

            {/* Nav Links */}
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-xl text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-900 flex items-center justify-between text-slate-800 dark:text-slate-200"
                >
                  <span>{link.name}</span>
                  {link.badge && (
                    <span className="bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300 text-[10px] px-2 py-0.5 rounded-md font-bold">
                      {link.badge}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
