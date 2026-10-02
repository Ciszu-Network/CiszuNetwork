'use client';

/**
 * RecaptchaGate — protección reCAPTCHA de los formularios de auth.
 *
 * MODO ACTUAL (Enterprise): una sola site key Enterprise con integración
 * INVISIBLE. En cada envío se ejecuta `grecaptcha.enterprise.execute(siteKey,
 * { action })` y el token se valida en el servidor vía la API de assessments
 * (risk analysis + score). No usa secretos en el servidor.
 *
 * MODO CLÁSICO (legado): v2 (checkbox visible) + v3 (invisible) con
 * `api.js`. Se mantiene la compatibilidad de props por si alguna web vuelve a
 * necesitarlo, pero las 4 webs usan Enterprise.
 *
 * DETALLE DEL SCRIPT: `enterprise.js` (o `api.js`) solo puede cargarse UNA vez
 * por página. En modo clásico hay que cargarlo con `?render=<site key v3>` para
 * habilitar v3 y montar el widget v2 con `grecaptcha.render(...)` explícito.
 * El token es de UN SOLO USO y caduca en 2 minutos, por eso no se pide al
 * montar: se pide justo antes de enviar, con `executorRef`.
 *
 * Componente autónomo (sin dependencias internas del monorepo) para poder
 * consumirse desde las 4 webs sin acoplar paquetes.
 */

import { useCallback, useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    grecaptcha?: {
      ready: (cb: () => void) => void;
      render: (el: HTMLElement, opts: Record<string, unknown>) => number;
      execute: (siteKey: string, opts: { action: string }) => Promise<string>;
      reset: (id?: number) => void;
      enterprise?: {
        ready: (cb: () => void) => void;
        execute: (siteKey: string, opts: { action: string }) => Promise<string>;
      };
    };
  }
}

const SCRIPT_ID = 'ciszu-recaptcha-api';
const ENTERPRISE_SCRIPT_BASE = 'https://www.google.com/recaptcha/enterprise.js';
const SCRIPT_BASE = 'https://www.google.com/recaptcha/api.js';

let scriptPromise: Promise<void> | null = null;

/**
 * Carga el script de reCAPTCHA una sola vez (idempotente y compartido entre
 * componentes). `enterprise` elige la API Enterprise; en ese caso `siteKey` se
 * usa como `render` para habilitar la ejecución invisible.
 */
export function loadRecaptcha(
  opts: { siteKey?: string; enterprise?: boolean } = {},
): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (opts.enterprise && window.grecaptcha?.enterprise) return Promise.resolve();
  if (!opts.enterprise && window.grecaptcha) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise<void>((resolve, reject) => {
    const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('recaptcha-script-error')));
      return;
    }
    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.async = true;
    script.defer = true;
    // `render=<site key>` habilita la ejecución invisible; sin ella se usa
    // render=explicit (modo clásico v2).
    const base = opts.enterprise ? ENTERPRISE_SCRIPT_BASE : SCRIPT_BASE;
    script.src = opts.siteKey
      ? `${base}?render=${encodeURIComponent(opts.siteKey)}`
      : `${base}?render=explicit`;
    script.onload = () => resolve();
    script.onerror = () => {
      scriptPromise = null;
      reject(new Error('recaptcha-script-error'));
    };
    document.head.appendChild(script);
  });

  return scriptPromise;
}

export interface RecaptchaGateProps {
  /** Site key Enterprise (modo actual) o site key v2 (modo clásico). */
  siteKey?: string;
  /** Site key de reCAPTCHA v3 (invisible). Solo modo clásico. */
  siteKeyV2?: string;
  /** Site key de reCAPTCHA v3 (invisible). Solo modo clásico. */
  siteKeyV3?: string;
  /** Modo Enterprise (default: true). Si es false, usa v2+v3 clásico. */
  enterprise?: boolean;
  /** Acción reportada a Google en el token. */
  action?: string;
  theme?: 'dark' | 'light';
  /** Token listo para enviar. En Enterprise llega bajo demanda. */
  onV2Token?: (token: string | null) => void;
  /** Token de v3 listo para enviar (clásico). */
  onV3Token?: (token: string | null) => void;
  /**
   * Ref donde se publica el ejecutor. El formulario lo llama justo antes de
   * enviar: `const token = await executorRef.current?.()`.
   */
  v3ExecutorRef?: React.MutableRefObject<(() => Promise<string | null>) | null>;
  /** Cambiar este número reinicia el widget (tras un envío fallido). */
  resetKey?: number;
  /** Texto de aviso mostrado si falta completar el reto visible. */
  hint?: string;
  className?: string;
}

