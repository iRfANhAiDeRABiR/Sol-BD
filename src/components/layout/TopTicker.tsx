'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Phone, MessageCircle, Send, Instagram } from 'lucide-react';

export default function TopTicker() {
  const pathname = usePathname();
  if (pathname?.startsWith('/admin')) return null;

  return (
    <div className="w-full text-white text-[11px] font-medium relative z-50 overflow-hidden no-print print:hidden select-none"
      style={{
        background: 'linear-gradient(90deg, hsl(0,74%,42%) 0%, hsl(0,82%,50%) 50%, hsl(0,74%,42%) 100%)',
        color: '#ffffff',
        padding: '6px 14px',
        boxShadow: '0 2px 14px hsla(0,80%,45%,0.30)',
      }}
    >
      <div className="max-w-[1800px] mx-auto flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Call Helpline */}
        <div className="flex items-center gap-2 flex-shrink-0 relative z-10">
          <a
            href="tel:+8801410699879"
            aria-label="Call SolutionsBD helpline"
            className="flex items-center gap-1.5 text-white/95 hover:text-white transition-colors"
          >
            <Phone className="w-3 h-3 flex-shrink-0" />
            <span className="font-bold tracking-[0.04em] tabular-nums whitespace-nowrap">
              01410-699879
            </span>
          </a>
        </div>

        {/* Center: Running Infinite Offer Marquee */}
        <div className="flex-1 mx-2 sm:mx-4 relative z-10 overflow-hidden mask-fade-edges offer-marquee">
          <div className="offer-marquee-track">
            {/* Loop item 1 */}
            <div className="flex items-center flex-shrink-0">
              <Link href="/shop" className="flex items-center gap-2.5 flex-shrink-0 px-6 group cursor-pointer">
                <span className="text-[14px] leading-none" aria-hidden="true">🎁</span>
                <span className="font-bold text-[11.5px] tracking-[0.01em] whitespace-nowrap text-white">
                  Instant digital delivery on every order — genuine lifetime license key
                </span>
                <span className="text-[10.5px] font-semibold text-white/90 whitespace-nowrap">
                  ✅ Secure bKash &amp; Nagad
                </span>
                <span className="flex-shrink-0 bg-white text-[10px] font-extrabold tracking-[0.08em] uppercase rounded-full px-3 py-[2px] whitespace-nowrap text-red-600 transition-transform group-hover:scale-105 shadow-sm">
                  🔥 Order Now!
                </span>
              </Link>
            </div>

            {/* Loop item 2 */}
            <div className="flex items-center flex-shrink-0">
              <Link href="/shop" className="flex items-center gap-2.5 flex-shrink-0 px-6 group cursor-pointer">
                <span className="text-[14px] leading-none" aria-hidden="true">⚡</span>
                <span className="font-bold text-[11.5px] tracking-[0.01em] whitespace-nowrap text-white">
                  Windows 11 Pro, Office 365, IDM Lifetime &amp; Antivirus at Best Price in BD
                </span>
                <span className="text-[10.5px] font-semibold text-white/90 whitespace-nowrap">
                  ⭐ 50,000+ Happy Customers
                </span>
                <span className="flex-shrink-0 bg-white text-[10px] font-extrabold tracking-[0.08em] uppercase rounded-full px-3 py-[2px] whitespace-nowrap text-red-600 transition-transform group-hover:scale-105 shadow-sm">
                  🔥 Order Now!
                </span>
              </Link>
            </div>

            {/* Loop item 3 (duplicate for seamless wrap) */}
            <div className="flex items-center flex-shrink-0" aria-hidden="true">
              <Link href="/shop" className="flex items-center gap-2.5 flex-shrink-0 px-6 group cursor-pointer">
                <span className="text-[14px] leading-none">🎁</span>
                <span className="font-bold text-[11.5px] tracking-[0.01em] whitespace-nowrap text-white">
                  Instant digital delivery on every order — genuine lifetime license key
                </span>
                <span className="text-[10.5px] font-semibold text-white/90 whitespace-nowrap">
                  ✅ Secure bKash &amp; Nagad
                </span>
                <span className="flex-shrink-0 bg-white text-[10px] font-extrabold tracking-[0.08em] uppercase rounded-full px-3 py-[2px] whitespace-nowrap text-red-600 transition-transform group-hover:scale-105 shadow-sm">
                  🔥 Order Now!
                </span>
              </Link>
            </div>

            {/* Loop item 4 (duplicate for seamless wrap) */}
            <div className="flex items-center flex-shrink-0" aria-hidden="true">
              <Link href="/shop" className="flex items-center gap-2.5 flex-shrink-0 px-6 group cursor-pointer">
                <span className="text-[14px] leading-none">⚡</span>
                <span className="font-bold text-[11.5px] tracking-[0.01em] whitespace-nowrap text-white">
                  Windows 11 Pro, Office 365, IDM Lifetime &amp; Antivirus at Best Price in BD
                </span>
                <span className="text-[10.5px] font-semibold text-white/90 whitespace-nowrap">
                  ⭐ 50,000+ Happy Customers
                </span>
                <span className="flex-shrink-0 bg-white text-[10px] font-extrabold tracking-[0.08em] uppercase rounded-full px-3 py-[2px] whitespace-nowrap text-red-600 transition-transform group-hover:scale-105 shadow-sm">
                  🔥 Order Now!
                </span>
              </Link>
            </div>
          </div>
        </div>

        {/* Right: Social Media Icons */}
        <div className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0 relative z-10">
          <a
            href="https://wa.me/8801410699879"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/85 hover:text-white transition-all hover:scale-110 active:scale-95"
            title="WhatsApp Support"
          >
            <MessageCircle className="w-3.5 h-3.5" />
          </a>
          <a
            href="https://facebook.com/solutionsbd"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/85 hover:text-white transition-all hover:scale-110 active:scale-95"
            title="Facebook"
          >
            <svg
              className="w-3.5 h-3.5 fill-current"
              viewBox="0 0 24 24"
            >
              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
            </svg>
          </a>
          <a
            href="https://instagram.com/solutionsbd"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/85 hover:text-white transition-all hover:scale-110 active:scale-95"
            title="Instagram"
          >
            <Instagram className="w-3.5 h-3.5" />
          </a>
          <a
            href="https://t.me/solutionsbd"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/85 hover:text-white transition-all hover:scale-110 active:scale-95"
            title="Telegram"
          >
            <Send className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
