'use client';

import React from 'react';
import { MessageCircle } from 'lucide-react';
import { usePathname } from 'next/navigation';

export function WhatsAppButton({
  phoneNumber = '8801410699879',
  defaultMessage = 'Hello SolutionsBD, I need help with an order / software license.',
}: {
  phoneNumber?: string;
  defaultMessage?: string;
}) {
  const pathname = usePathname();

  // Hide on admin routes
  if (pathname?.startsWith('/admin')) return null;

  const url = `https://wa.me/${phoneNumber.replace(/\D/g, '')}?text=${encodeURIComponent(
    defaultMessage
  )}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-20 md:bottom-6 right-5 z-40 bg-emerald-500 hover:bg-emerald-600 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30 transition-transform duration-200 hover:scale-105 active:scale-95 group"
    >
      <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-400 rounded-full border-2 border-white dark:border-slate-900 animate-ping" />
      <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-400 rounded-full border-2 border-white dark:border-slate-900" />
      <MessageCircle className="w-7 h-7 fill-white text-white" />
    </a>
  );
}

export default WhatsAppButton;

