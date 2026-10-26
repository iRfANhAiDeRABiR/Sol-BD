'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Star,
  Zap,
  ShieldCheck,
  CheckCircle,
  ShoppingCart,
  PhoneCall,
  Clock,
  MessageCircle,
  Award,
  ChevronRight,
  Share2,
  Check,
} from 'lucide-react';
import { ProductType, ProductVariantType } from '@/lib/types';
import { formatPrice, formatImageUrl } from '@/lib/utils';
import { useCartStore } from '@/lib/cart-store';
import { useCart } from '@/components/cart/CartProvider';
import ProductCard from '@/components/product/ProductCard';
import { toast } from 'sonner';

interface ProductClientViewProps {
  product: ProductType;
  relatedProducts: ProductType[];
}

export default function ProductClientView({
  product,
  relatedProducts,
}: ProductClientViewProps) {
  const router = useRouter();
  const { addItem: addContextItem } = useCart();
  const addZustandItem = useCartStore((state) => state.addItem);

  const [selectedVariant, setSelectedVariant] = useState<ProductVariantType>(
    product.variants[0] || {}
  );
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'desc' | 'guide' | 'reviews'>('desc');
  const [added, setAdded] = useState(false);

  const discountPercent = selectedVariant.originalPrice
    ? Math.round(
        ((selectedVariant.originalPrice - selectedVariant.price) /
          selectedVariant.originalPrice) *
          100
      )
    : 0;

  const handleAddToCart = () => {
    addContextItem(
      {
        productId: product.id,
        slug: product.slug,
        name: product.title,
        image: product.image,
        price: selectedVariant.price,
        originalPrice: selectedVariant.originalPrice ?? undefined,
        optionId: selectedVariant.id,
        optionName: selectedVariant.name,
      },
      quantity
    );

    addZustandItem(
      {
        variantId: selectedVariant.id,
        productId: product.id,
        productTitle: product.title,
        productSlug: product.slug,
        variantName: selectedVariant.name,
        price: selectedVariant.price,
        originalPrice: selectedVariant.originalPrice,
        image: formatImageUrl(product.image),
        validity: selectedVariant.validity,
        licenseType: selectedVariant.licenseType,
      },
      quantity
    );

    setAdded(true);
    toast.success(`Added ${quantity}x ${product.title} to cart!`);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    addContextItem(
      {
        productId: product.id,
        slug: product.slug,
        name: product.title,
        image: formatImageUrl(product.image),
        price: selectedVariant.price,
        originalPrice: selectedVariant.originalPrice ?? undefined,
        optionId: selectedVariant.id,
        optionName: selectedVariant.name,
      },
      quantity
    );

    addZustandItem(
      {
        variantId: selectedVariant.id,
        productId: product.id,
        productTitle: product.title,
        productSlug: product.slug,
        variantName: selectedVariant.name,
        price: selectedVariant.price,
        originalPrice: selectedVariant.originalPrice,
        image: formatImageUrl(product.image),
        validity: selectedVariant.validity,
        licenseType: selectedVariant.licenseType,
      },
      quantity
    );

    router.push('/checkout');
  };

  return (
    <div className="max-w-[1440px] mx-auto px-3 sm:px-5 py-6 space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
        <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600" />
        <Link href="/shop" className="hover:text-blue-600 dark:hover:text-blue-400">
          Shop
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600" />
        <span className="text-slate-800 dark:text-slate-200 font-bold truncate max-w-xs">
          {product.title}
        </span>
      </nav>

      {/* Main Product Layout: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-white dark:bg-slate-900 p-5 sm:p-8 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs">
        {/* Left Column: Image & Guarantee Box (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
            <Image
              src={formatImageUrl(product.image)}
              alt={product.title}
              fill
              priority
              className="object-cover"
            />
            {discountPercent > 0 && (
              <span className="absolute top-3 left-3 bg-rose-600 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-xs">
                -{discountPercent}% OFF
              </span>
            )}
            <span className="absolute bottom-3 left-3 bg-slate-900/85 backdrop-blur text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 border border-white/20">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              100% Instant Delivery
            </span>
          </div>

          {/* Guarantee Badges Box */}
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 space-y-2.5 text-xs">
            <div className="flex items-center gap-2 text-slate-800 dark:text-white font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>SolutionsBD ভেরিফাইড গ্যারান্টি</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-slate-600 dark:text-slate-300 text-[11px]">
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                <span>অরিজিনাল লাইসেন্স কি</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                <span>রিপ্লেসমেন্ট সুবিধা</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                <span>১০ সেকেন্ডে ডেলিভারি</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                <span>২৪/৭ লাইভ সাপোর্ট</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Title, Variants, Pricing & Actions (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Brand & Stock Status */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold tracking-wider text-blue-600 dark:text-blue-400 uppercase bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-md border border-blue-200/50 dark:border-blue-800/30">
              {product.brand} Official
            </span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 px-2.5 py-1 rounded-full flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              In Stock • Instant Key
            </span>
          </div>

          {/* Title */}
          <h1 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
            {product.title}
          </h1>

          {/* Ratings & Social Proof */}
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1 text-amber-500 dark:text-amber-400 font-bold bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-full border border-amber-200/50 dark:border-amber-800/30">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>{product.rating}</span>
            </div>
            <span className="text-slate-500 dark:text-slate-400 font-medium">
              ({product.reviewCount} customer reviews)
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-slate-600 dark:text-slate-300 font-semibold flex items-center gap-1">
              <Award className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              Verified Digital Product
            </span>
          </div>

          {/* Pricing Box */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex items-baseline gap-3">
            <span className="text-3xl font-black text-blue-600 dark:text-blue-400">
              {formatPrice(selectedVariant.price)}
            </span>
            {selectedVariant.originalPrice && (
              <span className="text-sm text-slate-400 dark:text-slate-500 line-through font-semibold">
                {formatPrice(selectedVariant.originalPrice)}
              </span>
            )}
            {discountPercent > 0 && (
              <span className="text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-950/60 px-2 py-0.5 rounded-full ml-auto">
                Save {formatPrice((selectedVariant.originalPrice || 0) - selectedVariant.price)} ({discountPercent}%)
              </span>
            )}
          </div>

          {/* Variant Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
              প্যাকেজ বা ভ্যারিয়েন্ট বেছে নিন (Select Variant):
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {product.variants.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setSelectedVariant(v)}
                  className={`p-3 rounded-xl text-left border transition-all flex flex-col justify-between ${
                    selectedVariant.id === v.id
                      ? 'border-blue-600 dark:border-blue-500 bg-blue-50/70 dark:bg-blue-950/50 ring-2 ring-blue-500/20'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/70 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <span className="text-xs font-bold text-slate-800 dark:text-white">{v.name}</span>
                  <div className="flex items-center justify-between mt-1 text-[11px]">
                    <span className="text-slate-500 dark:text-slate-400">{v.validity}</span>
                    <span className="font-extrabold text-blue-600 dark:text-blue-400">
                      {formatPrice(v.price)}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Delivery Note */}
          <div className="bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/40 rounded-xl p-3 flex items-start gap-2 text-xs text-amber-900 dark:text-amber-200">
            <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-bold">ডেলিভারি মেথড: ইনস্ট্যান্ট অটো ডেলিভারি</p>
              <p className="text-[11px] text-amber-800/90 dark:text-amber-300/80 mt-0.5">
                bKash বা Nagad এ পেমেন্ট করার সাথে সাথেই ডিজিটাল লাইসেন্স কি অন-স্ক্রিন ভেসে উঠবে এবং ইমেইলে পাঠিয়ে দেওয়া হবে।
              </p>
            </div>
          </div>

          {/* Quantity & CTA Buttons */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-slate-200 dark:border-white/[0.08] rounded-xl bg-white dark:bg-slate-800 p-1">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  -
                </button>
                <span className="w-8 text-center text-xs font-black text-slate-800 dark:text-white">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white border border-slate-200/60 dark:border-white/[0.08] py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                {added ? <Check className="w-4 h-4 text-emerald-500" /> : <ShoppingCart className="w-4 h-4" />}
                <span>{added ? 'Added to Cart' : 'Add to Cart'}</span>
              </button>

              <button
                onClick={handleBuyNow}
                className="flex-1 brand-gradient-btn text-white py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 active:scale-95 shadow-lg shadow-violet-500/25"
              >
                <Zap className="w-4 h-4" />
                <span>Buy Now (৳{selectedVariant.price * quantity})</span>
              </button>
            </div>

            {/* WhatsApp consultation trigger */}
            <a
              href={`https://wa.me/8801410699879?text=Hi%20SolutionsBD,%20I%20have%20questions%20about%20${encodeURIComponent(
                product.title
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full border border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 py-2.5 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>অর্ডারের আগে WhatsApp-এ কথা বলুন (Inquire via WhatsApp)</span>
            </a>
          </div>
        </div>
      </div>

      {/* Tabs: Description, Activation Guide, Customer Reviews */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6 text-sm font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveTab('desc')}
            className={`pb-3 transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'desc'
                ? 'border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            প্রোডাক্ট বিবরণী (Description)
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`pb-3 transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'guide'
                ? 'border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            অ্যাক্টিভেশন গাইড (Activation Guide)
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-3 transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'reviews'
                ? 'border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            গ্রাহক মতামত (Reviews {product.reviewCount})
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'desc' && (
          <div className="prose prose-slate dark:prose-invert max-w-none text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-line">
            {product.description}
          </div>
        )}

        {activeTab === 'guide' && (
          <div className="space-y-4 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
            <div className="bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-800/40 rounded-2xl p-4 text-blue-950 dark:text-blue-200 space-y-2">
              <h4 className="font-bold text-sm text-blue-900 dark:text-blue-300">
                কীভাবে লাইসেন্স কি সংগ্রহ ও অ্যাক্টিভেট করবেন?
              </h4>
              <ol className="list-decimal list-inside space-y-1.5 text-xs text-blue-900/90 dark:text-blue-200/90 leading-relaxed">
                <li>চেকআউটে bKash বা Nagad দিয়ে অর্ডার সম্পন্ন করুন।</li>
                <li>অর্ডার সম্পন্ন হওয়ার সাথে সাথে স্ক্রিনে ২৫ ডিজিটের লাইসেন্স কোড দেখতে পাবেন।</li>
                <li>আপনার ক্রয়কৃত সফটওয়্যারটি ওপেন করে Settings &gt; Activation এ গিয়ে কোডটি পেস্ট করুন।</li>
                <li>যেকোনো প্রয়োজনে আমাদের সহায়তার জন্য অর্ডার নম্বরসহ WhatsApp এ মেসেজ দিন।</li>
              </ol>
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200/80 dark:border-white/[0.08]">
              <div className="text-center">
                <div className="text-3xl font-black text-slate-900 dark:text-white">{product.rating}</div>
                <div className="flex items-center justify-center gap-0.5 text-amber-400 mt-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                  ))}
                </div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold mt-0.5 block">
                  {product.reviewCount} Reviews
                </span>
              </div>
              <div className="border-l border-slate-200 dark:border-white/[0.08] pl-4 text-xs text-slate-600 dark:text-slate-300">
                <p className="font-bold text-slate-800 dark:text-white">১০০% ভেরিফাইড ক্রেতার রিভিউ</p>
                <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                  সকল রিভিউ আসল ক্রেতাদের থেকে সংগৃহীত যারা এই লাইসেন্সটি সফলভাবে অ্যাক্টিভেট করেছেন।
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
            সম্পর্কিত সফটওয়্যার (Related Software)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {relatedProducts.map((rp) => (
              <ProductCard key={rp.id} product={rp} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

