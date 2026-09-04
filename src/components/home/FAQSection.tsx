'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

const faqs = [
  {
    q: 'SolutionsBD থেকে সফটওয়্যার লাইসেন্স কেনা কতটা নিরাপদ?',
    a: 'SolutionsBD শতভাগ বিশ্বস্ত ও রেজিস্টার্ড ডিজিটাল প্ল্যাটফর্ম। আমরা সরাসরি অনুমোদিত ভেন্ডর থেকে অরিজিনাল রিটেইল ও অফিসিয়াল লাইসেন্স কি সংগ্রহ করি। কোনো প্রকার ক্র্যাক বা ঝুঁকিপূর্ণ ফাইল আমরা সরবরাহ করি না।',
  },
  {
    q: 'অর্ডার করার পর লাইসেন্স কি কত দ্রুত ডেলিভারি পাওয়া যায়?',
    a: 'স্বয়ংক্রিয় bKash পেমেন্টের ক্ষেত্রে সাথে সাথেই (১০ থেকে ৩০ সেকেন্ডের মধ্যে) স্ক্রিনে ডিজিটাল লাইসেন্স কি উন্মুক্ত হয়ে যায় এবং আপনার ইমেইলে পাঠিয়ে দেওয়া হয়। ম্যানুয়াল সেন্ড মানি অর্ডারের ক্ষেত্রে ভেরিফিকেশন সম্পন্ন হতে ৫-১৫ মিনিট সময় লাগতে পারে।',
  },
  {
    q: 'কোন কোন পেমেন্ট মাধ্যমে টাকা পরিশোধ করা যায়?',
    a: 'আমরা bKash (বিকাশ অনলাইন ও সেন্ড মানি), Nagad (নগদ), Rocket (রকেট), এবং ব্র্যাক/ডিবিবিএল ব্যাংক ট্রান্সফার গ্রহণ করি।',
  },
  {
    q: 'লাইসেন্স কি অ্যাক্টিভেশন করতে কোনো সমস্যা হলে কি সমাধান পাবো?',
    a: 'আমাদের প্রতিটি প্রডাক্টের সাথে ফ্রি রিপ্লেসমেন্ট গ্যারান্টি রয়েছে। কোনো কারণে অ্যাক্টিভেশন ত্রুটি দেখা দিলে আমাদের WhatsApp নম্বরে স্ক্রিনশট পাঠালে তাৎক্ষণিক নতুন কি অথবা টেকনিক্যাল সহায়তা প্রদান করা হয়।',
  },
  {
    q: 'উইন্ডোজ বা অফিস কি পরবর্তীতে পিসি ফরম্যাট বা রি-ইনস্টল করা যাবে?',
    a: 'হ্যাঁ! আমাদের উইন্ডোজ ও অফিস রিটেইল কি সমূহ আপনার পিসির মাদারবোর্ড বা মাইক্রোসফট অ্যাকাউন্টের সাথে যুক্ত থাকে, ফলে পরবর্তীতে রি-ইনস্টল করলেও স্বয়ংক্রিয়ভাবে অ্যাক্টিভেট হয়ে যাবে।',
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq-section" className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-8 space-y-2">
        <span className="text-xs font-black uppercase tracking-widest text-violet-600 dark:text-violet-400 bg-violet-100 dark:bg-violet-950/60 px-3 py-1 rounded-full inline-flex items-center gap-1">
          <HelpCircle className="w-3.5 h-3.5" />
          সচরাচর জিজ্ঞাসিত প্রশ্ন (FAQ)
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          আপনার যেকোনো প্রশ্নের উত্তর
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
          সফটওয়্যার কেনা, পেমেন্ট এবং অ্যাক্টিভেশন সংক্রান্ত সাধারণ তথ্যাবলী
        </p>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="glass-card rounded-2xl border border-slate-200/80 dark:border-white/[0.08] overflow-hidden bg-white/95 dark:bg-[#0f172a]/95 transition-all"
            >
              <button
                onClick={() => toggle(idx)}
                className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-slate-800 dark:text-slate-200 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-5 h-5 text-slate-400 flex-shrink-0 transition-transform duration-200 ${
                    isOpen ? 'rotate-180 text-violet-600 dark:text-violet-400' : ''
                  }`}
                />
              </button>
              {isOpen && (
                <div className="px-4 sm:px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-white/[0.05]">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

