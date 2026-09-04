'use client';

import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { TrendingUp, Calendar, DollarSign, ShoppingCart } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

export interface DailyDataPoint {
  date: string;
  displayDate: string;
  revenue: number;
  orders: number;
}

interface OrdersChartProps {
  data7Days: DailyDataPoint[];
  data30Days: DailyDataPoint[];
}

export default function OrdersChart({ data7Days, data30Days }: OrdersChartProps) {
  const [timeRange, setTimeRange] = useState<'7d' | '30d'>('7d');
  const [metric, setMetric] = useState<'revenue' | 'orders'>('revenue');

  const activeData = timeRange === '7d' ? data7Days : data30Days;
  const totalRevenue = activeData.reduce((acc, curr) => acc + curr.revenue, 0);
  const totalOrders = activeData.reduce((acc, curr) => acc + curr.orders, 0);

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-white/[0.08] p-5 shadow-sm space-y-4">
      {/* Chart Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Performance Analytics
            </span>
            <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
              <TrendingUp className="w-3 h-3" />
              Live Feed
            </span>
          </div>
          <div className="flex items-baseline gap-3 mt-1">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {metric === 'revenue' ? formatPrice(totalRevenue) : `${totalOrders} Orders`}
            </h3>
            <span className="text-xs text-slate-400 font-medium">
              {timeRange === '7d' ? 'in past 7 days' : 'in past 30 days'}
            </span>
          </div>
        </div>

        {/* Controls: Metric Toggle & Range Toggle */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Metric Toggle */}
          <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800/80 p-1 border border-slate-200/60 dark:border-white/[0.06]">
            <button
              onClick={() => setMetric('revenue')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                metric === 'revenue'
                  ? 'bg-white dark:bg-slate-900 text-violet-600 dark:text-violet-400 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>Revenue</span>
            </button>
            <button
              onClick={() => setMetric('orders')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                metric === 'orders'
                  ? 'bg-white dark:bg-slate-900 text-violet-600 dark:text-violet-400 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Orders</span>
            </button>
          </div>

          {/* Time Range Toggle */}
          <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800/80 p-1 border border-slate-200/60 dark:border-white/[0.06]">
            <button
              onClick={() => setTimeRange('7d')}
              className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                timeRange === '7d'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>7D</span>
            </button>
            <button
              onClick={() => setTimeRange('30d')}
              className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                timeRange === '30d'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <span>30D</span>
            </button>
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-64 sm:h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={activeData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              className="stroke-slate-200/60 dark:stroke-white/[0.05]"
            />
            <XAxis
              dataKey="displayDate"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              dy={10}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              tickFormatter={(val) => (metric === 'revenue' ? `৳${val}` : `${val}`)}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const dataPoint = payload[0].payload as DailyDataPoint;
                  return (
                    <div className="rounded-xl bg-slate-900/95 dark:bg-slate-950/95 border border-white/10 p-3 shadow-xl backdrop-blur-md text-white text-xs space-y-1">
                      <p className="font-bold text-slate-400 text-[11px]">{dataPoint.date}</p>
                      <div className="flex items-center justify-between gap-4 font-extrabold text-sm">
                        <span className="text-violet-400">Revenue:</span>
                        <span>{formatPrice(dataPoint.revenue)}</span>
                      </div>
                      <div className="flex items-center justify-between gap-4 text-xs font-semibold text-slate-300">
                        <span className="text-emerald-400">Orders:</span>
                        <span>{dataPoint.orders} completed</span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey={metric === 'revenue' ? 'revenue' : 'orders'}
              stroke={metric === 'revenue' ? '#8b5cf6' : '#10b981'}
              strokeWidth={2.5}
              fillOpacity={1}
              fill={metric === 'revenue' ? 'url(#colorRevenue)' : 'url(#colorOrders)'}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

