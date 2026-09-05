import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

export type AdminRole = 'OWNER' | 'ADMIN' | 'SUPPORT';

export interface AdminSession {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
}

import crypto from 'crypto';

const ADMIN_COOKIE_NAME = 'sbd_admin_session';
const SESSION_SECRET = process.env.SESSION_SECRET || 'sbd_admin_signing_secret_2026_super_secure';

function signSessionData(dataStr: string): string {
  return crypto.createHmac('sha256', SESSION_SECRET).update(dataStr).digest('hex');
}

function verifySessionSignature(dataStr: string, signature: string): boolean {
  try {
    const expected = signSessionData(dataStr);
    if (expected.length !== signature.length) return false;
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
}

export async function getAdminSession(): Promise<AdminSession | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(ADMIN_COOKIE_NAME);

    if (!sessionCookie?.value) {
      return null;
    }

    const rawVal = sessionCookie.value;
    const parts = rawVal.split('.');
    if (parts.length !== 2) {
      // Reject any unsigned or legacy cookies immediately
      return null;
    }

    const [dataB64, signature] = parts;
    if (!verifySessionSignature(dataB64, signature)) {
      // Signature mismatch - tampering detected
      return null;
    }

    const parsed = JSON.parse(Buffer.from(dataB64, 'base64').toString('utf-8'));
    if (!parsed?.id || !parsed?.role) return null;

    // Verify user exists and is active in database, and role matches
    const dbUser = await prisma.user.findUnique({
      where: { id: parsed.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
      },
    });

    if (!dbUser || (dbUser as any).isActive === false) {
      return null;
    }

    if (!['OWNER', 'ADMIN', 'SUPPORT'].includes(dbUser.role)) {
      return null;
    }

    return {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name || 'Admin',
      role: dbUser.role as AdminRole,
    };
  } catch {
    return null;
  }
}

export async function setAdminSession(session: AdminSession): Promise<void> {
  const cookieStore = await cookies();
  const sessionPayload = {
    id: session.id,
    email: session.email,
    name: session.name,
    role: session.role,
  };
  const dataB64 = Buffer.from(JSON.stringify(sessionPayload)).toString('base64');
  const signature = signSessionData(dataB64);
  const token = `${dataB64}.${signature}`;

  cookieStore.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
}

export async function clearAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);
  cookieStore.set(ADMIN_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });
}

export function hasPermission(userRole: AdminRole, requiredRole: AdminRole): boolean {
  const hierarchy: Record<AdminRole, number> = {
    OWNER: 3,
    ADMIN: 2,
    SUPPORT: 1,
  };
  return (hierarchy[userRole] || 0) >= (hierarchy[requiredRole] || 0);
}

