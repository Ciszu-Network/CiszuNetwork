import { NextRequest, NextResponse } from 'next/server';
import { createHmac, timingSafeEqual } from 'crypto';
import { createRateLimiter } from '@ciszunetwork/utils';
import { adminClient } from '../../auth/2fa/_lib';
import { launcherSecret } from '../_lib';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const limiter = createRateLimiter({ windowMs: 60_000, max: 60 });
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const KINDS = new Set(['system', 'security', 'social', 'achievement', 'friend', 'commerce', 'support']);

function verifyLauncherToken(request: Request): string | null {
  const header = request.headers.get('authorization');
  if (!header?.startsWith('Bearer ')) return null;
  const parts = header.slice('Bearer '.length).trim().split('.');
  if (parts.length !== 3) return null;
  const [userId, expText, signature] = parts;
  if (!UUID.test(userId)) return null;
  const exp = Number(expText);
  if (!Number.isFinite(exp) || exp < Date.now()) return null;

  const secret = launcherSecret();
  if (!secret) return null;
  const expected = createHmac('sha256', secret)
    .update(`launcher-notifications:${userId}:${exp}`)
    .digest('base64url');
  const given = Buffer.from(signature);
  const wanted = Buffer.from(expected);
  if (given.length !== wanted.length || !timingSafeEqual(given, wanted)) return null;
  return userId;
}

function clientIp(request: Request) {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
}

export async function GET(request: NextRequest) {
  const userId = verifyLauncherToken(request);
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const rl = limiter.allow(clientIp(request));
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'rate_limited' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(rl.resetInMs / 1000)) } },
    );
  }

  const sp = request.nextUrl.searchParams;
  const limit = Math.min(100, Math.max(1, Number(sp.get('limit') ?? '50') || 50));
  const kind = sp.get('kind') ?? 'all';
  const search = (sp.get('search') ?? '').trim().slice(0, 80);
  const admin = adminClient() as any;

  let query = admin.schema('muzicmania').from('notifications')
    .select('id,kind,title,body,href,metadata,read_at,created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (kind !== 'all' && KINDS.has(kind)) query = query.eq('kind', kind);
  if (search) {
    const safe = search.replace(/[%_(),]/g, ' ');
    query = query.or(`title.ilike.%${safe}%,body.ilike.%${safe}%`);
  }

  const [{ data, error }, unread] = await Promise.all([
    query,
    admin.schema('muzicmania').from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .is('read_at', null),
  ]);
  if (error) return NextResponse.json({ error: 'notifications_load_failed' }, { status: 500 });

  return NextResponse.json(
    { notifications: data ?? [], unread: unread.count ?? 0 },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}

export async function PATCH(request: NextRequest) {
  const userId = verifyLauncherToken(request);
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const rl = limiter.allow(clientIp(request));
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'rate_limited' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(rl.resetInMs / 1000)) } },
    );
  }

  const body = await request.json().catch(() => null);
  const ids = Array.isArray(body?.ids)
    ? body.ids.filter((id: unknown): id is string => typeof id === 'string' && UUID.test(id)).slice(0, 100)
    : [];
  const all = body?.all === true;
  if (!all && !ids.length) return NextResponse.json({ error: 'ids_required' }, { status: 400 });

  const admin = adminClient() as any;
  let query = admin.schema('muzicmania').from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('user_id', userId)
    .is('read_at', null);
  if (!all) query = query.in('id', ids);
  const { error } = await query;
  if (error) return NextResponse.json({ error: 'notifications_update_failed' }, { status: 500 });
  return NextResponse.json({ ok: true });
}
