'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Check, Zap, Heart, ShieldCheck } from 'lucide-react';
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
  const badge = product?.isFlashSale ? '🔥 Flash Deal' : product?.isFeatured ? 'Bestseller' : propBadge;

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
    <div
      onClick={() => router.push(`/product/${slug}`)}
      className="group rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between border bg-white dark:bg-slate-900/90 hover:shadow-xl hover:border-violet-500/40 relative"
      style={{
        borderColor: 'hsl(var(--border))',
        boxShadow: '0 2px 14px hsla(258,78%,55%,0.06)',
      }}
    >
      {/* Product Image Area */}
      <div className="relative aspect-square overflow-hidden bg-slate-100 dark:bg-slate-800/50">
        <Image
          src={image}
          alt={name}
          fill
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Wishlist Heart Icon */}
        <button
          onClick={toggleWishlist}
          title={isWishlisted ? 'Remove Wishlist' : 'Add Wishlist'}
          className="absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-xl bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border border-slate-200/60 dark:border-white/10 flex items-center justify-center text-slate-500 hover:text-rose-500 transition-colors shadow-sm"
        >
          <Heart
            className={`w-4 h-4 transition-transform active:scale-125 ${
              isWishlisted ? 'fill-rose-500 text-rose-500' : ''
            }`}
          />
        </button>

        {/* Stock Out Overlay */}
        {outOfStock ? (
          <>
            <div className="absolute inset-0 bg-slate-950/60 pointer-events-none" />
            <span
              className="absolute top-2.5 left-2.5 text-[10px] font-black tracking-wider text-white px-2.5 py-1 rounded-full shadow-md"
              style={{
                background: 'linear-gradient(135deg, hsl(0,80%,55%), hsl(15,90%,55%))',
              }}
            >
              STOCK OUT
            </span>
          </>
        ) : (
          discountPercent && (
            <span
              className="absolute top-2.5 left-2.5 text-[10.5px] font-bold text-white px-2.5 py-0.5 rounded-full shadow-md"
              style={{
                background: 'hsl(32, 100%, 50%)',
              }}
            >
              -{discountPercent}%
            </span>
          )
        )}

        {/* Feature / Flash Badge */}
        {!outOfStock && badge && (
          <span
            className="absolute bottom-2.5 right-2.5 text-[9.5px] font-bold text-white px-2.5 py-0.5 rounded-full shadow-md"
            style={{
              background: 'linear-gradient(135deg, hsl(258,78%,55%), hsl(200,90%,45%))',
            }}
          >
            {badge}
          </span>
        )}

        {/* Instant Delivery Pill */}
        <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1 text-[9.5px] font-bold text-white bg-slate-950/75 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10">
          <Zap className="w-2.5 h-2.5 text-amber-400" />
          <span>Instant Key</span>
        </div>
      </div>

      {/* Product Content Details */}
      <div className="p-3.5 flex-1 flex flex-col justify-between gap-3">
        <div className="space-y-1">
          {product?.brand && (
            <span className="text-[10px] font-black uppercase tracking-wider text-violet-600 dark:text-violet-400 block font-sora">
              {product.brand}
            </span>
          )}
          <Link
            href={`/product/${slug}`}
            onClick={(e) => e.stopPropagation()}
            className="font-semibold text-xs sm:text-sm text-foreground leading-snug line-clamp-2 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors"
          >
            {name}
          </Link>
        </div>

        {/* Pricing & Interactive Actions */}
        <div className="space-y-2.5 pt-1">
          <div className="flex items-baseline justify-between gap-2">
            <div>
              <div className="font-sora font-black text-base sm:text-lg text-foreground">
                {formatPrice(price)}
              </div>
              {originalPrice && originalPrice > price && (
                <div className="text-xs text-muted-foreground line-through">
                  {formatPrice(originalPrice)}
                </div>
              )}
            </div>

            <div className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
              <ShieldCheck className="w-3 h-3" />
              <span>Genuine</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleQuickAdd}
              disabled={outOfStock}
              className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold transition-all active:scale-95 border ${
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
              className="text-white py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all active:scale-95 shadow-md disabled:opacity-50 hover:brightness-110"
              style={{
                background: 'linear-gradient(135deg, hsl(258,78%,55%), hsl(200,90%,45%))',
                boxShadow: '0 2px 10px hsla(258,78%,55%,0.25)',
              }}
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
