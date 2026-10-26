import type { NsfwCommandGender, NsfwSelection } from './catalog';
import { purrbotTag } from './catalog';

export interface NsfwMedia {
  kind: 'image' | 'video';
  url: string;
  link?: string;
  title: string;
  source: 'Purrbot' | 'RedGifs';
}

interface RedGif {
  id?: string;
  tags?: string[];
  urls?: {
    poster?: string;
    html?: string;
    hd?: string;
    sd?: string;
    thumbnail?: string;
  };
}

const USER_AGENT = 'CiszuBot/3.4 (+https://ciszubot.vercel.app)';
const TIMEOUT_MS = 8_000;
const DENIED_TAGS = [
  'loli',
  'lolicon',
  'shota',
  'shotacon',
  'child',
  'children',
  'underage',
  'minor',
  'teen',
  'teenager',
  'schoolgirl',
  'schoolboy',
  'petite',
];

let redgifsToken: { value: string; expiresAt: number } | null = null;

function safeUrl(value: unknown, hosts: string[]): string | null {
  if (typeof value !== 'string') return null;
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:') return null;
    if (!hosts.includes(url.hostname)) return null;
    return url.toString();
  } catch {
    return null;
  }
}

function hasDeniedTag(tags: string[] | undefined): boolean {
  if (!tags?.length) return false;
  return tags.some((tag) => {
    const normalized = tag.toLowerCase();
    return DENIED_TAGS.some((denied) => normalized.includes(denied));
  });
}

async function fetchJson(url: string, init: RequestInit = {}): Promise<{ ok: boolean; status: number; data: unknown }> {
  try {
    const res = await fetch(url, {
      ...init,
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: {
        'User-Agent': USER_AGENT,
        Accept: 'application/json',
        ...(init.headers ?? {}),
      },
    });
    if (!res.ok) return { ok: false, status: res.status, data: null };
    return { ok: true, status: res.status, data: await res.json() };
  } catch {
    return { ok: false, status: 0, data: null };
  }
}

async function fetchPurrbot(tag: string, title: string): Promise<NsfwMedia | null> {
  const result = await fetchJson(`https://api.purrbot.site/v2/img/nsfw/${encodeURIComponent(tag)}/gif`);
  if (!result.ok || !result.data || typeof result.data !== 'object') return null;
  const data = result.data as { link?: unknown; error?: unknown };
  if (data.error === true) return null;
  const url = safeUrl(data.link, ['cdn.purrbot.site']);
  if (!url) return null;
  return { kind: 'image', url, title, source: 'Purrbot' };
}

async function getRedgifsToken(): Promise<string | null> {
  if (redgifsToken && redgifsToken.expiresAt > Date.now()) return redgifsToken.value;
  const result = await fetchJson('https://api.redgifs.com/v2/auth/temporary');
  if (!result.ok || !result.data || typeof result.data !== 'object') return null;
  const token = (result.data as { token?: unknown }).token;
  if (typeof token !== 'string' || !token) return null;
  redgifsToken = { value: token, expiresAt: Date.now() + 20 * 60 * 60 * 1000 };
  return token;
}

function redgifsQuery(selection: NsfwSelection, gender: NsfwCommandGender, style: 'anime' | 'cartoon' | 'real'): string {
  const base = selection.def.search ?? selection.def.base;
  const genderTerm = gender === 'boy' ? 'boy' : gender === 'girl' ? 'girl' : '';
  const prefix = style === 'anime' ? 'anime' : style === 'cartoon' ? 'cartoon' : '';
  return [prefix, base, genderTerm, 'adult'].filter(Boolean).join(' ');
}

async function searchRedgifs(query: string, title: string): Promise<NsfwMedia | null> {
  let token = await getRedgifsToken();
  if (!token) return null;

  const search = async (auth: string) => {
    const url = `https://api.redgifs.com/v2/gifs/search?search_text=${encodeURIComponent(query)}&count=20&order=trending`;
    return fetchJson(url, { headers: { Authorization: `Bearer ${auth}` } });
  };

  let result = await search(token);
  if (result.status === 401) {
    redgifsToken = null;
    token = await getRedgifsToken();
    if (!token) return null;
    result = await search(token);
  }
  if (!result.ok || !result.data || typeof result.data !== 'object') return null;

  const gifs = (result.data as { gifs?: unknown }).gifs;
  if (!Array.isArray(gifs) || gifs.length === 0) return null;

  const candidates = (gifs as RedGif[]).filter((gif) => !hasDeniedTag(gif.tags));
  const gif = candidates[Math.floor(Math.random() * candidates.length)];
  if (!gif) return null;

  const url = safeUrl(gif.urls?.poster ?? gif.urls?.thumbnail, ['media.redgifs.com']);
  if (!url) return null;
  const link = safeUrl(gif.urls?.html, ['redgifs.com', 'www.redgifs.com']);
  return {
    kind: 'video',
    url,
    link: link ?? undefined,
    title,
    source: 'RedGifs',
  };
}

export async function fetchNsfwMedia(
  selection: NsfwSelection,
  gender: NsfwCommandGender,
): Promise<NsfwMedia | null> {
  const title = `${selection.def.label} · ${selection.style}`;

  if (selection.style !== 'real') {
    const tag = purrbotTag(selection, gender);
    if (tag) {
      const media = await fetchPurrbot(tag, title);
      if (media) return media;
    }
  }

  if (selection.style === 'real') {
    return searchRedgifs(redgifsQuery(selection, gender, 'real'), title);
  }

  if (selection.style === 'anime') {
    return searchRedgifs(redgifsQuery(selection, gender, 'anime'), title);
  }

  const cartoon = await searchRedgifs(redgifsQuery(selection, gender, 'cartoon'), title);
  if (cartoon) return cartoon;
  return searchRedgifs(redgifsQuery(selection, gender, 'anime'), title);
}

export function resetNsfwProviderCache(): void {
  redgifsToken = null;
}
