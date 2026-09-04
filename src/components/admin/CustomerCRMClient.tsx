'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Users,
  Mail,
  Phone,
  MessageSquare,
  Download,
  Search,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Ban,
  Activity,
  UserCheck,
  UserX,
  Clock,
  ShoppingBag,
  CreditCard,
  Key,
  Copy,
  Check,
  X,
  ChevronRight,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';
import { formatPrice, formatDate } from '@/lib/utils';
import { toggleSubscriberAction, toggleUserSuspensionAction } from '@/app/admin/actions';
import { toast } from 'sonner';

export interface RegisteredUserRecord {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  role: string;
  isActive: boolean;
  walletBalance: number;
  loyaltyPoints: number;
  createdAt: Date | string;
  orders: Array<{
    id: string;
    orderNumber: string;
    orderStatus: string;
    paymentStatus: string;
    paymentMethod: string;
    totalAmount: number;
    deliveredKeys?: string;
    createdAt: Date | string;
    items: Array<{
      id: string;
      quantity: number;
      unitPrice: number;
      productName?: string | null;
      variantName?: string | null;
    }>;
  }>;
}

interface CustomerRecord {
  email: string;
  name: string;
  phone: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: Date | string;
}

interface SubscriberRecord {
  id: string;
  email: string;
  source: string;
  isActive: boolean;
  createdAt: Date | string;
}

interface CustomerCRMProps {
  currentAdminId?: string;
  initialUsers?: RegisteredUserRecord[];
  customers: CustomerRecord[];
  initialSubscribers: SubscriberRecord[];
}

