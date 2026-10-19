import React from 'react';
import { Zap, ShieldCheck, RefreshCw, Smartphone, Headphones, Award } from 'lucide-react';

export default function WhyChooseUs() {
  const features = [
    {
      icon: <Zap className="w-6 h-6 text-amber-500" />,
      title: '১০ সেকেন্ডে অটো ডেলিভারি',
      subtitle: 'Instant Automated Key Delivery',
      desc: 'bKash বা Nagad এ পেমেন্ট সম্পন্ন হওয়ার সাথে সাথেই অন-স্ক্রিন ও ইমেইলে লাইসেন্স কি ও সেটাপ গাইড চলে যাবে।',
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-emerald-500" />,
      title: '১০০% জেনুইন রিটেইল লাইসেন্স',
      subtitle: '100% Original Vendor Verified',
      desc: 'মাইক্রোসফট, টোনেক আইডিএম ও অ্যাডোবির সরাসরি ভেরিফায়েবল অফিশিয়াল লাইসেন্স কি। নো ক্র্যাক, নো রিস্ক।',
    },
    {
      icon: <RefreshCw className="w-6 h-6 text-blue-500" />,
      title: 'ফ্রি রিপ্লেসমেন্ট গ্যারান্টি',
      subtitle: 'Hassle-Free Replacement',
      desc: 'যেকোনো অ্যাক্টিভেশন সমস্যা দেখা দিলে আমাদের টিম দ্রুত ভেরিফাই করে তাৎক্ষণিক নতুন কি প্রদান করে।',
    },
    {
      icon: <Smartphone className="w-6 h-6 text-pink-500" />,
      title: 'সহজ bKash ও Nagad পেমেন্ট',
      subtitle: 'Local Bangladeshi MFS Support',
      desc: 'আন্তর্জাতিক ক্রেডিট কার্ডের ঝামেলা নেই। দেশের যেকোনো প্রান্ত থেকে bKash ও Nagad এ অর্ডার করুন।',
    },
  ];

  return (
    <section className="max-w-[1800px] mx-auto px-2 sm:px-4 lg:px-6 py-10">
      <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
        <span className="text-[11px] font-black uppercase tracking-widest text-violet-600 dark:text-violet-400 bg-violet-100 dark:bg-violet-950/60 px-3 py-1 rounded-full font-sora">
          কেন SolutionsBD থেকে কিনবেন?
        </span>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black font-sora text-slate-900 dark:text-white tracking-tight">
          বাংলাদেশের সর্বাধিক নির্ভরযোগ্য{' '}
          <span
            style={{
              background: 'linear-gradient(135deg, hsl(258,78%,55%), hsl(200,90%,45%))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            ডিজিটাল সফটওয়্যার শপ
          </span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
          আমরা নিশ্চিত করি সর্বোচ্চ গ্রাহক সন্তুষ্টি, নিরাপদ পেমেন্ট এবং তাৎক্ষণিক ডেলিভারি
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {features.map((f, idx) => (
          <div
            key={idx}
            className="glass-card p-5 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] hover:border-violet-400 hover:shadow-lg transition-all bg-white/95 dark:bg-[#0f172a]/95 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-white/[0.08] flex items-center justify-center">
                {f.icon}
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                  {f.title}
                </h3>
                <p className="text-[11px] font-semibold text-violet-600 dark:text-violet-400 mt-0.5">
                  {f.subtitle}
                </p>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {f.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

