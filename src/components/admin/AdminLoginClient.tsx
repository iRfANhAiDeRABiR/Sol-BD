'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ShieldCheck, Lock, Mail, ArrowRight } from 'lucide-react';
import ThemeToggle from '@/components/theme/ThemeToggle';
import { loginAdminAction } from '@/app/admin/actions';
import { toast } from 'sonner';

export default function AdminLoginClient() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    const formData = new FormData();
    formData.append('email', email);
    formData.append('password', password);

    try {
      const res = await loginAdminAction(formData);
      if (res?.error) {
        setErrorMessage(res.error);
        toast.error(res.error);
      }
    } catch (err: any) {
      // Next.js redirect throws a special NEXT_REDIRECT error which is normal behavior
      if (err.message && !err.message.includes('NEXT_REDIRECT')) {
        setErrorMessage(err.message);
        toast.error(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 flex flex-col justify-between relative overflow-hidden">
      {/* Glow accents */}
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-violet-600/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-indigo-600/20 blur-3xl pointer-events-none" />

      {/* Top Bar with Theme Switch */}
      <div className="w-full max-w-7xl mx-auto p-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-2.5">
          <div className="relative w-8 h-8 rounded-full p-[1px] bg-gradient-to-tr from-cyan-400 via-blue-600 to-indigo-600 shadow-md shadow-blue-500/25 flex items-center justify-center flex-shrink-0">
            <div className="w-full h-full rounded-full overflow-hidden bg-white flex items-center justify-center">
              <Image
                src="/logo.png"
                alt="SolutionsBD Logo"
                width={32}
                height={32}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <span className="font-black text-sm tracking-tight flex items-baseline">
            <span className="text-slate-900 dark:text-white">Solutions</span>
            <span className="bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 bg-clip-text text-transparent ml-0.5">BD</span>
          </span>
        </div>
        <ThemeToggle />
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md mx-auto p-4 z-10">
        <div className="rounded-3xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-white/[0.08] p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20 mx-auto flex items-center justify-center shadow-inner">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Admin Control Center
            </h1>
            <p className="text-xs text-slate-400">
              Sign in with your administrative credentials to manage store operations
            </p>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold text-center">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/[0.08] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/[0.08] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-black text-xs shadow-md shadow-violet-600/20 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Verifying...' : 'Sign In to Dashboard'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Footer */}
      <div className="w-full max-w-7xl mx-auto p-6 text-center text-xs text-slate-400 z-10">
        © 2026 SolutionsBD Enterprise. All rights reserved.
      </div>
    </div>
  );
}

