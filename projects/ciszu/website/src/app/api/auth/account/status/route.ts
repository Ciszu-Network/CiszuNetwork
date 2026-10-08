import { NextRequest, NextResponse } from 'next/server';
import { checkBotId } from 'botid/server';
import { z } from 'zod';
import { createRateLimiter, parseJsonBody, firstZodMessage } from '@ciszunetwork/utils';
import { adminClient, authenticate } from '../../2fa/_lib';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface LooseResult { data: unknown; error: { message: string } | null }
interface LooseQuery extends PromiseLike<LooseResult> {
  select(cols?: string): LooseQuery;
  insert(values: unknown): LooseQuery;
  upsert(values: unknown, opts?: unknown): LooseQuery;
  eq(col: string, val: unknown): LooseQuery;
  gte(col: string, val: unknown): LooseQuery;
  order(col: string, opts?: unknown): LooseQuery;
  limit(n: number): LooseQuery;
  maybeSingle(): PromiseLike<LooseResult>;
  single(): PromiseLike<LooseResult>;
}
interface LooseClient { schema(s: string): { from(t: string): LooseQuery } }
const dbcOf = () => adminClient() as unknown as LooseClient;

const limiter = createRateLimiter({ windowMs: 60_000, max: 30 });

/** Tareas del "roadmap" por web (lo que falta configurar). */
const ROADMAP: Record<string, Array<{ key: string; title: string; detail: string; level: 'info' | 'recommendation' }>> = {
  default: [
    { key: 'verify-email', title: 'Correo verificado', detail: 'Tu correo está confirmado en la cuenta.', level: 'info' },
    { key: 'enable-otp', title: 'Activa la verificación en dos pasos (OTP)', detail: 'Protege tu cuenta con un código temporal al iniciar sesión.', level: 'recommendation' },
    { key: 'remember-session', title: 'Recuerda tu sesión', detail: 'Mantén la sesión en este dispositivo para no perderla al apagarlo.', level: 'recommendation' },
    { key: 'review-notifications', title: 'Revisa tus notificaciones', detail: 'Elige qué correos quieres recibir (patrocinios, avisos, noticias).', level: 'recommendation' },
    { key: 'profile-privacy', title: 'Configura tu privacidad', detail: 'Decide quién puede ver tu perfil y tus datos.', level: 'recommendation' },
  ],
};
const roadmapFor = (site: string) => ROADMAP[site] ?? ROADMAP.default;

interface StatusItem {
  key: string;
  title: string;
  detail: string | null;
  status: 'pending' | 'done' | 'ignored';
  level: 'info' | 'recommendation' | 'warning' | 'sanction' | 'critical';
}

