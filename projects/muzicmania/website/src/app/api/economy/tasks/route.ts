import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createRateLimiter, parseJsonBody } from '@ciszunetwork/utils';
import { adminClient, authenticate } from '../../auth/2fa/_lib';
import { taskPeriod } from '@/lib/economy/tasks';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const limiter = createRateLimiter({ windowMs: 60_000, max: 20 });
const schema = z.object({ task_key: z.string().trim().min(1).max(40) });

export async function GET(req: NextRequest) {
  const user = await authenticate(req);
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const admin = adminClient() as any;
  const [tasksResult, progressResult, profileResult] = await Promise.all([
    admin.schema('muzicmania').from('tasks').select('key,title,description,cadence,metric,target,points,xp,sort_order').eq('enabled', true).order('sort_order'),
    admin.schema('muzicmania').from('task_progress').select('task_key,period_key,progress,claimed_at').eq('user_id', user.userId),
    admin.schema('muzicmania').from('profiles').select('xp,level').eq('id', user.userId).maybeSingle(),
  ]);
  if (tasksResult.error || progressResult.error) return NextResponse.json({ error: 'tasks_load_failed' }, { status: 500 });

  const progress = new Map<string, any>((progressResult.data ?? []).map((row: any) => [`${row.task_key}:${row.period_key}`, row]));
  const tasks = (tasksResult.data ?? []).map((task: any) => {
    const period = taskPeriod(task.cadence);
    const row = progress.get(`${task.key}:${period}`);
    return {
      ...task,
      period,
      progress: Number(row?.progress ?? 0),
      claimed: Boolean(row?.claimed_at),
      complete: Number(row?.progress ?? 0) >= Number(task.target),
    };
  });

  return NextResponse.json({
    tasks,
    profile: profileResult.data ?? { xp: 0, level: 1 },
    daily: null,
  }, { headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(req: NextRequest) {
  const user = await authenticate(req);
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (!limiter.allow(ip).allowed) return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
  const parsed = await parseJsonBody(req, schema);
  if (!parsed.success) return NextResponse.json({ error: 'invalid_body' }, { status: 400 });

  const admin = adminClient() as any;
  const { data, error } = await admin.schema('muzicmania').rpc('claim_task', {
    p_user_id: user.userId,
    p_task_key: parsed.data.task_key,
  });
  if (error) {
    const message = typeof error.message === 'string' ? error.message : '';
    if (message.includes('task_incomplete')) return NextResponse.json({ error: 'task_incomplete' }, { status: 409 });
    if (message.includes('task_not_found')) return NextResponse.json({ error: 'task_not_found' }, { status: 404 });
    return NextResponse.json({ error: 'task_claim_failed' }, { status: 500 });
  }
  const row = Array.isArray(data) ? data[0] : data;
  return NextResponse.json({ task: row });
}
