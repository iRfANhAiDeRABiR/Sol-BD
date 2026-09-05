import React from 'react';
import { Star, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface Testimonial {
  name: string;
  location: string;
  product: string;
  rating: number;
  comment: string;
  date: string;
}

const column1: Testimonial[] = [
  {
    name: 'Tanvir Ahmed',
    location: 'Dhaka, Dhanmondi',
    product: 'Windows 11 Pro Retail Lifetime Key',
    rating: 5,
    comment:
      'অসাধারণ সার্ভিস! bKash পেমেন্ট করার ৩০ সেকেন্ডের মধ্যে মেসেজ এবং স্ক্রিনে লাইসেন্স কি পেয়ে গিয়েছিলাম। সাথে সাথেই অ্যাক্টিভেশন সফল হয়েছে। ১০০% অরিজিনাল কি।',
    date: '২ দিন আগে',
  },
  {
    name: 'Tahsin Reza',
    location: 'Dhaka, Gulshan',
    product: 'Windows 10 Pro Retail Key',
    rating: 5,
    comment:
      'পুরনো পিসিতে জেনুইন উইন্ডোজ ১০ প্রো দিয়েছি। আপডেট এবং সিকিউরিটি প্যাচ একদম স্মুথলি কাজ করছে। কাস্টমার সার্ভিসও অতুলনীয়।',
    date: '৫ দিন আগে',
  },
  {
    name: 'Arif Chowdhury',
    location: 'Chittagong, Agrabad',
    product: 'Internet Download Manager (IDM) Lifetime',
    rating: 5,
    comment:
      'আইডিএম এর স্পিড এবং অফিসিয়াল অটো আপডেট খুব সুন্দর কাজ করছে। কোন ক্র্যাক বা ভাইরাসের ভয় নেই। নিশ্চিন্তে সবাই নিতে পারেন।',
    date: '১ সপ্তাহ আগে',
  },
];

const column2: Testimonial[] = [
  {
    name: 'Engr. Rafiqul Islam',
    location: 'Chittagong, GEC',
    product: 'Internet Download Manager (IDM) 1 PC Lifetime',
    rating: 5,
    comment:
      'SolutionsBD থেকে অফিশিয়াল আইডিএম লাইসেন্স নিয়েছি। অফিসিয়াল সাইট থেকে ডাউনলোড করে রেজিস্টার করলাম, নিমেষেই অ্যাক্টিভেট হয়ে গেল। ধন্যবাদ!',
    date: '১ সপ্তাহ আগে',
  },
  {
    name: 'Farhan Kabir',
    location: 'Dhaka, Uttara',
    product: 'Kaspersky Total Security 1 Device',
    rating: 5,
    comment:
      'অর্ডার করার সাথে সাথেই লাইসেন্স কি ও অফিশিয়াল ডাউনলোড লিংক পেয়েছি। ইনস্টলেশন গাইড খুব ক্লিয়ার ছিল। ফুল প্রোটেকশন চালু হয়েছে।',
    date: '৩ দিন আগে',
  },
  {
    name: 'Sumaiya Akter',
    location: 'Comilla, Kandirpar',
    product: 'Microsoft Visio 2024 Pro',
    rating: 5,
    comment:
      'অফিসিয়াল প্রজেক্টের ফ্লোচার্ট ড্রয়িং এর জন্য ভিজিও ২০২৪ কিনেছি। মাইক্রোসফট অ্যাকাউন্টেই লাইসেন্স লিঙ্ক হয়েছে। চমৎকার সার্ভিস!',
    date: '৪ দিন আগে',
  },
];

const column3: Testimonial[] = [
  {
    name: 'Sadia Rahman',
    location: 'Sylhet, Zindabazar',
    product: 'Microsoft Office 365 Personal (1 Year)',
    rating: 5,
    comment:
      'setup.office.com এ আমার নিজস্ব মাইক্রোসফট একাউন্টে রিডিম করেছি। ১টিবি ওয়ানড্রাইভ ক্লাউড স্টোরেজ এবং ওয়ার্ড-এক্সেল একদম পারফেক্ট কাজ করছে।',
    date: '৩ দিন আগে',
  },
  {
    name: 'Zubair Al Mahmud',
    location: 'Dhaka, Mirpur',
    product: 'Microsoft Office Pro Plus 2024 LTSC',
    rating: 5,
    comment:
      'অফিস ২০২৪ এলটিএসসি লাইসেন্সটি নিমিষেই অ্যাক্টিভ হয়েছে। লাইফটাইম ভ্যালিডিটি এবং কোন রিনিউয়াল ঝামেলা নেই। অনেক ভালো সাপোর্ট পেয়েছি।',
    date: '৬ দিন আগে',
  },
  {
    name: 'Dr. Mizanur Rahman',
    location: 'Mymensingh, Sadar',
    product: 'Google One 100GB Storage',
    rating: 5,
    comment:
      'গুগল ওয়ান স্টোরেজ আপগ্রেড মাত্র ৫ মিনিটে কমপ্লিট হয়েছে। পার্সোনাল ড্রাইভ ও ফটোজ ব্যাকআপ নিয়ে আর কোন চিন্তা নেই।',
    date: '১ সপ্তাহ আগে',
  },
];

const column4: Testimonial[] = [
  {
    name: 'Mahmudul Hasan',
    location: 'Rajshahi, Shaheb Bazar',
    product: 'Canva Pro Team Invite (1 Year)',
    rating: 5,
    comment:
      'হোয়াটসঅ্যাপ সাপোর্টে নক দেওয়ার সাথে সাথেই সমাধান পেয়েছি। লাইসেন্স কি জেনুইন এবং দামও অন্যান্য সাইট থেকে অনেক রিজনেবল। রিকমেন্ডেড!',
    date: '৪ দিন আগে',
  },
  {
    name: 'Nusrat Jahan',
    location: 'Khulna, Boyra',
    product: 'Adobe Creative Cloud All Apps',
    rating: 5,
    comment:
      'আমার পার্সোনাল জিমেইল অ্যাকাউন্টে অ্যাডোবি সাবস্ক্রিপশন অ্যাক্টিভ হয়েছে। ফটোশপ ও প্রিমিয়ার প্রো ফুল ফিচার ও ক্লাউড স্টোরেজ সহ কাজ করছে।',
    date: '২ দিন আগে',
  },
  {
    name: 'Shakil Hossain',
    location: 'Barisal, Sadar',
    product: 'NordVPN Premium 1 Year',
    rating: 5,
    comment:
      'নর্ডভিপিএন হাই স্পিড দিচ্ছে এবং ফোন-ল্যাপটপ সব ডিভাইসে সহজে কানেক্ট করতে পারছি। ইনস্ট্যান্ট ডেলিভারির জন্য ধন্যবাদ।',
    date: '৫ দিন আগে',
  },
];

const columns = [
  { items: column1, direction: 'up', duration: '30s', visibility: 'block' },
  { items: column2, direction: 'down', duration: '26s', visibility: 'hidden sm:block' },
  { items: column3, direction: 'up', duration: '34s', visibility: 'hidden lg:block' },
  { items: column4, direction: 'down', duration: '28s', visibility: 'hidden lg:block' },
];

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <div className="rounded-2xl bg-white/95 dark:bg-[#0f172a]/95 border border-slate-200/80 dark:border-white/[0.08] p-5 shadow-sm space-y-4 hover:border-violet-500/40 hover:shadow-md transition-all group select-none">
      <div className="space-y-2.5">
        {/* Rating Stars */}
        <div className="flex items-center gap-1">
          {[...Array(testimonial.rating)].map((_, i) => (
            <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          ))}
        </div>

        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed italic">
          &ldquo;{testimonial.comment}&rdquo;
        </p>
      </div>

      <div className="pt-3 border-t border-slate-100 dark:border-white/[0.05] space-y-1">
        <div className="flex items-center justify-between">
          <span className="font-bold text-xs text-slate-900 dark:text-white">
            {testimonial.name}
          </span>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-0.5">
            <CheckCircle2 className="w-3 h-3" />
            Verified
          </span>
        </div>
        <div className="text-[10px] text-slate-400">
          {testimonial.location} • {testimonial.product}
        </div>
      </div>
    </div>
  );
}

