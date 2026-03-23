import { NextResponse } from 'next/server';
import { getAuthenticatedClient } from '@/lib/supabase/auth-helpers';
import crypto from 'crypto';

export async function POST(req: Request) {
  const { supabase, user } = await getAuthenticatedClient();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  if (!process.env.RAZORPAY_KEY_SECRET) {
    return NextResponse.json({ error: 'Payment not configured' }, { status: 503 });
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan } = await req.json();

  // Verify signature
  const body = razorpay_order_id + '|' + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');

  if (expectedSignature !== razorpay_signature) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // Update profile subscription status
  await supabase
    .from('profiles')
    .update({
      subscription_status: 'active',
    })
    .eq('id', user.id);

  return NextResponse.json({ success: true });
}
