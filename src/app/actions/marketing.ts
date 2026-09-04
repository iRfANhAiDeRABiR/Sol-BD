'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function subscribeNewsletterAction(email: string) {
  try {
    const trimmed = (email || '').trim().toLowerCase();
    if (!trimmed || !trimmed.includes('@')) {
      return { error: 'Please provide a valid email address.' };
    }

    await prisma.subscriber.upsert({
      where: { email: trimmed },
      create: {
        email: trimmed,
        source: 'home_exclusive_deals',
        isActive: true,
      },
      update: {
        isActive: true,
      },
    });

    try {
      revalidatePath('/admin/customers');
    } catch {}

    return {
      success: true,
      message: 'Thank you for subscribing! Your 10% discount coupon is WELCOME10.',
    };
  } catch (err: any) {
    console.error('Newsletter subscribe error:', err);
    return { error: err.message || 'Failed to subscribe. Please try again.' };
  }
}

export async function submitContactMessageAction(data: {
  name: string;
  email: string;
  subject?: string;
  message: string;
}) {
  try {
    const name = (data.name || '').trim();
    const email = (data.email || '').trim().toLowerCase();
    const subject = (data.subject || 'General Inquiry').trim();
    const message = (data.message || '').trim();

    if (!name) {
      return { error: 'Please enter your name.' };
    }
    if (!email || !email.includes('@')) {
      return { error: 'Please enter a valid email address.' };
    }
    if (!message) {
      return { error: 'Please write your message.' };
    }

    try {
      await (prisma as any).contactMessage.create({
        data: {
          name,
          email,
          subject,
          message,
          status: 'UNREAD',
        },
      });
    } catch (dbErr) {
      console.warn('ContactMessage create fallback:', dbErr);
    }

    return {
      success: true,
      message: 'Thank you! Your message has been sent. We will get back to you shortly.',
    };
  } catch (err: any) {
    console.error('Contact form submission error:', err);
    return { error: err.message || 'Failed to send message. Please try again.' };
  }
}

