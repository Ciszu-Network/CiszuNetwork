import { NextRequest, NextResponse } from 'next/server';
import { buildDebugStatus, listDebugWhitelist, upsertDebugWhitelist, removeDebugWhitelist } from '@ciszu/ui/server';
import { adminClient, authenticate, verifyStaffElevation } from '../../auth/2fa/_lib';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function ownerStatus(req: NextRequest) {
  const user = await authenticate(req);
  if (!user) return { error: NextResponse.json({ error: 'unauthorized' }, { status: 401 }) };
  const admin = adminClient() as any;
  const status = await buildDebugStatus({
    admin,
    user,
    site: 'ciszukoantony',
    elevationToken: req.headers.get('x-staff-elevation'),
    verifyElevation: verifyStaffElevation,
  });
  if (!status.authorized || status.staff?.role !== 'owner') {
    return { error: NextResponse.json({ error: 'forbidden' }, { status: 403 }) };
  }
  return { admin, actor: status.staff.staffId };
}

export async function GET(req: NextRequest) {
  const ctx = await ownerStatus(req);
  if ('error' in ctx) return ctx.error;
  try {
    return NextResponse.json(await listDebugWhitelist(ctx.admin));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'whitelist_error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const ctx = await ownerStatus(req);
  if ('error' in ctx) return ctx.error;
  try {
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    return NextResponse.json({ entry: await upsertDebugWhitelist(ctx.admin, ctx.actor, body) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'whitelist_error' }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  const ctx = await ownerStatus(req);
  if ('error' in ctx) return ctx.error;
  try {
    return NextResponse.json(await removeDebugWhitelist(ctx.admin, req.nextUrl.searchParams.get('staff_id') ?? '', req.nextUrl.searchParams.get('site') ?? ''));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'whitelist_error' }, { status: 400 });
  }
}