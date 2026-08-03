import { NextResponse } from 'next/server';
import { clearSession } from '@/lib/auth';

export const runtime = 'nodejs';

export async function GET() {
  await clearSession();
  return NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'));
}
