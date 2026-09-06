import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createRateLimiter } from '@ciszunetwork/utils';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const rateLimiter = createRateLimiter({ windowMs: 60_000, max: 5 });

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  if (!rateLimiter.allow(ip)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  try {
    const { userId, website, email } = await request.json();

    if (!userId || !website || !email) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const code = `C-${Math.floor(100 + Math.random() * 900)} ${Math.floor(100 + Math.random() * 900)}`;
    const expiresAt = new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString();

    const { error } = await supabase.from('two_factor_codes').insert({
      user_id: userId,
      website,
      code,
      expires_at: expiresAt,
    });

    if (error) throw error;

    // TODO: Send email with the code using Resend/Supabase email
    console.log(`[2FA] Code for ${email} on ${website}: ${code}`);

    return NextResponse.json({ success: true, message: 'Code sent' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
