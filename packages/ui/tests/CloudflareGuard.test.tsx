// @vitest-environment happy-dom
import React from 'react';
import { cleanup, render, screen, waitFor, act, fireEvent } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import CloudflareGuard from '../src/CloudflareGuard';

interface TurnstileMock {
  render: ReturnType<typeof vi.fn>;
  reset: ReturnType<typeof vi.fn>;
  remove: ReturnType<typeof vi.fn>;
}

let turnstileMock: TurnstileMock;

function lastRenderOpts() {
  const calls = turnstileMock.render.mock.calls;
  return calls[calls.length - 1][1];
}

beforeEach(() => {
  turnstileMock = {
    render: vi.fn(() => 'w1'),
    reset: vi.fn(),
    remove: vi.fn(),
  };
  (window as Record<string, unknown>).turnstile = turnstileMock;
});

afterEach(() => {
  vi.restoreAllMocks();
  cleanup();
  sessionStorage.clear();
  document.head.querySelectorAll('script').forEach((s) => s.remove());
  delete (window as Record<string, unknown>).turnstile;
  document.body.innerHTML = '';
});

const props = {
  siteKey: '0xTEST',
  storageKey: 'cf_verified_test',
  retryDelays: [1, 2, 3],
  children: <div>contenido</div>,
};

describe('CloudflareGuard', () => {
  it('degrada seguro sin siteKey: renderiza children sin bloquear', () => {
    const { getByText } = render(<CloudflareGuard>contenido</CloudflareGuard>);
    expect(getByText('contenido')).toBeTruthy();
    expect(screen.queryByText('Verificando Conexión Segura')).toBeNull();
  });

  it('si ya está verificado en sessionStorage, no muestra el guard', () => {
    sessionStorage.setItem('cf_verified_test', 'true');
    const { getByText } = render(<CloudflareGuard {...props} />);
    expect(getByText('contenido')).toBeTruthy();
  });

  it('con siteKey y sin verificar muestra la pantalla de verificación con el widget', async () => {
    render(<CloudflareGuard {...props} />);
    await waitFor(() => expect(turnstileMock.render).toHaveBeenCalled(), { timeout: 3000 });
    expect(screen.getByText('Verificando Conexión Segura')).toBeTruthy();
    expect(screen.queryByText('contenido')).toBeNull();
    expect(lastRenderOpts().sitekey).toBe('0xTEST');
    expect(lastRenderOpts().theme).toBe('dark');
  });

  it('widget con ancho fijo 300px (no desborda la UI de error de Cloudflare)', async () => {
    render(<CloudflareGuard {...props} />);
    await waitFor(() => expect(turnstileMock.render).toHaveBeenCalled(), { timeout: 3000 });
    const el = document.getElementById('cf-guard-widget');
    expect(el).toBeTruthy();
    expect(el.style.width).toBe('300px');
    expect(el.style.overflow).toBe('hidden');
  });

  it('error-callback limpia el widget y reintenta con backoff; tras agotar 3 intentos muestra REINTENTAR', async () => {
    vi.useFakeTimers();
    try {
      render(<CloudflareGuard {...props} />);
      await act(async () => {});
      expect(turnstileMock.render).toHaveBeenCalled();
      const widgetEl = document.getElementById('cf-guard-widget');

      // 3 errores reintentados automáticamente (cada uno con su delay) + 1 error final
      let n = 0;
      for (const delay of [...props.retryDelays, 0]) {
        act(() => {
          lastRenderOpts()['error-callback']();
        });
        if (delay > 0) {
          act(() => {
            vi.advanceTimersByTime(delay + 1);
          });
        }
        n++;
        if (delay > 0) {
          expect(turnstileMock.render).toHaveBeenCalledTimes(n + 1);
        }
      }

      await act(async () => {});
      expect(screen.getByText('REINTENTAR')).toBeTruthy();
      expect(turnstileMock.remove).toHaveBeenCalled();
    } finally {
      vi.useRealTimers();
    }
  });

  it('REINTENTAR manual re-renderiza el widget limpio y resetea el contador', async () => {
    vi.useFakeTimers();
    try {
      render(<CloudflareGuard {...props} />);
      await act(async () => {});
      expect(turnstileMock.render).toHaveBeenCalled();

      for (const delay of [...props.retryDelays, 0]) {
        act(() => {
          lastRenderOpts()['error-callback']();
        });
        if (delay > 0) {
          act(() => {
            vi.advanceTimersByTime(delay + 1);
          });
        }
      }
      await act(async () => {});
      expect(screen.getByText('REINTENTAR')).toBeTruthy();

      turnstileMock.render.mockClear();
      turnstileMock.remove.mockClear();
      fireEvent.click(screen.getByText('REINTENTAR'));

      await act(async () => {
        expect(turnstileMock.render).toHaveBeenCalled();
      });
      expect(screen.queryByText('REINTENTAR')).toBeNull();
      expect(screen.getByText('Verificando Conexión Segura')).toBeTruthy();
    } finally {
      vi.useRealTimers();
    }
  });

  it('success verificada: llama al verifyPath, dispara onVerified y guarda en sessionStorage', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      json: async () => ({ success: true }),
    }) as unknown as typeof fetch;
    const onVerified = vi.fn();
    render(<CloudflareGuard {...props} verifyPath="/api/verify-turnstile" onVerified={onVerified} />);
    await waitFor(() => expect(turnstileMock.render).toHaveBeenCalled(), { timeout: 3000 });
    await act(async () => {
      lastRenderOpts().callback('token123');
    });
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/verify-turnstile',
      expect.objectContaining({ method: 'POST' })
    );
    expect(onVerified).toHaveBeenCalled();
    await waitFor(() => expect(sessionStorage.getItem('cf_verified_test')).toBe('true'));
  });

  it('success con respuesta fallida: va a error con el mensaje del servidor', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      json: async () => ({ success: false, error: 'challenge-failed' }),
    }) as unknown as typeof fetch;
    render(<CloudflareGuard {...props} />);
    await waitFor(() => expect(turnstileMock.render).toHaveBeenCalled(), { timeout: 3000 });
    await act(async () => {
      lastRenderOpts().callback('token-bad');
    });
    await waitFor(() => expect(screen.getByText('REINTENTAR')).toBeTruthy());
    expect(screen.getByText('challenge-failed')).toBeTruthy();
  });

  it('error-callback nativo (rate limit free) limpia el iframe; expired-callback recrea el widget', async () => {
    vi.useFakeTimers();
    try {
      render(<CloudflareGuard {...props} />);
      await act(async () => {});
      const widgetEl = document.getElementById('cf-guard-widget');
      expect(turnstileMock.render).toHaveBeenCalledTimes(1);

      // Primer error → el widget se limpia (remove) y se recrea tras el delay
      act(() => {
        lastRenderOpts()['error-callback']();
      });
      act(() => {
        vi.advanceTimersByTime(props.retryDelays[0] + 1);
      });
      await act(async () => {});
      expect(turnstileMock.remove).toHaveBeenCalled();
      expect(widgetEl.innerHTML).toBe('');
      expect(turnstileMock.render).toHaveBeenCalledTimes(2);

      // expired → recrea el widget sin avisar a nadie (reto fresco, no "se cancela")
      act(() => {
        lastRenderOpts()['expired-callback']();
      });
      act(() => {
        vi.advanceTimersByTime(801);
      });
      await act(async () => {});
      expect(turnstileMock.render.mock.calls.length).toBeGreaterThanOrEqual(3);
      expect(screen.queryByText('REINTENTAR')).toBeNull();
    } finally {
      vi.useRealTimers();
    }
  });
});