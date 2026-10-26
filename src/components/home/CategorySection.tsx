import React from 'react';
import Link from 'next/link';
import {
  Monitor,
  FileText,
  Download,
  ShieldCheck,
  Palette,
  Lock,
  ArrowRight,
  Flame,
  Cloud,
  Workflow,
  CalendarCheck,
} from 'lucide-react';
import { CategoryType } from '@/lib/types';

interface CategorySectionProps {
  categories: CategoryType[];
}

const iconMap: Record<string, React.ReactNode> = {
  Monitor: <Monitor className="w-6 h-6 text-blue-500" />,
  FileText: <FileText className="w-6 h-6 text-orange-500" />,
  Download: <Download className="w-6 h-6 text-emerald-500" />,
  ShieldCheck: <ShieldCheck className="w-6 h-6 text-red-500" />,
  Palette: <Palette className="w-6 h-6 text-purple-500" />,
  Lock: <Lock className="w-6 h-6 text-indigo-500" />,
  Flame: <Flame className="w-6 h-6 text-amber-500" />,
  Cloud: <Cloud className="w-6 h-6 text-sky-500" />,
  Workflow: <Workflow className="w-6 h-6 text-cyan-500" />,
  Calendar: <CalendarCheck className="w-6 h-6 text-teal-500" />,
};

function getCategoryIcon(cat: CategoryType) {
  if (iconMap[cat.icon]) return iconMap[cat.icon];
  switch (cat.slug) {
    case 'top-selling':
      return <Flame className="w-6 h-6 text-amber-500" />;
    case 'cloud-storage':
      return <Cloud className="w-6 h-6 text-sky-500" />;
    case 'office-365':
      return <Cloud className="w-6 h-6 text-orange-500" />;
    case 'microsoft-visio':
      return <Workflow className="w-6 h-6 text-cyan-500" />;
    case 'microsoft-project':
      return <CalendarCheck className="w-6 h-6 text-teal-500" />;
    default:
      return <Monitor className="w-6 h-6 text-blue-500" />;
  }
}

export default function CategorySection({ categories }: CategorySectionProps) {
  return (
    <section className="max-w-[1800px] mx-auto px-2 sm:px-4 lg:px-6 py-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl sm:text-2xl font-black font-sora text-slate-900 dark:text-white tracking-tight">
            ক্যাটাগরি সমূহ <span className="text-blue-600 dark:text-blue-400 font-bold text-base sm:text-lg">(Categories)</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            আপনার প্রয়োজনীয় ডিজিটাল সফটওয়্যার এবং লাইসেন্স কি বেছে নিন
          </p>
        </div>
        <Link
          href="/shop"
          className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1 group"
        >
          <span>View All</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/shop?cat=${cat.slug}`}
            className="group p-4 rounded-2xl flex flex-col items-center text-center gap-2.5 transition-all duration-200 hover:-translate-y-0.5 border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs hover:shadow-md hover:border-blue-500/40"
          >
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 group-hover:border-blue-500/30 flex items-center justify-center transition-all duration-200 group-hover:scale-105">
              {getCategoryIcon(cat)}
            </div>
            <h3 className="text-xs font-semibold font-sora text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {cat.name}
            </h3>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Instant Key</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