export default function TestimonialsSection() {
  return (
    <section className="py-12 relative overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-3 sm:px-5 space-y-8">
        {/* Header */}
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-xs font-black uppercase tracking-wider text-violet-600 dark:text-violet-400 bg-violet-500/10 px-3 py-1 rounded-full inline-flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            Verified Customer Reviews
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            কাস্টমারদের বিশ্বস্ত মতামত ও রিভিউ
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            ১০,০০০+ সন্তুষ্ট গ্রাহকের বিশ্বাস এবং ৫-স্টার ভেরিফায়েড জেনুইন সফটওয়্যার ডেলিভারি
          </p>
        </div>

        {/* Sliding Reviews Carousel */}
        <div className="relative h-[520px] sm:h-[580px] overflow-hidden mask-fade-y pause-hover">
          {/* Top and bottom gradient shadows */}
          <div className="pointer-events-none absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-slate-50 dark:from-slate-950 to-transparent z-10" />
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-slate-50 dark:from-slate-950 to-transparent z-10" />

          {/* 4 Alternating Vertical Sliding Columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 h-full">
            {columns.map((col, colIdx) => (
              <div
                key={colIdx}
                className={`${col.visibility} overflow-hidden h-full relative`}
              >
                <div
                  className={`flex flex-col gap-4 ${
                    col.direction === 'up' ? 'animate-marquee-up' : 'animate-marquee-down'
                  } hover:[animation-play-state:paused]`}
                  style={{ animationDuration: col.duration }}
                >
                  {col.items.concat(col.items).map((t, idx) => (
                    <TestimonialCard key={`${colIdx}-${idx}`} testimonial={t} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

