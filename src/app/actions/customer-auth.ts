'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import {
  hashPassword,
  verifyPassword,
  setCustomerSession,
  clearCustomerSession,
  getCustomerSession,
  CustomerSession,
} from '@/lib/customer-auth';

// -------------------------------------------------------------
// 1. Customer Registration Server Action
// -------------------------------------------------------------
export async function registerCustomerAction(data: {
  name: string;
  email: string;
  phone: string;
  password: string;
  redirectUrl?: string;
}) {
  const name = data.name?.trim();
  const email = data.email?.trim().toLowerCase();
  const phone = data.phone?.trim();
  const password = data.password;

  if (!name) return { error: 'Full name is required.' };
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: 'Please provide a valid email address.' };
  }
  if (!phone || phone.length < 11) {
    return { error: 'Please provide a valid 11-digit mobile number.' };
  }
  if (!password || password.length < 6) {
    return { error: 'Password must be at least 6 characters long.' };
  }

  try {
    const existing = await prisma.user.findUnique({
      where: { email },
    });

    let user;
    if (existing) {
      if ((existing as any).isActive === false) {
        return { error: 'This account has been suspended by an administrator. Please contact customer support.' };
      }
      if (existing.password) {
        return { error: 'An account with this email already exists. Please log in.' };
      }
      // User existed from past guest checkout without password
      // Security check: verify phone matches existing record to prevent arbitrary account takeover
      if (existing.phone && existing.phone !== phone) {
        return { error: 'An order history already exists for this email with a different phone number. Please contact customer support.' };
      }
      user = await prisma.user.update({
        where: { id: existing.id },
        data: {
          name,
          phone,
          password: hashPassword(password),
          role: existing.role || 'CUSTOMER',
        },
      });
    } else {
      // Create new customer
      user = await prisma.user.create({
        data: {
          email,
          name,
          phone,
          password: hashPassword(password),
          role: 'CUSTOMER',
        },
      });
    }

    // Automatically link any past guest orders with matching email
    await prisma.order.updateMany({
      where: {
        customerEmail: email,
        userId: null,
      },
      data: {
        userId: user.id,
      },
    });

    const session: CustomerSession = {
      id: user.id,
      email: user.email,
      name: user.name || 'Customer',
      phone: user.phone,
      role: user.role,
      walletBalance: user.walletBalance || 0,
      loyaltyPoints: user.loyaltyPoints || 0,
    };

    await setCustomerSession(session);

    revalidatePath('/');
    revalidatePath('/account');
    revalidatePath('/checkout');

    return {
      success: true,
      user: session,
      redirectUrl: data.redirectUrl || '/account',
    };
  } catch (err: any) {
    console.error('Registration error:', err);
    return { error: err.message || 'Registration failed. Please try again.' };
  }
}

// -------------------------------------------------------------
// 2. Customer Login Server Action
// -------------------------------------------------------------
export async function loginCustomerAction(data: {
  emailOrPhone: string;
  password: string;
  redirectUrl?: string;
}) {
  const identifier = data.emailOrPhone?.trim();
  const password = data.password;

  if (!identifier) return { error: 'Email or phone number is required.' };
  if (!password) return { error: 'Password is required.' };

  try {
    const isEmail = identifier.includes('@');
    const user = await prisma.user.findFirst({
      where: isEmail
        ? { email: identifier.toLowerCase() }
        : { phone: identifier },
    });

    if (!user || !user.password) {
      return { error: 'Invalid email/phone or password. Please check your credentials.' };
    }

    const isValid = verifyPassword(password, user.password);
    if (!isValid) {
      return { error: 'Invalid email/phone or password. Please check your credentials.' };
    }

    // Transparently upgrade legacy plaintext password to secure salted scrypt hash
    if (isValid && !user.password.includes(':')) {
      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashPassword(password) },
      });
    }

    if ((user as any).isActive === false) {
      return {
        error: 'Your account has been suspended by an administrator. Please contact customer support.',
      };
    }

    // Auto-link any past guest orders matching user email
    await prisma.order.updateMany({
      where: {
        customerEmail: user.email,
        userId: null,
      },
      data: {
        userId: user.id,
      },
    });

    const session: CustomerSession = {
      id: user.id,
      email: user.email,
      name: user.name || 'Customer',
      phone: user.phone,
      role: user.role,
      walletBalance: user.walletBalance || 0,
      loyaltyPoints: user.loyaltyPoints || 0,
    };

    await setCustomerSession(session);

    revalidatePath('/');
    revalidatePath('/account');
    revalidatePath('/checkout');

    return {
      success: true,
      user: session,
      redirectUrl: data.redirectUrl || '/account',
    };
  } catch (err: any) {
    console.error('Login error:', err);
    return { error: err.message || 'Login failed. Please try again.' };
  }
}

// -------------------------------------------------------------
// 3. Customer Logout Server Action
// -------------------------------------------------------------
export async function logoutCustomerAction() {
  await clearCustomerSession();
  revalidatePath('/');
  revalidatePath('/account');
  revalidatePath('/checkout');
  return { success: true };
}

// -------------------------------------------------------------
// 4. Update Profile & Security Server Action
// -------------------------------------------------------------
export async function updateCustomerProfileAction(data: {
  name?: string;
  phone?: string;
  currentPassword?: string;
  newPassword?: string;
}) {
  const currentSession = await getCustomerSession();
  if (!currentSession) {
    return { error: 'Unauthorized. Please sign in to update your profile.' };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: currentSession.id },
    });

    if (!user) return { error: 'User record not found.' };

    const updatePayload: any = {};

    if (data.name?.trim()) {
      updatePayload.name = data.name.trim();
    }

    if (data.phone?.trim()) {
      updatePayload.phone = data.phone.trim();
    }

    // Handle password change if requested
    if (data.newPassword) {
      if (!data.currentPassword) {
        return { error: 'Current password is required to set a new password.' };
      }
      if (!verifyPassword(data.currentPassword, user.password)) {
        return { error: 'Current password is incorrect.' };
      }
      if (data.newPassword.length < 6) {
        return { error: 'New password must be at least 6 characters.' };
      }
      updatePayload.password = hashPassword(data.newPassword);
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updatePayload,
    });

    const newSession: CustomerSession = {
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name || 'Customer',
      phone: updatedUser.phone,
      role: updatedUser.role,
      walletBalance: updatedUser.walletBalance || 0,
      loyaltyPoints: updatedUser.loyaltyPoints || 0,
    };

    await setCustomerSession(newSession);

    revalidatePath('/account');
    return { success: true, user: newSession };
  } catch (err: any) {
    console.error('Update profile error:', err);
    return { error: err.message || 'Failed to update profile.' };
  }
}

