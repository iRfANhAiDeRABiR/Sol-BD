import React from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  Package,
  Clock,
  Key,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import prisma from '@/lib/prisma';
import { formatPrice, formatDate } from '@/lib/utils';
import { getAdminSession } from '@/lib/admin-auth';
import StatCard from '@/components/admin/StatCard';
import StatusBadge from '@/components/admin/StatusBadge';
import OrdersChart, { DailyDataPoint } from '@/components/admin/OrdersChart';
import SystemHealthMonitor from '@/components/admin/SystemHealthMonitor';
import QuickActionDock from '@/components/admin/QuickActionDock';

export const dynamic = 'force-dynamic';

export default async function AdminOverviewPage() {
  const session = await getAdminSession();

  // 1. Measure DB query latency
  const startPerf = performance.now();
  await prisma.$queryRawUnsafe('SELECT 1');
  const dbLatencyMs = Math.max(1, Math.round(performance.now() - startPerf));

  // 2. Fetch Aggregated Metrics & Recent Orders concurrently
  const [
    allOrders,
    pendingPaymentsCount,
    availableKeysCount,
    recentOrders,
  ] = await Promise.all([
    prisma.order.findMany({
      select: {
        id: true,
        totalAmount: true,
        paymentStatus: true,
        orderStatus: true,
        createdAt: true,
      },
    }),
    prisma.payment.count({
      where: { paymentStatus: { in: ['PENDING', 'SUBMITTED'] } },
    }),
    prisma.licenseKey.count({
      where: { status: 'AVAILABLE' },
    }),
    prisma.order.findMany({
      take: 6,
      orderBy: { createdAt: 'desc' },
      include: {
        items: true,
        payments: true,
      },
    }),
  ]);

  // Calculations
  const paidOrders = allOrders.filter((o) => o.paymentStatus === 'PAID');
  const totalRevenue = paidOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalOrdersCount = allOrders.length;

  // Build 7-day, 14-day & 30-day analytics buckets
  const now = new Date();
  const buildDailyStats = (days: number): DailyDataPoint[] => {
    const list: DailyDataPoint[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateKey = d.toISOString().split('T')[0];
      const displayDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      const dayOrders = paidOrders.filter((o) => {
        const orderDateKey = new Date(o.createdAt).toISOString().split('T')[0];
        return orderDateKey === dateKey;
      });

      const dayRevenue = dayOrders.reduce((acc, o) => acc + o.totalAmount, 0);

      list.push({
        date: dateKey,
        displayDate,
        revenue: dayRevenue,
        orders: dayOrders.length,
      });
    }
    return list;
  };

  const data7Days = buildDailyStats(7);
  const data14Days = buildDailyStats(14);
  const data30Days = buildDailyStats(30);

  // Compare current 7 days vs previous 7 days (days 8-14)
  const current7DaysRevenue = data7Days.reduce((sum, d) => sum + d.revenue, 0);
  const prev7DaysRevenue = data14Days.slice(0, 7).reduce((sum, d) => sum + d.revenue, 0);
  let revenueChange = 'All time';
  let isRevenuePositive = true;
  if (prev7DaysRevenue > 0) {
    const diffPct = Math.round(((current7DaysRevenue - prev7DaysRevenue) / prev7DaysRevenue) * 100);
    revenueChange = `${diffPct >= 0 ? '+' : ''}${diffPct}%`;
    isRevenuePositive = diffPct >= 0;
  } else if (current7DaysRevenue > 0) {
    revenueChange = '+100%';
    isRevenuePositive = true;
  }

  const current7DaysOrders = data7Days.reduce((sum, d) => sum + d.orders, 0);
  const prev7DaysOrders = data14Days.slice(0, 7).reduce((sum, d) => sum + d.orders, 0);
  let ordersChange = `${totalOrdersCount} total`;
  let isOrdersPositive = true;
  if (prev7DaysOrders > 0) {
    const diffPct = Math.round(((current7DaysOrders - prev7DaysOrders) / prev7DaysOrders) * 100);
    ordersChange = `${diffPct >= 0 ? '+' : ''}${diffPct}%`;
    isOrdersPositive = diffPct >= 0;
  } else if (current7DaysOrders > 0) {
    ordersChange = '+100%';
    isOrdersPositive = true;
  }

  // Sparkline arrays from last 7 days
  const revenueSparkline = data7Days.map((d) => d.revenue);
  const ordersSparkline = data7Days.map((d) => d.orders);
  const pendingSparkline = data7Days.map(() => pendingPaymentsCount);
  const stockSparkline = data7Days.map(() => availableKeysCount);

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-violet-600 dark:text-violet-400 bg-violet-500/10 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              Store Executive Cockpit
            </span>
            <span className="text-xs text-slate-400 font-medium">
              Welcome back, {session?.name || 'Admin'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
            Overview & Telemetry
          </h1>
        </div>

        {/* Floating Quick Action Dock */}
        <QuickActionDock pendingPaymentsCount={pendingPaymentsCount} />
      </div>

      {/* KPI StatCards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Gross Revenue"
          value={formatPrice(totalRevenue)}
          change={revenueChange}
          isPositive={isRevenuePositive}
          period="vs prior 7 days"
          icon={TrendingUp}
          color="emerald"
          sparkline={revenueSparkline}
        />

        <StatCard
          title="All Customer Orders"
          value={`${totalOrdersCount}`}
          change={ordersChange}
          isPositive={isOrdersPositive}
          period="vs prior 7 days"
          icon={Package}
          color="violet"
          sparkline={ordersSparkline}
        />

        <StatCard
          title="Pending TrxID Reviews"
          value={`${pendingPaymentsCount}`}
          change={pendingPaymentsCount > 0 ? 'Requires Action' : 'All Clear'}
          isPositive={pendingPaymentsCount === 0}
          period={pendingPaymentsCount > 0 ? 'Manual MFS review' : 'Zero backlog'}
          icon={Clock}
          color="amber"
          sparkline={pendingSparkline}
        />

        <StatCard
          title="Instant Key Stock"
          value={`${availableKeysCount}`}
          change={availableKeysCount > 5 ? 'Healthy Buffer' : 'Low Stock'}
          isPositive={availableKeysCount > 5}
          period="Ready for instant sale"
          icon={Key}
          color="blue"
          sparkline={stockSparkline}
        />
      </div>

      {/* Analytics Chart & Health Diagnostics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recharts Area Analytics (2 cols) */}
        <div className="lg:col-span-2">
          <OrdersChart data7Days={data7Days} data30Days={data30Days} />
        </div>

        {/* System Diagnostics & Alert Feed (1 col) */}
        <div className="space-y-6">
          <SystemHealthMonitor
            dbLatencyMs={dbLatencyMs}
            dbType="SQLite Engine (Prisma ORM)"
            adminRole={session?.role || 'OWNER'}
            adminName={session?.name || 'Irfan'}
            totalKeysInStock={availableKeysCount}
          />

          {/* Quick Notice Card */}
          <div className="rounded-2xl bg-gradient-to-br from-violet-600/10 via-indigo-600/5 to-transparent border border-violet-500/20 p-5 space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400">
                Automated Fulfillment Engine
              </h4>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              When manual bKash/Nagad transactions are approved in the{' '}
              <strong className="text-slate-900 dark:text-white">Payment Review</strong> queue,
              keys are automatically reserved from the inventory pool and revealed to the customer instantly.
            </p>
            <div className="pt-1">
              <Link
                href="/admin/payments"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-violet-600 dark:text-violet-400 hover:underline"
              >
                <span>Inspect TrxID Queue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders Feed Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-white/[0.08] overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-100 dark:border-white/[0.06] flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Recent Transactions Feed
            </h3>
            <p className="text-xs text-slate-400">
              Live orders submitted across all channels
            </p>
          </div>
          <Link
            href="/admin/orders"
            className="flex items-center gap-1 text-xs font-bold text-violet-600 dark:text-violet-400 hover:text-violet-700 transition-colors"
          >
            <span>View All Orders</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200/80 dark:border-white/[0.05]">
              <tr>
                <th className="px-5 py-3.5">Order ID</th>
                <th className="px-5 py-3.5">Customer</th>
                <th className="px-5 py-3.5">Method</th>
                <th className="px-5 py-3.5">Amount</th>
                <th className="px-5 py-3.5">Payment</th>
                <th className="px-5 py-3.5">Fulfillment</th>
                <th className="px-5 py-3.5 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04]">
              {recentOrders.map((order) => (
                <tr
                  key={order.id}
                  className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors group"
                >
                  <td className="px-5 py-4 font-mono font-bold text-violet-600 dark:text-violet-400">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="hover:underline flex items-center gap-1"
                    >
                      {order.orderNumber}
                    </Link>
                    <span className="block text-[10px] font-sans text-slate-400 mt-0.5">
                      {formatDate(order.createdAt)}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <div className="font-bold text-slate-900 dark:text-white">
                      {order.customerName}
                    </div>
                    <div className="text-[11px] text-slate-400">{order.customerPhone}</div>
                  </td>

                  <td className="px-5 py-4">
                    <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[11px] font-mono font-semibold">
                      {order.paymentMethod.replace('_', ' ')}
                    </span>
                  </td>

                  <td className="px-5 py-4 font-black text-slate-900 dark:text-white text-sm">
                    {formatPrice(order.totalAmount)}
                  </td>

                  <td className="px-5 py-4">
                    <StatusBadge status={order.paymentStatus} size="sm" />
                  </td>

                  <td className="px-5 py-4">
                    <StatusBadge status={order.orderStatus} size="sm" />
                  </td>

                  <td className="px-5 py-4 text-right">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="inline-flex items-center gap-1 text-slate-500 hover:text-violet-600 dark:hover:text-violet-400 font-bold text-xs"
                    >
                      <span>Manage</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

