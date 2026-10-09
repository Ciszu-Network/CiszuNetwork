import { NextRequest, NextResponse } from 'next/server';
import { checkBotId } from 'botid/server';
import { z } from 'zod';
import {
  createRateLimiter,
  parseJsonBody,
  firstZodMessage,
  MUZICMANIA_PROFILE,
  buildMuzicmaniaSignals,
  evaluate,
  accountWarningEmail,
  sendBrandedEmail,
  sendSms,
  type MuzicScoreSample,
} from '@ciszunetwork/utils';
import { adminClient, authenticate } from '../../auth/2fa/_lib';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Cliente laxo: el tipo mínimo de `_lib` no declara `.schema()` ni el resto de
 * la superficie de postgrest-js que sí existe en runtime (service_role).
 */
interface LooseResult {
  data: unknown;
  error: { message: string } | null;
}
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
interface LooseClient {
  schema(s: string): { from(t: string): LooseQuery };
}
const admin = (): LooseClient => adminClient() as unknown as LooseClient;

const limiter = createRateLimiter({ windowMs: 60_000, max: 40 });

const bodySchema = z.object({
  trackId: z.string().min(1).max(64),
  score: z.number().int().min(0).max(100_000_000),
  // Se aceptan fuera de rango a propósito: el anticheat debe VER la manipulación.
  accuracy: z.number().min(-1000).max(1000),
  maxCombo: z.number().int().min(0).max(10_000_000),
  difficulty: z.string().max(32).optional().nullable(),
});

/**
 * Ciszu Anti-Cheat — ingesta de señales de MuzicMania.
 *
 * El cliente envía SOLO la partida (no señales: no se confía en él). El servidor
 * reconstruye el histórico, construye las señales, evalúa con el motor
 * (invisible hasta el umbral) y, SOLO al escalar, crea la sanción escalonada.
 * Ver ANTICHEAT_SYSTEM.md.
 */
