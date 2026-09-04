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
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <div className="rounded-[28px] sm:rounded-[36px] bg-slate-50 dark:bg-[#0c1022] border border-slate-200 dark:border-indigo-500/20 shadow-xl dark:shadow-2xl relative overflow-hidden py-12 sm:py-16 md:py-20 px-6 sm:px-12 text-center transition-colors duration-300">
        {/* Subtle Ambient Radial Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-36 bg-gradient-to-b from-indigo-500/10 dark:from-indigo-500/15 via-violet-500/5 dark:via-violet-500/10 to-transparent blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl mx-auto space-y-3">
          {/* Title */}
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
            Get{' '}
            <span className="bg-gradient-to-r from-[#5974f2] via-[#6a66f7] to-[#1fd1c7] bg-clip-text text-transparent">
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
                className="w-full px-5 py-3.5 rounded-full bg-white dark:bg-[#151a30] border border-slate-200 dark:border-slate-700/60 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all shadow-sm dark:shadow-inner"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-7 py-3.5 rounded-full text-sm font-bold text-white flex items-center justify-center gap-2 bg-gradient-to-r from-[#506ef2] to-[#1ecab8] hover:from-[#4362ec] hover:to-[#17bda9] shadow-lg shadow-teal-500/25 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 flex-shrink-0"
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

