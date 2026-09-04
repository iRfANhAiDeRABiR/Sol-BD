'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Check, Zap, Star, ShieldCheck, Heart } from 'lucide-react';
import { formatPrice, formatImageUrl } from '@/lib/utils';
import { useCart } from '@/components/cart/CartProvider';
import { useCartStore } from '@/lib/cart-store';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface BaseProductProps {
  id?: string;
  slug?: string;
  name?: string;
  price?: number;
  originalPrice?: number | null;
  image?: string;
  badge?: string | null;
  outOfStock?: boolean;
  product?: any; // Full ProductType object support
}

export function ProductCard({
  id: propId,
  slug: propSlug,
  name: propName,
  price: propPrice,
  originalPrice: propOriginalPrice,
  image: propImage,
  badge: propBadge,
  outOfStock: propOutOfStock = false,
  product,
}: BaseProductProps) {
  const router = useRouter();
  const { addItem: addContextItem } = useCart();
  const addZustandItem = useCartStore((state) => state.addItem);

  const [added, setAdded] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Normalize between object-based props and flat props
  const id = product ? product.id : propId || '';
  const slug = product ? product.slug : propSlug || '';
  const name = product ? product.title : propName || '';
  const image = formatImageUrl(product ? product.image : propImage);

  const defaultVariant = product?.variants && product.variants.length > 0 ? product.variants[0] : null;
  const price = product ? defaultVariant?.price ?? 0 : propPrice ?? 0;
  const originalPrice = product ? defaultVariant?.originalPrice : propOriginalPrice;
  const outOfStock = product ? defaultVariant?.stock === 0 : propOutOfStock;
  const badge = product?.isFlashSale ? '🔥 Flash Deal' : product?.isFeatured ? 'Featured' : propBadge;

  const discountPercent =
    originalPrice && originalPrice > price
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : null;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (outOfStock) return;

    // Synchronize to both CartProvider & zustand store
    addContextItem({
      productId: id,
      slug,
      name,
      image,
      price,
      originalPrice: originalPrice ?? undefined,
      optionId: defaultVariant?.id,
      optionName: defaultVariant?.name,
    });

    addZustandItem({
      variantId: defaultVariant?.id || id,
      productId: id,
      productTitle: name,
      productSlug: slug,
      variantName: defaultVariant?.name || 'Standard',
      price,
      originalPrice: originalPrice ?? undefined,
      image,
      licenseType: defaultVariant?.licenseType || 'LICENSE_KEY',
      validity: defaultVariant?.validity || 'Lifetime',
    });

    setAdded(true);
    toast.success(`Added ${name} to cart!`);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (outOfStock) return;

    handleQuickAdd(e);
    router.push('/cart');
  };

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
    toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist!');
  };

  return (
    <div className="group rounded-2xl overflow-hidden bg-white/95 dark:bg-[#0f172a]/95 border border-slate-200/80 dark:border-white/[0.08] hover:border-violet-500/40 dark:hover:border-violet-500/40 shadow-sm hover:shadow-xl hover:shadow-violet-500/10 transition-all duration-300 flex flex-col justify-between relative backdrop-blur-xl">
      {/* Top Badges & Wishlist Trigger */}
      <div className="absolute top-3 left-3 z-10 flex flex-wrap gap-1.5 pointer-events-none">
        {discountPercent && (
          <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm">
            -{discountPercent}%
          </span>
        )}
        {badge && (
          <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-sm">
            {badge}
          </span>
        )}
      </div>

      <button
        onClick={toggleWishlist}
        title={isWishlisted ? 'Remove Wishlist' : 'Add Wishlist'}
        className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/60 dark:border-white/10 flex items-center justify-center text-slate-500 hover:text-rose-500 transition-colors shadow-sm"
      >
        <Heart
          className={`w-4 h-4 transition-transform active:scale-125 ${
            isWishlisted ? 'fill-rose-500 text-rose-500' : ''
          }`}
        />
      </button>

      {/* Product Image Wrap */}
      <Link
        href={`/product/${slug}`}
        className="relative w-full aspect-[4/3] sm:aspect-square bg-slate-100 dark:bg-slate-800/40 overflow-hidden block"
      >
        <Image
          src={image}
          alt={name}
          fill
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-transparent to-transparent pointer-events-none" />

        {outOfStock && (
          <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center text-rose-400 font-black text-xs uppercase tracking-wider">
            Out of Stock
          </div>
        )}

        {/* Feature Pills */}
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[10px] font-bold text-white z-10">
          <span className="bg-slate-900/80 backdrop-blur-md px-2 py-0.5 rounded-full flex items-center gap-1 border border-white/10">
            <Zap className="w-3 h-3 text-amber-400" />
            Instant Key
          </span>
          <span className="bg-slate-900/80 backdrop-blur-md px-2 py-0.5 rounded-full flex items-center gap-1 border border-white/10">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            Genuine
          </span>
        </div>
      </Link>

      {/* Card Body */}
      <div className="p-4 flex-1 flex flex-col justify-between gap-3">
        <div className="space-y-1.5">
          {product?.brand && (
            <span className="text-[10px] font-black uppercase tracking-wider text-violet-600 dark:text-violet-400 block">
              {product.brand}
            </span>
          )}
          <Link
            href={`/product/${slug}`}
            className="text-slate-900 dark:text-slate-100 hover:text-violet-600 dark:hover:text-violet-400 font-bold text-xs sm:text-sm line-clamp-2 leading-snug transition-colors"
          >
            {name}
          </Link>
        </div>

        {/* Pricing & Action Buttons */}
        <div className="space-y-3 pt-1">
          <div className="flex items-baseline gap-2">
            <span className="text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400">
              {formatPrice(price)}
            </span>
            {originalPrice && originalPrice > price && (
              <span className="text-xs text-slate-400 line-through">
                {formatPrice(originalPrice)}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleQuickAdd}
              disabled={outOfStock}
              className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 border ${
                added
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.06] dark:hover:bg-white/[0.1] text-slate-800 dark:text-slate-200 border-slate-200/60 dark:border-white/[0.08]'
              }`}
            >
              {added ? <Check className="w-3.5 h-3.5" /> : <ShoppingCart className="w-3.5 h-3.5" />}
              <span>{added ? 'Added' : 'Add'}</span>
            </button>

            <button
              onClick={handleBuyNow}
              disabled={outOfStock}
              className="brand-gradient-btn text-white py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all active:scale-95 disabled:opacity-50"
            >
              <Zap className="w-3 h-3" />
              <span>Buy Now</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
