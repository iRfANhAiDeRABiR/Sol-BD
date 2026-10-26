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
  if (pathname?.startsWith('/admin') || pathname?.startsWith('/checkout/payment')) return null;

  return (
    <footer className="relative overflow-hidden bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 border-t border-slate-200/80 dark:border-slate-800 no-print print:hidden">
      {/* Background Ambient Glows & Dot Grid */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-0 right-0 w-[600px] h-[500px]"
          style={{
            background: 'radial-gradient(ellipse at 80% 0%, rgba(37, 99, 235, 0.04), transparent 65%)',
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-[500px] h-[400px]"
          style={{
            background: 'radial-gradient(ellipse at 0% 100%, rgba(59, 130, 246, 0.03), transparent 65%)',
          }}
        />
        <div className="absolute inset-0 dot-grid opacity-20" />
      </div>

      {/* Top Assistance Strip */}
      <div className="relative z-10 border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-8 py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-center sm:text-left">
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 bg-blue-600 text-white shadow-sm">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-sora font-bold text-base sm:text-lg text-slate-900 dark:text-white">
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
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 dark:text-white bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 shadow-xs hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-emerald-500" />
                <span>WhatsApp</span>
              </a>

              <Link
                href="/shop"
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white transition-colors bg-blue-600 hover:bg-blue-700 shadow-sm"
              >
                <span>Shop Now</span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Multi-Column Content Area */}
      <div className="relative z-10 max-w-[1800px] mx-auto px-4 sm:px-8 pt-8 pb-8">
        {/* Brand Card with Taglines & Contacts */}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] items-center gap-8 lg:gap-12 mb-6 p-6 sm:p-7 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md">
          {/* Brand Info */}
          <div className="min-w-0 flex flex-col items-center lg:items-start gap-4 text-center lg:text-left">
            <Link href="/" className="inline-flex max-w-full">
              <div className="flex items-center gap-3">
                <div className="relative flex-shrink-0 flex items-center justify-center">
                  <div
                    className="absolute inset-[-2px] rounded-2xl pointer-events-none"
                    style={{
                      background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
                      borderRadius: '16px',
                      padding: '1.5px',
                    }}
                  />
                  <div className="h-12 w-12 rounded-2xl flex items-center justify-center relative overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                    <Image
                      src="/logo.png"
                      alt="SolutionsBD Logo"
                      width={42}
                      height={42}
                      className="w-[82%] h-[82%] object-contain"
                    />
                  </div>
                </div>

                <div className="flex flex-col leading-none select-none text-left">
                  <div className="text-2xl font-black flex items-baseline font-sora tracking-[-0.025em]">
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
                  <div className="flex items-center gap-1.5 mt-[5px]">
                    <div
                      className="h-[1.5px] w-5 rounded-full"
                      style={{ background: 'linear-gradient(90deg, #3b82f6, transparent)' }}
                    />
                    <span className="text-[10px] font-semibold tracking-[0.14em] uppercase font-fira text-slate-500">
                      solutionsbd.com
                    </span>
                    <div
                      className="h-[1.5px] w-5 rounded-full"
                      style={{ background: 'linear-gradient(90deg, transparent, #6366f1)' }}
                    />
                  </div>
                </div>
              </div>
            </Link>

            <p className="max-w-lg text-sm leading-6 text-slate-600 dark:text-slate-300">
              বাংলাদেশের অন্যতম শীর্ষ ও বিশ্বস্ত ডিজিটাল সফটওয়্যার শপ। অরিজিনাল লাইসেন্স কি, সেরা মূল্যে, ইনস্ট্যান্ট ডেলিভারি সহ।
            </p>
          </div>

          {/* Contact Details & Socials */}
          <div className="min-w-0 flex flex-col items-center lg:items-start gap-3 lg:pl-8 lg:border-l lg:border-slate-200/80 dark:lg:border-slate-800">
            <div className="flex flex-col items-center lg:items-start gap-2 max-w-full text-xs text-slate-600 dark:text-slate-400">
              <a
                href="tel:+8801410699879"
                className="flex items-center gap-2.5 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 flex-shrink-0">
                  <Phone className="w-3.5 h-3.5" />
                </div>
                <span className="font-semibold tracking-wide font-fira">+88 01410-699879</span>
              </a>

              <a
                href="mailto:info@solutionsbd.com"
                className="flex items-center gap-2.5 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 flex-shrink-0">
                  <Mail className="w-3.5 h-3.5" />
                </div>
                <span className="font-medium font-fira">info@solutionsbd.com</span>
              </a>

              <div className="flex items-center gap-2.5 text-slate-500">
                <div className="w-7 h-7 rounded-lg bg-slate-500/10 flex items-center justify-center text-slate-500 flex-shrink-0">
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                <span className="font-medium">Dhaka, Bangladesh</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex gap-2 pt-1">
              <a
                href="https://facebook.com/solutionsbd"
                target="_blank"
                rel="noopener noreferrer"
                title="Facebook"
                className="w-8 h-8 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-blue-600 transition-colors shadow-xs"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>

              <a
                href="https://wa.me/8801410699879"
                target="_blank"
                rel="noopener noreferrer"
                title="WhatsApp"
                className="w-8 h-8 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-emerald-500 transition-colors shadow-xs"
              >
                <MessageCircle className="w-3.5 h-3.5" />
              </a>

              <a
                href="https://instagram.com/solutionsbd"
                target="_blank"
                rel="noopener noreferrer"
                title="Instagram"
                className="w-8 h-8 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-pink-500 transition-colors shadow-xs"
              >
                <svg className="w-3.5 h-3.5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
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
                className="w-8 h-8 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-sky-500 transition-colors shadow-xs"
              >
                <svg className="w-3.5 h-3.5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
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
          <div className="rounded-2xl p-5 space-y-4 border border-slate-200/80 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-500/10 text-blue-600 border border-blue-500/20">
                <Package className="w-4 h-4" />
              </div>
              <h4 className="font-sora font-bold text-[11px] uppercase tracking-[0.18em] text-slate-900 dark:text-white">
                Products
              </h4>
            </div>
            <div className="h-px rounded-full bg-gradient-to-r from-blue-500/30 to-transparent" />
            <ul className="grid grid-cols-2 sm:grid-cols-1 gap-1 text-[12.5px] text-slate-600 dark:text-slate-400">
              <li>
                <Link href="/shop?cat=windows" className="flex items-center gap-2 py-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500/60" />
                  <span>Windows Keys</span>
                </Link>
              </li>
              <li>
                <Link href="/shop?cat=office" className="flex items-center gap-2 py-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500/60" />
                  <span>Office 365 &amp; 2021</span>
                </Link>
              </li>
              <li>
                <Link href="/shop?cat=utility" className="flex items-center gap-2 py-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500/60" />
                  <span>IDM Lifetime</span>
                </Link>
              </li>
              <li>
                <Link href="/shop?cat=antivirus" className="flex items-center gap-2 py-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500/60" />
                  <span>Antivirus Security</span>
                </Link>
              </li>
              <li>
                <Link href="/shop" className="flex items-center gap-2 py-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500/60" />
                  <span>All Products</span>
                </Link>
              </li>
              <li>
                <Link href="/tools" className="flex items-center gap-2 py-1 hover:text-blue-600 dark:hover:text-blue-400 font-semibold transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  <span>Tools (টুলস)</span>
                </Link>
              </li>
              <li>
                <Link href="/downloads" className="flex items-center gap-2 py-1 hover:text-blue-600 dark:hover:text-blue-400 font-semibold transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  <span>Software Downloads</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Card 2: Information */}
          <div className="rounded-2xl p-5 space-y-4 border border-slate-200/80 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-500/10 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                <Info className="w-4 h-4" />
              </div>
              <h4 className="font-sora font-bold text-[11px] uppercase tracking-[0.18em] text-slate-900 dark:text-white">
                Information
              </h4>
            </div>
            <div className="h-px rounded-full bg-gradient-to-r from-slate-400/30 to-transparent" />
            <ul className="grid grid-cols-2 sm:grid-cols-1 gap-1 text-[12.5px] text-slate-600 dark:text-slate-400">
              <li>
                <Link href="/about" className="flex items-center gap-2 py-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400/60" />
                  <span>About Us</span>
                </Link>
              </li>
              <li>
                <Link href="/account" className="flex items-center gap-2 py-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400/60" />
                  <span>My Account</span>
                </Link>
              </li>
              <li>
                <Link href="/account" className="flex items-center gap-2 py-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400/60" />
                  <span>License Vault</span>
                </Link>
              </li>
              <li>
                <a href="#faq-section" className="flex items-center gap-2 py-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400/60" />
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
                <Link href="/admin/login" className="flex items-center gap-2 py-1 hover:text-slate-600 dark:hover:text-slate-200 transition-colors opacity-75">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                  <span>Admin Portal</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Card 3: Policies */}
          <div className="rounded-2xl p-5 space-y-4 border border-slate-200/80 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                <FileText className="w-4 h-4" />
              </div>
              <h4 className="font-sora font-bold text-[11px] uppercase tracking-[0.18em] text-slate-900 dark:text-white">
                Policies
              </h4>
            </div>
            <div className="h-px rounded-full bg-gradient-to-r from-emerald-500/30 to-transparent" />
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
        <div className="rounded-2xl p-4 sm:p-5 mb-6 border border-slate-200/80 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            {/* Verified Digital Business Badge */}
            <div className="flex items-center gap-3 group">
              <div className="relative w-11 h-11 rounded-xl flex items-center justify-center bg-emerald-600 text-white shadow-xs">
                <svg className="w-6 h-6 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-white text-[9px] font-black flex items-center justify-center border-2 border-white dark:border-slate-900">
                  ✓
                </span>
              </div>
              <div>
                <p className="text-[11px] font-bold font-sora tracking-widest leading-tight uppercase text-slate-800 dark:text-slate-200">
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
              <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-pink-500/10 text-pink-600 dark:text-pink-400 border border-pink-500/20">
                bKash
              </span>
              <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
                Nagad
              </span>
              <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                Rocket
              </span>
              <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                Upay
              </span>
              <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                DBBL Nexus
              </span>
              <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                Cellfin
              </span>
              <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
                Visa / MC
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright Pill + Domain Link */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs border-t border-slate-200/60 dark:border-slate-800/80">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <p className="text-[11px] font-fira tracking-wide text-slate-600 dark:text-slate-400">
              © {new Date().getFullYear()}{' '}
              <strong className="text-blue-600 dark:text-blue-400 font-semibold">Solutions BD</strong>
              . All Rights Reserved.
            </p>
          </div>

          <a
            href="https://solutionsbd.com"
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] font-fira font-semibold text-blue-600 dark:text-blue-400 hover:border-blue-500/30 transition-all shadow-xs"
          >
            <span>www.solutionsbd.com</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </footer>
  );
}
