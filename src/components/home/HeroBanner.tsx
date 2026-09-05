'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShieldCheck, Zap, ChevronLeft, ChevronRight, ArrowRight, Award } from 'lucide-react';
import { formatImageUrl } from '@/lib/utils';

const slides = [
  {
    id: 1,
    badge: '🏆 OFFICIAL RESELLER',
    titleMain: 'IDM Lifetime',
    titleHighlight: 'Official License',
    subtitle: 'Internet Download Manager 1 PC Lifetime',
    description: 'আমরা IDM-এর অফিশিয়াল অনুমোদিত রিসেলার। একবার কিনুন, নিশ্চিন্তে সারাজীবন ব্যবহার করুন ৩ বছরের ফ্রি আপগ্রেডসহ।',
    price: '৳1,899',
    originalPrice: '৳2,800',
    link: '/product/idm-lifetime-official-license',
    image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&auto=format&fit=crop&q=80',
    tags: ['Official Reseller ✓', 'Lifetime License', 'Fast Delivery'],
  },
  {
    id: 2,
    badge: '⚡ BEST SELLER IN BD',
    titleMain: 'Windows 11 Pro',
    titleHighlight: 'Retail License',
    subtitle: '100% Genuine 25-Digit Retail Activation Key',
    description: 'মাইক্রোসফট অফিসিয়াল সার্ভার থেকে ইনস্ট্যান্ট অ্যাক্টিভেশন। রি-ইনস্টল করলেও লাইসেন্স থাকবে আজীবন।',
    price: '৳999',
    originalPrice: '৳1,800',
    link: '/product/windows-11-pro-retail-key',
    image: 'https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=1200&auto=format&fit=crop&q=80',
    tags: ['Instant Auto Delivery', 'Lifetime Valid', 'Reinstall Supported'],
  },
  {
    id: 3,
    badge: '📦 COMPLETE OFFICE SUITE',
    titleMain: 'Office 2021',
    titleHighlight: 'Professional Plus',
    subtitle: 'Word, Excel, PowerPoint, Outlook & Access',
    description: 'কোনো মাসিক বা বাৎসরিক ফি নেই। একবার কিনে আজীবন ব্যবহার করুন অফিসিয়াল সেটাপ লিংকসহ।',
    price: '৳1,399',
    originalPrice: '৳2,400',
    link: '/product/microsoft-office-2021-pro-plus',
    image: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=1200&auto=format&fit=crop&q=80',
    tags: ['Direct Bind Key', 'No Monthly Fee', 'Commercial Use'],
  },
];

export default function HeroBanner() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const slide = slides[currentSlide];

  return (
    <section className="relative px-2 sm:px-3 lg:px-5 pt-2 pb-6 max-w-[1440px] mx-auto">
      <div className="relative w-full aspect-[16/10] sm:aspect-[16/8] lg:aspect-[21/9] max-h-[500px] rounded-3xl overflow-hidden shadow-2xl border border-violet-500/20 bg-slate-900">
        {/* Background Image with Dark Gradient Overlay */}
        <div className="absolute inset-0">
          <Image
            src={formatImageUrl(slide.image)}
            alt={slide.titleMain}
            fill
            priority
            className="object-cover opacity-35 scale-105 transition-all duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-transparent" />
        </div>

        {/* Slide Content */}
        <div className="absolute inset-0 flex items-center p-5 sm:p-8 lg:p-12 z-10">
          <div className="w-full sm:w-[75%] lg:w-[58%] space-y-3 sm:space-y-4 text-white">
            {/* Badge */}
            <div className="flex items-center gap-2">
              <span className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-[10px] sm:text-xs font-black px-3 py-1 rounded-full shadow-md flex items-center gap-1.5 tracking-wider">
                <Award className="w-3.5 h-3.5 text-amber-300" />
                {slide.badge}
              </span>
            </div>

            {/* Title */}
            <div>
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                <span>{slide.titleMain} </span>
                <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-300 bg-clip-text text-transparent">
                  {slide.titleHighlight}
                </span>
              </h1>
              <p className="text-xs sm:text-sm font-semibold text-slate-300 mt-1">
                {slide.subtitle}
              </p>
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm text-slate-400 line-clamp-2 leading-relaxed max-w-xl">
              {slide.description}
            </p>

            {/* Tags Pills */}
            <div className="hidden sm:flex flex-wrap gap-2 pt-1">
              {slide.tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-white/10 backdrop-blur-md border border-white/15 text-slate-200 text-[11px] font-medium px-2.5 py-1 rounded-full flex items-center gap-1"
                >
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  {tag}
                </span>
              ))}
            </div>

            {/* Price & CTA */}
            <div className="flex items-center gap-4 pt-2">
              <div className="flex items-baseline gap-2">
                <span className="text-xl sm:text-3xl font-black text-amber-400">
                  {slide.price}
                </span>
                <span className="text-xs sm:text-sm text-slate-500 line-through">
                  {slide.originalPrice}
                </span>
              </div>

              <Link
                href={slide.link}
                className="brand-gradient-btn text-white text-xs sm:text-sm font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-violet-600/30"
              >
                <span>অর্ডার করুন (Order Now)</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Carousel Navigation Arrows */}
        <div className="absolute bottom-4 right-4 z-20 flex items-center gap-2">
          <button
            onClick={() =>
              setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1))
            }
            aria-label="Previous Slide"
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur border border-white/20 text-white flex items-center justify-center transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex gap-1.5 px-2">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`h-2 rounded-full transition-all ${
                  currentSlide === idx ? 'w-6 bg-amber-400' : 'w-2 bg-white/40'
                }`}
              />
            ))}
          </div>
          <button
            onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
            aria-label="Next Slide"
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur border border-white/20 text-white flex items-center justify-center transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}

