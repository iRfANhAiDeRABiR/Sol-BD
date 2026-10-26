'use client';

import React, { useState } from 'react';
import { MapPin, Phone, Mail, Send } from 'lucide-react';
import { toast } from 'sonner';
import { submitContactMessageAction } from '@/app/actions/marketing';

export default function ContactSection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Please enter your name.');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      toast.error('Please enter a valid email address.');
      return;
    }
    if (!formData.message.trim()) {
      toast.error('Please write your message.');
      return;
    }

    setLoading(true);
    try {
      const res = await submitContactMessageAction(formData);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(res.message || 'Message sent successfully!');
        setFormData({ name: '', email: '', subject: '', message: '' });
      }
    } catch {
      toast.error('Failed to send message. Please contact us via WhatsApp.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="w-full max-w-[1440px] mx-auto px-3 sm:px-5 py-10 sm:py-16">
      <div className="rounded-[28px] sm:rounded-[36px] bg-slate-50 dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-6 sm:p-10 md:p-14 shadow-lg relative overflow-hidden transition-colors duration-300">
        {/* Glow ambient background circles */}
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-blue-600/5 dark:bg-blue-600/10 blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-indigo-500/5 dark:bg-indigo-500/10 blur-[100px] pointer-events-none" />

        {/* Top Badge & Header */}
        <div className="relative z-10 text-center space-y-3 mb-12 sm:mb-14">
          <div className="flex justify-center">
            <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/50 border border-blue-200/60 dark:border-blue-800/40 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 shadow-xs">
              GET IN TOUCH
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
            Contact{' '}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
              Us
            </span>
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-slate-500 dark:text-slate-400 font-medium max-w-md mx-auto">
            Have questions? We&apos;re here to help!
          </p>
        </div>

        {/* 2-Column Content */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* Left Column: Contact Cards & Socials */}
          <div className="lg:col-span-5 space-y-7 sm:space-y-8">
            {/* Address */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-center flex-shrink-0 shadow-xs">
                <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-700 dark:text-white uppercase tracking-wider block">
                  Address
                </span>
                <span className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 block">
                  Dhaka, Bangladesh
                </span>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-center flex-shrink-0 shadow-xs">
                <Phone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-700 dark:text-white uppercase tracking-wider block">
                  Phone
                </span>
                <a
                  href="tel:+8801410699879"
                  className="text-sm text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors mt-0.5 block"
                >
                  +880 1410-699879
                </a>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-center flex-shrink-0 shadow-xs">
                <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-700 dark:text-white uppercase tracking-wider block">
                  Email
                </span>
                <a
                  href="mailto:info@solutionsbd.com"
                  className="text-sm text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors mt-0.5 block"
                >
                  info@solutionsbd.com
                </a>
              </div>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-3">
              {/* Facebook */}
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-400 text-slate-500 dark:text-slate-400 hover:text-blue-600 flex items-center justify-center transition-colors shadow-xs active:scale-95"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>

              {/* WhatsApp */}
              <a
                href="https://wa.me/8801410699879"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-400 text-slate-500 dark:text-slate-400 hover:text-emerald-600 flex items-center justify-center transition-colors shadow-xs active:scale-95"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                </svg>
              </a>

              {/* Telegram */}
              <a
                href="https://t.me/solutionsbd"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Telegram"
                className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-sky-400 text-slate-500 dark:text-slate-400 hover:text-sky-600 flex items-center justify-center transition-colors shadow-xs active:scale-95"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.121l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.196 1.006.128.832.916z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-7">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your Name"
                  disabled={loading}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-3.5 text-sm text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all shadow-xs"
                />
              </div>

              {/* Email */}
              <div>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Your Email"
                  disabled={loading}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-3.5 text-sm text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all shadow-xs"
                />
              </div>

              {/* Select Subject */}
              <div>
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-3.5 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all shadow-xs cursor-pointer"
                >
                  <option value="" disabled>
                    Select Subject
                  </option>
                  <option value="General Inquiry">
                    General Inquiry
                  </option>
                  <option value="License Activation Help">
                    License Activation Help
                  </option>
                  <option value="Corporate / Bulk Order">
                    Corporate / Bulk Order
                  </option>
                  <option value="Payment & TrxID Verification">
                    Payment &amp; TrxID Verification
                  </option>
                  <option value="Partnership">
                    Partnership &amp; Vendor
                  </option>
                </select>
              </div>

              {/* Message */}
              <div>
                <textarea
                  name="message"
                  required
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Your Message"
                  disabled={loading}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-3.5 text-sm text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all shadow-xs resize-none"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-full font-semibold text-sm text-white flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-500/20 transition-colors disabled:opacity-70 mt-2"
              >
                <span>{loading ? 'Sending Message...' : 'Send Message'}</span>
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

