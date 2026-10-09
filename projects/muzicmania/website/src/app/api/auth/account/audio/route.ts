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
  update(values: unknown): LooseQuery;
  eq(col: string, val: unknown): LooseQuery;
  maybeSingle(): PromiseLike<LooseResult>;
}
interface LooseClient { schema(s: string): { from(t: string): LooseQuery } }
const dbcOf = () => adminClient() as unknown as LooseClient;

const limiter = createRateLimiter({ windowMs: 60_000, max: 20 });

/** Preferencias de "Video y voz" (MuzicMania): volumen de música/efectos. */
const prefsSchema = z.object({
  musicVol: z.number().int().min(0).max(100).optional(),
  sfxVol: z.number().int().min(0).max(100).optional(),
});

type VideoVoice = { musicVol?: number; sfxVol?: number };

export async function GET(req: NextRequest) {
  const verification = await checkBotId();
  if (verification.isBot) return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  const user = await authenticate(req);
  if (!user) return NextResponse.json({ success: false, error: 'No autorizado.' }, { status: 401 });

  try {
    const dbc = dbcOf();
    const { data } = await dbc.schema('muzicmania').from('profiles').select('settings_controls').eq('id', user.userId).maybeSingle();
    const controls = ((data as { settings_controls?: Record<string, unknown> } | null)?.settings_controls ?? {}) as Record<string, unknown>;
    const vv = (controls.video_voice ?? {}) as VideoVoice;
    return NextResponse.json({ success: true, prefs: { musicVol: vv.musicVol ?? 100, sfxVol: vv.sfxVol ?? 100 } });
  } catch (err) {
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : 'Error interno.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const verification = await checkBotId();
  if (verification.isBot) return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  const user = await authenticate(req);
  if (!user) return NextResponse.json({ success: false, error: 'No autorizado.' }, { status: 401 });

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const rl = limiter.allow(ip);
  if (!rl.allowed) return NextResponse.json({ success: false, error: 'Demasiadas peticiones.' }, { status: 429 });

  const parsed = await parseJsonBody(req, prefsSchema);
  if (!parsed.success) return NextResponse.json({ success: false, error: firstZodMessage(parsed.error) }, { status: 400 });

  try {
    const dbc = dbcOf();
    const { data } = await dbc.schema('muzicmania').from('profiles').select('settings_controls').eq('id', user.userId).maybeSingle();
    const controls = ((data as { settings_controls?: Record<string, unknown> } | null)?.settings_controls ?? {}) as Record<string, unknown>;
    const prev = (controls.video_voice ?? {}) as VideoVoice;
    const videoVoice: VideoVoice = {
      musicVol: parsed.data.musicVol ?? prev.musicVol ?? 100,
      sfxVol: parsed.data.sfxVol ?? prev.sfxVol ?? 100,
    };
    const { error } = await dbc
      .schema('muzicmania')
      .from('profiles')
      .update({ settings_controls: { ...controls, video_voice: videoVoice } })
      .eq('id', user.userId);
    if (error) throw new Error(error.message);

    return NextResponse.json({ success: true, prefs: videoVoice });
  } catch (err) {
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : 'Error interno.' }, { status: 500 });
  }
}
