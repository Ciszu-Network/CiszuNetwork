import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { createRateLimiter, parseJsonBody, firstZodMessage } from '@ciszunetwork/utils';
import { sendContactEmail } from '@/lib/contactMail';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const limiter = createRateLimiter({ windowMs: 60_000, max: 10 });
const schema = z.object({
  displayName: z.string().trim().max(120).optional().default(''),
  username: z.string().trim().max(80).optional().default(''),
  firstName: z.string().trim().max(80).optional().default(''),
  lastName: z.string().trim().max(80).optional().default(''),
  email: z.string().trim().email().max(254),
  region: z.string().trim().max(40).optional().default('ve'),
  contactType: z.string().trim().max(80).optional().default('Soporte Técnico General'),
  phone: z.string().trim().max(40).optional().default(''),
  device: z.string().trim().max(200).optional().default(''),
  category: z.string().trim().max(80).optional().default('Técnico'),
  subCategory: z.string().trim().max(80).optional().default('Performance'),
  message: z.string().trim().min(10).max(5000),
});

const URL_BASE = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://obwzzmbvkrcscqwptlqo.supabase.co';

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (!limiter.allow(ip).allowed) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
  }

  const token = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!token || !anonKey || !serviceKey) {
    return NextResponse.json({ error: 'no_auth' }, { status: 401 });
  }

  const authClient = createClient(URL_BASE, anonKey, { auth: { persistSession: false } });
  const { data: authData, error: authError } = await authClient.auth.getUser(token);
  if (authError || !authData.user) {
    return NextResponse.json({ error: 'no_auth' }, { status: 401 });
  }

  const parsed = await parseJsonBody(req, schema);
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid_body', issue: firstZodMessage(parsed.error) }, { status: 400 });
  }

  const admin = createClient(URL_BASE, serviceKey, { auth: { persistSession: false } });
  const { data, error } = await admin
    .schema('public')
    .from('ciszunetwork_tickets')
    .insert({
      user_id: authData.user.id,
      display_name: parsed.data.displayName,
      username: parsed.data.username,
      first_name: parsed.data.firstName,
      last_name: parsed.data.lastName,
      email: parsed.data.email,
      region: parsed.data.region,
      contact_type: parsed.data.contactType,
      phone: parsed.data.phone,
      device: parsed.data.device,
      category: parsed.data.category,
      sub_category: parsed.data.subCategory,
      message: parsed.data.message,
      status: 'pending',
    })
    .select('id')
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'db_error' }, { status: 500 });
  }

  const emailSent = await sendContactEmail({
    name: parsed.data.displayName || parsed.data.username || authData.user.email || 'Usuario',
    email: parsed.data.email,
    subject: `Ticket ${String(data.id).slice(0, 8).toUpperCase()} · ${parsed.data.contactType}`,
    message: parsed.data.message,
    source: 'support',
    ticketId: String(data.id),
  });

  return NextResponse.json({ ok: true, id: data.id, email_sent: emailSent });
}