export async function GET(req: NextRequest) {
  const verification = await checkBotId();
  if (verification.isBot) return NextResponse.json({ error: 'Access denied' }, { status: 403 });

  const user = await authenticate(req);
  if (!user) return NextResponse.json({ success: false, error: 'No autorizado.' }, { status: 401 });

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const rl = limiter.allow(ip);
  if (!rl.allowed) {
    return NextResponse.json({ success: false, error: 'Demasiadas peticiones.' }, { status: 429 });
  }

  const site = new URL(req.url).searchParams.get('site') || 'default';
  const dbc = dbcOf();

  try {
    // Sanciones activas: anticheat (automáticas) + public.sanctions (manuales).
    const [{ data: acSanctions }, { data: manualSanctions }, { data: strikesRaw }, { data: itemsRaw }, { data: deletions }] =
      await Promise.all([
        dbc.schema('anticheat').from('sanctions').select('id, type, reason, created_at, expires_at, appealed, issued_by').eq('user_id', user.userId).order('created_at', { ascending: false }).limit(30),
        dbc.schema('public').from('sanctions').select('id, type, scope, reason, created_at, expires_at').eq('user_id', user.userId).order('created_at', { ascending: false }).limit(30),
        dbc.schema('anticheat').from('strikes').select('idx, reason, created_at, expires_at').eq('user_id', user.userId).gte('expires_at', new Date().toISOString()),
        dbc.schema('public').from('account_status_items').select('key, title, detail, status, level').eq('user_id', user.userId).eq('website', site),
        dbc.schema('public').from('account_deletions').select('status, expires_at').eq('user_id', user.userId).maybeSingle(),
      ]);

    const now = Date.now();
    const isActive = (s: { expires_at?: string | null }) => !s.expires_at || Date.parse(String(s.expires_at)) > now;
    const ac = ((acSanctions ?? []) as Array<Record<string, unknown>>).filter(isActive).map((s) => ({
      id: String(s.id), type: String(s.type), reason: String(s.reason), source: 'anticheat' as const,
      createdAt: String(s.created_at), expiresAt: (s.expires_at as string | null) ?? null,
      appealable: String(s.type) !== 'delete',
    }));
    const manual = ((manualSanctions ?? []) as Array<Record<string, unknown>>).filter(isActive).map((s) => ({
      id: String(s.id), type: String(s.type), reason: String(s.reason), source: 'manual' as const,
      createdAt: String(s.created_at), expiresAt: (s.expires_at as string | null) ?? null,
      appealable: String(s.type) !== 'delete',
    }));
    const sanctions = [...ac, ...manual];
    const strikes = ((strikesRaw ?? []) as Array<Record<string, unknown>>).map((s) => Number(s.idx));

    const deletion = (deletions ?? null) as { status?: string; expires_at?: string } | null;
    const isDeletionPending = deletion?.status === 'pending';
    const isDeleted = deletion?.status === 'deleted' || deletion?.status === 'completed';

    const stored = new Map<string, StatusItem>();
    for (const it of ((itemsRaw ?? []) as Array<Record<string, unknown>>)) {
      stored.set(String(it.key), {
        key: String(it.key), title: String(it.title), detail: (it.detail as string | null) ?? null,
        status: String(it.status) as StatusItem['status'], level: String(it.level) as StatusItem['level'],
      });
    }

    // Roadmap: tareas estáticas + estado guardado (hecho/ignorado) + sanciones.
    const roadmap: StatusItem[] = roadmapFor(site).map((t) => stored.get(t.key) ?? { ...t, status: 'pending' });
    const sanctionItems = Array.from(stored.values()).filter((i) => i.level === 'sanction' || i.level === 'critical');

    // Color del estado.
    let color: 'green' | 'yellow' | 'red' | 'minimal' | 'deleted' = 'green';
    if (isDeleted) color = 'deleted';
    else if (isDeletionPending) color = 'minimal';
    else if (sanctions.length > 0 || strikes.length > 0 || sanctionItems.length > 0) color = 'red';
    else if (roadmap.some((i) => i.status === 'pending' && i.level === 'recommendation')) color = 'yellow';

    const nextStrikeExpiry = ((strikesRaw ?? []) as Array<Record<string, unknown>>)
      .map((s) => String(s.expires_at))
      .sort()[0] ?? null;

    return NextResponse.json({
      success: true,
      status: {
        color,
        sanctions,
        strikes: { count: strikes.length, max: 3, nextExpiry: nextStrikeExpiry },
        roadmap,
        history: sanctions, // actuales (el histórico completo se sirve bajo demanda en rojo)
        appealUrl: '/appeal',
        deletionPending: isDeletionPending,
        deleted: isDeleted,
      },
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : 'Error interno.' }, { status: 500 });
  }
}

const patchSchema = z.object({
  key: z.string().min(1).max(64),
  status: z.enum(['done', 'ignored', 'pending']),
  title: z.string().min(1).max(120).optional(),
  level: z.enum(['info', 'recommendation', 'warning', 'sanction', 'critical']).optional(),
  detail: z.string().max(500).optional(),
});

export async function POST(req: NextRequest) {
  const verification = await checkBotId();
  if (verification.isBot) return NextResponse.json({ error: 'Access denied' }, { status: 403 });

  const user = await authenticate(req);
  if (!user) return NextResponse.json({ success: false, error: 'No autorizado.' }, { status: 401 });

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const rl = limiter.allow(ip);
  if (!rl.allowed) return NextResponse.json({ success: false, error: 'Demasiadas peticiones.' }, { status: 429 });

  const parsed = await parseJsonBody(req, patchSchema);
  if (!parsed.success) return NextResponse.json({ success: false, error: firstZodMessage(parsed.error) }, { status: 400 });

  const site = new URL(req.url).searchParams.get('site') || 'default';
  const { key, status, title, level, detail } = parsed.data;

  try {
    const dbc = dbcOf();
    await dbc.schema('public').from('account_status_items').upsert(
      {
        user_id: user.userId,
        website: site,
        key,
        status,
        title: title ?? key,
        detail: detail ?? null,
        level: level ?? 'recommendation',
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,website,key' },
    );
    return NextResponse.json({ success: true, key, status });
  } catch (err) {
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : 'Error interno.' }, { status: 500 });
  }
}