export default function RecaptchaGate({
  siteKey,
  siteKeyV2,
  siteKeyV3,
  enterprise = true,
  action = 'submit',
  theme = 'dark',
  onV2Token,
  onV3Token,
  v3ExecutorRef,
  resetKey = 0,
  hint = 'Completa el reCAPTCHA',
  className = '',
}: RecaptchaGateProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetId = useRef<number | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [scriptError, setScriptError] = useState(false);
  const [ready, setReady] = useState(false);

  // En Enterprise el "token visible" se pide bajo demanda; publicamos el estado
  // como listo sin esperar a que el usuario toque el checkbox.
  const effectiveSiteKey = siteKey || siteKeyV2 || '';
  const effectiveV3 = enterprise ? siteKey : siteKeyV3;

  const publish = useCallback(
    (value: string | null) => {
      setToken(value);
      onV2Token?.(value);
    },
    [onV2Token],
  );

  // 1) Cargar el script (una vez) con la site key correcta.
  useEffect(() => {
    if (!effectiveSiteKey) return;
    let cancelled = false;
    loadRecaptcha({ siteKey: enterprise ? siteKey : siteKeyV3, enterprise })
      .then(() => {
        if (!cancelled) setReady(true);
      })
      .catch(() => {
        if (!cancelled) setScriptError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [effectiveSiteKey, siteKey, siteKeyV3, enterprise]);

  // 2) Modo clásico: montar el widget v2 en cuanto el script esté listo.
  useEffect(() => {
    if (enterprise || !ready || !siteKeyV2 || !containerRef.current || widgetId.current !== null) return;
    const g = window.grecaptcha;
    if (!g) return;
    g.ready(() => {
      if (!containerRef.current || widgetId.current !== null) return;
      widgetId.current = g.render(containerRef.current, {
        sitekey: siteKeyV2,
        theme,
        callback: (t: string) => publish(t),
        'expired-callback': () => publish(null),
        'error-callback': () => publish(null),
      });
    });
  }, [enterprise, ready, siteKeyV2, theme, publish]);

  // 3) Reinicio del widget (token quemado tras un envío fallido).
  useEffect(() => {
    if (!ready || widgetId.current === null) return;
    if (resetKey === 0) return;
    try {
      window.grecaptcha?.reset(widgetId.current);
    } catch {
      /* el widget se recrea abajo si el reset no aplica */
    }
    publish(null);
  }, [resetKey, ready, publish]);

  // 4) Publicar el ejecutor del token (Enterprise o v3 clásico).
  useEffect(() => {
    if (!v3ExecutorRef) return;
    if (!effectiveV3 || !ready) {
      v3ExecutorRef.current = null;
      return;
    }
    const exec = (g: NonNullable<Window['grecaptcha']>, key: string) =>
      enterprise ? g.enterprise?.execute(key, { action }) : g.execute(key, { action });
    v3ExecutorRef.current = async () => {
      const g = window.grecaptcha;
      if (!g) return null;
      try {
        // Salvavidas: si Google no responde (key mal configurada, bloqueadores,
        // challenge interactivo de Enterprise…) no se permite que el submit quede
        // colgado. Enterprise INVISIBLE puede mostrar un reto y tardar, por eso se
        // dan 10s; a los 10s se sigue sin token.
        const timeoutMs = enterprise ? 10000 : 5000;
        const fresh = await Promise.race([
          Promise.resolve(exec(g, effectiveV3)).then((t) => t ?? null),
          new Promise<string | null>((resolve) => setTimeout(() => resolve(null), timeoutMs)),
        ]);
        onV3Token?.(fresh);
        if (enterprise) onV2Token?.(fresh);
        return fresh;
      } catch {
        onV3Token?.(null);
        return null;
      }
    };
    return () => {
      v3ExecutorRef.current = null;
    };
  }, [v3ExecutorRef, effectiveV3, ready, action, onV3Token, onV2Token, enterprise]);

  return (
    /**
     * Stacking: `relative isolate z-10` crea un contexto propio por encima de
     * las decoraciones de pagina (gradientes/paneles absolutos sin z) pero por
     * DEBAJO del chrome de layout (navbar, FABs, docks: z-40/50). Asi el widget
     * siempre es interactivo sin tapar la UI de la app.
     */
    <div className={`relative isolate z-10 flex flex-col items-center gap-2 ${className}`}>
      {enterprise ? (
        // Enterprise: sin widget visible; el badge lo pinta Google.
        <span className="pointer-events-none select-none text-[9px] text-faint font-bold uppercase tracking-widest">
          Protegido con reCAPTCHA Enterprise
        </span>
      ) : siteKeyV2 ? (
        <div ref={containerRef} data-testid="recaptcha-v2" />
      ) : (
        <p className="pointer-events-none text-amber-400 text-[10px] font-bold text-center max-w-[260px]">
          reCAPTCHA sin configurar (falta la site key de esta web). Contacta con soporte.
        </p>
      )}
      {scriptError && (
        <p className="pointer-events-none text-amber-400 text-[10px] font-bold text-center max-w-[260px]">
          No se pudo cargar reCAPTCHA. Revisa tu conexión o desactiva el bloqueador de scripts.
        </p>
      )}
      {!enterprise && siteKeyV2 && !token && !scriptError && (
        <span className="pointer-events-none text-gray-500 text-[10px] font-bold">{hint}</span>
      )}
      {!enterprise && siteKeyV3 && (
        <span className="pointer-events-none select-none text-[9px] text-faint font-bold uppercase tracking-widest">
          Protegido con reCAPTCHA v2 + v3
        </span>
      )}
    </div>
  );
}