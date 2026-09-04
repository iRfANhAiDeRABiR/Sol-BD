import React from 'react';
import { Activity, Database, Server, ShieldCheck, Zap } from 'lucide-react';

interface SystemHealthMonitorProps {
  dbLatencyMs: number;
  dbType?: string;
  adminRole: string;
  adminName: string;
  totalKeysInStock: number;
}

export default function SystemHealthMonitor({
  dbLatencyMs,
  dbType = 'Prisma Engine (Active)',
  adminRole,
  adminName,
  totalKeysInStock,
}: SystemHealthMonitorProps) {
  const isHealthy = dbLatencyMs < 100;

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-white/[0.08] p-5 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.05] pb-3">
        <div className="flex items-center gap-2">
          <div className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </div>
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            System & Security Health
          </span>
        </div>
        <span className="text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
          All Systems Operational
        </span>
      </div>

      {/* Grid of Diagnostics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        {/* DB Latency */}
        <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-3 border border-slate-100 dark:border-white/[0.04] space-y-1">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Activity className="w-3.5 h-3.5 text-violet-500" />
            <span className="text-[11px] font-medium">DB Query Latency</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-black text-slate-900 dark:text-white font-mono">
              {dbLatencyMs}ms
            </span>
            <span
              className={`text-[10px] font-bold ${
                isHealthy ? 'text-emerald-500' : 'text-amber-500'
              }`}
            >
              {isHealthy ? 'Optimal' : 'Elevated'}
            </span>
          </div>
        </div>

        {/* Database Engine */}
        <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-3 border border-slate-100 dark:border-white/[0.04] space-y-1">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Database className="w-3.5 h-3.5 text-blue-500" />
            <span className="text-[11px] font-medium">Database Layer</span>
          </div>
          <div className="text-sm font-bold text-slate-900 dark:text-white truncate">
            {dbType}
          </div>
        </div>

        {/* License Key Buffer */}
        <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-3 border border-slate-100 dark:border-white/[0.04] space-y-1">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-[11px] font-medium">Instant Key Buffer</span>
          </div>
          <div className="text-sm font-bold text-slate-900 dark:text-white">
            <span className="text-amber-600 dark:text-amber-400 font-extrabold">
              {totalKeysInStock}
            </span>{' '}
            keys ready
          </div>
        </div>

        {/* Authenticated Admin Identity */}
        <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-3 border border-slate-100 dark:border-white/[0.04] space-y-1">
          <div className="flex items-center gap-1.5 text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-[11px] font-medium">Active RBAC Identity</span>
          </div>
          <div className="text-sm font-bold text-slate-900 dark:text-white truncate">
            <span className="text-violet-600 dark:text-violet-400 font-extrabold uppercase">
              {adminRole}
            </span>{' '}
            ({adminName.split(' ')[0]})
          </div>
        </div>
      </div>
    </div>
  );
}

