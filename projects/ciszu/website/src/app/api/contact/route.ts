import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { createRateLimiter, parseJsonBody, firstZodMessage } from '@ciszunetwork/utils';
import { sendContactEmail } from '@/lib/contactMail';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const limiter = createRateLimiter({ windowMs: 60_000, max: 6 });
const schema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(254),
  subject: z.string().trim().min(3).max(160),
  message: z.string().trim().min(10).max(5000),
  website: z.string().max(0).optional(),
});

const URL_BASE = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://obwzzmbvkrcscqwptlqo.supabase.co';

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (!limiter.allow(ip).allowed) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
  }

  const parsed = await parseJsonBody(req, schema);
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid_body', issue: firstZodMessage(parsed.error) }, { status: 400 });
  }
  if (parsed.data.website) return NextResponse.json({ ok: true }, { status: 200 });

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    return NextResponse.json({ error: 'not_configured' }, { status: 500 });
  }

  let userId: string | null = null;
  const token = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (token && anonKey) {
    const authClient = createClient(URL_BASE, anonKey, { auth: { persistSession: false } });
    const { data } = await authClient.auth.getUser(token);
    userId = data.user?.id ?? null;
  }

  const admin = createClient(URL_BASE, serviceKey, { auth: { persistSession: false } });
  const { data, error } = await admin
    .schema('public')
    .from('contact_messages')
    .insert({
      user_id: userId,
      name: parsed.data.name,
      email: parsed.data.email,
      subject: parsed.data.subject,
      message: parsed.data.message,
      source: 'contact',
      status: 'new',
    })
    .select('id')
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'db_error' }, { status: 500 });
  }

  const emailSent = await sendContactEmail({
    name: parsed.data.name,
    email: parsed.data.email,
    subject: parsed.data.subject,
    message: parsed.data.message,
    source: 'contact',
  });

  return NextResponse.json({ ok: true, id: data.id, email_sent: emailSent });
}
