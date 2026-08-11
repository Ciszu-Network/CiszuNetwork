import { NextResponse } from 'next/server';
import { clearSession, getSessionData } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export const runtime = 'nodejs';

export async function GET() {
  const session = await getSessionData();
  if (session) {
    await logAudit({ event: 'logout', actorId: session.id, actorName: session.name });
  }
  await clearSession();
  return NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'));
}
