'use client';

import React, { useState, useEffect, useMemo, type FormEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Copy,
  Check,
  CheckCircle2,
  ShieldCheck,
  Zap,
  ShoppingBag,
  Trash2,
  AlertCircle,
  Headphones,
  FileDown,
  MessageCircle,
} from 'lucide-react';
import { useCart } from './CartProvider';
import { useCartStore } from '@/lib/cart-store';
import { toast } from 'sonner';
import { formatPrice, formatImageUrl } from '@/lib/utils';
import { BkashLogo, NagadLogo, RocketLogo } from '@/components/common/PaymentLogos';
import type {
  PaymentGatewayOrder,
  SubmittedOrderData,
} from '@/components/payment/PaymentGatewayPage';
import styles from '@/app/cart/cart.module.css';

interface SubmittedOrder {
  id: string;
  orderNumber: string;
  total: number;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  paymentMethod?: string;
  senderNumber?: string;
  transactionId?: string;
  status?: string;
}

interface NormalizedCartItem {
  id: string;
  productId: string;
  slug: string;
  name: string;
  optionLabel: string;
  image: string;
  price: number;
  originalPrice?: number | null;
  quantity: number;
  rawOptionId?: string;
}

type PaymentProviderKey = 'bkash' | 'nagad' | 'rocket';

interface PaymentConfig {
  id: PaymentProviderKey;
  name: string;
  label: string;
  type: string;
  number: string;
  ussd: string;
  accent: string;
  accentBg: string;
  LogoComponent: React.ComponentType<{ className?: string; size?: number }>;
}

const PAYMENT_CONFIGS: Record<PaymentProviderKey, PaymentConfig> = {
  bkash: {
    id: 'bkash',
    name: 'bKash',
    label: 'bKash Send Money',
    type: 'Personal Account',
    number: process.env.NEXT_PUBLIC_BKASH_PERSONAL_NUMBER || '01641699879',
    ussd: '*247#',
    accent: '#E2136E',
    accentBg: 'rgba(226, 19, 110, 0.1)',
    LogoComponent: BkashLogo,
  },
  nagad: {
    id: 'nagad',
    name: 'Nagad',
    label: 'Nagad Send Money',
    type: 'Personal Account',
    number: process.env.NEXT_PUBLIC_NAGAD_PERSONAL_NUMBER || '01641699879',
    ussd: '*167#',
    accent: '#F6821F',
    accentBg: 'rgba(246, 130, 31, 0.1)',
    LogoComponent: NagadLogo,
  },
  rocket: {
    id: 'rocket',
    name: 'Rocket',
    label: 'Rocket Send Money',
    type: 'Personal Account',
    number: process.env.NEXT_PUBLIC_ROCKET_PERSONAL_NUMBER || '015189028225',
    ussd: '*322#',
    accent: '#8C3494',
    accentBg: 'rgba(140, 52, 148, 0.1)',
    LogoComponent: RocketLogo,
  },
};

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '8801410699879';

function isValidBdPhone(phone: string): boolean {
  const clean = phone.replace(/[\s\-()]/g, '');
  return /^(?:\+?88)?01[3-9]\d{8}$/.test(clean);
}

function normalizeBdPhone(phone: string): string {
  const clean = phone.replace(/[\s\-()]/g, '');
  if (clean.startsWith('+88')) return clean.slice(3);
  if (clean.startsWith('88')) return clean.slice(2);
  return clean;
}

