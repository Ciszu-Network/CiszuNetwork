import { describe, expect, it, vi } from 'vitest';
import { buildCsp } from '../src/csp';

describe('buildCsp', () => {
  it('incluye default-src self y directivas base', () => {
    const csp = buildCsp();
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("base-uri 'self'");
    expect(csp).toContain("form-action 'self'");
    expect(csp).toContain("frame-src 'self' https://challenges.cloudflare.com");
  });

  it('permite los orígenes del ecosistema (Turnstile, PostHog, Cloudflare, Supabase)', () => {
    const csp = buildCsp();
    expect(csp).toContain('https://challenges.cloudflare.com');
    expect(csp).toContain('https://us.i.posthog.com');
    expect(csp).toContain('https://us-assets.i.posthog.com');
    expect(csp).toContain('https://static.cloudflareinsights.com');
    expect(csp).toContain('https://obwzzmbvkrcscqwptlqo.supabase.co');
  });

  it('en producción no usa unsafe-eval ni el CDN local', () => {
    vi.stubEnv('NODE_ENV', 'production');
    const csp = buildCsp();
    expect(csp).not.toContain("'unsafe-eval'");
    expect(csp).not.toContain('http://localhost:8788');
    vi.unstubAllEnvs();
  });

  it('en desarrollo permite unsafe-eval y el CDN local (localhost:8788)', () => {
    vi.stubEnv('NODE_ENV', 'development');
    const csp = buildCsp();
    expect(csp).toContain("'unsafe-eval'");
    expect(csp).toContain('http://localhost:8788');
    expect(csp).toContain('http://127.0.0.1:8788');
    vi.unstubAllEnvs();
  });

  it('acepta fuentes extra por directiva', () => {
    const csp = buildCsp({
      imgSrc: ['https://cdn.discordapp.com'],
      connectSrc: ['wss://x.supabase.co'],
    });
    expect(csp).toContain('https://cdn.discordapp.com');
    expect(csp).toContain('wss://x.supabase.co');
  });

  it('genera una política sin directivas duplicadas', () => {
    const csp = buildCsp();
    const names = csp.split(';').map((d) => d.trim().split(' ')[0]);
    expect(new Set(names).size).toBe(names.length);
  });
});