export async function POST(req: NextRequest) {
  const verification = await checkBotId();
  if (verification.isBot) return NextResponse.json({ error: 'Access denied' }, { status: 403 });

  const user = await authenticate(req);
  if (!user) return NextResponse.json({ success: false, error: 'No autorizado.' }, { status: 401 });

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const rl = limiter.allow(ip);
  if (!rl.allowed) {
    return NextResponse.json(
      { success: false, error: 'Demasiadas peticiones.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(rl.resetInMs / 1000)) } },
    );
  }

  const parsed = await parseJsonBody(req, bodySchema);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: firstZodMessage(parsed.error) }, { status: 400 });
  }
  const entry = parsed.data;

  try {
    const dbc = admin();

    // 1) Histórico reciente del jugador (no se confía en el cliente).
    const { data: rows } = await dbc
      .schema('muzicmania')
      .from('scores')
      .select('track_id, score, accuracy, max_combo, difficulty, created_at')
      .eq('user_id', user.userId)
      .order('created_at', { ascending: false })
      .limit(10);

    const history: MuzicScoreSample[] = ((rows ?? []) as Array<Record<string, unknown>>)
      .map((r) => ({
        trackId: String(r.track_id ?? ''),
        score: Number(r.score ?? 0),
        accuracy: Number(r.accuracy ?? 0),
        maxCombo: Number(r.max_combo ?? 0),
        difficulty: (r.difficulty as string | null) ?? null,
        createdAtMs: Date.parse(String(r.created_at ?? '')) || Date.now(),
      }))
      .reverse(); // cronológico

    // 2) Señales (cada infracción cuenta; el contexto pesa).
    const signals = buildMuzicmaniaSignals(
      { ...entry, difficulty: entry.difficulty ?? null, createdAtMs: Date.now() },
      history,
    );
    if (signals.length === 0) {
      return NextResponse.json({ success: true }); // invisible: nada que registrar aparte
    }

    // 3) Estado acumulado + evaluación (con decaimiento).
    const { data: currentRaw } = await dbc
      .schema('anticheat')
      .from('scores')
      .select('score, updated_at')
      .eq('game', MUZICMANIA_PROFILE.game)
      .eq('user_id', user.userId)
      .maybeSingle();

    const current = (currentRaw ?? null) as { score?: number; updated_at?: string } | null;
    const evalResult = evaluate({
      profile: MUZICMANIA_PROFILE,
      currentScore: Number(current?.score ?? 0),
      lastUpdatedMs: Date.parse(String(current?.updated_at ?? '')) || Date.now(),
      signals,
    });

    // 4) Persistencia de señales + score.
    await dbc.schema('anticheat').from('signals').insert(
      signals.map((s) => ({
        game: MUZICMANIA_PROFILE.game,
        user_id: user.userId,
        rule: s.rule,
        weight: s.weight,
        details: s.details ?? {},
      })),
    );
    await dbc.schema('anticheat').from('scores').upsert(
      {
        game: MUZICMANIA_PROFILE.game,
        user_id: user.userId,
        score: evalResult.score,
        level: evalResult.level,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'game,user_id' },
    );

    // 5) Solo al CRUZAR el umbral (primera vez) actúa el sistema.
    if (evalResult.escalate) {
      const { data: prevRaw } = await dbc
        .schema('anticheat')
        .from('sanctions')
        .select('type')
        .eq('user_id', user.userId)
        .eq('game', MUZICMANIA_PROFILE.game);
      const prev = (prevRaw ?? []) as Array<{ type?: string }>;
      const count = prev.length;
      const type = count === 0 ? 'warn' : count === 1 ? 'mute' : count === 2 ? 'ban' : 'delete';

      const { data: createdRaw } = await dbc
        .schema('anticheat')
        .from('sanctions')
        .insert({
          game: MUZICMANIA_PROFILE.game,
          user_id: user.userId,
          type,
          reason: 'Actividad anómala detectada por Ciszu Anti-Cheat.',
          issued_by: 'muzicmania_anticheat',
        })
        .select('id')
        .single();

      const created = (createdRaw ?? null) as { id?: string } | null;
      // 5b) Strikes: ban/delete suman strike; 3 activos ⇒ eliminación de sistema.
      if (type === 'ban' || type === 'delete') {
        const { data: strikesRaw } = await dbc
          .schema('anticheat')
          .from('strikes')
          .select('idx')
          .eq('user_id', user.userId)
          .gte('expires_at', new Date().toISOString());
        const active = ((strikesRaw ?? []) as unknown[]).length;
        const idx = Math.min(3, active + 1);
        await dbc.schema('anticheat').from('strikes').insert({
          user_id: user.userId,
          game: MUZICMANIA_PROFILE.game,
          idx,
          reason: 'Zona roja del anticheat.',
          expires_at: new Date(Date.now() + 2 * 365 * 86_400_000).toISOString(),
        });
        if (idx >= 3) {
          await dbc.schema('anticheat').from('sanctions').insert({
            game: MUZICMANIA_PROFILE.game,
            user_id: user.userId,
            type: 'delete',
            reason: 'Tercer strike activo (2 años): eliminación por sistema.',
            issued_by: 'muzicmania_anticheat',
          });
        }
      }

      // 5c) Estado de cuenta (rojo) + apelación disponible (mensaje genérico).
      await dbc.schema('public').from('account_status_items').upsert(
        {
          user_id: user.userId,
          website: 'muzicmania',
          key: created?.id ? `anticheat-${created.id}` : 'anticheat-sanction',
          status: 'pending',
          level: type === 'warn' ? 'warning' : 'sanction',
          title: 'Sanción activa de Ciszu Anti-Cheat',
          detail:
            'Se detectó actividad anómala en tu cuenta. Puedes apelar esta sanción desde Soporte → Apelación de sanción.',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,website,key' },
      );

      // 5d) Aviso por email con marca (genérico: no revela las reglas).
      try {
        const to = user.email;
        if (to) {
          const mail = accountWarningEmail({
            siteKey: 'muzicmania',
            title: 'Aviso de Ciszu Anti-Cheat',
            intro:
              'Se detectó actividad anómala (puntuaciones o patrones fuera de lo normal) en tu cuenta del juego. ' +
              'Esta es una notificación automática de seguridad del ecosistema Ciszu Network.',
            securityNote:
              'Puedes apelar esta decisión desde tu cuenta → Soporte → Apelación de sanciones. Si no fuiste tú, revisa la seguridad de tu cuenta.',
            recipient: { email: to },
          });
          void sendBrandedEmail({ to, subject: mail.subject, html: mail.html, text: mail.text });
        }
      } catch {
        /* el aviso nunca debe romper la ingesta */
      }

      // 5e) Aviso por SMS si el usuario lo activo y dejo telefono (Textbelt).
      try {
        const prefs = await admin()
          .schema('public')
          .from('notification_preferences')
          .select('sms_enabled')
          .eq('user_id', user.userId)
          .maybeSingle();
        const smsEnabled = (prefs.data as { sms_enabled?: boolean } | null)?.sms_enabled === true;
        if (smsEnabled) {
          const authUser = await adminClient().auth.admin.getUserById(user.userId);
          const phone = (authUser.data.user?.user_metadata as { phone?: string } | undefined)?.phone;
          if (typeof phone === 'string' && phone.startsWith('+')) {
            void sendSms({
              to: phone,
              text: 'Ciszu Anti-Cheat: actividad anomala detectada en tu cuenta de MuzicMania. Revisa tu correo y apela desde Soporte si crees que es un error.',
            });
          }
        }
      } catch {
        /* el SMS nunca debe romper la ingesta */
      }
    }

    // El usuario NUNCA recibe el score ni las reglas (invisible); solo el flujo normal.
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Error interno.' },
      { status: 500 },
    );
  }
}
