'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Shield,
  Zap,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  ShoppingBag,
  TrendingUp,
  Clock,
  Star,
  CheckCircle2,
} from 'lucide-react';
import { formatImageUrl } from '@/lib/utils';

const slides = [
  {
    id: 1,
    badge: 'Best Seller',
    tag: 'MOST POPULAR',
    titleFirst: 'Windows 11',
    titleSecond: 'Pro',
    subtitle: 'Original Retail 25-Digit License Key',
    description: 'মাইক্রোসফট অফিসিয়াল সার্ভার থেকে ইনস্ট্যান্ট অ্যাক্টিভেশন। রি-ইনস্টল করলেও লাইসেন্স থাকবে আজীবন।',
    price: '৳999',
    originalPrice: '৳1,800',
    discount: '-45% OFF',
    link: '/shop?q=Windows+11',
    image: 'https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=1400&auto=format&fit=crop&q=80',
    features: ['Lifetime License', 'Instant Delivery', 'All Devices'],
    accentGradient: 'linear-gradient(135deg, #38bdf8 0%, #2563eb 100%)',
  },
  {
    id: 2,
    badge: 'Special Offer',
    tag: 'OFFICIAL RESELLER',
    titleFirst: 'IDM Lifetime',
    titleSecond: 'Official Key',
    subtitle: 'Internet Download Manager 1 PC Lifetime',
    description: 'আমরা IDM-এর অফিশিয়াল অনুমোদিত রিসেলার। একবার কিনুন, নিশ্চিন্তে সারাজীবন ব্যবহার করুন ৩ বছরের ফ্রি আপগ্রেডসহ।',
    price: '৳1,899',
    originalPrice: '৳2,800',
    discount: '-32% OFF',
    link: '/shop?q=IDM',
    image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1400&auto=format&fit=crop&q=80',
    features: ['Official Partner', 'Instant Serial', 'Auto Updates'],
    accentGradient: 'linear-gradient(135deg, #34d399 0%, #06b6d4 100%)',
  },
  {
    id: 3,
    badge: 'Top Rated',
    tag: 'ESSENTIAL SUITE',
    titleFirst: 'Office 2021',
    titleSecond: 'Professional',
    subtitle: 'Word, Excel, PowerPoint, Outlook & Access',
    description: 'কোনো মাসিক বা বাৎসরিক ফি নেই। একবার কিনে আজীবন ব্যবহার করুন অফিসিয়াল সেটআপ লিংক ও জেনুইন কি সহ।',
    price: '৳1,399',
    originalPrice: '৳2,400',
    discount: '-42% OFF',
    link: '/shop?q=Office',
    image: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=1400&auto=format&fit=crop&q=80',
    features: ['Permanent Bind', 'No Monthly Fee', 'Commercial Use'],
    accentGradient: 'linear-gradient(135deg, #38bdf8 0%, #818cf8 100%)',
  },
];

