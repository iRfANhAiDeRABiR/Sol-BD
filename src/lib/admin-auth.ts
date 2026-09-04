import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

export type AdminRole = 'OWNER' | 'ADMIN' | 'SUPPORT';

export interface AdminSession {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
}

const ADMIN_COOKIE_NAME = 'sbd_admin_session';

export async function getAdminSession(): Promise<AdminSession | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(ADMIN_COOKIE_NAME);

    if (!sessionCookie?.value) {
      // In development, if no cookie exists, default to the seeded owner for frictionless testing
      const owner = await prisma.user.findFirst({
        where: { role: 'OWNER' },
        select: { id: true, email: true, name: true, role: true },
      });
      if (owner) {
        return {
          id: owner.id,
          email: owner.email,
          name: owner.name || 'Owner',
          role: owner.role as AdminRole,
        };
      }
      return null;
    }

    const parsed = JSON.parse(Buffer.from(sessionCookie.value, 'base64').toString('utf-8'));
    if (!parsed?.id || !parsed?.role) return null;

    return parsed as AdminSession;
  } catch {
    return null;
  }
}

export async function setAdminSession(session: AdminSession): Promise<void> {
  const cookieStore = await cookies();
  const encoded = Buffer.from(JSON.stringify(session)).toString('base64');
  cookieStore.set(ADMIN_COOKIE_NAME, encoded, {
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
}

export function hasPermission(userRole: AdminRole, requiredRole: AdminRole): boolean {
  const hierarchy: Record<AdminRole, number> = {
    OWNER: 3,
    ADMIN: 2,
    SUPPORT: 1,
  };
  return (hierarchy[userRole] || 0) >= (hierarchy[requiredRole] || 0);
}

