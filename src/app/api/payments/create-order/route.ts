import { NextResponse } from 'next/server';
import { getAuthenticatedClient } from '@/lib/supabase/auth-helpers';
import Razorpay from 'razorpay';

const PLANS: Record<string, { amount: number; currency: string; name: string }> = {
  pro: { amount: 149900, currency: 'INR', name: 'Pro Plan' },
  team: { amount: 399900, currency: 'INR', name: 'Team Plan' },
};

export async function POST(req: Request) {
  const { user } = await getAuthenticatedClient();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    return NextResponse.json({ error: 'Payment not configured yet' }, { status: 503 });
  }

  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

  const { plan } = await req.json();
  const planConfig = PLANS[plan as string];
  if (!planConfig) return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });

  try {
    const order = await razorpay.orders.create({
      amount: planConfig.amount,
      currency: planConfig.currency,
      receipt: `${user.id}-${plan}-${Date.now()}`,
      notes: { userId: user.id, plan },
    });

    return NextResponse.json({
      orderId: order.id,
      amount: planConfig.amount,
      currency: planConfig.currency,
    });
  } catch (error) {
    console.error('Razorpay order creation failed:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
