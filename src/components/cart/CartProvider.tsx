'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { formatImageUrl } from '@/lib/utils';

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  image: string;
  price: number;
  originalPrice?: number;
  optionId?: string;
  optionName?: string;
  optionType?: string;
  quantity: number;
  // Extra compatibility fields for existing digital software pages
  variantId?: string;
  variantName?: string;
  productTitle?: string;
  productSlug?: string;
  validity?: string;
  licenseType?: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeItem: (productIdOrVariantId: string, optionId?: string) => void;
  updateQuantity: (productIdOrVariantId: string, quantity: number, optionId?: string) => void;
  clearCart: () => void;
  totalCount: number;
  subtotal: number;
  couponCode: string | null;
  discountAmount: number;
  applyCoupon: (code: string, discount: number) => void;
  removeCoupon: () => void;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [couponCode, setCouponCode] = useState<string | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);

  // Load cart from LocalStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('store_cart');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const sanitized = parsed.map((item: any) => ({
            ...item,
            image: formatImageUrl(item.image),
          }));
          setItems(sanitized);
        }
      }
    } catch (e) {
      console.error('Failed to load cart from localStorage', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save cart to LocalStorage on updates
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem('store_cart', JSON.stringify(items));
      } catch (e) {
        console.error('Failed to persist cart to localStorage', e);
      }
    }
  }, [items, isLoaded]);

  const addItem = (item: Omit<CartItem, 'quantity'>, quantity = 1) => {
    const key = item.optionId || item.variantId || item.productId;
    const sanitizedImage = formatImageUrl(item.image);

    setItems((prev) => {
      const index = prev.findIndex(
        (i) =>
          (i.optionId || i.variantId || i.productId) === key &&
          i.productId === item.productId
      );

      if (index > -1) {
        const updated = [...prev];
        updated[index].quantity += quantity;
        updated[index].image = sanitizedImage;
        return updated;
      }

      return [
        ...prev,
        {
          ...item,
          image: sanitizedImage,
          quantity,
          optionId: item.optionId || item.variantId,
          variantId: item.variantId || item.optionId,
          name: item.name || item.productTitle || 'Product',
          slug: item.slug || item.productSlug || '',
        },
      ];
    });
  };

  const removeItem = (targetId: string, optionId?: string) => {
    setItems((prev) =>
      prev.filter((i) => {
        if (optionId) {
          return !(i.productId === targetId && (i.optionId === optionId || i.variantId === optionId));
        }
        return !(
          i.productId === targetId ||
          i.variantId === targetId ||
          i.optionId === targetId
        );
      })
    );
  };

  const updateQuantity = (targetId: string, quantity: number, optionId?: string) => {
    if (quantity <= 0) {
      removeItem(targetId, optionId);
      return;
    }

    setItems((prev) =>
      prev.map((i) => {
        const isMatch = optionId
          ? i.productId === targetId && (i.optionId === optionId || i.variantId === optionId)
          : i.productId === targetId || i.variantId === targetId || i.optionId === targetId;

        return isMatch ? { ...i, quantity } : i;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
    setCouponCode(null);
    setDiscountAmount(0);
  };

  const applyCoupon = (code: string, discount: number) => {
    setCouponCode(code);
    setDiscountAmount(discount);
  };

  const removeCoupon = () => {
    setCouponCode(null);
    setDiscountAmount(0);
  };

  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = Math.max(0, subtotal - discountAmount);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalCount,
        subtotal,
        couponCode,
        discountAmount,
        applyCoupon,
        removeCoupon,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

