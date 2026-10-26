'use client';

import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { subscribeNewsletterAction } from '@/app/actions/marketing';

export default function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      toast.error('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await subscribeNewsletterAction(email);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(res.message || 'Thank you for subscribing!');
        setEmail('');
      }
    } catch {
      toast.error('Failed to subscribe. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="w-full max-w-[1440px] mx-auto px-3 sm:px-5 py-6 sm:py-10">
      <div className="rounded-[28px] sm:rounded-[36px] bg-slate-50 dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-lg relative overflow-hidden py-12 sm:py-16 md:py-20 px-6 sm:px-12 text-center transition-colors duration-300">
        {/* Subtle Ambient Radial Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-36 bg-gradient-to-b from-blue-500/10 via-indigo-500/5 to-transparent blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl mx-auto space-y-3">
          {/* Title */}
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
            Get{' '}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
              Exclusive Deals
            </span>
          </h2>

          {/* Subtitle */}
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm md:text-base max-w-lg mx-auto leading-relaxed font-medium">
            Subscribe to our newsletter and get 10% off your first order plus weekly deals.
          </p>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="pt-5 max-w-lg mx-auto flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <div className="relative w-full flex-1">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                disabled={loading}
                className="w-full px-5 py-3.5 rounded-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-xs"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-7 py-3.5 rounded-full text-sm font-semibold text-white flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-500/20 transition-colors disabled:opacity-70 flex-shrink-0"
            >
              <span>{loading ? 'Subscribing...' : 'Subscribe'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

