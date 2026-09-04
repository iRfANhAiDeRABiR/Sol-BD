'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag, Zap, ShieldCheck } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useCartStore } from '@/lib/cart-store';
import { formatPrice, formatImageUrl } from '@/lib/utils';
import { toast } from 'sonner';

export default function CartDrawer() {
  const pathname = usePathname();
  if (pathname?.startsWith('/admin')) return null;
  const {
    items,
    isOpen,
    closeCart,
    updateQuantity,
    removeItem,
    subtotal,
    total,
    discountAmount,
    couponCode,
    applyCoupon,
    removeCoupon,
  } = useCartStore();

  const [inputCoupon, setInputCoupon] = useState('');

  if (!isOpen) return null;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const code = inputCoupon.trim().toUpperCase();
    if (!code) return;

    if (code === 'WELCOME10') {
      const discount = Math.round(subtotal() * 0.1);
      applyCoupon(code, discount);
      toast.success('Coupon WELCOME10 applied! 10% discount added.');
      setInputCoupon('');
    } else if (code === 'EID50') {
      applyCoupon(code, 50);
      toast.success('Coupon EID50 applied! ৳50 discount added.');
      setInputCoupon('');
    } else {
      toast.error('Invalid coupon code.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={closeCart}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-[#0b1121] shadow-2xl flex flex-col border-l border-slate-200/80 dark:border-white/[0.08]">
          {/* Header */}
          <div className="p-4 border-b border-slate-100 dark:border-white/[0.08] flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/80">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-violet-600 dark:text-violet-400" />
              <h2 className="font-bold text-slate-800 dark:text-white text-base">Your Cart</h2>
              <span className="bg-violet-100 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 text-xs px-2 py-0.5 rounded-full font-bold">
                {items.length} {items.length === 1 ? 'item' : 'items'}
              </span>
            </div>
            <button
              onClick={closeCart}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Delivery notice */}
          <div className="bg-emerald-50 dark:bg-emerald-950/40 border-b border-emerald-100 dark:border-emerald-800/40 px-4 py-2 flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300 font-medium">
            <Zap className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <span>Digital keys are dispatched automatically after payment.</span>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div className="w-16 h-16 rounded-full bg-violet-50 dark:bg-violet-950/60 flex items-center justify-center text-violet-500">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-slate-700 dark:text-white text-base">Your cart is empty</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs">
                  Browse our genuine Windows, Office, IDM, and Antivirus digital licenses.
                </p>
                <button
                  onClick={closeCart}
                  className="brand-gradient-btn text-white text-xs font-bold px-4 py-2 rounded-xl mt-2"
                >
                  Explore Catalog
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.variantId}
                  className="flex gap-3 bg-slate-50/70 dark:bg-slate-900/70 p-3 rounded-2xl border border-slate-200/60 dark:border-white/[0.08]"
                >
                  {/* Thumbnail */}
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-800 flex-shrink-0 relative border border-slate-200 dark:border-white/[0.08]">
                    <Image
                      src={formatImageUrl(item.image)}
                      alt={item.productTitle || 'Product'}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-white truncate">
                      {item.productTitle}
                    </h4>
                    <p className="text-[11px] font-semibold text-violet-600 dark:text-violet-400 mt-0.5 truncate">
                      {item.variantName}
                    </p>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                        {formatPrice(item.price)}
                      </span>
                      {item.originalPrice && (
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 line-through">
                          {formatPrice(item.originalPrice)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quantity & Delete */}
                  <div className="flex flex-col items-end justify-between">
                    <button
                      onClick={() => removeItem(item.variantId)}
                      className="text-slate-400 hover:text-red-500 p-1 transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="flex items-center gap-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/[0.08] rounded-lg px-1.5 py-0.5 shadow-sm">
                      <button
                        onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                        className="text-slate-600 dark:text-slate-300 hover:text-violet-600 dark:hover:text-violet-400 p-0.5"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-bold w-4 text-center text-slate-900 dark:text-white">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                        className="text-slate-600 dark:text-slate-300 hover:text-violet-600 dark:hover:text-violet-400 p-0.5"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout Area */}
          {items.length > 0 && (
            <div className="p-4 border-t border-slate-100 dark:border-white/[0.08] bg-slate-50/60 dark:bg-slate-900/60 space-y-3">
              {/* Coupon Form */}
              {couponCode ? (
                <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 p-2.5 rounded-xl text-xs">
                  <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 font-semibold">
                    <Tag className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Applied: <strong>{couponCode}</strong> (-{formatPrice(discountAmount)})</span>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-slate-400 hover:text-red-500 text-xs underline"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter promo code"
                    value={inputCoupon}
                    onChange={(e) => setInputCoupon(e.target.value)}
                    className="flex-1 text-xs border border-slate-200 dark:border-white/[0.08] rounded-xl px-3 py-2 outline-none focus:border-violet-500 bg-white dark:bg-slate-800 text-slate-800 dark:text-white uppercase font-semibold"
                  />
                  <button
                    type="submit"
                    className="bg-slate-800 hover:bg-slate-900 dark:bg-violet-600 dark:hover:bg-violet-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-colors"
                  >
                    Apply
                  </button>
                </form>
              )}

              {/* Pricing Breakdown */}
              <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400 pt-1">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{formatPrice(subtotal())}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                    <span>Discount</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-extrabold text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-white/[0.08]">
                  <span>Total Payable</span>
                  <span className="text-base text-violet-700 dark:text-violet-400">{formatPrice(total())}</span>
                </div>
              </div>

              {/* Checkout Action Button */}
              <Link
                href="/checkout"
                onClick={closeCart}
                className="w-full brand-gradient-btn text-white py-3 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-violet-500/25 transition-transform active:scale-[0.99]"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>100% Secure Checkout via bKash / Nagad</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

