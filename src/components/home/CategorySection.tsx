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
      return <Monitor className="w-6 h-6 text-violet-500" />;
  }
}

export default function CategorySection({ categories }: CategorySectionProps) {
  return (
    <section className="max-w-[1440px] mx-auto px-3 sm:px-5 py-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            ক্যাটাগরি সমূহ (Browse Categories)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            আপনার প্রয়োজনীয় ডিজিটাল সফটওয়্যার এবং লাইসেন্স কি বেছে নিন
          </p>
        </div>
        <Link
          href="/shop"
          className="text-xs font-bold text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 flex items-center gap-1 group"
        >
          <span>View All</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/shop?cat=${cat.slug}`}
            className="group glass-card p-4 rounded-2xl flex flex-col items-center text-center gap-2 hover:border-violet-500/50 hover:shadow-lg hover:shadow-violet-500/10 transition-all hover:-translate-y-1 bg-white/90 dark:bg-[#0f172a]/90 border border-slate-200/80 dark:border-white/[0.08]"
          >
            <div className="w-12 h-12 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 group-hover:bg-violet-100/50 dark:group-hover:bg-violet-950/50 flex items-center justify-center transition-colors border border-slate-200/60 dark:border-white/[0.08]">
              {getCategoryIcon(cat)}
            </div>
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
              {cat.name}
            </h3>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Instant Key</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