export default function CustomerCRMClient({
  currentAdminId,
  initialUsers = [],
  customers,
  initialSubscribers,
}: CustomerCRMProps) {
  const [activeTab, setActiveTab] = useState<'users' | 'customers' | 'subscribers'>('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'SUSPENDED'>('ALL');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'CUSTOMER' | 'STAFF'>('ALL');

  const [users, setUsers] = useState<RegisteredUserRecord[]>(initialUsers);
  const [subscribers, setSubscribers] = useState<SubscriberRecord[]>(initialSubscribers);

  // Selected user for activity drawer
  const [selectedUser, setSelectedUser] = useState<RegisteredUserRecord | null>(null);
  const [togglingUserId, setTogglingUserId] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Filter registered users
  const filteredUsers = users.filter((u) => {
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !term ||
      (u.name && u.name.toLowerCase().includes(term)) ||
      u.email.toLowerCase().includes(term) ||
      (u.phone && u.phone.toLowerCase().includes(term));

    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'ACTIVE' && u.isActive) ||
      (statusFilter === 'SUSPENDED' && !u.isActive);

    const isStaff = ['OWNER', 'ADMIN', 'SUPPORT'].includes(u.role);
    const matchesRole =
      roleFilter === 'ALL' ||
      (roleFilter === 'CUSTOMER' && u.role === 'CUSTOMER') ||
      (roleFilter === 'STAFF' && isStaff);

    return matchesSearch && matchesStatus && matchesRole;
  });

  // Filter purchasing customers
  const filteredCustomers = customers.filter((c) => {
    const term = searchTerm.toLowerCase().trim();
    return (
      !term ||
      c.name.toLowerCase().includes(term) ||
      c.email.toLowerCase().includes(term) ||
      c.phone.toLowerCase().includes(term)
    );
  });

  // Filter subscribers
  const filteredSubscribers = subscribers.filter((s) => {
    const term = searchTerm.toLowerCase().trim();
    return !term || s.email.toLowerCase().includes(term) || s.source.toLowerCase().includes(term);
  });

  // Handle User Suspension Toggle
  const handleToggleUserSuspension = async (targetUser: RegisteredUserRecord) => {
    if (targetUser.id === currentAdminId) {
      toast.error('You cannot suspend your own administrative account.');
      return;
    }
    if (targetUser.role === 'OWNER') {
      toast.error('The OWNER account cannot be suspended.');
      return;
    }

    const actionName = targetUser.isActive ? 'Suspend' : 'Reactivate';
    const confirmMessage = targetUser.isActive
      ? `Are you sure you want to SUSPEND ${targetUser.name || targetUser.email}? They will be immediately blocked from logging in.`
      : `Reactivate account for ${targetUser.name || targetUser.email}?`;

    if (!window.confirm(confirmMessage)) {
      return;
    }

    setTogglingUserId(targetUser.id);
    try {
      const res = await toggleUserSuspensionAction(targetUser.id);
      if (res?.error) {
        toast.error(res.error);
        return;
      }

      // Update state
      const nextActive = res.isActive !== undefined ? res.isActive : !targetUser.isActive;
      setUsers((prev) =>
        prev.map((u) => (u.id === targetUser.id ? { ...u, isActive: nextActive } : u))
      );

      if (selectedUser?.id === targetUser.id) {
        setSelectedUser((prev) => (prev ? { ...prev, isActive: nextActive } : null));
      }

      toast.success(
        nextActive
          ? `Account ${targetUser.email} has been reactivated.`
          : `Account ${targetUser.email} has been suspended.`
      );
    } catch (err: any) {
      toast.error(err.message || `Failed to ${actionName.toLowerCase()} user.`);
    } finally {
      setTogglingUserId(null);
    }
  };

  // Handle Subscriber Toggle
  const handleToggleSub = async (id: string) => {
    try {
      const res = await toggleSubscriberAction(id);
      if (res?.error) throw new Error(res.error);

      setSubscribers((prev) =>
        prev.map((s) => (s.id === id ? { ...s, isActive: !s.isActive } : s))
      );
      toast.success('Subscriber status updated.');
    } catch (err: any) {
      toast.error(err.message || 'Toggle failed.');
    }
  };

  const exportSubscribersCSV = () => {
    const headers = ['Email', 'Source', 'Status', 'Subscribed At'];
    const rows = filteredSubscribers.map((s) => [
      s.email,
      s.source,
      s.isActive ? 'Active' : 'Unsubscribed',
      new Date(s.createdAt).toLocaleDateString(),
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `solutionsbd_subscribers_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Quick stats
  const activeCount = users.filter((u) => u.isActive).length;
  const suspendedCount = users.filter((u) => !u.isActive).length;
  const staffCount = users.filter((u) => ['OWNER', 'ADMIN', 'SUPPORT'].includes(u.role)).length;

  return (
    <div className="space-y-6">
      {/* Top Stat Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/[0.08] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Total Users</span>
            <div className="w-8 h-8 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{users.length}</span>
            <span className="text-[11px] text-slate-400 font-medium">accounts</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/[0.08] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Active Accounts</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{activeCount}</span>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">Unrestricted</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/[0.08] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-600 dark:text-rose-400">Suspended</span>
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <UserX className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{suspendedCount}</span>
            <span className="text-[11px] text-rose-500 font-bold">Access Blocked</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/[0.08] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-sky-600 dark:text-sky-400">Staff & Admins</span>
            <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{staffCount}</span>
            <span className="text-[11px] text-slate-400 font-medium">privileged</span>
          </div>
        </div>
      </div>

      {/* Top Controls: Search, Tabs & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={
              activeTab === 'users'
                ? 'Search registered name, email, or phone...'
                : activeTab === 'customers'
                ? 'Search customer name, email, or phone...'
                : 'Search subscriber email...'
            }
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/[0.08] text-xs focus:outline-none focus:ring-2 focus:ring-violet-500/50"
          />
        </div>

        {/* Tab Selector & Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200/60 dark:border-white/[0.06]">
            <button
              onClick={() => setActiveTab('users')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'users'
                  ? 'bg-white dark:bg-slate-900 text-violet-600 dark:text-violet-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Registered Accounts ({users.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('customers')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'customers'
                  ? 'bg-white dark:bg-slate-900 text-violet-600 dark:text-violet-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Purchasing Orders ({customers.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('subscribers')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'subscribers'
                  ? 'bg-white dark:bg-slate-900 text-violet-600 dark:text-violet-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Subscribers ({subscribers.length})</span>
            </button>
          </div>

          {activeTab === 'subscribers' && (
            <button
              onClick={exportSubscribersCSV}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/[0.08] text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition-colors shadow-sm"
            >
              <Download className="w-3.5 h-3.5 text-violet-500" />
              <span>Export CSV</span>
            </button>
          )}
        </div>
      </div>

      {/* Secondary Filters for Users Tab */}
      {activeTab === 'users' && (
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider">Status:</span>
            <div className="inline-flex rounded-lg bg-slate-100 dark:bg-slate-800/80 p-0.5 border border-slate-200/60 dark:border-white/[0.06]">
              {(['ALL', 'ACTIVE', 'SUSPENDED'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors ${
                    statusFilter === st
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  {st === 'ALL' ? 'All Status' : st}
                </button>
              ))}
            </div>

            <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider ml-2">Role:</span>
            <div className="inline-flex rounded-lg bg-slate-100 dark:bg-slate-800/80 p-0.5 border border-slate-200/60 dark:border-white/[0.06]">
              {(['ALL', 'CUSTOMER', 'STAFF'] as const).map((rl) => (
                <button
                  key={rl}
                  onClick={() => setRoleFilter(rl)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors ${
                    roleFilter === rl
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  {rl === 'ALL' ? 'All Roles' : rl === 'CUSTOMER' ? 'Customers' : 'Staff / Admins'}
                </button>
              ))}
            </div>
          </div>

          <div className="text-[11px] text-slate-500">
            Showing <span className="font-bold text-slate-800 dark:text-slate-200">{filteredUsers.length}</span> of {users.length} accounts
          </div>
        </div>
      )}

      {/* Tab 1: Registered Accounts & User Control */}
      {activeTab === 'users' && (
        <div className="rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-white/[0.08] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200/80 dark:border-white/[0.05]">
                <tr>
                  <th className="px-5 py-3.5">User Details</th>
                  <th className="px-5 py-3.5">Role</th>
                  <th className="px-5 py-3.5">Account Status</th>
                  <th className="px-5 py-3.5">Orders & Spend</th>
                  <th className="px-5 py-3.5">Wallet / Points</th>
                  <th className="px-5 py-3.5">Joined</th>
                  <th className="px-5 py-3.5 text-right">Activity & Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04]">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-slate-400">
                      No registered user records match your search criteria.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => {
                    const totalPaid = u.orders
                      .filter((o) => o.paymentStatus === 'PAID')
                      .reduce((sum, o) => sum + o.totalAmount, 0);

                    const cleanPhone = u.phone ? u.phone.replace(/[^0-9]/g, '') : null;
                    const isSelf = u.id === currentAdminId;
                    const isOwner = u.role === 'OWNER';
                    const canSuspend = !isSelf && !isOwner;

                    return (
                      <tr
                        key={u.id}
                        className={`hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors ${
                          !u.isActive ? 'bg-rose-500/[0.02]' : ''
                        }`}
                      >
                        {/* User Identity */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs uppercase flex-shrink-0 ${
                                !u.isActive
                                  ? 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                                  : u.role === 'OWNER'
                                  ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                                  : u.role === 'ADMIN'
                                  ? 'bg-violet-500/10 text-violet-600 border border-violet-500/20'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                              }`}
                            >
                              {(u.name || u.email).substring(0, 2)}
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 truncate">
                                <span>{u.name || 'Anonymous User'}</span>
                                {isSelf && (
                                  <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-violet-500/10 text-violet-600 dark:text-violet-400">
                                    You
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5 truncate">
                                <span>{u.email}</span>
                                {cleanPhone && (
                                  <>
                                    <span>•</span>
                                    <span className="font-mono">{u.phone}</span>
                                    <a
                                      href={`https://wa.me/${cleanPhone}?text=Hello%20${encodeURIComponent(
                                        u.name || 'Customer'
                                      )},%20greetings%20from%20SolutionsBD!`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      title="Chat on WhatsApp"
                                      className="text-emerald-500 hover:text-emerald-600"
                                    >
                                      <MessageSquare className="w-3 h-3 inline" />
                                    </a>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Role */}
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                              u.role === 'OWNER'
                                ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                                : u.role === 'ADMIN'
                                ? 'bg-violet-500/15 text-violet-700 dark:text-violet-300 border border-violet-500/30'
                                : u.role === 'SUPPORT'
                                ? 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>

                        {/* Account Status Badge */}
                        <td className="px-5 py-4">
                          {u.isActive ? (
                            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/30">
                              <Ban className="w-3 h-3 text-rose-500" />
                              Suspended
                            </span>
                          )}
                        </td>

                        {/* Orders & Spend */}
                        <td className="px-5 py-4">
                          <div className="font-bold text-slate-900 dark:text-white">
                            {formatPrice(totalPaid)}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {u.orders.length} {u.orders.length === 1 ? 'order' : 'orders'}
                          </div>
                        </td>

                        {/* Wallet & Points */}
                        <td className="px-5 py-4">
                          <div className="font-semibold text-slate-700 dark:text-slate-300">
                            {formatPrice(u.walletBalance || 0)}
                          </div>
                          <div className="text-[10px] text-amber-500 font-bold flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5" />
                            {u.loyaltyPoints || 0} pts
                          </div>
                        </td>

                        {/* Joined Date */}
                        <td className="px-5 py-4 text-slate-400 text-[11px]">
                          {formatDate(u.createdAt)}
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* Inspect Activity */}
                            <button
                              onClick={() => setSelectedUser(u)}
                              className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-violet-500 hover:text-white dark:hover:bg-violet-600 transition-colors inline-flex items-center gap-1"
                              title="Inspect user activity and order history"
                            >
                              <Activity className="w-3.5 h-3.5" />
                              <span>Activity</span>
                            </button>

                            {/* Suspend / Reactivate Action Button */}
                            {canSuspend ? (
                              <button
                                onClick={() => handleToggleUserSuspension(u)}
                                disabled={togglingUserId === u.id}
                                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1 disabled:opacity-50 ${
                                  u.isActive
                                    ? 'bg-rose-500/10 text-rose-600 hover:bg-rose-500 hover:text-white border border-rose-500/20'
                                    : 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white border border-emerald-500/20'
                                }`}
                                title={u.isActive ? 'Suspend this account' : 'Reactivate this account'}
                              >
                                {u.isActive ? (
                                  <>
                                    <Ban className="w-3.5 h-3.5" />
                                    <span>Suspend</span>
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>Reactivate</span>
                                  </>
                                )}
                              </button>
                            ) : (
                              <span
                                className="text-[10px] text-slate-400 font-semibold px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded"
                                title={isSelf ? 'Cannot suspend self' : 'OWNER protected'}
                              >
                                Protected
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Purchasing Customers */}
      {activeTab === 'customers' && (
        <div className="rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-white/[0.08] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200/80 dark:border-white/[0.05]">
                <tr>
                  <th className="px-5 py-3.5">Customer Name</th>
                  <th className="px-5 py-3.5">Phone & WhatsApp</th>
                  <th className="px-5 py-3.5">Email</th>
                  <th className="px-5 py-3.5">Completed Orders</th>
                  <th className="px-5 py-3.5">Lifetime Spend</th>
                  <th className="px-5 py-3.5 text-right">Last Purchase</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04]">
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center text-slate-400">
                      No customer records found.
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((c, idx) => {
                    const cleanPhone = c.phone.replace(/[^0-9]/g, '');
                    return (
                      <tr
                        key={idx}
                        className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="px-5 py-4 font-bold text-slate-900 dark:text-white">
                          {c.name}
                        </td>

                        <td className="px-5 py-4 font-mono font-bold text-slate-800 dark:text-slate-200">
                          <div className="flex items-center gap-2">
                            <span>{c.phone}</span>
                            <a
                              href={`https://wa.me/${cleanPhone}?text=Hello%20${encodeURIComponent(
                                c.name
                              )},%20greetings%20from%20SolutionsBD!`}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Chat on WhatsApp"
                              className="text-emerald-500 hover:text-emerald-600"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </td>

                        <td className="px-5 py-4 text-slate-600 dark:text-slate-400">
                          <a
                            href={`mailto:${c.email}`}
                            className="hover:text-violet-600 hover:underline"
                          >
                            {c.email}
                          </a>
                        </td>

                        <td className="px-5 py-4">
                          <span className="font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full">
                            {c.totalOrders} orders
                          </span>
                        </td>

                        <td className="px-5 py-4 font-black text-violet-600 dark:text-violet-400 text-sm">
                          {formatPrice(c.totalSpent)}
                        </td>

                        <td className="px-5 py-4 text-right text-slate-400">
                          {formatDate(c.lastOrderDate)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Newsletter Subscribers Table */}
      {activeTab === 'subscribers' && (
        <div className="rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-white/[0.08] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200/80 dark:border-white/[0.05]">
                <tr>
                  <th className="px-5 py-3.5">Email Address</th>
                  <th className="px-5 py-3.5">Acquisition Source</th>
                  <th className="px-5 py-3.5">Subscription Status</th>
                  <th className="px-5 py-3.5">Subscribed Date</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04]">
                {filteredSubscribers.map((s) => (
                  <tr
                    key={s.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="px-5 py-4 font-bold text-slate-900 dark:text-white">
                      {s.email}
                    </td>

                    <td className="px-5 py-4">
                      <span className="font-mono text-[11px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded uppercase text-slate-600 dark:text-slate-300">
                        {s.source}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          s.isActive
                            ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                            : 'bg-slate-500/10 text-slate-500'
                        }`}
                      >
                        {s.isActive ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                            <span>Active</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 text-slate-400" />
                            <span>Unsubscribed</span>
                          </>
                        )}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-slate-400">
                      {formatDate(s.createdAt)}
                    </td>

                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => handleToggleSub(s.id)}
                        className="text-[11px] font-bold text-slate-500 hover:text-violet-600 dark:hover:text-violet-400 underline"
                      >
                        {s.isActive ? 'Deactivate' : 'Reactivate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* User Activity & Supervise Modal Drawer */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-white/[0.1] shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 dark:border-white/[0.06] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-sm uppercase ${
                    !selectedUser.isActive
                      ? 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                      : 'bg-violet-500/10 text-violet-600 border border-violet-500/20'
                  }`}
                >
                  {(selectedUser.name || selectedUser.email).substring(0, 2)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">
                      {selectedUser.name || 'Anonymous User'}
                    </h3>
                    <span
                      className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        selectedUser.isActive
                          ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                      }`}
                    >
                      {selectedUser.isActive ? 'Active' : 'Suspended'}
                    </span>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {selectedUser.role}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {selectedUser.email} {selectedUser.phone ? `• ${selectedUser.phone}` : ''}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedUser(null)}
                className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {/* Account Quick Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-white/[0.04]">
                  <span className="text-[11px] text-slate-400 font-bold block">Total Orders</span>
                  <span className="text-lg font-black text-slate-900 dark:text-white mt-1 block">
                    {selectedUser.orders.length}
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-white/[0.04]">
                  <span className="text-[11px] text-slate-400 font-bold block">Total Paid Spent</span>
                  <span className="text-lg font-black text-violet-600 dark:text-violet-400 mt-1 block">
                    {formatPrice(
                      selectedUser.orders
                        .filter((o) => o.paymentStatus === 'PAID')
                        .reduce((sum, o) => sum + o.totalAmount, 0)
                    )}
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-white/[0.04]">
                  <span className="text-[11px] text-slate-400 font-bold block">Wallet Balance</span>
                  <span className="text-lg font-black text-slate-900 dark:text-white mt-1 block">
                    {formatPrice(selectedUser.walletBalance || 0)}
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-white/[0.04]">
                  <span className="text-[11px] text-slate-400 font-bold block">Loyalty Points</span>
                  <span className="text-lg font-black text-amber-500 mt-1 block">
                    {selectedUser.loyaltyPoints || 0} pts
                  </span>
                </div>
              </div>

              {/* Suspension Status Alert */}
              {!selectedUser.isActive && (
                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 flex items-start gap-3">
                  <ShieldAlert className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-500" />
                  <div>
                    <div className="font-bold text-sm">Account Is Currently Suspended</div>
                    <p className="mt-0.5 text-rose-600/90 dark:text-rose-400/90 leading-relaxed">
                      This user cannot sign in, place new orders, or access their digital licenses vault.
                      To restore access, click &ldquo;Reactivate Account&rdquo; below.
                    </p>
                  </div>
                </div>
              )}

              {/* Order History Timeline */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                    <ShoppingBag className="w-4 h-4 text-violet-500" />
                    <span>Order History & Digital License Activity</span>
                  </h4>
                  <span className="text-slate-400 font-medium text-[11px]">
                    {selectedUser.orders.length} orders recorded
                  </span>
                </div>

                {selectedUser.orders.length === 0 ? (
                  <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-800/30 border border-slate-200/50 dark:border-white/[0.04] text-center text-slate-400">
                    This user has not placed any orders yet.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedUser.orders.map((o) => {
                      let parsedDeliveredKeys: Array<{ variantName?: string; keyCode?: string }> = [];
                      try {
                        if (o.deliveredKeys && o.deliveredKeys !== '[]') {
                          parsedDeliveredKeys = JSON.parse(o.deliveredKeys);
                        }
                      } catch {}

                      return (
                        <div
                          key={o.id}
                          className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-white/[0.05] space-y-3"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/50 dark:border-white/[0.05] pb-2.5">
                            <div className="flex items-center gap-2">
                              <Link
                                href={`/admin/orders/${o.id}`}
                                className="font-mono font-bold text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1"
                              >
                                {o.orderNumber}
                                <ExternalLink className="w-3 h-3" />
                              </Link>
                              <span className="text-slate-400">•</span>
                              <span className="text-slate-400 text-[11px]">{formatDate(o.createdAt)}</span>
                            </div>

                            <div className="flex items-center gap-2">
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  o.paymentStatus === 'PAID'
                                    ? 'bg-emerald-500/10 text-emerald-600'
                                    : 'bg-amber-500/10 text-amber-600'
                                }`}
                              >
                                {o.paymentStatus}
                              </span>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200/70 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                                {o.orderStatus}
                              </span>
                              <span className="font-black text-slate-900 dark:text-white">
                                {formatPrice(o.totalAmount)}
                              </span>
                            </div>
                          </div>

                          {/* Ordered Items */}
                          <div className="space-y-1 text-[11px]">
                            {o.items.map((item) => (
                              <div key={item.id} className="flex justify-between text-slate-600 dark:text-slate-300">
                                <span>
                                  {item.productName || 'Digital License'}{' '}
                                  {item.variantName ? `(${item.variantName})` : ''} × {item.quantity}
                                </span>
                                <span className="font-bold">{formatPrice(item.unitPrice * item.quantity)}</span>
                              </div>
                            ))}
                          </div>

                          {/* Delivered Keys if available */}
                          {parsedDeliveredKeys.length > 0 && (
                            <div className="pt-2 border-t border-slate-200/40 dark:border-white/[0.04]">
                              <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1 mb-1.5">
                                <Key className="w-3 h-3 text-amber-500" />
                                Delivered Serial Keys:
                              </span>
                              <div className="space-y-1.5">
                                {parsedDeliveredKeys.map((dk, kidx) => (
                                  <div
                                    key={kidx}
                                    className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-white/[0.06] font-mono text-[11px]"
                                  >
                                    <span className="truncate max-w-sm text-slate-800 dark:text-slate-200">
                                      {dk.keyCode}
                                    </span>
                                    <button
                                      onClick={() => dk.keyCode && copyToClipboard(dk.keyCode, `${o.id}-${kidx}`)}
                                      className="text-slate-400 hover:text-violet-500 p-1"
                                      title="Copy key"
                                    >
                                      {copiedKey === `${o.id}-${kidx}` ? (
                                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                                      ) : (
                                        <Copy className="w-3.5 h-3.5" />
                                      )}
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer Controls */}
            <div className="p-4 sm:p-6 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/50">
              <div className="text-[11px] text-slate-400">
                User ID: <span className="font-mono">{selectedUser.id}</span>
              </div>

              <div className="flex items-center gap-3">
                {selectedUser.id !== currentAdminId && selectedUser.role !== 'OWNER' && (
                  <button
                    onClick={() => handleToggleUserSuspension(selectedUser)}
                    disabled={togglingUserId === selectedUser.id}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      selectedUser.isActive
                        ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-md shadow-rose-500/20'
                        : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                    }`}
                  >
                    {selectedUser.isActive ? (
                      <>
                        <Ban className="w-3.5 h-3.5" />
                        <span>Suspend Account</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Reactivate Account</span>
                      </>
                    )}
                  </button>
                )}

                <button
                  onClick={() => setSelectedUser(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
