// @vitest-environment happy-dom
import React from 'react';
import { cleanup, render, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import PostHogAnalytics, { captureEvent } from '../src/PostHogAnalytics';

vi.mock('next/navigation', () => ({
  usePathname: () => '/play',
  useSearchParams: () => new URLSearchParams('track=genesis'),
}));

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
    expect(scripts.some((src) => src.includes('posthog.com'))).toBe(false);
    expect(container.innerHTML).toBe('');
  });

  it('con key carga array.js del host por defecto (us.i.posthog.com)', () => {
    vi.stubEnv('NEXT_PUBLIC_POSTHOG_KEY', 'phc_test');
    render(<PostHogAnalytics app="muzicmania" />);
    const srcs = Array.from(document.head.querySelectorAll('script')).map((s) => s.src);
    expect(srcs.some((src) => src === 'https://us.i.posthog.com/static/array.js')).toBe(true);
  });

  it('usa NEXT_PUBLIC_POSTHOG_HOST si está definido', () => {
    vi.stubEnv('NEXT_PUBLIC_POSTHOG_KEY', 'phc_test');
    vi.stubEnv('NEXT_PUBLIC_POSTHOG_HOST', 'https://eu.i.posthog.com');
    render(<PostHogAnalytics app="ciszubot" />);
    const srcs = Array.from(document.head.querySelectorAll('script')).map((s) => s.src);
    expect(srcs.some((src) => src === 'https://eu.i.posthog.com/static/array.js')).toBe(true);
  });

  it('inicializa PostHog con capture_pageview:false + pageleave y web vitals', async () => {
    vi.stubEnv('NEXT_PUBLIC_POSTHOG_KEY', 'phc_test');
    const init = vi.fn();
    window.posthog = { init, capture: vi.fn() };
    render(<PostHogAnalytics app="ciszunetwork" />);
    await waitFor(
      () =>
        expect(init).toHaveBeenCalledWith(
          'phc_test',
          expect.objectContaining({
            capture_pageview: false,
            capture_pageleave: true,
            capture_performance: { web_vitals: true, network_timing: false },
          })
        ),
      { timeout: 2000 }
    );
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
