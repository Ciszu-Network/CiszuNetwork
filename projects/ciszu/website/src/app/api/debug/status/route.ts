import { NextRequest, NextResponse } from 'next/server';
import { buildDebugStatus } from '@ciszu/ui/server';
import { adminClient, authenticate, verifyStaffElevation } from '../../auth/2fa/_lib';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const user = await authenticate(req);
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  try {
    const status = await buildDebugStatus({
      admin: adminClient() as any,
      user,
      site: 'ciszu',
      elevationToken: req.headers.get('x-staff-elevation'),
      verifyElevation: verifyStaffElevation,
    });
    return NextResponse.json(status, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'debug_status_error' }, { status: 500 });
  }
}