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
const SESSION_SECRET = process.env.SESSION_SECRET || 'sbd_customer_signing_secret_2026_secure';

function signCustomerData(dataStr: string): string {
  return crypto.createHmac('sha256', SESSION_SECRET).update(dataStr).digest('hex');
}

function verifyCustomerSignature(dataStr: string, signature: string): boolean {
  try {
    const expected = signCustomerData(dataStr);
    if (expected.length !== signature.length) return false;
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
}

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
    if (keyBuffer.length !== derivedKey.length) return false;
    return crypto.timingSafeEqual(keyBuffer, derivedKey);
  } catch {
    return false;
  }
}

/**
 * Retrieve authenticated customer session from HTTP-only cookie with cryptographic signature verification
 */
export async function getCustomerSession(): Promise<CustomerSession | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(CUSTOMER_COOKIE_NAME);
    if (!sessionCookie?.value) return null;

    const rawVal = sessionCookie.value;
    const parts = rawVal.split('.');
    if (parts.length !== 2) {
      // Reject any unsigned or legacy cookies
      return null;
    }

    const [dataB64, signature] = parts;
    if (!verifyCustomerSignature(dataB64, signature)) {
      // Signature mismatch - tampering detected
      return null;
    }

    const parsed = JSON.parse(Buffer.from(dataB64, 'base64').toString('utf-8'));
    if (!parsed?.id || !parsed?.email) return null;

    // Verify user exists and is active in database, pulling fresh state
    const dbUser = await prisma.user.findUnique({
      where: { id: parsed.id },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        isActive: true,
        walletBalance: true,
        loyaltyPoints: true,
      },
    });

    if (!dbUser || (dbUser as any).isActive === false) {
      return null;
    }

    return {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name || 'Customer',
      phone: dbUser.phone,
      role: dbUser.role,
      walletBalance: dbUser.walletBalance || 0,
      loyaltyPoints: dbUser.loyaltyPoints || 0,
    };
  } catch {
    return null;
  }
}

/**
 * Set customer session into HTTP-only cookie with cryptographic signature
 */
export async function setCustomerSession(session: CustomerSession): Promise<void> {
  const cookieStore = await cookies();
  const payload = {
    id: session.id,
    email: session.email,
    name: session.name,
    phone: session.phone,
    role: session.role,
  };
  const dataB64 = Buffer.from(JSON.stringify(payload)).toString('base64');
  const signature = signCustomerData(dataB64);
  const token = `${dataB64}.${signature}`;

  cookieStore.set(CUSTOMER_COOKIE_NAME, token, {
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
  cookieStore.set(CUSTOMER_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });
}

