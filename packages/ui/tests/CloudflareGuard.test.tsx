// @vitest-environment happy-dom
import React from 'react';
import { cleanup, render, screen, waitFor, act, fireEvent } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import CloudflareGuard, { SCRIPT_LOAD_TIMEOUT_MS } from '../src/CloudflareGuard';

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

  it('con siteKey y sin verificar muestra la pantalla de verificación con la página DETRÁS (pintada para FCP/LCP pero sin interacción)', async () => {
    render(<CloudflareGuard {...props} />);
    await waitFor(() => expect(turnstileMock.render).toHaveBeenCalled(), { timeout: 3000 });
    expect(screen.getByText('Verificando Conexión Segura')).toBeTruthy();
    expect(screen.getByText('contenido')).toBeTruthy();
    expect(lastRenderOpts().sitekey).toBe('0xTEST');
    expect(lastRenderOpts().theme).toBe('dark');

    // El contenido se renderiza DETRÁS del gate, en un wrapper no interactivo
    const wrapper = screen.getByText('contenido').parentElement;
    expect(wrapper).toBeTruthy();
    expect(wrapper.getAttribute('aria-hidden')).toBe('true');
    expect(wrapper.hasAttribute('inert')).toBe(true);
    expect(wrapper.style.pointerEvents).toBe('none');
    expect(wrapper.style.userSelect).toBe('none');
  });

  it('el overlay del gate: fixed, z-index 9999 (encima de todo) y blur del contenido detrás', async () => {
    render(<CloudflareGuard {...props} />);
    await waitFor(() => expect(turnstileMock.render).toHaveBeenCalled(), { timeout: 3000 });
    // h2 → div(textAlign) → div(flex column) → div(fixed overlay)
    const overlay = screen
      .getByText('Verificando Conexión Segura')
      .closest('div').parentElement.parentElement;
    expect(overlay.style.position).toBe('fixed');
    expect(overlay.style.zIndex).toBe('9999');
    // React omite -webkit-backdrop-filter si el entorno reporta soporte nativo
    expect(overlay.style.backdropFilter).toContain('blur');
    const attr = overlay.getAttribute('style');
    expect(attr).toMatch(/backdrop-filter:\s*blur\(/);
    expect(overlay.style.background).not.toBe('rgb(0, 0, 0)');
  });

  it('mientras el gate está activo, bloquea el scroll del body y los atajos de copia/impresión (Ctrl+C/Ctrl+P)', async () => {
    render(<CloudflareGuard {...props} />);
    await waitFor(() => expect(turnstileMock.render).toHaveBeenCalled(), { timeout: 3000 });
    expect(document.documentElement.style.overflow).toBe('hidden');

    const copy = new KeyboardEvent('keydown', { key: 'c', ctrlKey: true, bubbles: true, cancelable: true });
    const copyEvt = new Event('copy', { bubbles: true, cancelable: true });
    const preventedCopy = !document.dispatchEvent(copy);
    const preventedEvt = !document.dispatchEvent(copyEvt);
    expect(preventedCopy).toBe(true);
    expect(preventedEvt).toBe(true);

    // Al confirmar la verificación se sueltan los bloqueos y funde el overlay (leaving)
    global.fetch = vi.fn().mockResolvedValue({ json: async () => ({ success: true }) }) as unknown as typeof fetch;
    await act(async () => {
      lastRenderOpts().callback('token');
    });
    const overlay = screen
      .getByText('Verificando Conexión Segura')
      .closest('div').parentElement.parentElement;
    expect(overlay.style.opacity).toBe('0');
    expect(overlay.style.transition).toContain('opacity');
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

  it('si api.js nunca inicializa window.turnstile (p.ej. tras un deploy con rate limit), a los 10s pasa a error con REINTENTAR en vez de quedar vacío para siempre', async () => {
    vi.useFakeTimers();
    try {
      // Simular que el script no llega: sin window.turnstile
      delete (window as Record<string, unknown>).turnstile;
      render(<CloudflareGuard {...props} />);
      await act(async () => {});

      expect(turnstileMock.render).not.toHaveBeenCalled();
      expect(screen.queryByText('REINTENTAR')).toBeNull();

      // Avanzar el reloj: el sondeo (200ms) debe tropezar con el timeout de 10s
      act(() => {
        vi.advanceTimersByTime(SCRIPT_LOAD_TIMEOUT_MS + 1000);
      });
      await act(async () => {});

      expect(screen.getByText('REINTENTAR')).toBeTruthy();
      // Nunca hubo widget renderizado: no hay iframe que limpiar (y el hueco
      // quedó vacío, no con un iframe fantasma colgado).
      expect(turnstileMock.remove).not.toHaveBeenCalled();
    } finally {
      vi.useRealTimers();
    }
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