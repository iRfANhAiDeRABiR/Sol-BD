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
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
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

  if (pathname?.startsWith('/admin')) return null;

  const totalItems = totalCount || zustandTotal;

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'All Products', href: '/shop' },
    { name: 'Tools', href: '/tools', badge: 'Free' },
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
    <header className="sticky top-0 z-40 w-full px-1 sm:px-3 py-2 pointer-events-none no-print print:hidden">
      <nav className="glass-nav rounded-2xl mx-auto w-full max-w-[1440px] px-3 sm:px-5 py-2.5 transition-all duration-300 pointer-events-auto">
        <div className="flex items-center justify-between gap-3">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group select-none">
            <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full p-[2px] bg-gradient-to-tr from-cyan-400 via-blue-600 to-indigo-600 shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-transform flex items-center justify-center flex-shrink-0">
              <div className="w-full h-full rounded-full overflow-hidden bg-white flex items-center justify-center">
                <Image
                  src="/logo.png"
                  alt="SolutionsBD Logo"
                  width={56}
                  height={56}
                  className="w-full h-full object-cover"
                  priority
                />
              </div>
            </div>
            <div className="text-2xl sm:text-[26px] font-black tracking-tight flex items-baseline">
              <span className="text-slate-900 dark:text-white">
                Solutions
              </span>
              <span className="bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 bg-clip-text text-transparent ml-1 font-black">
                BD
              </span>
            </div>
          </Link>

          {/* Real Working Search Bar */}
          <form
            action="/shop"
            method="GET"
            onSubmit={handleSearchSubmit}
            className="hidden md:flex flex-1 max-w-md lg:max-w-lg xl:max-w-xl items-center gap-3 rounded-xl border border-violet-500/25 bg-violet-500/5 hover:bg-violet-500/[0.08] px-4 py-2.5 text-sm text-slate-600 dark:text-slate-300 focus-within:border-violet-500/60 focus-within:bg-violet-500/10 focus-within:ring-2 focus-within:ring-violet-500/20 transition-all shadow-sm"
          >
            <Search className="w-5 h-5 text-violet-600 dark:text-violet-400 shrink-0" />
            <input
              type="text"
              name="q"
              placeholder="Search Windows, Office, IDM, Antivirus..."
              className="bg-transparent text-sm w-full outline-none font-medium text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
          </form>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-violet-600/15 text-violet-700 dark:text-violet-300 border border-violet-500/30 shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:text-violet-700 dark:hover:text-violet-300 hover:bg-violet-500/5'
                  }`}
                >
                  {link.name}
                  {link.badge && (
                    <span className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 text-[9px] px-1.5 py-0.2 rounded-full font-extrabold">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right Action Icons: Day/Night Switch, Customer Account & Cart */}
          <div className="flex items-center gap-2">
            {/* Modern Day/Night Switch */}
            <ThemeToggle />

            {/* Customer Account Button / Dropdown */}
            {customer ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-violet-500/20 bg-violet-500/10 hover:bg-violet-500/20 text-violet-800 dark:text-violet-200 text-xs font-bold transition-all"
                >
                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 text-white flex items-center justify-center text-[10px] font-black">
                    {(customer.name || customer.email)[0].toUpperCase()}
                  </div>
                  <span className="hidden md:inline max-w-[90px] truncate">{customer.name || 'Account'}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-violet-500" />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/[0.08] shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {customer.name || 'Customer'}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">{customer.email}</p>
                    </div>

                    <Link
                      href="/account"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-violet-50 dark:hover:bg-violet-950/40"
                    >
                      <User className="w-4 h-4 text-violet-600" />
                      <span>My Account</span>
                    </Link>

                    <Link
                      href="/account"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-violet-50 dark:hover:bg-violet-950/40"
                    >
                      <ShoppingBag className="w-4 h-4 text-indigo-600" />
                      <span>My Orders</span>
                    </Link>

                    <Link
                      href="/account"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-violet-50 dark:hover:bg-violet-950/40"
                    >
                      <Key className="w-4 h-4 text-amber-500" />
                      <span>Licenses Vault</span>
                    </Link>

                    <div className="border-t border-slate-100 dark:border-slate-800 my-1" />

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-left"
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
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-violet-600 hover:bg-violet-500/10 border border-slate-200/80 dark:border-slate-800 transition-all"
              >
                <User className="w-4 h-4 text-violet-600" />
                <span>Sign In</span>
              </Link>
            )}

            {/* Cart Drawer Trigger */}
            <button
              onClick={toggleCart}
              aria-label="View Shopping Cart"
              className="relative flex items-center gap-2 brand-gradient-btn text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-transform active:scale-95"
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline">Cart</span>
              {mounted && totalItems > 0 && (
                <span className="bg-amber-400 text-slate-900 text-[11px] font-black w-5 h-5 rounded-full flex items-center justify-center -ml-0.5 shadow">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-1 pb-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-violet-50 dark:hover:bg-violet-950/40 flex items-center justify-between"
              >
                <span>{link.name}</span>
                {link.badge && (
                  <span className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 text-[10px] px-2 py-0.5 rounded-full font-bold">
                    {link.badge}
                  </span>
                )}
              </Link>
            ))}

            {/* Customer Account on Mobile */}
            {customer ? (
              <Link
                href="/account"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-sm font-semibold text-violet-700 dark:text-violet-300 hover:bg-violet-50 dark:hover:bg-violet-950/40 flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-violet-600" />
                  <span>My Account ({customer.name})</span>
                </div>
                <span className="text-xs text-slate-400">View</span>
              </Link>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-sm font-semibold text-violet-700 dark:text-violet-300 hover:bg-violet-50 dark:hover:bg-violet-950/40 flex items-center gap-2"
              >
                <User className="w-4 h-4 text-violet-600" />
                <span>Sign In / Create Account</span>
              </Link>
            )}

            <form
              action="/shop"
              method="GET"
              onSubmit={(e) => {
                setMobileMenuOpen(false);
                handleSearchSubmit(e);
              }}
              className="mt-2 flex items-center gap-2.5 bg-violet-50 dark:bg-violet-950/50 text-violet-700 dark:text-violet-300 px-3.5 py-3 rounded-xl border border-violet-500/20"
            >
              <Search className="w-5 h-5 text-violet-600 shrink-0" />
              <input
                type="text"
                name="q"
                placeholder="Search All Products..."
                className="bg-transparent text-sm w-full outline-none font-bold text-slate-800 dark:text-white placeholder:text-violet-400/80"
              />
            </form>
          </div>
        )}
      </nav>
    </header>
  );
}
