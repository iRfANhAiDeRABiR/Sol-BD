import React from 'react';
import { Star, ShieldCheck, CheckCircle2, MessageSquareQuote } from 'lucide-react';

interface Testimonial {
  name: string;
  location: string;
  product: string;
  rating: number;
  comment: string;
  date: string;
}

const testimonials: Testimonial[] = [
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
    name: 'Engr. Rafiqul Islam',
    location: 'Chittagong, GEC',
    product: 'Internet Download Manager (IDM) 1 PC Lifetime',
    rating: 5,
    comment:
      'SolutionsBD থেকে অফিশিয়াল আইডিএম লাইসেন্স নিয়েছি। অফিসিয়াল সাইট থেকে ডাউনলোড করে রেজিস্টার করলাম, নিমেষেই অ্যাক্টিভেট হয়ে গেল। ধন্যবাদ!',
    date: '১ সপ্তাহ আগে',
  },
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
    name: 'Mahmudul Hasan',
    location: 'Rajshahi, Shaheb Bazar',
    product: 'Canva Pro Team Invite (1 Year)',
    rating: 5,
    comment:
      'হোয়াটসঅ্যাপ সাপোর্টে নক দেওয়ার সাথে সাথেই সমাধান পেয়েছি। লাইসেন্স কি জেনুইন এবং দামও অন্যান্য সাইট থেকে অনেক রিজনেবল। রিকমেন্ডেড!',
    date: '৪ দিন আগে',
  },
];

export default function TestimonialsSection() {
  return (
    <section className="py-12 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
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

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className="rounded-2xl bg-white/95 dark:bg-[#0f172a]/95 border border-slate-200/80 dark:border-white/[0.08] p-5 shadow-sm flex flex-col justify-between space-y-4 hover:border-violet-500/40 transition-all group"
            >
              <div className="space-y-3">
                {/* Rating Stars */}
                <div className="flex items-center gap-1">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed italic">
                  "{t.comment}"
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-white/[0.05] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900 dark:text-white">
                    {t.name}
                  </span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-0.5">
                    <CheckCircle2 className="w-3 h-3" />
                    Verified
                  </span>
                </div>
                <div className="text-[10px] text-slate-400">
                  {t.location} • {t.product}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

