'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Copy,
  Check,
  ShieldCheck,
  Zap,
  Tag,
  Phone,
  MessageSquare,
  Lock,
} from 'lucide-react';
import { formatPrice, formatImageUrl } from '@/lib/utils';
import { useCart } from '@/components/cart/CartProvider';
import { useCartStore } from '@/lib/cart-store';
import { toast } from 'sonner';

export default function CartPageClient() {
  const router = useRouter();
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

  // Also support zustand store items if any were added there
  const zustandItems = useCartStore((state) => state.items);

  // Active items: prefer CartProvider, fallback to zustand
  const activeItems = items.length > 0 ? items : zustandItems.map((z) => ({
    productId: z.productId,
    slug: z.productSlug,
    name: z.productTitle,
    image: z.image,
    price: z.price,
    originalPrice: z.originalPrice,
    optionId: z.variantId,
    optionName: z.variantName,
    quantity: z.quantity,
  }));

  const activeSubtotal = items.length > 0 ? subtotal : activeItems.reduce((acc, i) => acc + i.price * i.quantity, 0);
  const activeTotal = Math.max(0, activeSubtotal - discountAmount);

  // Step Tracker: 1 = Cart Review, 2 = Customer Info, 3 = Payment Method
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Coupon state
  const [couponInput, setCouponInput] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  // Customer Form
  const [customer, setCustomer] = useState({
    name: '',
    phone: '',
    whatsapp: '',
    email: '',
    notes: '',
  });
  const [sameAsPhone, setSameAsPhone] = useState(true);
  const [loggedInUser, setLoggedInUser] = useState<{ id: string; name: string; email: string; phone: string | null } | null>(null);

  React.useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setLoggedInUser(data.user);
          setCustomer((prev) => ({
            ...prev,
            name: prev.name || data.user.name || '',
            email: prev.email || data.user.email || '',
            phone: prev.phone || data.user.phone || '',
            whatsapp: prev.whatsapp || data.user.phone || '',
          }));
        }
      })
      .catch(() => {});
  }, []);

  // Payment Selection
  const [paymentMethod, setPaymentMethod] = useState<'BKASH_MANUAL' | 'NAGAD_MANUAL' | 'ROCKET_MANUAL' | 'UPAY_MANUAL'>('BKASH_MANUAL');
  const [trxId, setTrxId] = useState('');
  const [senderPhone, setSenderPhone] = useState('');
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [copiedNumber, setCopiedNumber] = useState(false);

  const MERCHANT_NUMBERS = {
    BKASH_MANUAL: { name: 'bKash Personal / Send Money', number: '01641699879' },
    NAGAD_MANUAL: { name: 'Nagad Personal / Send Money', number: '01641699879' },
    ROCKET_MANUAL: { name: 'Rocket Personal / Send Money', number: '015189028225' },
    UPAY_MANUAL: { name: 'Upay Personal / Send Money', number: '01518902822' },
  };

  const handleCopyNumber = (num: string) => {
    navigator.clipboard.writeText(num);
    setCopiedNumber(true);
    toast.success('Number copied to clipboard!');
    setTimeout(() => setCopiedNumber(false), 2000);
  };

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const code = couponInput.trim().toUpperCase();
    if (!code) return;

    setApplyingCoupon(true);
    if (code === 'WELCOME10') {
      const discount = Math.round(activeSubtotal * 0.1);
      applyCoupon('WELCOME10', discount);
      toast.success('Promo code WELCOME10 applied! 10% Discount saved.');
    } else if (code === 'EID50') {
      applyCoupon('EID50', 50);
      toast.success('Promo code EID50 applied! ৳50 Discount saved.');
    } else {
      toast.error('Invalid promo code.');
    }
    setApplyingCoupon(false);
  };

  const handleProceedToStep2 = () => {
    if (activeItems.length === 0) {
      toast.error('Your cart is empty.');
      return;
    }
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleProceedToStep3 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer.name.trim() || !customer.phone.trim() || !customer.email.trim()) {
      toast.error('Please fill in Name, Phone, and Email.');
      return;
    }
    setStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmitOrder = async () => {
    if (!trxId.trim() || !senderPhone.trim()) {
      toast.error('Please enter the Transaction ID (TrxID) and Sender Phone Number.');
      return;
    }

    setSubmittingOrder(true);
    try {
      const orderPayload = {
        userId: loggedInUser?.id,
        customerName: customer.name,
        customerEmail: customer.email,
        customerPhone: customer.phone,
        items: activeItems.map((item) => ({
          variantId: item.optionId,
          productName: (item as any).productTitle || item.name,
          variantName: (item as any).variantName || item.optionName || 'Standard License',
          quantity: item.quantity,
          unitPrice: item.price,
        })),
        totalAmount: activeTotal,
        discountAmount,
        couponCode: couponCode || null,
        paymentMethod,
        paymentTrxId: trxId.trim(),
        senderPhone: senderPhone.trim(),
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit order.');
      }

      toast.success('Order placed successfully! Redirecting...');
      const targetOrderNumber = data.orderNumber || data.order?.orderNumber;
      if (targetOrderNumber) {
        router.push(`/order-success/${targetOrderNumber}`);
      } else {
        router.push('/my-licenses');
      }
    } catch (err: any) {
      toast.error(err.message || 'Checkout failed. Please retry or contact WhatsApp support.');
    } finally {
      setSubmittingOrder(false);
    }
  };

  if (activeItems.length === 0 && step === 1) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
          <ShoppingCart className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            আপনার কার্ট বর্তমানে খালি (Your Cart is Empty)
          </h1>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Explore our genuine software catalog for Windows, Office, IDM, and antivirus licenses with instant automated delivery.
          </p>
        </div>
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs shadow-lg shadow-violet-600/25 transition-all active:scale-95"
        >
          <span>Explore Software Catalog</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* 4-Step Progress Indicator */}
      <div className="flex items-center justify-center max-w-xl mx-auto">
        <div className="flex items-center w-full justify-between relative">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-200 dark:bg-slate-800 -translate-y-1/2 z-0" />

          {/* Step 1 */}
          <button
            onClick={() => setStep(1)}
            className={`relative z-10 flex flex-col items-center gap-1.5 focus:outline-none`}
          >
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-colors shadow-sm ${
                step >= 1
                  ? 'bg-violet-600 text-white shadow-violet-600/30'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
              }`}
            >
              1
            </div>
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
              Cart Review
            </span>
          </button>

          {/* Step 2 */}
          <button
            onClick={() => step > 2 && setStep(2)}
            disabled={step < 2}
            className={`relative z-10 flex flex-col items-center gap-1.5 focus:outline-none`}
          >
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-colors shadow-sm ${
                step >= 2
                  ? 'bg-violet-600 text-white shadow-violet-600/30'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
              }`}
            >
              2
            </div>
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
              Customer Info
            </span>
          </button>

          {/* Step 3 */}
          <div className={`relative z-10 flex flex-col items-center gap-1.5`}>
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-colors shadow-sm ${
                step === 3
                  ? 'bg-violet-600 text-white shadow-violet-600/30'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
              }`}
            >
              3
            </div>
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
              Payment & TrxID
            </span>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left 2 Cols: Step View */}
        <div className="lg:col-span-2 space-y-6">
          {/* STEP 1: Cart Items Review */}
          {step === 1 && (
            <div className="rounded-2xl bg-white/95 dark:bg-[#0f172a]/95 border border-slate-200/80 dark:border-white/[0.08] p-5 sm:p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.06] pb-3">
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-violet-500" />
                  <span>Your Selected Items ({activeItems.length})</span>
                </h2>
                <button
                  onClick={clearCart}
                  className="text-xs text-rose-500 hover:text-rose-600 font-semibold"
                >
                  Clear All
                </button>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-white/[0.05]">
                {activeItems.map((item) => (
                  <div
                    key={`${item.productId}-${item.optionId}`}
                    className="py-4 flex gap-4 items-center justify-between"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0 border border-slate-200/60 dark:border-white/[0.06]">
                        <Image src={formatImageUrl(item.image)} alt={item.name} fill className="object-cover" />
                      </div>
                      <div className="min-w-0 space-y-0.5">
                        <Link
                          href={`/product/${item.slug}`}
                          className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white hover:text-violet-600 line-clamp-1"
                        >
                          {item.name}
                        </Link>
                        {item.optionName && (
                          <span className="text-[11px] text-violet-600 dark:text-violet-400 font-semibold block">
                            {item.optionName}
                          </span>
                        )}
                        <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 block">
                          {formatPrice(item.price)}
                        </span>
                      </div>
                    </div>

                    {/* Quantity Controls & Delete */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-white/[0.06] p-1">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1, item.optionId)}
                          className="p-1 hover:text-violet-600 transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-2 text-xs font-black font-mono">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1, item.optionId)}
                          className="p-1 hover:text-violet-600 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.productId, item.optionId)}
                        className="text-slate-400 hover:text-rose-500 p-1 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Next Button */}
              <button
                onClick={handleProceedToStep2}
                className="w-full py-3 rounded-xl brand-gradient-btn text-white font-black text-sm flex items-center justify-center gap-2 shadow-md shadow-violet-600/20 active:scale-95 transition-all mt-4"
              >
                <span>Proceed to Customer Details</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 2: Customer Information */}
          {step === 2 && (
            <form
              onSubmit={handleProceedToStep3}
              className="rounded-2xl bg-white/95 dark:bg-[#0f172a]/95 border border-slate-200/80 dark:border-white/[0.08] p-5 sm:p-6 shadow-sm space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.06] pb-3">
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Customer & Delivery Details
                </h2>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs text-violet-600 dark:text-violet-400 font-bold flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Cart</span>
                </button>
              </div>

              <div className="space-y-3 text-xs">
                {loggedInUser ? (
                  <div className="p-3 bg-violet-500/10 border border-violet-500/20 rounded-xl flex items-center justify-between text-xs text-violet-800 dark:text-violet-300">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>
                        Signed in as <strong>{loggedInUser.name}</strong> ({loggedInUser.email}). Licenses will be added to your account vault.
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                    <span>
                      Have an account? <Link href="/login?redirect=/checkout" className="text-violet-600 dark:text-violet-400 font-bold hover:underline">Sign In</Link> to track orders and save your license keys automatically.
                    </span>
                  </div>
                )}

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Full Name (আপনার নাম) *
                  </label>
                  <input
                    type="text"
                    required
                    value={customer.name}
                    onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                    placeholder="e.g. Tanvir Ahmed"
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/[0.08] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col">
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5 sm:min-h-[2.5rem]">
                      Mobile Phone (ফোন নাম্বার) *
                    </label>
                    <input
                      type="tel"
                      required
                      value={customer.phone}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCustomer((prev) => ({
                          ...prev,
                          phone: val,
                          whatsapp: sameAsPhone ? val : prev.whatsapp,
                        }));
                      }}
                      placeholder="017XXXXXXXX"
                      className="w-full h-10 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/[0.08] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-violet-500/50 mt-auto"
                    />
                  </div>

                  <div className="flex flex-col">
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5 sm:min-h-[2.5rem]">
                      Email Address (ইমেইল - লাইসেন্স কি পাঠানোর জন্য) *
                    </label>
                    <input
                      type="email"
                      required
                      value={customer.email}
                      onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                      placeholder="tanvir@gmail.com"
                      className="w-full h-10 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/[0.08] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-violet-500/50 mt-auto"
                    />
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={sameAsPhone}
                      onChange={(e) => {
                        setSameAsPhone(e.target.checked);
                        if (e.target.checked) {
                          setCustomer((prev) => ({ ...prev, whatsapp: prev.phone }));
                        }
                      }}
                      className="rounded text-violet-600 focus:ring-violet-500"
                    />
                    <span className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                      WhatsApp number is the same as Phone number
                    </span>
                  </label>
                </div>

                {!sameAsPhone && (
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      WhatsApp Number (হোয়াটসঅ্যাপ নাম্বার)
                    </label>
                    <input
                      type="tel"
                      value={customer.whatsapp}
                      onChange={(e) => setCustomer({ ...customer, whatsapp: e.target.value })}
                      placeholder="018XXXXXXXX"
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/[0.08] text-xs focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                    />
                  </div>
                )}

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Special Notes (যদি কোনো নির্দেশনা থাকে - ঐচ্ছিক)
                  </label>
                  <textarea
                    rows={2}
                    value={customer.notes}
                    onChange={(e) => setCustomer({ ...customer, notes: e.target.value })}
                    placeholder="e.g. Please also send invoice to my secondary email..."
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/[0.08] text-xs focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl brand-gradient-btn text-white font-black text-sm flex items-center justify-center gap-2 shadow-md shadow-violet-600/20 active:scale-95 transition-all mt-4"
              >
                <span>Continue to Payment (পেমেন্ট অপশন)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* STEP 3: Payment & TrxID Submission */}
          {step === 3 && (
            <div className="rounded-2xl bg-white/95 dark:bg-[#0f172a]/95 border border-slate-200/80 dark:border-white/[0.08] p-5 sm:p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.06] pb-3">
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Payment Method & TrxID Verification
                </h2>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="text-xs text-violet-600 dark:text-violet-400 font-bold flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
              </div>

              {/* Payment Gateway Toggle */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {(
                  [
                    { id: 'BKASH_MANUAL', name: 'bKash', color: 'from-pink-500 to-rose-600' },
                    { id: 'NAGAD_MANUAL', name: 'Nagad', color: 'from-orange-500 to-amber-600' },
                    { id: 'ROCKET_MANUAL', name: 'Rocket', color: 'from-purple-600 to-indigo-700' },
                    { id: 'UPAY_MANUAL', name: 'Upay', color: 'from-amber-500 to-yellow-600' },
                  ] as const
                ).map((method) => (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setPaymentMethod(method.id)}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all font-bold text-xs ${
                      paymentMethod === method.id
                        ? 'border-violet-600 bg-violet-500/10 text-violet-600 dark:text-violet-400 shadow-sm'
                        : 'border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <span className="font-extrabold text-sm">{method.name}</span>
                    <span className="text-[10px] font-medium text-slate-400">Send Money</span>
                  </button>
                ))}
              </div>

              {/* Step-by-Step Instructions Box */}
              <div className="p-4 rounded-xl bg-violet-500/5 border border-violet-500/20 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white">
                    {MERCHANT_NUMBERS[paymentMethod].name}:
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyNumber(MERCHANT_NUMBERS[paymentMethod].number)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/[0.08] text-violet-600 font-bold hover:bg-slate-50 transition-colors"
                  >
                    {copiedNumber ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedNumber ? 'Copied' : 'Copy Number'}</span>
                  </button>
                </div>

                <div className="text-base font-black font-mono text-violet-600 dark:text-violet-400">
                  {MERCHANT_NUMBERS[paymentMethod].number}
                </div>

                <div className="space-y-1 text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                  <p>1. আপনার {MERCHANT_NUMBERS[paymentMethod].name.split(' ')[0]} অ্যাপ ওপেন করে <strong>Send Money</strong> সিলেক্ট করুন।</p>
                  <p>2. প্রাপক নম্বরে উপরের নাম্বারটি দিন এবং মোট <strong>{formatPrice(activeTotal)}</strong> টাকা পাঠান।</p>
                  <p>3. লেনদেন সফল হলে SMS বা অ্যাপ থেকে পাওয়া <strong>TrxID</strong> এবং আপনার <strong>সেন্ডার ফোন নম্বর</strong> নিচের বক্সে লিখে সাবমিট করুন।</p>
                </div>
              </div>

              {/* Inputs for TrxID and Sender Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="flex flex-col">
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5 sm:min-h-[2.5rem]">
                    Sender Phone Number (যে নাম্বার থেকে পাঠিয়েছেন) *
                  </label>
                  <input
                    type="tel"
                    required
                    value={senderPhone}
                    onChange={(e) => setSenderPhone(e.target.value)}
                    placeholder="017XXXXXXXX"
                    className="w-full h-10 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/[0.08] text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-violet-500/50 mt-auto"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5 sm:min-h-[2.5rem]">
                    Transaction ID (TrxID) *
                  </label>
                  <input
                    type="text"
                    required
                    value={trxId}
                    onChange={(e) => setTrxId(e.target.value.toUpperCase())}
                    placeholder="e.g. BL99KJS882"
                    className="w-full h-10 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/[0.08] text-xs font-mono font-black text-emerald-600 dark:text-emerald-400 uppercase focus:outline-none focus:ring-2 focus:ring-violet-500/50 mt-auto"
                  />
                </div>
              </div>

              {/* Direct Submit Button */}
              <button
                type="button"
                onClick={handleSubmitOrder}
                disabled={submittingOrder}
                className="w-full py-3.5 rounded-xl brand-gradient-btn text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-violet-600/30 active:scale-95 transition-all disabled:opacity-50"
              >
                <Lock className="w-4 h-4" />
                <span>{submittingOrder ? 'Processing Order...' : `Complete Order & Pay ${formatPrice(activeTotal)}`}</span>
              </button>

              <p className="text-[11px] text-center text-slate-500 dark:text-slate-400 leading-relaxed">
                অর্ডার সম্পন্ন করার মাধ্যমে আপনি SolutionsBD-এর{' '}
                <Link href="/policies/terms-and-conditions" target="_blank" className="text-violet-600 dark:text-violet-400 underline underline-offset-2 hover:opacity-80">
                  শর্তাবলী
                </Link>
                ,{' '}
                <Link href="/policies/refund-policy" target="_blank" className="text-violet-600 dark:text-violet-400 underline underline-offset-2 hover:opacity-80">
                  রিফান্ড পলিসি
                </Link>{' '}
                ও{' '}
                <Link href="/policies/delivery-info" target="_blank" className="text-violet-600 dark:text-violet-400 underline underline-offset-2 hover:opacity-80">
                  ডেলিভারি তথ্যে
                </Link>{' '}
                সম্মত হচ্ছেন।
              </p>
            </div>
          )}
        </div>

        {/* Right 1 Col: Financial Summary & Coupon Box */}
        <div className="space-y-5">
          {/* Order Summary Card */}
          <div className="rounded-2xl bg-white/95 dark:bg-[#0f172a]/95 border border-slate-200/80 dark:border-white/[0.08] p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
              Financial Summary
            </h3>

            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {formatPrice(activeSubtotal)}
                </span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Coupon Discount ({couponCode})</span>
                  <span>-{formatPrice(discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Instant Digital Delivery</span>
                <span className="text-emerald-600 font-bold">FREE (0 ৳)</span>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-white/[0.05] flex justify-between items-baseline text-sm font-black text-slate-900 dark:text-white">
                <span>Total Amount</span>
                <span className="text-lg font-black text-violet-600 dark:text-violet-400">
                  {formatPrice(activeTotal)}
                </span>
              </div>
            </div>

            {/* Promo Code Box */}
            <form onSubmit={handleApplyCoupon} className="pt-2 border-t border-slate-100 dark:border-white/[0.05] space-y-2">
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Tag className="w-3 h-3 text-violet-500" />
                <span>Have a Promo Code?</span>
              </label>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  placeholder="Enter promo code"
                  className="flex-1 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/[0.08] text-xs font-mono font-bold uppercase focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={applyingCoupon}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white font-bold text-xs transition-colors"
                >
                  Apply
                </button>
              </div>

              {couponCode && (
                <div className="flex items-center justify-between text-[11px] text-emerald-600 font-bold">
                  <span>Applied: {couponCode}</span>
                  <button type="button" onClick={removeCoupon} className="text-rose-500 underline">
                    Remove
                  </button>
                </div>
              )}
            </form>
          </div>

          {/* Trust Guarantees */}
          <div className="rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/60 dark:border-white/[0.06] p-4 space-y-2.5 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-bold">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Instant Automated Delivery</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              License keys are revealed immediately on-screen and dispatched to your email once payment is verified.
            </p>

            <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-bold pt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>100% Genuine Retail Warranty</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              All product keys are checked against official vendor activation servers with replacement guarantee.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

