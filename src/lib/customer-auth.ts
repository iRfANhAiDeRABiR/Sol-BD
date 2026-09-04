import { cookies } from 'next/headers';
import crypto from 'crypto';
import prisma from '@/lib/prisma';

export interface CustomerSession {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  role: string;
  walletBalance: number;
  loyaltyPoints: number;
}

const CUSTOMER_COOKIE_NAME = 'sbd_customer_session';

/**
 * Hash password using Node.js scrypt with a unique random salt
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return `${salt}:${derivedKey.toString('hex')}`;
}

/**
 * Verify password against stored hash or fallback
 */
export function verifyPassword(password: string, combinedHash?: string | null): boolean {
  if (!combinedHash || !password) return false;

  // Backwards compatibility for plain text if any legacy testing data existed
  if (!combinedHash.includes(':')) {
    return password === combinedHash;
  }

  try {
    const [salt, key] = combinedHash.split(':');
    if (!salt || !key) return false;
    const keyBuffer = Buffer.from(key, 'hex');
    const derivedKey = crypto.scryptSync(password, salt, 64);
    return crypto.timingSafeEqual(keyBuffer, derivedKey);
  } catch {
    return false;
  }
}

/**
 * Retrieve authenticated customer session from HTTP-only cookie
 */
export async function getCustomerSession(): Promise<CustomerSession | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(CUSTOMER_COOKIE_NAME);
    if (!sessionCookie?.value) return null;

    const parsed = JSON.parse(Buffer.from(sessionCookie.value, 'base64').toString('utf-8'));
    if (!parsed?.id || !parsed?.email) return null;

    return parsed as CustomerSession;
  } catch {
    return null;
  }
}

/**
 * Set customer session into HTTP-only cookie
 */
export async function setCustomerSession(session: CustomerSession): Promise<void> {
  const cookieStore = await cookies();
  const encoded = Buffer.from(JSON.stringify(session)).toString('base64');

  cookieStore.set(CUSTOMER_COOKIE_NAME, encoded, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/',
  });
}

/**
 * Remove customer session cookie on logout
 */
export async function clearCustomerSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(CUSTOMER_COOKIE_NAME);
}

