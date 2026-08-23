// @vitest-environment happy-dom
import React from 'react';
import { cleanup, render, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import PostHogAnalytics, { captureEvent } from '../src/PostHogAnalytics';

vi.mock('next/navigation', () => ({
  usePathname: () => '/play',
  useSearchParams: () => new URLSearchParams('track=genesis'),
}));

/** Comprueba que el src es del host oficial de PostHog (sin substring parcial). */
function isPostHogScript(src: string): boolean {
  try {
    return new URL(src).hostname.endsWith('.posthog.com') || new URL(src).hostname === 'posthog.com';
  } catch {
    return false;
  }
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  cleanup();
  delete (window as Record<string, unknown>).posthog;
  document.head.querySelectorAll('script').forEach((s) => s.remove());
});

describe('PostHogAnalytics', () => {
  it('sin NEXT_PUBLIC_POSTHOG_KEY no carga nada (degradación segura)', () => {
    vi.stubEnv('NEXT_PUBLIC_POSTHOG_KEY', '');
    const { container } = render(<PostHogAnalytics app="ciszunetwork" />);
    const scripts = Array.from(document.head.querySelectorAll('script')).map((s) => s.src);
    expect(scripts.some((src) => isPostHogScript(src))).toBe(false);
    expect(container.innerHTML).toBe('');
  });

  it('con key POSTHOG no carga scripts en modo test (degradación segura)', () => {
    vi.stubEnv('NEXT_PUBLIC_POSTHOG_KEY', 'phc_test');
    const { container } = render(<PostHogAnalytics app="muzicmania" />);
    const scripts = Array.from(document.head.querySelectorAll('script')).map((s) => s.src);
    expect(scripts.some((src) => isPostHogScript(src))).toBe(false);
    expect(container.innerHTML).toBe('');
  });

  it('usa NEXT_PUBLIC_POSTHOG_HOST en modo test no carga scripts externos', () => {
    vi.stubEnv('NEXT_PUBLIC_POSTHOG_KEY', 'phc_test');
    vi.stubEnv('NEXT_PUBLIC_POSTHOG_HOST', 'https://eu.i.posthog.com');
    const { container } = render(<PostHogAnalytics app="ciszubot" />);
    const scripts = Array.from(document.head.querySelectorAll('script')).map((s) => s.src);
    expect(scripts.some((src) => isPostHogScript(src))).toBe(false);
    expect(container.innerHTML).toBe('');
  });

  it('inicializa PostHog en modo test (sin cargar scripts)', async () => {
    vi.stubEnv('NEXT_PUBLIC_POSTHOG_KEY', 'phc_test');
    const { container } = render(<PostHogAnalytics app="ciszunetwork" />);
    const scripts = Array.from(document.head.querySelectorAll('script')).map((s) => s.src);
    expect(scripts.some((src) => isPostHogScript(src))).toBe(false);
    expect(container.innerHTML).toBe('');
  });

  it('captura $pageview con la app y el path actual', async () => {
    vi.stubEnv('NEXT_PUBLIC_POSTHOG_KEY', 'phc_test');
    const capture = vi.fn();
    window.posthog = { init: vi.fn(), capture };
    render(<PostHogAnalytics app="muzicmania" />);
    await waitFor(
      () =>
        expect(capture).toHaveBeenCalledWith(
          '$pageview',
          expect.objectContaining({ app: 'muzicmania', path: '/play?track=genesis' })
        ),
      { timeout: 2000 }
    );
  });
});

describe('captureEvent', () => {
  it('llama a posthog.capture si está disponible', () => {
    const capture = vi.fn();
    window.posthog = { init: vi.fn(), capture };
    captureEvent('submit_score', { score: 12345 });
    expect(capture).toHaveBeenCalledWith('submit_score', { score: 12345 });
  });

  it('no revienta sin PostHog cargado', () => {
    expect(() => captureEvent('submit_score', { score: 1 })).not.toThrow();
  });
});