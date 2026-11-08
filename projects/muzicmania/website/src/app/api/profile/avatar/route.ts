import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createRateLimiter } from '@ciszunetwork/utils';
import { adminClient, authenticate } from '../../auth/2fa/_lib';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const limiter = createRateLimiter({ windowMs: 60_000, max: 10 });
const TYPES: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };

export async function POST(req: NextRequest) {
  const user = await authenticate(req);
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (!limiter.allow(ip).allowed) return NextResponse.json({ error: 'rate_limited' }, { status: 429 });

  const form = await req.formData().catch(() => null);
  const file = form?.get('file');
  if (!(file instanceof File)) return NextResponse.json({ error: 'file_required' }, { status: 400 });
  if (!TYPES[file.type]) return NextResponse.json({ error: 'invalid_file_type' }, { status: 400 });
  if (file.size <= 0 || file.size > 5 * 1024 * 1024) return NextResponse.json({ error: 'invalid_file_size' }, { status: 400 });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !service) return NextResponse.json({ error: 'storage_unavailable' }, { status: 500 });
  const storage = createClient(url, service);
  const path = `${user.userId}/${Date.now()}.${TYPES[file.type]}`;
  const { error: uploadError } = await storage.storage.from('avatars').upload(path, await file.arrayBuffer(), {
    contentType: file.type,
    upsert: true,
  });
  if (uploadError) return NextResponse.json({ error: 'upload_failed' }, { status: 500 });
  const { data } = storage.storage.from('avatars').getPublicUrl(path);
  const avatarUrl = data.publicUrl;

  const admin = adminClient() as any;
  const { error } = await admin.schema('muzicmania').from('profiles').update({ avatar_url: avatarUrl }).eq('id', user.userId);
  if (error) return NextResponse.json({ error: 'profile_update_failed' }, { status: 500 });
  return NextResponse.json({ avatar_url: avatarUrl });
}
