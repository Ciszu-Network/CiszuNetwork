import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { parseJsonBody } from '@ciszunetwork/utils';
import { adminClient, authenticate } from '../auth/2fa/_lib';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const patchSchema = z.object({
  ids: z.array(z.string().uuid()).max(100).optional(),
  all: z.boolean().optional(),
});

export async function GET(req: NextRequest) {
  const user = await authenticate(req);
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const sp = req.nextUrl.searchParams;
  const limit = Math.min(100, Math.max(1, Number(sp.get('limit') ?? '50') || 50));
  const kind = sp.get('kind') ?? 'all';
  const search = (sp.get('search') ?? '').trim().slice(0, 80);
  const admin = adminClient() as any;

  let query = admin.schema('muzicmania').from('notifications')
    .select('id,kind,title,body,href,metadata,read_at,created_at')
    .eq('user_id', user.userId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (kind !== 'all' && ['system', 'security', 'social', 'achievement', 'friend', 'commerce', 'support'].includes(kind)) {
    query = query.eq('kind', kind);
  }
  if (search) {
    query = query.or(`title.ilike.%${search.replace(/[%_(),]/g, ' ')}%,body.ilike.%${search.replace(/[%_(),]/g, ' ')}%`);
  }
  const [{ data, error }, unread, friends] = await Promise.all([
    query,
    admin.schema('muzicmania').from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.userId)
      .is('read_at', null),
    admin.schema('muzicmania').from('friend_requests')
      .select('id,sender_id,status,created_at')
      .eq('recipient_id', user.userId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(20),
  ]);
  if (error) return NextResponse.json({ error: 'notifications_load_failed' }, { status: 500 });

  const requests = friends.data ?? [];
  let profiles: Record<string, { username: string; display_name: string; avatar_url: string | null }> = {};
  if (requests.length) {
    const ids = Array.from(new Set(requests.map((row: any) => row.sender_id)));
    const { data: people } = await admin.schema('muzicmania').from('profiles')
      .select('id,username,display_name,avatar_url')
      .in('id', ids);
    profiles = Object.fromEntries((people ?? []).map((person: any) => [person.id, person]));
  }

  return NextResponse.json({
    notifications: data ?? [],
    unread: unread.count ?? 0,
    friendRequests: requests.map((request: any) => ({ ...request, sender: profiles[request.sender_id] ?? null })),
  }, { headers: { 'Cache-Control': 'no-store' } });
}

export async function PATCH(req: NextRequest) {
  const user = await authenticate(req);
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const parsed = await parseJsonBody(req, patchSchema);
  if (!parsed.success) return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  const admin = adminClient() as any;
  let query = admin.schema('muzicmania').from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('user_id', user.userId)
    .is('read_at', null);
  if (!parsed.data.all) {
    if (!parsed.data.ids?.length) return NextResponse.json({ error: 'ids_required' }, { status: 400 });
    query = query.in('id', parsed.data.ids);
  }
  const { error } = await query;
  if (error) return NextResponse.json({ error: 'notifications_update_failed' }, { status: 500 });
  return NextResponse.json({ ok: true });
}
