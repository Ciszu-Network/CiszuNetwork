import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createRateLimiter } from '@ciszunetwork/utils';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SOURCES = new Set(['launcher', 'installer', 'uninstaller', 'web', 'bot', 'game']);
const APPS = new Set(['muzicmania', 'ciszunetwork', 'ciszukoantony', 'ciszubot', 'ciszugamens']);
const ORIGINS = new Set([
  'https://ciszunetwork.vercel.app',
  'https://muzicmania.vercel.app',
  'https://ciszukoantony.vercel.app',
  'https://ciszubot.vercel.app',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:3003',
  'tauri://localhost',
  'http://tauri.localhost',
  'https://tauri.localhost',
]);
const limiter = createRateLimiter({ windowMs: 60_000, max: 180 });

type Incoming = {
  event_id?: string;
  occurred_at?: string;
  source?: string;
  app?: string;
  event_type?: string;
  user_id?: string | null;
  device_id?: string;
  session_id?: string;
  os?: string;
  os_version?: string;
  arch?: string;
  device_type?: string;
  app_version?: string;
  channel?: string;
  language?: string;
  timezone?: string;
  is_official?: boolean;
  consent?: boolean;
  properties?: Record<string, unknown>;
};

function cors(request: Request) {
  const origin = request.headers.get('origin') || '';
  const allowed = ORIGINS.has(origin);
  return {
    'Access-Control-Allow-Origin': allowed ? origin : 'https://ciszunetwork.vercel.app',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Telemetry-Client',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

function text(value: unknown, max = 200): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, max) : null;
}

function uuid(value: unknown): string | null {
  return typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value) ? value : null;
}

function ip(value: string): string | null {
  const clean = value.split(',')[0].trim();
  return /^[0-9a-f:.]+$/i.test(clean) && (clean.includes(':') || /^\d{1,3}(\.\d{1,3}){3}$/.test(clean)) ? clean : null;
}

export async function OPTIONS(request: Request) {
  return new NextResponse(null, { status: 204, headers: cors(request) });
}

export async function POST(request: Request) {
  const headers = cors(request);
  const origin = request.headers.get('origin') || '';
  if (origin && !ORIGINS.has(origin)) {
    return NextResponse.json({ ok: false, error: 'origin_not_allowed' }, { status: 403, headers });
  }
  const requestIp = ip(request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '');
  const rl = limiter.allow(requestIp || 'unknown');
  if (!rl.allowed) {
    return NextResponse.json({ ok: false, error: 'rate_limited' }, { status: 429, headers });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400, headers });
  }
  const rawEvents = Array.isArray(body) ? body : (body as { events?: unknown[] })?.events;
  if (!Array.isArray(rawEvents) || rawEvents.length === 0 || rawEvents.length > 50) {
    return NextResponse.json({ ok: false, error: 'events_required' }, { status: 400, headers });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    return NextResponse.json({ ok: false, error: 'telemetry_unavailable' }, { status: 503, headers });
  }
  const supabase = createClient(url, key, { auth: { persistSession: false } }).schema('ciszu');
  const country = request.headers.get('x-vercel-ip-country') || null;
  const region = request.headers.get('x-vercel-ip-country-region') || null;
  const userAgent = request.headers.get('user-agent') || null;
  const events: Record<string, unknown>[] = [];
  const devices = new Map<string, Record<string, unknown>>();
  const sessions = new Map<string, Record<string, unknown>>();

  for (const raw of rawEvents.slice(0, 50)) {
    const event = raw as Incoming;
    if (!event || typeof event !== 'object') continue;
    const source = text(event.source, 20);
    const app = text(event.app, 40);
    const eventType = text(event.event_type, 80);
    if (!source || !SOURCES.has(source) || !app || !APPS.has(app) || !eventType) continue;
    const eventId = text(event.event_id, 80) || crypto.randomUUID();
    const occurred = event.occurred_at && !Number.isNaN(Date.parse(event.occurred_at)) ? event.occurred_at : new Date().toISOString();
    const deviceId = text(event.device_id, 120);
    const sessionId = text(event.session_id, 120);
    const userId = uuid(event.user_id);
    const row = {
      event_id: eventId,
      occurred_at: occurred,
      source,
      app,
      event_type: eventType,
      user_id: userId,
      device_id: deviceId,
      session_id: sessionId,
      ip: requestIp,
      country,
      region,
      city: null,
      os: text(event.os, 40),
      os_version: text(event.os_version, 80),
      arch: text(event.arch, 30),
      device_type: text(event.device_type, 40),
      app_version: text(event.app_version, 40),
      channel: text(event.channel, 20),
      language: text(event.language, 20),
      timezone: text(event.timezone, 80),
      is_official: event.is_official !== false,
      consent: event.consent !== false,
      user_agent: userAgent?.slice(0, 500) || null,
      properties: event.properties && typeof event.properties === 'object' ? event.properties : {},
    };
    events.push(row);
    if (deviceId) {
      devices.set(`${app}:${deviceId}`, {
        app,
        device_id: deviceId,
        user_id: userId,
        last_seen_at: occurred,
        source,
        os: row.os,
        os_version: row.os_version,
        arch: row.arch,
        device_type: row.device_type,
        country,
        last_ip: requestIp,
        app_version: row.app_version,
        channel: row.channel,
        is_official: row.is_official,
        metadata: { user_agent: userAgent },
      });
    }
    if (sessionId) {
      sessions.set(sessionId, {
        session_id: sessionId,
        app,
        source,
        user_id: userId,
        device_id: deviceId,
        last_seen_at: occurred,
        activity: eventType === 'session_end' ? 'ended' : text(event.properties?.activity, 30) || 'active',
        app_version: row.app_version,
        channel: row.channel,
        country,
        ip: requestIp,
        metadata: {},
      });
    }
  }

  if (!events.length) {
    return NextResponse.json({ ok: false, error: 'no_valid_events' }, { status: 400, headers });
  }

  const { error: eventError } = await supabase.from('telemetry_events').insert(events);
  if (eventError) {
    return NextResponse.json({ ok: false, error: 'telemetry_insert_failed' }, { status: 500, headers });
  }
  if (devices.size) {
    await supabase.from('telemetry_devices').upsert([...devices.values()], { onConflict: 'app,device_id' });
  }
  if (sessions.size) {
    await supabase.from('telemetry_sessions').upsert([...sessions.values()], { onConflict: 'session_id' });
  }
  return NextResponse.json({ ok: true, accepted: events.length }, { status: 202, headers });
}
