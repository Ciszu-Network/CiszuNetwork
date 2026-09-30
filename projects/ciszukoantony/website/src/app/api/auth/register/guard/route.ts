import { NextResponse } from 'next/server';
import { checkBotId } from 'botid/server';
import { adminClient } from '../../2fa/_lib';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Guardia anti-abuso del registro por IP: si la IP del visitante está en
 * `banned_ips` o ligada a una sanción con IP activa (`sanctions.ip`), se
 * bloquea la creación de cuentas desde ese origen. La consulta corre
 * server-side (service role); ante fallo no se bloquea a usuarios legítimos.
 */
export async function POST(request: Request) {
  const verification = await checkBotId();
  if (verification.isBot) return NextResponse.json({ error: 'Access denied' }, { status: 403 });

  try {
    const ip = (request.headers.get('x-forwarded-for') ?? '').split(',')[0]?.trim() ?? '';
    if (!ip) return NextResponse.json({ success: true, blocked: false });

    const admin = adminClient();
    const [ipRow, sanctionRow] = await Promise.all([
      admin.schema('public').from('banned_ips').select('ip, expires_at').eq('ip', ip).maybeSingle(),
      admin
        .schema('public')
        .from('sanctions')
        .select('id, expires_at')
        .eq('type', 'ban')
        .eq('ip', ip)
        .limit(1)
        .maybeSingle(),
    ]);

    const now = Date.now();
    const bannedIp = (ipRow as { ip?: string; expires_at?: string | null } | null) ?? null;
    const bannedSanction = (sanctionRow as { id?: string; expires_at?: string | null } | null) ?? null;
    const active = (row: { expires_at?: string | null } | null) =>
      !!row && (!row.expires_at || Date.parse(row.expires_at) > now);
    const blocked = active(bannedIp) || active(bannedSanction);

    return NextResponse.json({ success: true, blocked });
  } catch {
    return NextResponse.json({ success: true, blocked: false });
  }
}
