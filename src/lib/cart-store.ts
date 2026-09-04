'use client';

import { create } from 'zustand';
import { CartItem } from './types';
import { formatImageUrl } from './utils';

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  couponCode: string | null;
  discountAmount: number;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  applyCoupon: (code: string, discount: number) => void;
  removeCoupon: () => void;
  subtotal: () => number;
  total: () => number;
  totalItems: () => number;
}

function getInitialItems(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem('store_cart');
    if (!saved) return [];
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((item: any) => ({
      variantId: item.variantId || item.optionId || item.productId,
      productId: item.productId,
      productTitle: item.productTitle || item.name || 'Digital Product',
      productSlug: item.productSlug || item.slug || '',
      variantName: item.variantName || item.optionName || 'Standard',
      price: Number(item.price) || 0,
      originalPrice: item.originalPrice ? Number(item.originalPrice) : undefined,
      image: formatImageUrl(item.image),
      quantity: Number(item.quantity) || 1,
      validity: item.validity || 'Lifetime',
      licenseType: item.licenseType || 'LICENSE_KEY',
    }));
  } catch {
    return [];
  }
}

function syncToLocalStorage(items: CartItem[]) {
  if (typeof window === 'undefined') return;
  try {
    const formatted = items.map((i) => ({
      productId: i.productId,
      slug: i.productSlug,
      name: i.productTitle,
      image: i.image,
      price: i.price,
      originalPrice: i.originalPrice,
      optionId: i.variantId,
      optionName: i.variantName,
      quantity: i.quantity,
      variantId: i.variantId,
      variantName: i.variantName,
      productTitle: i.productTitle,
      productSlug: i.productSlug,
      validity: i.validity,
      licenseType: i.licenseType,
    }));
    localStorage.setItem('store_cart', JSON.stringify(formatted));
  } catch (e) {
    console.error('Failed to sync cart to localStorage', e);
  }
}

export const useCartStore = create<CartState>((set, get) => ({
  items: getInitialItems(),
  isOpen: false,
  couponCode: null,
  discountAmount: 0,

  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),
  toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

  addItem: (item, quantity = 1) => {
    const sanitizedImage = formatImageUrl(item.image);
    set((state) => {
      const existing = state.items.find((i) => i.variantId === item.variantId);
      let updatedItems: CartItem[];
      if (existing) {
        updatedItems = state.items.map((i) =>
          i.variantId === item.variantId
            ? { ...i, quantity: i.quantity + quantity, image: sanitizedImage }
            : i
        );
      } else {
        updatedItems = [...state.items, { ...item, image: sanitizedImage, quantity }];
      }
      syncToLocalStorage(updatedItems);
      return {
        items: updatedItems,
        isOpen: true,
      };
    });
  },

  removeItem: (variantId) => {
    set((state) => {
      const updated = state.items.filter((i) => i.variantId !== variantId);
      syncToLocalStorage(updated);
      return { items: updated };
    });
  },

  updateQuantity: (variantId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(variantId);
      return;
    }
    set((state) => {
      const updated = state.items.map((i) =>
        i.variantId === variantId ? { ...i, quantity } : i
      );
      syncToLocalStorage(updated);
      return { items: updated };
    });
  },

  clearCart: () => {
    syncToLocalStorage([]);
    set({ items: [], couponCode: null, discountAmount: 0 });
  },

  applyCoupon: (code, discount) => set({ couponCode: code, discountAmount: discount }),
  removeCoupon: () => set({ couponCode: null, discountAmount: 0 }),

  subtotal: () => {
    return get().items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  },

  total: () => {
    const sub = get().subtotal();
    return Math.max(0, sub - get().discountAmount);
  },

  totalItems: () => {
    return get().items.reduce((sum, i) => sum + i.quantity, 0);
  },
}));

