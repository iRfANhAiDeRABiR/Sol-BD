'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { ShieldCheck, Mail, Phone, MapPin, CheckCircle } from 'lucide-react';

export default function Footer() {
  const pathname = usePathname();
  if (pathname?.startsWith('/admin')) return null;
  return (
    <footer className="w-full bg-slate-950 text-slate-300 pt-14 pb-8 border-t border-slate-800 relative no-print print:hidden">
      <div className="max-w-[1440px] mx-auto px-3 sm:px-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 pb-12 border-b border-slate-800/80">
          {/* Col 1 & 2: Brand Info */}
          <div className="sm:col-span-2 md:col-span-3 lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-3.5 group select-none">
              <div className="relative w-14 h-14 rounded-full p-[2px] bg-gradient-to-tr from-cyan-400 via-blue-600 to-indigo-600 shadow-xl shadow-blue-500/25 flex items-center justify-center flex-shrink-0">
                <div className="w-full h-full rounded-full overflow-hidden bg-white flex items-center justify-center">
                  <Image
                    src="/logo.png"
                    alt="SolutionsBD Logo"
                    width={56}
                    height={56}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="text-2xl sm:text-[28px] font-black tracking-tight flex items-baseline">
                <span className="text-white">Solutions</span>
                <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 bg-clip-text text-transparent ml-1 font-black">
                  BD
                </span>
              </div>
            </Link>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              বাংলাদেশের অন্যতম শীর্ষ ও বিশ্বস্ত ডিজিটাল সফটওয়্যার শপ। অরিজিনাল উইন্ডোজ, মাইক্রোসফট অফিস, আইডিএম, অ্যান্টিভাইরাস এবং ডিজিটাল সাবস্ক্রিপশন কিনুন ইনস্ট্যান্ট অটোমেটেড ডেলিভারিসহ।
            </p>

            <div className="space-y-2 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>হেল্পলাইন: +880 1410-699879 (সকাল ৯টা – রাত ১১টা)</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-violet-400" />
                <span>ইমেইল: info@solutionsbd.com</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>ধানমন্ডি, ঢাকা, বাংলাদেশ</span>
              </div>
            </div>
          </div>

          {/* Col 3: Popular Categories */}
          <div>
            <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-1.5">
              <span>জনপ্রিয় ক্যাটাগরি</span>
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link href="/shop?cat=windows" className="hover:text-white transition-colors">
                  Windows 11 & 10 Pro
                </Link>
              </li>
              <li>
                <Link href="/shop?cat=office" className="hover:text-white transition-colors">
                  Microsoft Office 2021 / 2024
                </Link>
              </li>
              <li>
                <Link href="/shop?cat=utility" className="hover:text-white transition-colors">
                  IDM Lifetime License
                </Link>
              </li>
              <li>
                <Link href="/shop?cat=antivirus" className="hover:text-white transition-colors">
                  Kaspersky & ESET Antivirus
                </Link>
              </li>
              <li>
                <Link href="/shop?cat=creative-design" className="hover:text-white transition-colors">
                  Adobe Creative Cloud
                </Link>
              </li>
              <li>
                <Link href="/shop?cat=vpn-privacy" className="hover:text-white transition-colors">
                  NordVPN & ExpressVPN
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Customer Services */}
          <div>
            <h4 className="text-sm font-bold text-white mb-3">গ্রাহক সেবা</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link href="/tools" className="hover:text-white transition-colors text-amber-300 font-semibold">
                  🛠️ দরকারি ফ্রি টুলস (Free Tools)
                </Link>
              </li>
              <li>
                <Link href="/shop" className="hover:text-white transition-colors">
                  সব প্রোডাক্ট ব্রাউজ করুন
                </Link>
              </li>
              <li>
                <a href="#faq-section" className="hover:text-white transition-colors">
                  সচরাচর জিজ্ঞাসিত প্রশ্ন (FAQ)
                </a>
              </li>
              <li>
                <a href="https://wa.me/8801410699879" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors text-emerald-400">
                  হোয়াটসঅ্যাপ সাপোর্ট চ্যাট
                </a>
              </li>
            </ul>
          </div>

          {/* Col 5: Policies & Legal */}
          <div>
            <h4 className="text-sm font-bold text-white mb-3">পলিসি ও শর্তাবলী</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link href="/policies/delivery-info" className="hover:text-white transition-colors">
                  ⚡ ডেলিভারি তথ্য (Delivery)
                </Link>
              </li>
              <li>
                <Link href="/policies/order-and-cancellation" className="hover:text-white transition-colors">
                  🛒 অর্ডার ও বাতিল নীতি
                </Link>
              </li>
              <li>
                <Link href="/policies/refund-policy" className="hover:text-white transition-colors">
                  ↩ রিফান্ড ও রিটার্ন নীতি
                </Link>
              </li>
              <li>
                <Link href="/policies/refund-request" className="hover:text-white transition-colors text-amber-400">
                  📝 রিফান্ড রিকোয়েস্ট ফরম
                </Link>
              </li>
              <li>
                <Link href="/policies/privacy-policy" className="hover:text-white transition-colors">
                  🔒 গোপনীয়তা নীতি (Privacy)
                </Link>
              </li>
              <li>
                <Link href="/policies/terms-and-conditions" className="hover:text-white transition-colors">
                  📜 ব্যবহারের শর্তাবলী (Terms)
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 6: Security & Guarantee */}
          <div>
            <h4 className="text-sm font-bold text-white mb-3">আমাদের প্রতিশ্রুতি</h4>
            <div className="space-y-2 text-xs text-slate-400">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span>১০০% জেনুইন অফিশিয়াল লাইসেন্স কি</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span>অ্যাক্টিভেশন ফেইল করলে ফ্রি রিপ্লেসমেন্ট</span>
              </div>
              <div className="flex items-start gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400 mt-0.5 flex-shrink-0" />
                <span>সিকিউর bKash / Nagad পেমেন্ট</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Gateways & Legal Bottom Bar */}
        <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-slate-400">পেমেন্ট মেথড:</span>
            <span className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-pink-400 font-bold text-[11px]">
              bKash (বিকাশ)
            </span>
            <span className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-orange-400 font-bold text-[11px]">
              Nagad (নগদ)
            </span>
            <span className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-purple-400 font-bold text-[11px]">
              Rocket (রকেট)
            </span>
            <span className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-amber-400 font-bold text-[11px]">
              Upay (উপায়)
            </span>
            <span className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-blue-400 font-bold text-[11px]">
              Bank Transfer (DBBL)
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-slate-500 flex-wrap">
            <Link href="/policies/terms-and-conditions" className="hover:text-slate-300 transition-colors">
              শর্তাবলী
            </Link>
            <span>•</span>
            <Link href="/policies/privacy-policy" className="hover:text-slate-300 transition-colors">
              প্রাইভেসি
            </Link>
            <span>•</span>
            <Link href="/policies/refund-policy" className="hover:text-slate-300 transition-colors">
              রিফান্ড
            </Link>
            <span>•</span>
            <Link href="/policies/delivery-info" className="hover:text-slate-300 transition-colors">
              ডেলিভারি তথ্য
            </Link>
            <span>•</span>
            <Link href="/admin/login" className="hover:text-slate-300 transition-colors text-violet-400/80 hover:text-violet-300">
              অ্যাডমিন পোর্টাল
            </Link>
          </div>

          <div className="text-center sm:text-right">
            <p>© {new Date().getFullYear()} SolutionsBD. All Rights Reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
