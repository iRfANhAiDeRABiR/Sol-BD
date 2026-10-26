'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User,
  ShoppingBag,
  Key,
  Settings,
  LogOut,
  Clock,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Download,
  ExternalLink,
  ShieldCheck,
  Zap,
  ArrowRight,
  Package,
  Calendar,
  CreditCard,
  Phone,
  Mail,
  Sparkles,
  Lock,
} from 'lucide-react';
import { toast } from 'sonner';
import { formatPrice, formatDate, formatImageUrl } from '@/lib/utils';
import { logoutCustomerAction, updateCustomerProfileAction } from '@/app/actions/customer-auth';

interface CustomerDashboardClientProps {
  initialUser: {
    id: string;
    email: string;
    name: string | null;
    phone: string | null;
    role: string;
    walletBalance: number;
    loyaltyPoints: number;
    createdAt: string | Date;
  };
  initialOrders: any[];
}

export default function CustomerDashboardClient({
  initialUser,
  initialOrders,
}: CustomerDashboardClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'licenses' | 'profile'>('overview');
  const [user, setUser] = useState(initialUser);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Profile Edit State
  const [editName, setEditName] = useState(user.name || '');
  const [editPhone, setEditPhone] = useState(user.phone || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // Extract all delivered keys from completed orders
  const allDeliveredLicenses: Array<{
    orderNumber: string;
    date: string | Date;
    productTitle: string;
    variantName: string;
    keyCode: string;
  }> = [];

  initialOrders.forEach((order) => {
    if (order.deliveredKeys) {
      try {
        const parsed = JSON.parse(order.deliveredKeys);
        if (Array.isArray(parsed)) {
          parsed.forEach((k: any) => {
            allDeliveredLicenses.push({
              orderNumber: order.orderNumber,
              date: order.createdAt,
              productTitle: k.variantName || 'Software License',
              variantName: k.variantName || '',
              keyCode: k.keyCode || k.code || String(k),
            });
          });
        }
      } catch (e) {
        // ignore parse error
      }
    }
  });

  const totalOrders = initialOrders.length;
  const completedOrders = initialOrders.filter((o) => o.orderStatus === 'COMPLETED').length;
  const totalKeysDelivered = allDeliveredLicenses.length;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(text);
    toast.success('License key copied to clipboard!');
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logoutCustomerAction();
      toast.success('Logged out successfully.');
      router.push('/');
      router.refresh();
    } catch {
      toast.error('Failed to log out.');
      setLoggingOut(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword && newPassword !== confirmPassword) {
      toast.error('New passwords do not match.');
      return;
    }

    setSavingProfile(true);
    try {
      const res = await updateCustomerProfileAction({
        name: editName,
        phone: editPhone,
        currentPassword: currentPassword || undefined,
        newPassword: newPassword || undefined,
      });

      if (res?.error) {
        toast.error(res.error);
      } else if (res?.success) {
        toast.success('Profile updated successfully!');
        setUser((prev) => ({
          ...prev,
          name: res.user.name,
          phone: res.user.phone,
        }));
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Delivered
          </span>
        );
      case 'PAYMENT_SUBMITTED':
      case 'PROCESSING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            <Clock className="w-3.5 h-3.5" />
            Verifying Payment
          </span>
        );
      case 'PENDING_PAYMENT':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <AlertCircle className="w-3.5 h-3.5" />
            Pending Payment
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="max-w-[1440px] mx-auto px-3 sm:px-5 py-8 space-y-8">
      {/* Top Header Card */}
      <div className="bg-white/95 dark:bg-[#0f172a]/95 rounded-3xl border border-slate-200/80 dark:border-white/[0.08] p-6 sm:p-8 shadow-sm backdrop-blur-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-2xl shadow-lg shadow-blue-500/20 shrink-0">
            {(user.name || user.email || 'U')[0].toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {user.name || 'Valued Customer'}
              </h1>
              <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black px-2 py-0.5 rounded-full border border-emerald-500/20 uppercase tracking-wider">
                Verified Account
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500 dark:text-slate-400 mt-1">
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                {user.email}
              </span>
              {user.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {user.phone}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Member since {formatDate(user.createdAt)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Link
            href="/shop"
            className="flex-1 md:flex-none text-center py-2.5 px-4 rounded-xl text-xs font-bold text-white brand-gradient-btn shadow-md shadow-blue-500/20"
          >
            Explore Catalog
          </Link>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="p-2.5 rounded-xl border border-rose-200 dark:border-rose-900/40 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex bg-slate-100 dark:bg-slate-800/60 p-1.5 rounded-2xl gap-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all whitespace-nowrap ${
            activeTab === 'overview'
              ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>Dashboard Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all whitespace-nowrap ${
            activeTab === 'orders'
              ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>My Orders ({totalOrders})</span>
        </button>

        <button
          onClick={() => setActiveTab('licenses')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all whitespace-nowrap ${
            activeTab === 'licenses'
              ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Key className="w-4 h-4 text-amber-500" />
          <span>Digital Licenses Vault ({totalKeysDelivered})</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all whitespace-nowrap ${
            activeTab === 'profile'
              ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Profile & Security</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white/95 dark:bg-[#0f172a]/95 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Total Orders</span>
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-2">
                {totalOrders}
              </p>
              <span className="text-[10px] text-slate-500 mt-1 block">Lifetime purchases</span>
            </div>

            <div className="bg-white/95 dark:bg-[#0f172a]/95 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Delivered Keys</span>
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                  <Key className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-2">
                {totalKeysDelivered}
              </p>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-1 block">
                Instant lifetime access
              </span>
            </div>

            <div className="bg-white/95 dark:bg-[#0f172a]/95 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Completed Orders</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-2">
                {completedOrders}
              </p>
              <span className="text-[10px] text-slate-500 mt-1 block">Successfully fulfilled</span>
            </div>

            <div className="bg-white/95 dark:bg-[#0f172a]/95 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Loyalty Points</span>
                <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-600 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-2">
                {user.loyaltyPoints || 0}
              </p>
              <span className="text-[10px] text-sky-600 dark:text-sky-400 font-bold mt-1 block">
                Reward points earned
              </span>
            </div>
          </div>

          {/* Quick Banner for Digital Vault */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-blue-950 border border-slate-800 rounded-3xl p-6 text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <h2 className="text-lg font-black flex items-center justify-center sm:justify-start gap-2">
                <Key className="w-5 h-5 text-amber-300" />
                Access Your Software Keys & Activation Guides
              </h2>
              <p className="text-xs text-white/80 max-w-xl">
                All software licenses purchased from SolutionsBD remain stored securely in your Digital Vault forever.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('licenses')}
              className="py-2.5 px-5 bg-white text-blue-700 hover:bg-slate-100 rounded-xl font-extrabold text-xs transition-all shadow shrink-0 flex items-center gap-2"
            >
              <span>Open Key Vault</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Recent Orders Section */}
          <div className="bg-white/95 dark:bg-[#0f172a]/95 rounded-3xl border border-slate-200/80 dark:border-white/[0.08] p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-black text-slate-900 dark:text-white">Recent Orders</h3>
              {initialOrders.length > 0 && (
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-xs font-bold text-blue-600 hover:underline"
                >
                  View All Orders
                </button>
              )}
            </div>

            {initialOrders.length === 0 ? (
              <div className="text-center py-10 space-y-3">
                <Package className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
                <p className="text-sm font-bold text-slate-600 dark:text-slate-400">No orders placed yet</p>
                <Link
                  href="/shop"
                  className="inline-block py-2 px-4 rounded-xl text-xs font-bold text-white brand-gradient-btn"
                >
                  Start Shopping
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {initialOrders.slice(0, 3).map((order) => (
                  <div key={order.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                          {order.orderNumber}
                        </span>
                        {getStatusBadge(order.orderStatus)}
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        {formatDate(order.createdAt)} • {order.items?.length || 1} item(s) • {order.paymentMethod}
                      </p>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4">
                      <span className="text-sm font-black text-slate-900 dark:text-white">
                        {formatPrice(order.totalAmount)}
                      </span>
                      <Link
                        href={`/order-success/${order.orderNumber}`}
                        className="text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 border border-blue-500/20 px-3 py-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/30"
                      >
                        Receipt
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: MY ORDERS */}
      {activeTab === 'orders' && (
        <div className="bg-white/95 dark:bg-[#0f172a]/95 rounded-3xl border border-slate-200/80 dark:border-white/[0.08] p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">Order History</h2>
              <p className="text-xs text-slate-500">Track order statuses, payment confirmations, and receipts.</p>
            </div>
            <Link
              href="/shop"
              className="py-2 px-3.5 rounded-xl text-xs font-bold text-white brand-gradient-btn"
            >
              Order New Software
            </Link>
          </div>

          {initialOrders.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <ShoppingBag className="w-14 h-14 text-slate-300 dark:text-slate-600 mx-auto" />
              <p className="text-base font-bold text-slate-700 dark:text-slate-300">No orders placed yet</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Discover genuine Windows, Microsoft Office, Antivirus, and IDM lifetime licenses with instant delivery.
              </p>
              <Link
                href="/shop"
                className="inline-block mt-2 py-2.5 px-5 rounded-xl text-xs font-bold text-white brand-gradient-btn shadow-md"
              >
                Browse Products
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {initialOrders.map((order) => (
                <div
                  key={order.id}
                  className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200/80 dark:border-slate-800">
                    <div className="flex items-center gap-2.5">
                      <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                        {order.orderNumber}
                      </span>
                      {getStatusBadge(order.orderStatus)}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span>{formatDate(order.createdAt)}</span>
                      <span>•</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {formatPrice(order.totalAmount)}
                      </span>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="space-y-2">
                    {order.items?.map((item: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between text-xs py-1">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold">
                            {idx + 1}
                          </div>
                          <div>
                            <span className="font-bold text-slate-800 dark:text-slate-200">
                              {item.productName || item.variant?.product?.title || 'Software License'}
                            </span>
                            <span className="text-slate-500 ml-1">
                              ({item.variantName || item.variant?.name || '1 License'}) x {item.quantity}
                            </span>
                          </div>
                        </div>
                        <span className="font-bold text-slate-700 dark:text-slate-300">
                          {formatPrice(item.unitPrice * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Payment Details & Actions */}
                  <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="text-slate-500 flex flex-wrap items-center gap-3">
                      <span>Method: <strong className="text-slate-700 dark:text-slate-300">{order.paymentMethod}</strong></span>
                      {order.paymentTrxId && (
                        <span>TrxID: <code className="bg-slate-200/60 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[11px] font-mono text-blue-600 dark:text-blue-400 font-bold">{order.paymentTrxId}</code></span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={`/api/orders/${encodeURIComponent(order.orderNumber)}/invoice`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-1.5 px-3 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold flex items-center gap-1.5 transition-colors"
                        title="Download Official Invoice PDF"
                      >
                        <Download className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        <span>Invoice PDF</span>
                      </a>

                      <Link
                        href={`/order-success/${order.orderNumber}`}
                        className="py-1.5 px-3 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold flex items-center gap-1.5"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>View Order Details</span>
                      </Link>

                      {order.orderStatus === 'COMPLETED' && (
                        <button
                          onClick={() => setActiveTab('licenses')}
                          className="py-1.5 px-3 rounded-lg bg-amber-500 text-slate-900 font-black hover:bg-amber-400 flex items-center gap-1.5 shadow-sm"
                        >
                          <Key className="w-3.5 h-3.5" />
                          <span>View Keys</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: DIGITAL LICENSES VAULT */}
      {activeTab === 'licenses' && (
        <div className="bg-white/95 dark:bg-[#0f172a]/95 rounded-3xl border border-slate-200/80 dark:border-white/[0.08] p-6 shadow-sm space-y-6">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-400/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                <Key className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                ডিজিটাল লাইসেন্স ভল্ট (Digital Licenses Vault)
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Your purchased official license serial keys, team invite links, and activation steps.
            </p>
          </div>

          {allDeliveredLicenses.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <ShieldCheck className="w-14 h-14 text-slate-300 dark:text-slate-600 mx-auto" />
              <p className="text-base font-bold text-slate-700 dark:text-slate-300">No license keys delivered yet</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Once your payment is verified or you complete an order, your official license keys will appear here automatically.
              </p>
              <Link
                href="/shop"
                className="inline-block mt-2 py-2.5 px-5 rounded-xl text-xs font-bold text-white brand-gradient-btn shadow-md"
              >
                Buy Genuine Software
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allDeliveredLicenses.map((lic, index) => {
                const isInvite = lic.keyCode.includes('http') || lic.keyCode.startsWith('INVITE:');
                return (
                  <div
                    key={index}
                    className="p-5 rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-500/[0.03] to-indigo-500/[0.05] dark:bg-slate-900/60 space-y-3 relative overflow-hidden"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                          {lic.orderNumber}
                        </span>
                        <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mt-0.5">
                          {lic.productTitle}
                        </h3>
                        <p className="text-[11px] text-slate-500">Delivered on {formatDate(lic.date)}</p>
                      </div>

                      <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black px-2 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Genuine
                      </span>
                    </div>

                    {/* Key Box */}
                    <div className="bg-slate-900 text-amber-400 p-3 rounded-xl font-mono text-xs flex items-center justify-between gap-2 border border-amber-500/20 shadow-inner">
                      <span className="truncate select-all font-bold">{lic.keyCode}</span>
                      <button
                        onClick={() => handleCopy(lic.keyCode)}
                        className="shrink-0 p-1.5 rounded-lg bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 transition-colors"
                        title="Copy Key"
                      >
                        {copiedKey === lic.keyCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Action Helper */}
                    <div className="flex items-center justify-between text-xs pt-1">
                      {isInvite ? (
                        <a
                          href={lic.keyCode.replace('INVITE:', '').trim()}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center gap-1"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Open Activation Link</span>
                        </a>
                      ) : (
                        <span className="text-slate-500 text-[11px]">
                          Official registration key for 1 device
                        </span>
                      )}

                      <Link
                        href={`/order-success/${lic.orderNumber}`}
                        className="text-slate-600 dark:text-slate-400 font-bold hover:underline"
                      >
                        View Guide & Receipt
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: PROFILE & SECURITY (MODERN REDESIGN) */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          {/* Top Profile Card Summary */}
          <div className="bg-white/95 dark:bg-[#0f172a]/95 rounded-3xl border border-slate-200/80 dark:border-white/[0.08] p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-500 flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-blue-500/25 shrink-0">
                  {(editName || user.name || 'User').split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                      {editName || user.name || 'Account Holder'}
                    </h2>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      <ShieldCheck className="w-3 h-3" />
                      Verified
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{user.email}</p>
                  <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5">
                    <Calendar className="w-3 h-3" />
                    Member since {formatDate(user.createdAt)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 self-start sm:self-center">
                <div className="px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-right">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Digital Licenses</span>
                  <span className="text-base font-black text-slate-900 dark:text-white">{totalKeysDelivered} Keys</span>
                </div>
                <div className="px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-right">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Orders</span>
                  <span className="text-base font-black text-slate-900 dark:text-white">{totalOrders}</span>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Card 1: Personal Details */}
              <div className="bg-white/95 dark:bg-[#0f172a]/95 rounded-3xl border border-slate-200/80 dark:border-white/[0.08] p-6 sm:p-7 shadow-sm space-y-5">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                      Personal Information
                    </h3>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">Your official account profile details.</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="IRFAN HAIDER ABIR"
                        className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 bg-slate-50/70 dark:bg-slate-800/60 text-slate-900 dark:text-white font-medium transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Email Address
                      </label>
                      <span className="text-[10px] font-semibold text-slate-400">Locked to License Vault</span>
                    </div>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        value={user.email}
                        disabled
                        className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-100 dark:bg-slate-800/40 text-slate-500 font-medium cursor-not-allowed"
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Email address is permanently associated with your purchased license keys.
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Mobile Number (bKash / Nagad / WhatsApp)
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        placeholder="01XXXXXXXXX"
                        className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 bg-slate-50/70 dark:bg-slate-800/60 text-slate-900 dark:text-white font-medium transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2: Security & Password */}
              <div className="bg-white/95 dark:bg-[#0f172a]/95 rounded-3xl border border-slate-200/80 dark:border-white/[0.08] p-6 sm:p-7 shadow-sm space-y-5">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                      Security &amp; Password
                    </h3>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">Leave blank if you do not want to change your password.</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Current Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Enter current password"
                        className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 bg-slate-50/70 dark:bg-slate-800/60 text-slate-900 dark:text-white font-medium transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        New Password
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Min 6 characters"
                          className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 bg-slate-50/70 dark:bg-slate-800/60 text-slate-900 dark:text-white font-medium transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Re-type password"
                          className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 bg-slate-50/70 dark:bg-slate-800/60 text-slate-900 dark:text-white font-medium transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Security Note */}
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/40 flex items-start gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                      Your digital licenses and payment credentials are encrypted in SolutionsBD&apos;s vault. Never share your password with third parties.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Submit Action */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="submit"
                disabled={savingProfile}
                className="py-3 px-8 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-blue-500/25 active:scale-[0.99] transition-all disabled:opacity-60 flex items-center gap-2 cursor-pointer"
              >
                {savingProfile ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Save Profile Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

