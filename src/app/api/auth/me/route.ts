import { NextResponse } from 'next/server';
import { getCustomerSession } from '@/lib/customer-auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getCustomerSession();
    if (!session) {
      return NextResponse.json({ authenticated: false, user: null });
    }
    return NextResponse.json({
      authenticated: true,
      user: session,
    });
  } catch (err: any) {
    return NextResponse.json({ authenticated: false, user: null, error: err.message }, { status: 500 });
  }
}

