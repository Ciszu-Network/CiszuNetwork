import { NextRequest, NextResponse } from 'next/server';
import { checkBotId } from 'botid/server';
import { z } from 'zod';
import { createRateLimiter, parseJsonBody, firstZodMessage } from '@ciszunetwork/utils';
import { adminClient, authenticate } from '../../auth/2fa/_lib';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface LooseResult { data: unknown; error: { message: string } | null }
interface LooseQuery extends PromiseLike<LooseResult> {
  select(cols?: string): LooseQuery;
  insert(values: unknown): LooseQuery;
  eq(col: string, val: unknown): LooseQuery;
  gte(col: string, val: unknown): LooseQuery;
  order(col: string, opts?: unknown): LooseQuery;
  limit(n: number): LooseQuery;
  maybeSingle(): PromiseLike<LooseResult>;
}
interface LooseClient { schema(s: string): { from(t: string): LooseQuery } }
const dbcOf = () => adminClient() as unknown as LooseClient;

const limiter = createRateLimiter({ windowMs: 60_000, max: 6 });

/** Sanciones activas del usuario (anticheat + manuales) para elegir cuál apelar. */
export async function GET(req: NextRequest) {
  const verification = await checkBotId();
  if (verification.isBot) return NextResponse.json({ error: 'Access denied' }, { status: 403 });

  const user = await authenticate(req);
  if (!user) return NextResponse.json({ success: false, error: 'No autorizado.' }, { status: 401 });

  try {
    const dbc = dbcOf();
    const [{ data: ac }, { data: manual }] = await Promise.all([
      dbc.schema('anticheat').from('sanctions').select('id, type, reason, created_at, expires_at').eq('user_id', user.userId).order('created_at', { ascending: false }).limit(20),
      dbc.schema('public').from('sanctions').select('id, type, reason, created_at, expires_at').eq('user_id', user.userId).order('created_at', { ascending: false }).limit(20),
    ]);
    const now = Date.now();
    const active = (rows: unknown, source: 'anticheat' | 'manual') =>
      ((rows ?? []) as Array<Record<string, unknown>>)
        .filter((s) => !s.expires_at || Date.parse(String(s.expires_at)) > now)
        .map((s) => ({
          id: String(s.id), type: String(s.type), reason: String(s.reason), source,
          createdAt: String(s.created_at), expiresAt: (s.expires_at as string | null) ?? null,
        }));
    return NextResponse.json({ success: true, sanctions: [...active(ac, 'anticheat'), ...active(manual, 'manual')] });
  } catch (err) {
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : 'Error interno.' }, { status: 500 });
  }
}

const appealSchema = z.object({
  sanctionId: z.string().uuid().nullable().optional(),
  sanctionSource: z.enum(['anticheat', 'manual', 'other']),
  message: z.string().min(10).max(2000),
});

export async function POST(req: NextRequest) {
  const verification = await checkBotId();
  if (verification.isBot) return NextResponse.json({ error: 'Access denied' }, { status: 403 });

  const user = await authenticate(req);
  if (!user) return NextResponse.json({ success: false, error: 'No autorizado.' }, { status: 401 });

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const rl = limiter.allow(ip);
  if (!rl.allowed) {
    return NextResponse.json(
      { success: false, error: 'Demasiadas solicitudes. Inténtalo más tarde.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(rl.resetInMs / 1000)) } },
    );
  }

  const parsed = await parseJsonBody(req, appealSchema);
  if (!parsed.success) return NextResponse.json({ success: false, error: firstZodMessage(parsed.error) }, { status: 400 });
  const { sanctionId, sanctionSource, message } = parsed.data;
  const site = new URL(req.url).searchParams.get('site') || 'default';
  const dbc = dbcOf();

  try {
    // La sanción debe pertenecer al usuario (no se puede apelar la de otro).
    if (sanctionId && sanctionSource !== 'other') {
      const schemaName = sanctionSource === 'anticheat' ? 'anticheat' : 'public';
      const { data: row } = await dbc
        .schema(schemaName)
        .from('sanctions')
        .select('id')
        .eq('id', sanctionId)
        .eq('user_id', user.userId)
        .maybeSingle();
      if (!row) return NextResponse.json({ success: false, error: 'Sanción no encontrada.' }, { status: 404 });
    }

    const { error } = await dbc.schema('public').from('sanction_appeals').insert({
      user_id: user.userId,
      sanction_id: sanctionId ?? '00000000-0000-0000-0000-000000000000',
      sanction_source: sanctionSource === 'other' ? 'manual' : sanctionSource,
      website: site,
      message: message.trim(),
      status: 'open',
    });
    if (error) throw new Error(error.message);

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : 'Error interno.' }, { status: 500 });
  }
}
