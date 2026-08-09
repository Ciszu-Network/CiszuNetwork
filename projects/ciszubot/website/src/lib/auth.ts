import 'server-only';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
import { supabaseAdmin } from './supabaseAdmin';

export { supabaseAdmin };

export const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID ?? '1395532235872141312';
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET ?? '';
const SESSION_SECRET = process.env.SESSION_SECRET ?? 'ciszubot-dev-secret-no-usar-en-prod';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export const REDIRECT_URI = `${SITE_URL}/api/auth/discord/callback`;
export const OAUTH_AUTHORIZE_URL = 'https://discord.com/oauth2/authorize';
export const OAUTH_TOKEN_URL = 'https://discord.com/api/oauth2/token';
export const API_BASE = 'https://discord.com/api/v10';

const COOKIE_NAME = 'ciszubot_session';
const SESSION_MAX_AGE = 7 * 24 * 60 * 60; // 7 días

// ─── Sesión (cookie firmada HMAC) ───

export interface SessionData {
  id: string;
  name: string | null;
  avatar: string | null;
}

function sign(payload: string): string {
  return createHmac('sha256', SESSION_SECRET).update(payload).digest('hex');
}

export function createSessionToken(userId: string, profile?: { name?: string | null; avatar?: string | null }): string {
  const data: SessionData = { id: userId, name: profile?.name ?? null, avatar: profile?.avatar ?? null };
  const payload = Buffer.from(JSON.stringify(data)).toString('base64url');
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token: string): SessionData | null {
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return null;
  const expected = sign(payload);
  const a = Buffer.from(sig, 'hex');
  const b = Buffer.from(expected, 'hex');
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as SessionData;
    if (!parsed?.id) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function setSession(userId: string, profile?: { name?: string | null; avatar?: string | null }): Promise<void> {
  const store = await cookies();
  store.set(COOKIE_NAME, createSessionToken(userId, profile), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  });
}

export async function clearSession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function getSessionData(): Promise<SessionData | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function getSessionUserId(): Promise<string | null> {
  const session = await getSessionData();
  return session?.id ?? null;
}

// ─── API de Discord ───

export interface DiscordUser {
  id: string;
  username: string;
  discriminator?: string;
  global_name?: string | null;
  avatar?: string | null;
  email?: string | null;
}

export interface DiscordGuild {
  id: string;
  name: string;
  icon?: string | null;
  owner: boolean;
  permissions: string;
}

export function oauthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: DISCORD_CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    scope: 'identify email guilds',
    state,
  });
  return `${OAUTH_AUTHORIZE_URL}?${params.toString()}`;
}

export async function exchangeCode(code: string): Promise<{ access_token: string; refresh_token: string; expires_in: number } | null> {
  try {
    const body = new URLSearchParams({
      client_id: DISCORD_CLIENT_ID,
      client_secret: DISCORD_CLIENT_SECRET,
      grant_type: 'authorization_code',
      code,
      redirect_uri: REDIRECT_URI,
    });
    const res = await fetch(OAUTH_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { access_token: string; refresh_token: string; expires_in: number };
    return json;
  } catch {
    return null;
  }
}

export async function refreshAccessToken(refreshToken: string): Promise<{ access_token: string; refresh_token: string; expires_in: number } | null> {
  try {
    const body = new URLSearchParams({
      client_id: DISCORD_CLIENT_ID,
      client_secret: DISCORD_CLIENT_SECRET,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    });
    const res = await fetch(OAUTH_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });
    if (!res.ok) return null;
    return (await res.json()) as { access_token: string; refresh_token: string; expires_in: number };
  } catch {
    return null;
  }
}

export async function fetchDiscordUser(accessToken: string): Promise<DiscordUser | null> {
  try {
    const res = await fetch(`${API_BASE}/users/@me`, { headers: { Authorization: `Bearer ${accessToken}` } });
    if (!res.ok) return null;
    return (await res.json()) as DiscordUser;
  } catch {
    return null;
  }
}

/** Devuelve el access_token vigente del usuario (refresca si hace falta) */
export async function getValidUserToken(userId: string): Promise<string | null> {
  const db = supabaseAdmin();
  const { data } = await db
    .from('discord_users')
    .select('access_token, refresh_token, token_expires')
    .eq('id', userId)
    .maybeSingle();

  if (!data?.access_token) return null;

  const expires = data.token_expires ? new Date(data.token_expires).getTime() : 0;
  if (expires > Date.now() + 60_000) return data.access_token as string;

  const refreshed = await refreshAccessToken(data.refresh_token as string);
  if (!refreshed) return null;
  await db.from('discord_users').upsert({
    id: userId,
    access_token: refreshed.access_token,
    refresh_token: refreshed.refresh_token,
    token_expires: new Date(Date.now() + refreshed.expires_in * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  });
  return refreshed.access_token;
}

export async function getGuildsForUser(userId: string): Promise<DiscordGuild[]> {
  const { cacheStore } = await import('./cacheStore');
  return cacheStore.getOrSet(`discord:guilds:${userId}`, 60_000, async () => {
    const token = await getValidUserToken(userId);
    if (!token) return [];
    try {
      const res = await fetch(`${API_BASE}/users/@me/guilds`, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' });
      if (!res.ok) return [];
      return (await res.json()) as DiscordGuild[];
    } catch {
      return [];
    }
  });
}

// ADMINISTRATOR (8) | MANAGE_GUILD (32)
const GUILD_ADMIN = BigInt(8) | BigInt(32);

export function isGuildAdmin(guild: DiscordGuild): boolean {
  if (guild.owner) return true;
  try {
    const perms = BigInt(guild.permissions);
    return (perms & GUILD_ADMIN) !== BigInt(0);
  } catch {
    return false;
  }
}

/** Guilds donde el bot está presente (usando el token del bot) */
export async function getBotGuildIds(): Promise<Set<string>> {
  const { cacheStore } = await import('./cacheStore');
  const ids = await cacheStore.getOrSet<string[]>('discord:bot-guilds', 60_000, async () => {
    const botToken = process.env.DISCORD_BOT_TOKEN;
    if (!botToken) return [];
    try {
      const res = await fetch(`${API_BASE}/applications/@me/guilds`, {
        headers: { Authorization: `Bot ${botToken}` },
        cache: 'no-store',
      });
      if (!res.ok) return [];
      const guilds = (await res.json()) as Array<{ id: string }>;
      return guilds.map((g) => g.id);
    } catch {
      return [];
    }
  });
  return new Set(ids);
}
