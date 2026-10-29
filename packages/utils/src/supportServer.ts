import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { createRateLimiter } from './rateLimit';
import { SUPPORT_SITES, sendContactSupportEmails, type SupportSiteKey } from './contactSupport';

const URL_BASE = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://obwzzmbvkrcscqwptlqo.supabase.co';
const ACTIVE_STATUSES = new Set(['pending', 'open', 'in_progress']);
const LIMIT = 3;
const contactLimiter = createRateLimiter({ windowMs: 60_000, max: 6 });
const supportLimiter = createRateLimiter({ windowMs: 60_000, max: 10 });

const contactSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(254),
  subject: z.string().trim().min(3).max(160),
  message: z.string().trim().min(10).max(5000),
  website: z.string().max(0).optional(),
});

const supportSchema = z.object({
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

function ipOf(request: Request): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}

function formRows(data: Record<string, unknown>): Record<string, string> {
  return Object.fromEntries(Object.entries(data).map(([key, value]) => [key, String(value ?? '')]));
}

async function optionalUser(request: Request): Promise<{ id?: string; email?: string } | undefined> {
  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!token || !anonKey) return undefined;
  const auth = createClient(URL_BASE, anonKey, { auth: { persistSession: false } });
  const { data } = await auth.auth.getUser(token);
  return data.user ? { id: data.user.id, email: data.user.email ?? undefined } : undefined;
}

export async function processContact(request: Request, site: SupportSiteKey): Promise<Response> {
  if (!contactLimiter.allow(ipOf(request)).allowed) return json({ error: 'rate_limited' }, 429);
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return json({ error: 'invalid_body' }, 400);
  }
  const parsed = contactSchema.safeParse(raw);
  if (!parsed.success) return json({ error: 'invalid_body', issue: parsed.error.issues[0]?.message }, 400);
  if (parsed.data.website) return json({ ok: true });

  const user = await optionalUser(request);
  const result = await sendContactSupportEmails({
    site,
    source: 'contact',
    name: parsed.data.name,
    email: parsed.data.email,
    subject: parsed.data.subject,
    message: parsed.data.message,
    form: formRows(parsed.data),
    ticketId: `CONTACTO-${Date.now().toString(36).toUpperCase()}`,
    user,
  });
  return json({ ok: true, email_sent: result.internal, receipt_sent: result.receipt });
}

export async function processSupport(request: Request, site: SupportSiteKey): Promise<Response> {
  if (!supportLimiter.allow(ipOf(request)).allowed) return json({ error: 'rate_limited' }, 429);
  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!token || !anonKey || !serviceKey) return json({ error: 'no_auth' }, 401);

  const auth = createClient(URL_BASE, anonKey, { auth: { persistSession: false } });
  const { data: authData, error: authError } = await auth.auth.getUser(token);
  if (authError || !authData.user) return json({ error: 'no_auth' }, 401);

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return json({ error: 'invalid_body' }, 400);
  }
  const parsed = supportSchema.safeParse(raw);
  if (!parsed.success) return json({ error: 'invalid_body', issue: parsed.error.issues[0]?.message }, 400);

  const config = SUPPORT_SITES[site];
  const admin = createClient(URL_BASE, serviceKey, { auth: { persistSession: false } });
  const table = admin.schema(config.schema).from(config.table);

  const existing = await table.select('status').eq('user_id', authData.user.id);
  if (existing.error) return json({ error: 'db_error' }, 500);
  const active = (existing.data ?? []).filter((row: { status?: string | null }) => ACTIVE_STATUSES.has(String(row.status ?? '')));
  if (active.length >= LIMIT) return json({ error: 'ticket_limit', limit: LIMIT }, 409);

  let profile: { username?: string; display_name?: string } | null = null;
  try {
    const profileRes = await admin
      .schema(config.profileSchema)
      .from('profiles')
      .select('username, display_name')
      .eq('id', authData.user.id)
      .maybeSingle();
    profile = (profileRes.data as { username?: string; display_name?: string } | null) ?? null;
  } catch {
    profile = null;
  }

  const inserted = await table
    .insert({
      user_id: authData.user.id,
      display_name: parsed.data.displayName || profile?.display_name || '',
      username: parsed.data.username || profile?.username || '',
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
    .select('id, created_at')
    .single();

  if (inserted.error || !inserted.data) return json({ error: 'db_error' }, 500);

  const id = String(inserted.data.id);
  const ticketId = `${config.prefix}-${id.slice(0, 8).toUpperCase()}`;
  const result = await sendContactSupportEmails({
    site,
    source: 'support',
    name: parsed.data.displayName || profile?.display_name || parsed.data.username || 'Usuario',
    email: parsed.data.email,
    subject: `${parsed.data.contactType} · ${parsed.data.category}/${parsed.data.subCategory}`,
    message: parsed.data.message,
    form: formRows(parsed.data),
    ticketId,
    user: {
      id: authData.user.id,
      email: authData.user.email ?? undefined,
      username: profile?.username,
      displayName: profile?.display_name,
    },
    activeTickets: active.length,
    ticketLimit: LIMIT,
    ticketIndex: active.length + 1,
  });

  return json({ ok: true, id: ticketId, email_sent: result.internal, receipt_sent: result.receipt });
}