export default function HeroBanner() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6500);
    return () => clearInterval(timer);
  }, []);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const slide = slides[currentSlide];

  return (
    <section className="relative px-2 sm:px-4 lg:px-6 pt-2 pb-3 md:pt-3 md:pb-5">
      <div
        className="hero-readable relative mx-auto w-full max-w-[1800px] rounded-[20px] lg:rounded-[28px] overflow-hidden shadow-xl border border-slate-200/80 dark:border-slate-800"
        role="region"
        aria-roledescription="carousel"
        aria-label="Featured deals"
      >
        <div className="relative w-full aspect-[3/2] sm:aspect-[16/9] lg:aspect-[21/9] max-h-[560px]">
          {/* Banner Image with Smooth Crossfade */}
          <Image
            src={formatImageUrl(slide.image)}
            alt={slide.titleFirst}
            fill
            priority
            className="absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-out"
          />

          {/* Readability Wash Overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'linear-gradient(90deg, rgba(11, 15, 25, 0.96) 0%, rgba(11, 15, 25, 0.85) 48%, rgba(11, 15, 25, 0.3) 82%, transparent 100%)',
            }}
          />

          {/* Slide Content */}
          <div className="absolute inset-0 flex items-center">
            <div className="w-full sm:w-[65%] lg:w-[54%] pl-4 sm:pl-8 md:pl-10 lg:pl-14 pr-3 sm:pr-4 space-y-2 sm:space-y-3 md:space-y-4">
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <span className="inline-flex items-center gap-1.5 text-[9px] sm:text-[10.5px] font-bold uppercase tracking-[0.14em] px-3 py-1 sm:py-1.5 rounded-full text-white bg-blue-600 shadow-sm shadow-blue-500/30">
                  <span className="text-[11px]">⚡</span>
                  {slide.badge}
                </span>

                <span className="hidden sm:inline-flex items-center text-[9px] font-bold tracking-widest uppercase px-2.5 py-1.5 rounded-full border border-slate-700/80 bg-slate-800/80 text-slate-300">
                  {slide.tag}
                </span>
              </div>

              {/* Title with Sora Typography & Gradient Second Word */}
              <div>
                <h2
                  className="font-sora font-black leading-[1.05] tracking-tight text-white"
                  style={{ fontSize: 'clamp(1.4rem, 4.4vw, 3.2rem)' }}
                >
                  <span className="block">{slide.titleFirst}</span>
                  <span
                    className="block"
                    style={{
                      backgroundImage: slide.accentGradient,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    {slide.titleSecond}
                  </span>
                </h2>
                <p className="text-[11px] sm:text-[13px] lg:text-[14px] font-semibold mt-1 sm:mt-2 text-white/90">
                  {slide.subtitle}
                </p>
              </div>

              {/* Description */}
              <p className="hidden md:block text-[12.5px] leading-relaxed max-w-[430px] text-white/80">
                {slide.description}
              </p>

              {/* Feature Pills */}
              <div className="hidden lg:flex flex-wrap gap-1.5">
                {slide.features.map((feature) => (
                  <span
                    key={feature}
                    className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-full text-slate-200 bg-white/10 border border-white/15 backdrop-blur-md"
                  >
                    <CheckCircle2 className="w-3 h-3 text-blue-400" />
                    {feature}
                  </span>
                ))}
              </div>

              {/* Pricing Row */}
              <div className="flex items-baseline gap-2 flex-wrap pt-0.5">
                <span
                  className="font-sora font-black leading-none tracking-tight text-white"
                  style={{ fontSize: 'clamp(1.2rem, 2.8vw, 2.2rem)' }}
                >
                  {slide.price}
                </span>
                <span className="text-[11px] sm:text-xs line-through font-medium text-slate-400">
                  {slide.originalPrice}
                </span>
                <span className="text-[9.5px] sm:text-[11px] font-bold text-white px-2.5 py-1 rounded-full bg-rose-600 shadow-sm">
                  {slide.discount}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2 pt-1">
                <Link
                  href={slide.link}
                  className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2.5 rounded-full text-white text-[11.5px] sm:text-[13px] font-bold active:scale-95 transition-all shadow-md shadow-blue-600/30 bg-blue-600 hover:bg-blue-500"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Buy Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                <Link
                  href="/shop"
                  className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-[12.5px] font-bold text-white backdrop-blur-md transition-all bg-white/10 hover:bg-white/15 border border-white/20"
                >
                  <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
                  <span>View All Deals</span>
                </Link>
              </div>

              {/* Trust Indicators Strip */}
              <div className="hidden lg:flex flex-wrap gap-3 pt-2 text-slate-300 text-[10.5px] font-medium">
                <span className="flex items-center gap-1.5">
                  <Zap className="w-3 h-3 text-blue-400" /> Instant Delivery
                </span>
                <span className="flex items-center gap-1.5">
                  <Shield className="w-3 h-3 text-blue-400" /> 100% Genuine
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3 h-3 text-blue-400" /> 24/7 Support
                </span>
                <span className="flex items-center gap-1.5">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> 4.9★ Rating
                </span>
              </div>
            </div>
          </div>

          {/* Carousel Left / Right Arrows */}
          <button
            onClick={prevSlide}
            aria-label="Previous hero slide"
            className="hidden lg:flex absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full items-center justify-center transition-all hover:bg-white/25 text-white backdrop-blur-md border border-white/20 shadow-sm active:scale-95 bg-white/10"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={nextSlide}
            aria-label="Next hero slide"
            className="hidden lg:flex absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full items-center justify-center transition-all hover:bg-white/25 text-white backdrop-blur-md border border-white/20 shadow-sm active:scale-95 bg-white/10"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Slide Indicator Dots with Active Wide Pill */}
      <div className="flex justify-center items-center gap-1.5 pt-3">
        {slides.map((s, idx) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setCurrentSlide(idx)}
            aria-label={`Show slide ${idx + 1}`}
            className="rounded-full transition-all duration-300"
            style={{
              width: currentSlide === idx ? '24px' : '7px',
              height: '7px',
              backgroundColor: currentSlide === idx ? '#2563eb' : 'rgba(148, 163, 184, 0.4)',
              boxShadow: currentSlide === idx ? '0 0 8px rgba(37, 99, 235, 0.4)' : 'none',
            }}
          />
        ))}
      </div>
    </section>
  );
}
