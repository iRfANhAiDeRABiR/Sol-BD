'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { MessageCircle, ArrowUp } from 'lucide-react';

export default function FloatingSupport() {
  const pathname = usePathname();
  if (pathname?.startsWith('/admin') || pathname?.startsWith('/checkout/payment')) return null;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="fixed bottom-16 md:bottom-5 right-4 md:right-5 z-40 flex flex-col items-end gap-2.5 no-print print:hidden">
      {/* Scroll to Top */}
      <button
        onClick={scrollToTop}
        aria-label="Scroll to top"
        className="w-10 h-10 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur border border-slate-200 dark:border-slate-800 shadow-md text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
      >
        <ArrowUp className="w-4 h-4" />
      </button>

      {/* WhatsApp Quick Chat */}
      <a
        href="https://wa.me/8801410699879?text=Hello%20SolutionsBD,%20I%20have%20an%20inquiry%20about%20software%20licenses."
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="group relative flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-3.5 py-2.5 rounded-full shadow-lg shadow-emerald-500/30 transition-all hover:scale-105 active:scale-95"
      >
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full border-2 border-white dark:border-slate-900 animate-ping" />
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full border-2 border-white dark:border-slate-900" />
        <MessageCircle className="w-5 h-5 fill-white" />
        <span className="text-xs font-bold tracking-tight pr-1">WhatsApp Help</span>
      </a>
    </div>
  );
}
