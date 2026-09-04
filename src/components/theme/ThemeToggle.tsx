'use client';

import React, { useEffect, useState } from 'react';
import { useTheme } from './ThemeProvider';
import { Sun, Moon, Sparkles } from 'lucide-react';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-14 h-8 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse" />
    );
  }

  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      type="button"
      aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      title={isDark ? 'Switch to Light Mode (দিন)' : 'Switch to Dark Mode (রাত)'}
      className={`relative flex items-center justify-between w-[62px] h-[32px] p-1 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-violet-500/50 shadow-inner group ${
        isDark
          ? 'bg-slate-900 border border-violet-500/40 shadow-violet-950/50'
          : 'bg-gradient-to-r from-sky-200 to-amber-100 border border-amber-300/60 shadow-amber-500/10'
      }`}
    >
      {/* Background Micro Icons */}
      <span
        className={`text-[10px] pl-1 transition-opacity duration-200 ${
          isDark ? 'opacity-100 text-violet-300' : 'opacity-0'
        }`}
      >
        <Sparkles className="w-3 h-3" />
      </span>

      <span
        className={`text-[10px] pr-1 transition-opacity duration-200 ${
          !isDark ? 'opacity-100 text-amber-500' : 'opacity-0'
        }`}
      >
        <Sun className="w-3 h-3 fill-amber-400" />
      </span>

      {/* Sliding Thumb */}
      <div
        className={`absolute top-1 left-1 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 transform shadow-md ${
          isDark
            ? 'translate-x-[30px] bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-violet-600/50 rotate-[360deg]'
            : 'translate-x-0 bg-gradient-to-br from-amber-300 to-orange-400 text-white shadow-amber-500/50 rotate-0'
        }`}
      >
        {isDark ? (
          <Moon className="w-3.5 h-3.5 fill-white text-white" />
        ) : (
          <Sun className="w-3.5 h-3.5 fill-white text-white" />
        )}
      </div>
    </button>
  );
}

