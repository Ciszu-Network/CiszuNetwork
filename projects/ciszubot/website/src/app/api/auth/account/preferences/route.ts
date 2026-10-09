import { NextResponse } from 'next/server';
import { createRateLimiter } from '@ciszunetwork/utils';
import { checkBotId } from 'botid/server';
import { adminClient, authenticate } from '../../2fa/_lib';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const limiter = createRateLimiter({ windowMs: 60_000, max: 20 });

const KEYS = [
  'sponsorship_enabled',
  'account_alerts_enabled',
  'site_notifications_enabled',
  'newsletter_enabled',
  'sms_enabled',
] as const;

type PreferenceKey = (typeof KEYS)[number];

/** GET: devuelve las preferencias de notificación del usuario (defaults si no existen). */
export async function GET(request: Request) {
  const verification = await checkBotId();
  if (verification.isBot) return NextResponse.json({ error: 'Access denied' }, { status: 403 });

  const user = await authenticate(request);
  if (!user) return NextResponse.json({ success: false, error: 'No autorizado.' }, { status: 401 });

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const rl = limiter.allow(ip);
  if (!rl.allowed) {
    return NextResponse.json(
      { success: false, error: 'Demasiadas peticiones. Espera un minuto.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(rl.resetInMs / 1000)) } },
    );
  }

  try {
    const admin = adminClient();
    const { data, error } = await admin
      .schema('public')
      .from('notification_preferences')
      .select('*')
      .eq('user_id', user.userId)
      .maybeSingle();

    if (error) throw error;

    const prefs = data ?? {
      sponsorship_enabled: false,
      account_alerts_enabled: true,
      site_notifications_enabled: true,
      newsletter_enabled: false,
      sms_enabled: false,
    };

    return NextResponse.json({ success: true, preferences: prefs });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Error interno.' },
      { status: 500 },
    );
  }
}

/** POST: actualiza las preferencias (solo campos permitidos). */
export async function POST(request: Request) {
  const verification = await checkBotId();
  if (verification.isBot) return NextResponse.json({ error: 'Access denied' }, { status: 403 });

  const user = await authenticate(request);
  if (!user) return NextResponse.json({ success: false, error: 'No autorizado.' }, { status: 401 });

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const rl = limiter.allow(ip);
  if (!rl.allowed) {
    return NextResponse.json(
      { success: false, error: 'Demasiadas peticiones. Espera un minuto.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(rl.resetInMs / 1000)) } },
    );
  }

  try {
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;

    const patch: Partial<Record<PreferenceKey, boolean>> = {};
    for (const key of KEYS) {
      const value = body[key];
      if (typeof value === 'boolean') patch[key] = value;
    }
    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ success: false, error: 'Sin campos válidos.' }, { status: 400 });
    }

    const admin = adminClient();
    const { data, error } = await admin
      .schema('public')
      .from('notification_preferences')
      .upsert({ user_id: user.userId, ...patch }, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, preferences: data });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Error interno.' },
      { status: 500 },
    );
  }
}