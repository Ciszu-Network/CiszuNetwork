import { NextResponse } from 'next/server';
import { adminClient } from '../../auth/2fa/_lib';
import { sponsorshipEmail, sendBrandedEmail } from '@ciszunetwork/utils';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_EMAILS = 50;

/**
 * Disparo del envío diario de patrocinios (cada 24h).
 *
 * Recorre los usuarios con `notification_preferences.sponsorship_enabled = true`
 * y les envía un patrocinio rotativo de un proyecto del ecosistema. Se protege
 * con `SPONSORSHIP_CRON_SECRET` (Bearer). Pensado para ser invocado por un cron
 * externo (GitHub Actions schedule, ntfy, UptimeRobot) a `/api/sponsorship/dispatch`.
 *
 * Sin `RESEND_API_KEY` el envío falla con motivo (no finge éxito); con
 * `EMAIL_ALLOW_PREVIEW=1` solo devuelve la vista previa del primero.
 */
export async function POST(request: Request) {
  const secret = process.env.SPONSORSHIP_CRON_SECRET;
  const auth = request.headers.get('authorization');
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  }

  const allowPreview = process.env.EMAIL_ALLOW_PREVIEW === '1';

  try {
    const admin = adminClient();

    // Usuarios con patrocinios activados.
    const { data: prefs, error: prefsErr } = await admin
      .schema('public')
      .from('notification_preferences')
      .select('user_id')
      .eq('sponsorship_enabled', true)
      .limit(MAX_EMAILS);

    if (prefsErr) throw prefsErr;
    if (!prefs || !Array.isArray(prefs) || prefs.length === 0) {
      return NextResponse.json({ success: true, sent: 0, note: 'Sin usuarios con patrocinios activados.' });
    }

    const userIds = prefs.map((p) => (p as { user_id?: string }).user_id).filter(Boolean) as string[];

    // Emails vía Admin API de Supabase (listado paginado con service_role).
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !serviceKey) {
      return NextResponse.json({ success: false, error: 'Admin no configurado.' }, { status: 500 });
    }

    const adminRes = await fetch(`${url}/auth/v1/admin/users?per_page=${MAX_EMAILS}`, {
      headers: { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey },
    });
    if (!adminRes.ok) {
      return NextResponse.json({ success: false, error: `Admin API ${adminRes.status}` }, { status: 500 });
    }
    const { users = [] } = (await adminRes.json()) as { users?: { id: string; email?: string | null }[] };
    const emailById = new Map<string, string>();
    for (const u of users) {
      if (u.email && userIds.includes(u.id)) emailById.set(u.id, u.email);
    }

    if (emailById.size === 0) {
      return NextResponse.json({ success: true, sent: 0, note: 'Sin emails disponibles.' });
    }

    // Rotación simple de proyectos: cambia según el día (0..n).
    const projects = [
      { key: 'muzicmania', project: 'MuzicMania', headline: '¿Listo para el ritmo?', intro: 'El juego de ritmo del ecosistema: mecánicas adictivas y estética futurista.', ctaLabel: 'Jugar MuzicMania', ctaUrl: 'https://muzicmania.vercel.app' },
      { key: 'ciszubot', project: 'CiszuBot', headline: 'Conoce a CiszuBot', intro: 'El bot de Discord del ecosistema: moderación, música, niveles y más.', ctaLabel: 'Invitar a CiszuBot', ctaUrl: 'https://ciszubot.vercel.app' },
      { key: 'ciszukoantony', project: 'Ciszuko Antony', headline: 'Contenido de Ciszuko Antony', intro: 'Gaming, tech y música: el lado creativo del fundador del ecosistema.', ctaLabel: 'Ver el portfolio', ctaUrl: 'https://ciszukoantony.vercel.app' },
      { key: 'ciszu', project: 'Ciszu Network', headline: 'El ecosistema sigue creciendo', intro: 'Descubre la web principal, el centro de documentación y todos los proyectos.', ctaLabel: 'Visitar Ciszu Network', ctaUrl: 'https://ciszunetwork.vercel.app' },
    ];
    const day = Math.floor(Date.now() / 86400000) % projects.length;
    const project = projects[day];

    let sent = 0;
    const errors: string[] = [];

    for (const email of emailById.values()) {
      const mail = sponsorshipEmail({
        siteKey: project.key,
        project: project.project,
        headline: project.headline,
        intro: project.intro,
        ctaLabel: project.ctaLabel,
        ctaUrl: project.ctaUrl,
      });
      const result = await sendBrandedEmail({
        to: email,
        subject: mail.subject,
        html: mail.html,
        text: mail.text,
      });
      if (result.sent) sent++;
      else errors.push(`${email}: ${result.error ?? 'fallo'}`);

      if (allowPreview) {
        return NextResponse.json({ success: false, previewOnly: true, preview: { to: email, subject: mail.subject, html: mail.html } });
      }
    }

    return NextResponse.json({
      success: true,
      sent,
      errors: errors.length ? errors : undefined,
      project: project.project,
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Error interno.' },
      { status: 500 },
    );
  }
}