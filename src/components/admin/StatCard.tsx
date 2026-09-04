import React from 'react';
import { TrendingUp, TrendingDown, LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  isPositive?: boolean;
  period?: string;
  icon: LucideIcon | React.ComponentType<{ className?: string }> | React.ReactNode;
  color?: 'violet' | 'emerald' | 'amber' | 'blue' | 'rose';
  subtitle?: string;
  sparkline?: number[];
}

const colorMap = {
  violet: {
    bg: 'bg-violet-500/10 dark:bg-violet-500/15',
    text: 'text-violet-600 dark:text-violet-400',
    border: 'border-violet-500/20',
    glow: 'from-violet-500/20 to-transparent',
    stroke: '#8b5cf6',
  },
  emerald: {
    bg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
    text: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-500/20',
    glow: 'from-emerald-500/20 to-transparent',
    stroke: '#10b981',
  },
  amber: {
    bg: 'bg-amber-500/10 dark:bg-amber-500/15',
    text: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-500/20',
    glow: 'from-amber-500/20 to-transparent',
    stroke: '#f59e0b',
  },
  blue: {
    bg: 'bg-blue-500/10 dark:bg-blue-500/15',
    text: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-500/20',
    glow: 'from-blue-500/20 to-transparent',
    stroke: '#3b82f6',
  },
  rose: {
    bg: 'bg-rose-500/10 dark:bg-rose-500/15',
    text: 'text-rose-600 dark:text-rose-400',
    border: 'border-rose-500/20',
    glow: 'from-rose-500/20 to-transparent',
    stroke: '#f43f5e',
  },
};

export default function StatCard({
  title,
  value,
  change,
  isPositive = true,
  period = 'vs last month',
  icon,
  color = 'violet',
  subtitle,
  sparkline = [35, 42, 38, 55, 62, 58, 75],
}: StatCardProps) {
  const theme = colorMap[color];

  // SVG mini sparkline path
  const minVal = Math.min(...sparkline);
  const maxVal = Math.max(...sparkline) || 1;
  const points = sparkline
    .map((val, idx) => {
      const x = (idx / (sparkline.length - 1)) * 70;
      const y = 25 - ((val - minVal) / (maxVal - minVal || 1)) * 20;
      return `${x},${y}`;
    })
    .join(' ');

  const renderIcon = () => {
    if (!icon) return null;
    if (React.isValidElement(icon)) {
      return icon;
    }
    if (typeof icon === 'function' || typeof icon === 'object') {
      const IconComponent = icon as React.ComponentType<{ className?: string }>;
      return <IconComponent className="w-5 h-5" />;
    }
    return null;
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-white/[0.08] p-5 shadow-sm hover:shadow-md hover:translate-y-[-2px] transition-all duration-300 group">
      {/* Ambient background glow */}
      <div
        className={`absolute -top-12 -right-12 w-32 h-32 rounded-full bg-gradient-to-br ${theme.glow} blur-2xl pointer-events-none opacity-60 group-hover:opacity-100 transition-opacity`}
      />

      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wide">
            {title}
          </span>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {value}
          </div>
        </div>

        <div
          className={`w-10 h-10 rounded-xl ${theme.bg} ${theme.text} ${theme.border} border flex items-center justify-center flex-shrink-0 shadow-inner`}
        >
          {renderIcon()}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/[0.05] flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs">
          {change ? (
            <>
              <span
                className={`font-black flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[11px] ${
                  isPositive
                    ? 'text-emerald-700 bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-400'
                    : 'text-rose-700 bg-rose-100 dark:bg-rose-950/60 dark:text-rose-400'
                }`}
              >
                {isPositive ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                {change}
              </span>
              <span className="text-slate-400 text-[11px]">{period}</span>
            </>
          ) : (
            <span className="text-slate-400 text-[11px]">{subtitle || 'Live metrics'}</span>
          )}
        </div>

        {/* Mini Sparkline SVG */}
        <svg className="w-16 h-6 overflow-visible opacity-80 group-hover:opacity-100 transition-opacity">
          <polyline
            fill="none"
            stroke={theme.stroke}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={points}
          />
        </svg>
      </div>
    </div>
  );
}

