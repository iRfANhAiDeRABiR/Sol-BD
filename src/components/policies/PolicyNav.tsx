'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from '@/app/policies/policies.module.css';

const navItems = [
  { href: '/policies/delivery-info', label: '🚚 Delivery Info' },
  { href: '/policies/order-and-cancellation', label: '🛒 Order & Cancellation' },
  { href: '/policies/refund-policy', label: '↩ Refund & Return Policy' },
  { href: '/policies/refund-request', label: '📝 Refund Request' },
  { href: '/policies/privacy-policy', label: '🔒 Privacy Policy' },
  { href: '/policies/terms-and-conditions', label: '📜 Terms & Conditions' },
];

export default function PolicyNav() {
  const pathname = usePathname();

  return (
    <nav className={styles.navPills} aria-label="Policy navigation">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`${styles.navPill} ${isActive ? styles.navPillActive : ''}`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