export default function CartPageClient() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  const {
    items,
    updateQuantity,
    removeItem,
    clearCart,
    subtotal,
    couponCode,
    discountAmount,
    applyCoupon,
    removeCoupon,
    total,
  } = useCart();

  const zustandItems = useCartStore((state) => state.items);

  // Normalize items from either Context or Zustand
  const activeItems: NormalizedCartItem[] = useMemo(() => {
    const source = items.length > 0 ? items : zustandItems;
    return source.map((it: any) => ({
      id: it.optionId || it.variantId || it.productId,
      productId: it.productId,
      slug: it.slug || it.productSlug || it.productId,
      name: it.name || it.productTitle || 'Digital License',
      optionLabel: it.optionName || it.variantName || '',
      image: it.image,
      price: it.price,
      originalPrice: it.originalPrice,
      quantity: it.quantity,
      rawOptionId: it.optionId,
    }));
  }, [items, zustandItems]);

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [requirements, setRequirements] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<PaymentProviderKey>('bkash');

  const [couponInput, setCouponInput] = useState('');
  const [couponFeedback, setCouponFeedback] = useState<{ tone: 'success' | 'error'; message: string } | null>(null);

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submittedOrder, setSubmittedOrder] = useState<SubmittedOrder | null>(null);
  const [orderVerificationStatus, setOrderVerificationStatus] = useState<'PENDING' | 'CONFIRMED' | 'INVALID'>('PENDING');

  useEffect(() => {
    setMounted(true);

    try {
      const stored = sessionStorage.getItem('sbd_submitted_order') || localStorage.getItem('sbd_submitted_order');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.orderNumber || parsed?.id) {
          setSubmittedOrder(parsed);
          setOrderVerificationStatus(parsed.status === 'CONFIRMED' ? 'CONFIRMED' : 'PENDING');
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // Compute subtotal and total
  const activeSubtotal = useMemo(() => {
    if (subtotal > 0) return subtotal;
    return activeItems.reduce((acc, it) => acc + it.price * it.quantity, 0);
  }, [subtotal, activeItems]);

  const activeTotal = useMemo(() => {
    if (total > 0) return total;
    return Math.max(0, activeSubtotal - (discountAmount || 0));
  }, [total, activeSubtotal, discountAmount]);

  const currentPayment = PAYMENT_CONFIGS[selectedMethod] || PAYMENT_CONFIGS.bkash;

  const validateCustomerForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!customerName.trim() || customerName.trim().length < 2) {
      errors.name = 'অনুগ্রহ করে আপনার পুরো নাম লিখুন (Full name is required)';
    }

    if (!customerPhone.trim()) {
      errors.phone = 'সঠিক ফোন নম্বর প্রয়োজন (Phone number is required)';
    } else if (!isValidBdPhone(customerPhone.trim())) {
      errors.phone = 'সঠিক বাংলাদেশী মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX)';
    }

    if (!customerEmail.trim()) {
      errors.email = 'লাইসেন্স পাওয়ার জন্য ইমেইল ঠিকানা প্রয়োজন (Email is required)';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail.trim())) {
      errors.email = 'একটি বৈধ ইমেইল ঠিকানা প্রদান করুন (Valid email address required)';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleApplyCoupon = (e: FormEvent) => {
    e.preventDefault();
    const code = couponInput.trim().toUpperCase();
    if (!code) return;

    if (code === 'SBD10' || code === 'SAVE10' || code === 'TECH10') {
      const discount = Math.round(activeSubtotal * 0.1);
      applyCoupon(code, discount);
      setCouponFeedback({ tone: 'success', message: `কুপন কোড ${code} সফলভাবে প্রয়োগ করা হয়েছে! (১০% ছাড়)` });
      toast.success(`Coupon ${code} applied: 10% discount!`);
    } else if (code === 'WELCOME50') {
      applyCoupon(code, 50);
      setCouponFeedback({ tone: 'success', message: `কুপন কোড ${code} প্রয়োগ করা হয়েছে! (৳৫০ ছাড়)` });
      toast.success(`Coupon ${code} applied: ৳50 discount!`);
    } else {
      setCouponFeedback({ tone: 'error', message: 'অবৈধ বা মেয়াদোত্তীর্ণ কুপন কোড। অনুগ্রহ করে সঠিক কোড দিন।' });
      toast.error('Invalid or expired coupon code.');
    }
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
    setCouponInput('');
    setCouponFeedback(null);
    toast.info('Coupon removed.');
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateCustomerForm()) {
      toast.error('অনুগ্রহ করে নাম, সঠিক মোবাইল নম্বর এবং ডেলিভারি ইমেইল লিখুন।');
      return;
    }

    const orderRef = `SBD-${Math.floor(100000 + Math.random() * 900000)}`;

    const pendingPaymentOrder: PaymentGatewayOrder = {
      refId: orderRef,
      customerName: customerName.trim(),
      customerPhone: normalizeBdPhone(customerPhone.trim()),
      customerEmail: customerEmail.trim(),
      total: activeTotal,
      totalPrice: formatPrice(activeTotal),
      paymentMethod: selectedMethod,
      notes: requirements.trim() || null,
      couponCode: couponCode || null,
      items: activeItems.map((item) => ({
        productId: item.productId,
        optionId: item.rawOptionId || item.id,
        variantId: item.id,
        optionName: item.optionLabel || undefined,
        productName: item.name,
        productImage: item.image,
        unitPrice: item.price,
        originalUnitPrice: item.originalPrice ?? null,
        quantity: item.quantity,
      })),
    };

    if (typeof window !== 'undefined') {
      sessionStorage.setItem('sbd_pending_payment', JSON.stringify(pendingPaymentOrder));
      sessionStorage.setItem('techbd_pending_payment', JSON.stringify(pendingPaymentOrder));
    }

    router.push('/checkout/payment');
  };

  if (!mounted) {
    return (
      <main className={styles.page}>
        <div className={styles.container}>
          <div className="py-24 text-center">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm text-slate-500 font-medium">অর্ডার ফর্ম লোড হচ্ছে...</p>
          </div>
        </div>
      </main>
    );
  }

  // ── 1. Order Placed / Verification Status View ─────────────────────────
  if (submittedOrder) {
    const isConfirmed = orderVerificationStatus === 'CONFIRMED';
    const isInvalid = orderVerificationStatus === 'INVALID';
    const isPending = orderVerificationStatus === 'PENDING';

    const whatsappText = encodeURIComponent(
      `Hello SolutionsBD Support! I placed order #${submittedOrder.orderNumber} for ${formatPrice(submittedOrder.total)} via ${submittedOrder.paymentMethod || 'bKash'}. TrxID: ${submittedOrder.transactionId || 'N/A'}. Please confirm my license key delivery.`
    );
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappText}`;

    return (
      <main className={styles.page}>
        <div className={styles.container}>
          <div className={styles.confirmationCard}>
            {/* Dynamic Status Icon */}
            <div
              className={styles.successCheckWrap}
              style={{
                background: isConfirmed
                  ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                  : isInvalid
                  ? 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)'
                  : 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
              }}
              aria-hidden="true"
            >
              {isConfirmed ? '✓' : isInvalid ? '✕' : '⏳'}
            </div>

            {/* Dynamic Title */}
            <h1 className={styles.confirmationTitle}>
              {isConfirmed && 'Payment Verified & Order Confirmed!'}
              {isInvalid && 'TrxID Verification Failed!'}
              {isPending && 'Order Placed — Verification In Progress'}
            </h1>

            {/* Dynamic Status Pill */}
            <div
              className={styles.confirmationBadge}
              style={{
                background: isConfirmed
                  ? 'rgba(16, 185, 129, 0.12)'
                  : isInvalid
                  ? 'rgba(239, 68, 68, 0.12)'
                  : 'rgba(245, 158, 11, 0.12)',
                borderColor: isConfirmed
                  ? 'rgba(16, 185, 129, 0.4)'
                  : isInvalid
                  ? 'rgba(239, 68, 68, 0.4)'
                  : 'rgba(245, 158, 11, 0.4)',
                color: isConfirmed ? '#10B981' : isInvalid ? '#EF4444' : '#F59E0B',
              }}
            >
              <span aria-hidden="true">
                {isConfirmed ? '✅' : isInvalid ? '❌' : '⏳'}
              </span>
              <span>
                {isConfirmed && 'Payment Verified & Confirmed (অনুমোদিত)'}
                {isInvalid && 'ভুল TrxID (Verification Failed - বাতিল)'}
                {isPending && 'Payment Submitted — Pending Verification (ভেরিফিকেশন চলছে)'}
              </span>
            </div>

            {/* Subtitle Description */}
            <p className={styles.subtitle} style={{ marginBottom: '24px' }}>
              {isConfirmed &&
                `আপনার পেমেন্ট সফলভাবে অনুমোদিত হয়েছে। কিছুক্ষণের মধ্যে আপনার ইমেইলে (${submittedOrder.customerEmail}) লাইসেন্স কি ও সেটআপ নির্দেশনা পৌঁছে যাবে।`}
              {isInvalid &&
                `আপনার প্রদত্ত Transaction ID (${submittedOrder.transactionId}) যাচাই করা সম্ভব হয়নি। অনুগ্রহ করে পেমেন্ট গেটওয়েতে সঠিক TrxID লিখুন।`}
              {isPending &&
                'আপনার পেমেন্ট তথ্য সফলভাবে গ্রহণ করা হয়েছে এবং ভেরিফিকেশন চলছে। অ্যাডমিন কনফার্ম করা মাত্রই এই স্ক্রিন স্বয়ংক্রিয়ভাবে আপডেট হবে।'}
            </p>

            {/* If Invalid, direct button to return to Payment Gateway */}
            {isInvalid && (
              <div style={{ marginBottom: '24px' }}>
                <Link
                  href="/checkout/payment"
                  className={styles.submitOrderButton}
                  style={{
                    background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                    maxWidth: '340px',
                    margin: '0 auto',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    textDecoration: 'none',
                  }}
                >
                  🔄 পুনরায় TrxID দিন (Re-enter TrxID in Gateway)
                </Link>
              </div>
            )}

            {/* Complete Order Details Grid */}
            <div className={styles.orderDetailsGrid}>
              <div className={styles.orderDetailItem}>
                <span className={styles.orderDetailLabel}>Order Reference</span>
                <span className={styles.orderDetailValue}>#{submittedOrder.orderNumber || submittedOrder.id}</span>
              </div>
              <div className={styles.orderDetailItem}>
                <span className={styles.orderDetailLabel}>Verification Status</span>
                <span
                  className={styles.orderDetailValue}
                  style={{
                    color: isConfirmed ? '#10B981' : isInvalid ? '#EF4444' : '#F59E0B',
                    fontWeight: 750,
                  }}
                >
                  {isConfirmed && '✅ Confirmed (অনুমোদিত)'}
                  {isInvalid && '❌ Verification Failed (ভুল TrxID)'}
                  {isPending && '⏳ Pending Verification (চলছে)'}
                </span>
              </div>
              <div className={styles.orderDetailItem}>
                <span className={styles.orderDetailLabel}>Total Amount</span>
                <span className={styles.orderDetailValue} style={{ color: '#2563eb', fontWeight: 800 }}>
                  {formatPrice(submittedOrder.total)}
                </span>
              </div>
              <div className={styles.orderDetailItem}>
                <span className={styles.orderDetailLabel}>Delivery Email</span>
                <span className={styles.orderDetailValue}>{submittedOrder.customerEmail}</span>
              </div>
              <div className={styles.orderDetailItem}>
                <span className={styles.orderDetailLabel}>Customer Name</span>
                <span className={styles.orderDetailValue}>{submittedOrder.customerName || 'N/A'}</span>
              </div>
              <div className={styles.orderDetailItem}>
                <span className={styles.orderDetailLabel}>Customer Phone</span>
                <span className={styles.orderDetailValue}>{submittedOrder.customerPhone || 'N/A'}</span>
              </div>
              <div className={styles.orderDetailItem}>
                <span className={styles.orderDetailLabel}>Payment Method</span>
                <span className={styles.orderDetailValue}>{submittedOrder.paymentMethod || 'Mobile Banking'}</span>
              </div>
              {submittedOrder.senderNumber && (
                <div className={styles.orderDetailItem}>
                  <span className={styles.orderDetailLabel}>Sender Number</span>
                  <span className={styles.orderDetailValue} style={{ fontFamily: 'var(--font-mono, monospace)' }}>
                    {submittedOrder.senderNumber}
                  </span>
                </div>
              )}
              {submittedOrder.transactionId && (
                <div className={styles.orderDetailItem}>
                  <span className={styles.orderDetailLabel}>Transaction ID (TrxID)</span>
                  <span
                    className={styles.orderDetailValue}
                    style={{
                      fontFamily: 'var(--font-mono, monospace)',
                      fontWeight: 750,
                      color: isInvalid ? '#EF4444' : '#10B981',
                    }}
                  >
                    {submittedOrder.transactionId}
                  </span>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className={styles.confirmationActions}>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.continueButton}
                style={{
                  background: '#25D366',
                  color: '#ffffff',
                  border: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  fontWeight: 700,
                  textDecoration: 'none',
                }}
              >
                <MessageCircle size={16} />
                <span>WhatsApp কনফার্মেশন (+8801410699879)</span>
              </a>

              <Link
                href="/downloads"
                className={styles.continueButton}
                style={{
                  background: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  fontWeight: 700,
                  textDecoration: 'none',
                }}
              >
                <FileDown size={16} />
                <span>সফটওয়্যার ডাউনলোড সেন্টারে যান →</span>
              </Link>

              <button
                type="button"
                onClick={() => {
                  try {
                    sessionStorage.removeItem('sbd_submitted_order');
                    localStorage.removeItem('sbd_submitted_order');
                    sessionStorage.removeItem('sbd_pending_payment');
                  } catch {}
                  setSubmittedOrder(null);
                  if (typeof window !== 'undefined') {
                    window.history.replaceState({}, '', '/cart');
                  }
                }}
                className={styles.continueButton}
                style={{ cursor: 'pointer', background: 'none', border: '1px solid rgba(148, 163, 184, 0.4)' }}
              >
                + Start New Order
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // ── 2. Empty State View ───────────────────────────────────────────────
  if (activeItems.length === 0) {
    return (
      <main className={styles.page}>
        <div className={styles.container}>
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon} aria-hidden="true">
              🛒
            </span>
            <h1 className={styles.emptyTitle}>Your cart is empty</h1>
            <p className={styles.emptySubtitle}>
              You have not selected any digital software products yet. Browse our marketplace for genuine operating systems, office packages, CAD tools, and security suites.
            </p>
            <Link href="/shop" className={styles.emptyButton}>
              <ShoppingBag size={18} />
              <span>Browse Software Catalog →</span>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // ── 3. Active Two-Column Checkout View ──────────────────────────────────
  return (
    <main className={styles.page}>
      <div className={styles.container}>
        {/* Checkout Header */}
        <div className={styles.header}>
          <span className={styles.headerBadge}>Secure Digital Checkout</span>
          <h1 className={styles.title}>
            <span className={styles.titleGradient}>Checkout</span>
          </h1>
          <p className={styles.subtitle}>
            Complete your customer details and mobile banking payment to receive genuine software licenses.
          </p>
        </div>

        {/* Two-Column Grid */}
        <div className={styles.checkoutLayout}>
          {/* ===============================================================
              LEFT COLUMN (60%): CUSTOMER INFO & PAYMENT METHOD
             =============================================================== */}
          <form id="checkout-form" className={styles.leftColumn} onSubmit={handlePlaceOrder} noValidate>
            {/* Step 1: Customer Information */}
            <section className={styles.sectionCard} aria-labelledby="customer-info-title">
              <div className={styles.sectionHeader}>
                <span className={styles.sectionNumber}>1</span>
                <div className={styles.sectionTitleGroup}>
                  <h2 id="customer-info-title" className={styles.sectionTitle}>
                    Customer Information
                  </h2>
                  <p className={styles.sectionSubtitle}>
                    Provide your contact details where your digital licenses and invoices will be delivered.
                  </p>
                </div>
              </div>

              <div className={styles.formGrid}>
                {/* Full Name */}
                <div className={styles.formGroup}>
                  <label htmlFor="customer-name" className={styles.formLabel}>
                    <span>Full Name <span className={styles.formRequired}>*</span></span>
                  </label>
                  <input
                    id="customer-name"
                    name="name"
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => {
                      setCustomerName(e.target.value);
                      if (fieldErrors.name) {
                        setFieldErrors((prev) => ({ ...prev, name: '' }));
                      }
                    }}
                    placeholder="Enter your full name"
                    autoComplete="name"
                    className={`${styles.formInput} ${fieldErrors.name ? styles.formInputError : ''}`}
                  />
                  {fieldErrors.name && (
                    <p className={styles.formErrorText}>{fieldErrors.name}</p>
                  )}
                </div>

                <div className={styles.formGridTwoCol}>
                  {/* Phone Number */}
                  <div className={styles.formGroup}>
                    <label htmlFor="customer-phone" className={styles.formLabel}>
                      <span>Phone Number <span className={styles.formRequired}>*</span></span>
                    </label>
                    <input
                      id="customer-phone"
                      name="phone"
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={(e) => {
                        setCustomerPhone(e.target.value);
                        if (fieldErrors.phone) {
                          setFieldErrors((prev) => ({ ...prev, phone: '' }));
                        }
                      }}
                      placeholder="01XXXXXXXXX"
                      autoComplete="tel"
                      className={`${styles.formInput} ${fieldErrors.phone ? styles.formInputError : ''}`}
                    />
                    {fieldErrors.phone ? (
                      <p className={styles.formErrorText}>{fieldErrors.phone}</p>
                    ) : (
                      <p className={styles.formHelpText}>Used for order delivery & verification alerts</p>
                    )}
                  </div>

                  {/* Email Address */}
                  <div className={styles.formGroup}>
                    <label htmlFor="customer-email" className={styles.formLabel}>
                      <span>Delivery Email Address <span className={styles.formRequired}>*</span></span>
                    </label>
                    <input
                      id="customer-email"
                      name="email"
                      type="email"
                      required
                      value={customerEmail}
                      onChange={(e) => {
                        setCustomerEmail(e.target.value);
                        if (fieldErrors.email) {
                          setFieldErrors((prev) => ({ ...prev, email: '' }));
                        }
                      }}
                      placeholder="your.email@example.com"
                      autoComplete="email"
                      className={`${styles.formInput} ${fieldErrors.email ? styles.formInputError : ''}`}
                    />
                    {fieldErrors.email ? (
                      <p className={styles.formErrorText}>{fieldErrors.email}</p>
                    ) : (
                      <p className={styles.formHelpText}>Official license keys & setup guide will be sent here</p>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* Step 2: Payment Method Selection */}
            <section className={styles.sectionCard} aria-labelledby="payment-method-title">
              <div className={styles.sectionHeader} style={{ marginBottom: '14px' }}>
                <div className={styles.sectionTitleGroup}>
                  <label id="payment-method-title" className={styles.formLabel} style={{ fontSize: '12px', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 0 }}>
                    <span>PAYMENT METHOD <span className={styles.formRequired}>*</span></span>
                  </label>
                </div>
              </div>

              {/* 3 Selectable Payment Cards: bKash | Nagad | Rocket */}
              <div className={styles.paymentCardsGrid} role="radiogroup" aria-label="Select Payment Method">
                {(Object.keys(PAYMENT_CONFIGS) as PaymentProviderKey[]).map((key) => {
                  const cfg = PAYMENT_CONFIGS[key];
                  const isSelected = selectedMethod === key;
                  const Logo = cfg.LogoComponent;

                  return (
                    <button
                      key={key}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      className={`${styles.paymentCard} ${isSelected ? styles.paymentCardSelected : ''}`}
                      onClick={() => setSelectedMethod(key)}
                    >
                      <div className={styles.paymentCardLogoWrap}>
                        <Logo className="w-6 h-6" size={24} />
                      </div>
                      <span className={styles.paymentCardName}>{cfg.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* Single Helper Line under Payment Options */}
              <div className={styles.paymentHintBar}>
                <span>
                  {selectedMethod === 'bkash' && `Send Money via bKash App or dial *247# to ${currentPayment.number}`}
                  {selectedMethod === 'nagad' && `Send Money via Nagad App or dial *167# to ${currentPayment.number}`}
                  {selectedMethod === 'rocket' && `Send Money via Rocket App or dial *322# to ${currentPayment.number}`}
                </span>
                <span className={styles.paymentHintBrand}>
                  {currentPayment.name}
                </span>
              </div>

              {/* Additional Requirements (Optional) */}
              <div className={styles.formGroup} style={{ marginTop: '16px' }}>
                <label htmlFor="order-requirements" className={styles.formLabel}>
                  <span>Additional Requirements (Optional)</span>
                </label>
                <textarea
                  id="order-requirements"
                  name="requirements"
                  rows={2}
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  placeholder="e.g. Need assistance with multi-seat setup, Mac/Windows version notes, etc."
                  className={styles.formTextarea}
                />
              </div>
            </section>

            {/* Trust and Guarantee Badges */}
            <div className={styles.trustBadgesRow}>
              <div className={styles.trustBadgeItem}>
                <ShieldCheck className={styles.trustBadgeIcon} style={{ color: '#10B981' }} />
                <div>
                  <h4 className={styles.trustBadgeTitle}>Genuine Software</h4>
                  <p className={styles.trustBadgeDesc}>100% Authentic Retail Licenses</p>
                </div>
              </div>
              <div className={styles.trustBadgeItem}>
                <Zap className={styles.trustBadgeIcon} style={{ color: '#F59E0B' }} />
                <div>
                  <h4 className={styles.trustBadgeTitle}>Fast Delivery</h4>
                  <p className={styles.trustBadgeDesc}>Sent directly to your delivery email</p>
                </div>
              </div>
              <div className={styles.trustBadgeItem}>
                <Headphones className={styles.trustBadgeIcon} style={{ color: '#2563eb' }} />
                <div>
                  <h4 className={styles.trustBadgeTitle}>Live Support</h4>
                  <p className={styles.trustBadgeDesc}>24/7 WhatsApp & Ticket Help</p>
                </div>
              </div>
            </div>
          </form>

          {/* ===============================================================
              RIGHT COLUMN (40%): COMPLETE PRODUCT DETAILS & ORDER SUMMARY
             =============================================================== */}
          <aside className={styles.rightColumn} aria-label="Order Summary">
            <div className={styles.orderSummaryCard}>
              <h2 className={styles.orderSummaryTitle}>Your Order</h2>
              <p className={styles.orderSummarySubtitle}>
                Review your digital products before proceeding to payment.
              </p>

              {/* Product List */}
              <div className={styles.productList} role="list">
                {activeItems.map((item) => {
                  const hasDiscount = item.originalPrice && item.originalPrice > item.price;

                  return (
                    <div
                      key={`${item.productId}:${item.id}`}
                      className={styles.productRow}
                      role="listitem"
                    >
                      {/* Product Thumbnail */}
                      <div className={styles.productThumbnail}>
                        <Image
                          src={formatImageUrl(item.image)}
                          alt={item.name}
                          width={75}
                          height={75}
                          className="object-contain"
                        />
                      </div>

                      {/* Product Info */}
                      <div className={styles.productInfo}>
                        <Link href={`/product/${item.slug || item.productId}`} className={styles.productName}>
                          {item.name}
                        </Link>

                        {item.optionLabel && (
                          <span className={styles.productOptionBadge}>
                            {item.optionLabel}
                          </span>
                        )}

                        {/* Quantity controls */}
                        <div className={styles.productQuantityControls}>
                          <button
                            type="button"
                            className={styles.qtyButton}
                            disabled={item.quantity <= 1}
                            onClick={() => updateQuantity(item.productId, item.quantity - 1, item.rawOptionId)}
                            aria-label={`Decrease quantity of ${item.name}`}
                          >
                            −
                          </button>
                          <span className={styles.qtyValue}>{item.quantity}</span>
                          <button
                            type="button"
                            className={styles.qtyButton}
                            disabled={item.quantity >= 99}
                            onClick={() => updateQuantity(item.productId, item.quantity + 1, item.rawOptionId)}
                            aria-label={`Increase quantity of ${item.name}`}
                          >
                            +
                          </button>
                          <button
                            type="button"
                            className={styles.productRemoveBtn}
                            onClick={() => removeItem(item.productId, item.rawOptionId)}
                            aria-label={`Remove ${item.name} from order`}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>

                      {/* Price Column */}
                      <div className={styles.productPriceCol}>
                        <span className={styles.productLineTotal}>
                          {formatPrice(item.price * item.quantity)}
                        </span>
                        {hasDiscount && (
                          <span className={styles.productOriginalPrice}>
                            {formatPrice(item.originalPrice! * item.quantity)}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Coupon Section */}
              <div className={styles.couponSection}>
                <label htmlFor="coupon-input" className={styles.couponLabel}>
                  Have a coupon code?
                </label>

                {couponCode ? (
                  <div className={styles.couponAppliedBadge}>
                    <span className={styles.couponAppliedText}>
                      <span>✓ {couponCode} (৳{discountAmount} off)</span>
                    </span>
                    <button
                      type="button"
                      className={styles.couponRemoveBtn}
                      onClick={handleRemoveCoupon}
                      aria-label="Remove applied coupon"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form className={styles.couponForm} onSubmit={handleApplyCoupon}>
                    <input
                      id="coupon-input"
                      type="text"
                      value={couponInput}
                      onChange={(e) => {
                        setCouponInput(e.target.value.toUpperCase());
                        if (couponFeedback?.tone === 'error') {
                          setCouponFeedback(null);
                        }
                      }}
                      placeholder="e.g. SBD10"
                      className={styles.couponInput}
                    />
                    <button
                      type="submit"
                      disabled={!couponInput.trim()}
                      className={styles.couponApplyBtn}
                    >
                      Apply
                    </button>
                  </form>
                )}

                {couponFeedback && (
                  <p
                    className={
                      couponFeedback.tone === 'success'
                        ? styles.couponAppliedBadge
                        : styles.couponError
                    }
                  >
                    {couponFeedback.message}
                  </p>
                )}
              </div>

              {/* Order Total Breakdown */}
              <div className={styles.priceBreakdown}>
                <div className={styles.priceRow}>
                  <span>Products Subtotal</span>
                  <span className={styles.priceRowValue}>{formatPrice(activeSubtotal)}</span>
                </div>

                {discountAmount > 0 && (
                  <div className={styles.priceRow}>
                    <span>Coupon Discount</span>
                    <span className={`${styles.priceRowValue} ${styles.priceRowSavings}`}>
                      −{formatPrice(discountAmount)}
                    </span>
                  </div>
                )}

                <div className={styles.priceRow}>
                  <span>Digital Delivery</span>
                  <span className={styles.deliveryFree}>Free (Instant)</span>
                </div>

                <div className={styles.divider} />

                <div className={styles.totalRow}>
                  <span className={styles.totalLabel}>TOTAL PAYABLE</span>
                  <span className={styles.totalAmount}>{formatPrice(activeTotal)}</span>
                </div>
              </div>

              {/* Submit Order Button on the Right Side */}
              <div style={{ marginTop: '20px', marginBottom: '8px' }}>
                <button
                  type="submit"
                  form="checkout-form"
                  onClick={handlePlaceOrder}
                  className={styles.submitOrderButton}
                >
                  <span>পেমেন্ট গেটওয়েতে যান (Pay {formatPrice(activeTotal)}) →</span>
                </button>
              </div>

              <p className="text-[11px] text-center text-slate-500 dark:text-slate-400 mt-3 leading-relaxed">
                By submitting this order you agree to SolutionsBD&apos;s{' '}
                <Link href="/policies/terms-and-conditions" target="_blank" className="text-blue-600 dark:text-blue-400 underline underline-offset-2">
                  Terms
                </Link>{' '}
                &amp;{' '}
                <Link href="/policies/refund-policy" target="_blank" className="text-blue-600 dark:text-blue-400 underline underline-offset-2">
                  Refund Policy
                </Link>
                .
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
