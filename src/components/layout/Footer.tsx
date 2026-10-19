'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  MessageCircle,
  Phone,
  Mail,
  MapPin,
  ArrowUpRight,
  Package,
  Info,
  FileText,
  ExternalLink,
  Zap,
} from 'lucide-react';

export default function Footer() {
  const pathname = usePathname();
  if (pathname?.startsWith('/admin')) return null;

  return (
    <footer className="relative overflow-hidden bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 border-t border-slate-200/80 dark:border-slate-800 no-print print:hidden">
      {/* Background Ambient Glows & Dot Grid */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-0 right-0 w-[600px] h-[500px]"
          style={{
            background: 'radial-gradient(ellipse at 80% 0%, hsla(258, 78%, 55%, 0.08), transparent 65%)',
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-[500px] h-[400px]"
          style={{
            background: 'radial-gradient(ellipse at 0% 100%, hsla(200, 90%, 45%, 0.07), transparent 65%)',
          }}
        />
        <div className="absolute inset-0 dot-grid opacity-30" />
      </div>

      {/* Top Assistance Strip - Shahed Store Signature */}
      <div className="relative z-10 border-b border-violet-500/15">
        <div
          className="max-w-[1800px] mx-auto px-4 sm:px-8 py-6"
          style={{
            background: 'hsla(0,0%,100%,0.50)',
            backdropFilter: 'blur(24px) saturate(180%)',
            WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          }}
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-center sm:text-left">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: 'linear-gradient(135deg, hsl(258,78%,55%), hsl(200,90%,45%))',
                  boxShadow: '0 4px 16px hsla(258,78%,55%,0.30)',
                }}
              >
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-sora font-black text-lg sm:text-xl text-slate-900 dark:text-white">
                  Need help choosing a product?
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  Our certified support team is available 24/7 to assist you with activation
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
              <a
                href="https://wa.me/8801410699879"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold text-slate-800 dark:text-white bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-violet-500/25 shadow-sm hover:scale-105 transition-all"
              >
                <MessageCircle className="w-4 h-4 text-emerald-500" />
                <span>WhatsApp</span>
              </a>

              <Link
                href="/shop"
                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold text-white transition-all hover:scale-105 shadow-md"
                style={{
                  background: 'linear-gradient(135deg, hsl(258,78%,55%), hsl(200,90%,45%))',
                  boxShadow: '0 4px 16px hsla(258,78%,55%,0.30)',
                }}
              >
                <span>Shop Now</span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Multi-Column Content Area */}
      <div className="relative z-10 max-w-[1800px] mx-auto px-4 sm:px-8 pt-10 pb-8">
        {/* Brand Card with Taglines & Contacts */}
        <div
          className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] items-center gap-8 lg:gap-12 mb-6 p-6 sm:p-8 rounded-2xl border"
          style={{
            background: 'var(--glass-bg)',
            backdropFilter: 'blur(24px) saturate(180%)',
            WebkitBackdropFilter: 'blur(24px) saturate(180%)',
            borderColor: 'var(--glass-border)',
            boxShadow: 'var(--glass-shadow)',
          }}
        >
          {/* Brand Info */}
          <div className="min-w-0 flex flex-col items-center lg:items-start gap-4 text-center lg:text-left">
            <Link href="/" className="inline-flex max-w-full">
              <div className="flex items-center gap-3">
                <div className="relative flex-shrink-0 flex items-center justify-center">
                  <div
                    className="absolute inset-[-2px] rounded-2xl pointer-events-none"
                    style={{
                      background: 'linear-gradient(135deg, hsl(42,96%,58%), hsl(25,100%,55%), hsl(258,78%,60%), hsl(210,90%,60%))',
                      borderRadius: '18px',
                      padding: '1.5px',
                    }}
                  />
                  <div className="h-14 w-14 rounded-2xl flex items-center justify-center relative overflow-hidden bg-white dark:bg-slate-900 border border-violet-500/20 shadow-md">
                    <Image
                      src="/logo.png"
                      alt="SolutionsBD Logo"
                      width={48}
                      height={48}
                      className="w-[82%] h-[82%] object-contain"
                    />
                  </div>
                </div>

                <div className="flex flex-col leading-none select-none text-left">
                  <div className="text-3xl font-black flex items-baseline font-sora tracking-[-0.025em]">
                    <span className="text-slate-900 dark:text-white">Solutions</span>
                    <span
                      className="ml-[0.25em]"
                      style={{
                        background: 'linear-gradient(135deg, hsl(210,90%,52%) 0%, hsl(243,80%,55%) 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                      }}
                    >
                      BD
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-[5px]">
                    <div
                      className="h-[1.5px] w-5 rounded-full"
                      style={{ background: 'linear-gradient(90deg, hsl(20,100%,58%), transparent)' }}
                    />
                    <span className="text-[10px] font-semibold tracking-[0.14em] uppercase font-fira text-slate-500">
                      solutionsbd.com
                    </span>
                    <div
                      className="h-[1.5px] w-5 rounded-full"
                      style={{ background: 'linear-gradient(90deg, transparent, hsl(222,90%,60%))' }}
                    />
                  </div>
                </div>
              </div>
            </Link>

            <p className="max-w-lg text-sm leading-7 footer-tagline-highlight text-slate-600 dark:text-slate-300">
              বাংলাদেশের অন্যতম শীর্ষ ও <mark className="fth-g">বিশ্বস্ত ডিজিটাল সফটওয়্যার শপ</mark>।{' '}
              <mark className="fth-o">অরিজিনাল লাইসেন্স কি</mark>, <mark className="fth-g">সেরা দামে</mark>,{' '}
              <mark className="fth-g">ইনস্ট্যান্ট অটো ডেলিভারি</mark>।
            </p>
          </div>

          {/* Contact Details & Socials */}
          <div className="min-w-0 flex flex-col items-center lg:items-start gap-4 lg:pl-8 lg:border-l lg:border-slate-200/60 dark:lg:border-slate-800">
            <div className="flex flex-col items-center lg:items-start gap-2.5 max-w-full text-xs text-slate-600 dark:text-slate-400">
              <a
                href="tel:+8801410699879"
                className="flex items-center gap-2.5 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-600 dark:text-violet-400 flex-shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <span className="font-bold tracking-wide font-fira">+88 01410-699879</span>
              </a>

              <a
                href="mailto:info@solutionsbd.com"
                className="flex items-center gap-2.5 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-600 dark:text-violet-400 flex-shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <span className="font-medium font-fira">info@solutionsbd.com</span>
              </a>

              <div className="flex items-center gap-2.5 text-slate-500">
                <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-600 dark:text-violet-400 flex-shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <span className="font-medium">Dhanmondi, Dhaka, Bangladesh</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex gap-2.5 pt-1">
              <a
                href="https://facebook.com/solutionsbd"
                target="_blank"
                rel="noopener noreferrer"
                title="Facebook"
                className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-blue-500 hover:scale-110 transition-all shadow-xs"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>

              <a
                href="https://wa.me/8801410699879"
                target="_blank"
                rel="noopener noreferrer"
                title="WhatsApp"
                className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-emerald-500 hover:scale-110 transition-all shadow-xs"
              >
                <MessageCircle className="w-4 h-4" />
              </a>

              <a
                href="https://instagram.com/solutionsbd"
                target="_blank"
                rel="noopener noreferrer"
                title="Instagram"
                className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-pink-500 hover:scale-110 transition-all shadow-xs"
              >
                <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </a>

              <a
                href="https://t.me/solutionsbd"
                target="_blank"
                rel="noopener noreferrer"
                title="Telegram"
                className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-sky-500 hover:scale-110 transition-all shadow-xs"
              >
                <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                  <path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z" />
                  <path d="m21.854 2.147-10.94 10.939" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* 3 Columns Section: Products, Information, Policies */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          {/* Card 1: Products */}
          <div
            className="rounded-2xl p-5 space-y-4 border"
            style={{
              background: 'var(--glass-bg)',
              backdropFilter: 'blur(20px)',
              borderColor: 'hsla(258,78%,55%,0.18)',
              boxShadow: 'var(--glass-shadow)',
            }}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-violet-500/10 text-violet-600 border border-violet-500/20">
                <Package className="w-4 h-4" />
              </div>
              <h4 className="font-sora font-bold text-[11px] uppercase tracking-[0.18em] text-slate-900 dark:text-white">
                Products
              </h4>
            </div>
            <div className="h-px rounded-full bg-gradient-to-r from-violet-500/40 to-transparent" />
            <ul className="grid grid-cols-2 sm:grid-cols-1 gap-1 text-[12.5px] text-slate-600 dark:text-slate-400">
              <li>
                <Link href="/shop?cat=windows" className="flex items-center gap-2 py-1 hover:text-violet-600 transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-500/50" />
                  <span>Windows Keys</span>
                </Link>
              </li>
              <li>
                <Link href="/shop?cat=office" className="flex items-center gap-2 py-1 hover:text-violet-600 transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-500/50" />
                  <span>Office 365 &amp; 2021</span>
                </Link>
              </li>
              <li>
                <Link href="/shop?cat=utility" className="flex items-center gap-2 py-1 hover:text-violet-600 transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-500/50" />
                  <span>IDM Lifetime</span>
                </Link>
              </li>
              <li>
                <Link href="/shop?cat=antivirus" className="flex items-center gap-2 py-1 hover:text-violet-600 transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-500/50" />
                  <span>Antivirus Security</span>
                </Link>
              </li>
              <li>
                <Link href="/shop" className="flex items-center gap-2 py-1 hover:text-violet-600 transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-500/50" />
                  <span>All Products</span>
                </Link>
              </li>
              <li>
                <Link href="/tools" className="flex items-center gap-2 py-1 hover:text-amber-500 font-semibold transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <span>Free Tools (টুলস)</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Card 2: Information */}
          <div
            className="rounded-2xl p-5 space-y-4 border"
            style={{
              background: 'var(--glass-bg)',
              backdropFilter: 'blur(20px)',
              borderColor: 'hsla(200,90%,45%,0.18)',
              boxShadow: 'var(--glass-shadow)',
            }}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-cyan-500/10 text-cyan-600 border border-cyan-500/20">
                <Info className="w-4 h-4" />
              </div>
              <h4 className="font-sora font-bold text-[11px] uppercase tracking-[0.18em] text-slate-900 dark:text-white">
                Information
              </h4>
            </div>
            <div className="h-px rounded-full bg-gradient-to-r from-cyan-500/40 to-transparent" />
            <ul className="grid grid-cols-2 sm:grid-cols-1 gap-1 text-[12.5px] text-slate-600 dark:text-slate-400">
              <li>
                <Link href="/about" className="flex items-center gap-2 py-1 hover:text-cyan-500 transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-500/50" />
                  <span>About Us</span>
                </Link>
              </li>
              <li>
                <Link href="/account" className="flex items-center gap-2 py-1 hover:text-cyan-500 transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-500/50" />
                  <span>My Account</span>
                </Link>
              </li>
              <li>
                <Link href="/account" className="flex items-center gap-2 py-1 hover:text-cyan-500 transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-500/50" />
                  <span>License Vault</span>
                </Link>
              </li>
              <li>
                <a href="#faq-section" className="flex items-center gap-2 py-1 hover:text-cyan-500 transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-500/50" />
                  <span>FAQs</span>
                </a>
              </li>
              <li>
                <a href="https://wa.me/8801410699879" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 py-1 hover:text-emerald-500 transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/50" />
                  <span>Live Support</span>
                </a>
              </li>
              <li>
                <Link href="/admin/login" className="flex items-center gap-2 py-1 hover:text-violet-400 transition-colors opacity-75">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                  <span>Admin Portal</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Card 3: Policies */}
          <div
            className="rounded-2xl p-5 space-y-4 border"
            style={{
              background: 'var(--glass-bg)',
              backdropFilter: 'blur(20px)',
              borderColor: 'hsla(162,72%,38%,0.18)',
              boxShadow: 'var(--glass-shadow)',
            }}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                <FileText className="w-4 h-4" />
              </div>
              <h4 className="font-sora font-bold text-[11px] uppercase tracking-[0.18em] text-slate-900 dark:text-white">
                Policies
              </h4>
            </div>
            <div className="h-px rounded-full bg-gradient-to-r from-emerald-500/40 to-transparent" />
            <ul className="grid grid-cols-2 sm:grid-cols-1 gap-1 text-[12.5px] text-slate-600 dark:text-slate-400">
              <li>
                <Link href="/policies/privacy-policy" className="flex items-center gap-2 py-1 hover:text-emerald-500 transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/50" />
                  <span>Privacy Policy</span>
                </Link>
              </li>
              <li>
                <Link href="/policies/terms-and-conditions" className="flex items-center gap-2 py-1 hover:text-emerald-500 transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/50" />
                  <span>Terms &amp; Conditions</span>
                </Link>
              </li>
              <li>
                <Link href="/policies/refund-policy" className="flex items-center gap-2 py-1 hover:text-emerald-500 transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/50" />
                  <span>Refund &amp; Return</span>
                </Link>
              </li>
              <li>
                <Link href="/policies/order-and-cancellation" className="flex items-center gap-2 py-1 hover:text-emerald-500 transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/50" />
                  <span>Order &amp; Cancellation</span>
                </Link>
              </li>
              <li>
                <Link href="/policies/delivery-info" className="flex items-center gap-2 py-1 hover:text-emerald-500 transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/50" />
                  <span>Delivery Info</span>
                </Link>
              </li>
              <li>
                <Link href="/policies/refund-request" className="flex items-center gap-2 py-1 hover:text-amber-500 font-semibold transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <span>Refund Request</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Verification & Complete Payment Badges Strip */}
        <div
          className="rounded-2xl p-4 sm:p-5 mb-6 border"
          style={{
            background: 'var(--glass-bg)',
            backdropFilter: 'blur(20px)',
            borderColor: 'var(--glass-border)',
            boxShadow: 'var(--glass-shadow)',
          }}
        >
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            {/* Verified Digital Business Badge */}
            <div className="flex items-center gap-3 group">
              <div className="relative w-11 h-11 rounded-xl flex items-center justify-center bg-gradient-to-tr from-emerald-500 to-teal-500 text-white shadow-md">
                <svg className="w-6 h-6 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-white text-[9px] font-black flex items-center justify-center border-2 border-white dark:border-slate-900">
                  ✓
                </span>
              </div>
              <div>
                <p className="text-[11px] font-black font-sora tracking-widest leading-tight uppercase text-slate-800 dark:text-slate-200">
                  Verified Digital Software Store
                </p>
                <p className="text-[10px] font-fira mt-0.5 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>100% Genuine Retail Keys Guaranteed</span>
                </p>
              </div>
            </div>

            {/* Payment Gateway Badges */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
              <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-pink-500/10 text-pink-600 dark:text-pink-400 border border-pink-500/20">
                bKash
              </span>
              <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
                Nagad
              </span>
              <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                Rocket
              </span>
              <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                Upay
              </span>
              <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                DBBL Nexus
              </span>
              <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                Cellfin
              </span>
              <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
                Visa / MC
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright Pill + Domain Link */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs border-t border-slate-200/60 dark:border-slate-800/80">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-white/70 dark:bg-slate-900/70 border border-violet-500/20 shadow-xs">
            <p className="text-[11px] font-fira tracking-wide text-slate-600 dark:text-slate-400">
              © {new Date().getFullYear()}{' '}
              <strong className="text-violet-600 dark:text-violet-400 font-bold">Solutions BD</strong>
              . All Rights Reserved.
            </p>
          </div>

          <a
            href="https://solutionsbd.com"
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/70 dark:bg-slate-900/70 border border-violet-500/20 text-[11px] font-fira font-semibold text-violet-600 dark:text-violet-400 hover:scale-105 transition-all shadow-xs"
          >
            <span>www.solutionsbd.com</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </footer>
  );
}
