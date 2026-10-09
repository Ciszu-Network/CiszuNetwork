import { NextRequest, NextResponse } from 'next/server';
import { checkBotId } from 'botid/server';
import { createRateLimiter } from '@ciszunetwork/utils';
import { adminClient } from '../../auth/2fa/_lib';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const limiter = createRateLimiter({ windowMs: 60_000, max: 10 });
const LANGS = ['es-latam', 'es-es', 'en-us', 'en-uk'] as const;

type Lang = (typeof LANGS)[number];

interface LooseResult { data: unknown; error: { message: string } | null }
interface LooseQuery extends PromiseLike<LooseResult> {
  select(cols?: string): LooseQuery;
  update(values: unknown): LooseQuery;
  eq(col: string, val: unknown): LooseQuery;
  maybeSingle(): PromiseLike<LooseResult>;
}
interface LooseClient { schema(s: string): { from(t: string): LooseQuery } }

function toEnGb(text: string): string {
  const map: Array<[RegExp, string]> = [
    [/\borganiz(e|ed|es|ing|ation)\b/gi, 'organis$1'],
    [/\bcolor(s?)\b/gi, 'colour$1'],
    [/\bcenter\b/gi, 'centre'],
    [/\bbehavior(s?)\b/gi, 'behaviour$1'],
    [/\btheater(s?)\b/gi, 'theatre$1'],
    [/\bcatalog(s?)\b/gi, 'catalogue$1'],
    [/\bfulfill(ed|ing|s|ment)?\b/gi, 'fulfil$1'],
  ];
  let out = text;
  for (const [re, rep] of map) out = out.replace(re, rep);
  return out;
}

async function translateEsToEn(text: string): Promise<string | null> {
  try {
    const r = await fetch(
      'https://api.mymemory.translated.net/get?q=' + encodeURIComponent(text) + '&langpair=es|en',
      { signal: AbortSignal.timeout(10_000) },
    );
    if (!r.ok) return null;
    const j = (await r.json()) as { responseData?: { translatedText?: string } };
    const t = j?.responseData?.translatedText;
    return typeof t === 'string' && t && !/QUERY LENGTH LIMIT/i.test(t) ? t : null;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const verification = await checkBotId();
  if (verification.isBot) return NextResponse.json({ error: 'Access denied' }, { status: 403 });

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const rl = limiter.allow(ip);
  if (!rl.allowed) return NextResponse.json({ success: false, error: 'Demasiadas peticiones.' }, { status: 429 });

  try {
    const body = (await req.json().catch(() => ({}))) as { id?: unknown; lang?: unknown };
    const id = Number(body.id);
    const lang = String(body.lang ?? '') as Lang;
    if (!Number.isInteger(id) || id <= 0 || !LANGS.includes(lang)) {
      return NextResponse.json({ success: false, error: 'Parámetros inválidos.' }, { status: 400 });
    }

    const dbc = adminClient() as unknown as LooseClient;
    const { data, error } = await dbc
      .schema('ciszunetwork')
      .from('global_disclaimers')
      .select('id,message,message_i18n')
      .eq('id', id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    const row = data as { id: number; message: string; message_i18n: Record<string, string> | null } | null;
    if (!row) return NextResponse.json({ success: false, error: 'No existe.' }, { status: 404 });

    const map: Record<string, string> = row.message_i18n && typeof row.message_i18n === 'object' ? { ...row.message_i18n } : {};
    if (map[lang]) return NextResponse.json({ success: true, text: map[lang], cached: true });
    if (lang.startsWith('es')) return NextResponse.json({ success: true, text: map['es-latam'] ?? row.message, cached: false });

    const en = map['en-us'] ?? (await translateEsToEn(row.message));
    if (!en) return NextResponse.json({ success: false, error: 'Traducción no disponible.' }, { status: 502 });
    if (!map['es-latam']) map['es-latam'] = row.message;
    if (!map['en-us']) map['en-us'] = en;
    if (!map['en-uk']) map['en-uk'] = toEnGb(en);

    const { error: upErr } = await dbc
      .schema('ciszunetwork')
      .from('global_disclaimers')
      .update({ message_i18n: map })
      .eq('id', id);
    if (upErr) throw new Error(upErr.message);

    return NextResponse.json({ success: true, text: map[lang], cached: false });
  } catch (err) {
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : 'Error interno.' }, { status: 500 });
  }
}
