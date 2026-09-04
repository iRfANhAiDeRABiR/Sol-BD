import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined) return '৳0';
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return `৳${num.toLocaleString('en-BD')}`;
}

export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-BD', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatImageUrl(src?: string | null): string {
  if (!src || typeof src !== 'string' || !src.trim()) {
    return 'https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=1000&auto=format&fit=crop&q=80';
  }
  let s = src.trim();
  if (s.startsWith('http://') || s.startsWith('https://')) {
    return s;
  }
  // Strip any leading ./ or .\ if present
  s = s.replace(/^\.?\//, '/').replace(/^\.?\\/, '/');
  if (!s.startsWith('/')) {
    s = '/' + s;
  }
  return s;
}

export function sanitizeProductSlug(input: string): string {
  return (input || '')
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
