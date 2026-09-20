'use client';

/**
 * RecaptchaGate — doble protección reCAPTCHA v2 + v3 en los formularios de auth.
 *
 * POR QUÉ LOS DOS:
 *  - v2 (checkbox visible) es la prueba que el usuario resuelve y que Google
 *    necesita para aprobar los sitios; además hace el bloqueo evidente.
 *  - v3 (invisible) corre en segundo plano en cada envío y aporta una
 *    puntuación de riesgo sin interacción.
 *
 * DETALLE IMPORTANTE DEL SCRIPT: `api.js` solo se puede cargar UNA vez por
 * página. Para habilitar v3 hay que cargarlo con `?render=<site key v3>`; a
 * partir de ahí el widget de v2 se monta con `grecaptcha.render(...)` explícito.
 * Cargarlo dos veces (una por versión) hacía que el widget no apareciera: ese
 * era el motivo de "no aparecen los reCAPTCHA en el register".
 *
 * El token de v3 es de UN SOLO USO y caduca en 2 minutos, por eso no se pide al
 * montar: se pide justo antes de enviar, con `v3ExecutorRef`.
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
    };
  }
}

const SCRIPT_ID = 'ciszu-recaptcha-api';
const SCRIPT_BASE = 'https://www.google.com/recaptcha/api.js';

let scriptPromise: Promise<void> | null = null;

/** Carga `api.js` una sola vez (idempotente y compartida entre componentes). */
export function loadRecaptcha(v3SiteKey?: string): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.grecaptcha) return Promise.resolve();
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
    // `render=<v3 key>` habilita v3; si no hay v3 se usa render=explicit para v2.
    script.src = v3SiteKey
      ? `${SCRIPT_BASE}?render=${encodeURIComponent(v3SiteKey)}`
      : `${SCRIPT_BASE}?render=explicit`;
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
  /** Site key de reCAPTCHA v2 (checkbox). */
  siteKeyV2: string;
  /** Site key de reCAPTCHA v3 (invisible). Opcional pero recomendado. */
  siteKeyV3?: string;
  /** Acción reportada a Google en el token de v3. */
  action?: string;
  theme?: 'dark' | 'light';
  /** Token de v2 (null mientras no se resuelve o si caduca). */
  onV2Token?: (token: string | null) => void;
  /** Token de v3 listo para enviar (se pide bajo demanda). */
  onV3Token?: (token: string | null) => void;
  /**
   * Ref donde se publica el ejecutor de v3. El formulario lo llama justo antes
   * de enviar: `const v3 = await v3ExecutorRef.current?.()`.
   */
  v3ExecutorRef?: React.MutableRefObject<(() => Promise<string | null>) | null>;
  /** Cambiar este número reinicia el widget de v2 (tras un envío fallido). */
  resetKey?: number;
  /** Texto de aviso mostrado si falta completar el v2. */
  hint?: string;
  className?: string;
}

export default function RecaptchaGate({
  siteKeyV2,
  siteKeyV3,
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

  const publish = useCallback(
    (value: string | null) => {
      setToken(value);
      onV2Token?.(value);
    },
    [onV2Token],
  );

  // 1) Cargar api.js (una vez) con el site key de v3.
  useEffect(() => {
    if (!siteKeyV2) return;
    let cancelled = false;
    loadRecaptcha(siteKeyV3)
      .then(() => {
        if (!cancelled) setReady(true);
      })
      .catch(() => {
        if (!cancelled) setScriptError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [siteKeyV2, siteKeyV3]);

  // 2) Montar el widget de v2 en cuanto el script esté listo.
  useEffect(() => {
    if (!ready || !siteKeyV2 || !containerRef.current || widgetId.current !== null) return;
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
  }, [ready, siteKeyV2, theme, publish]);

  // 3) Reinicio del widget (token de v2 quemado tras un envío fallido).
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

  // 4) Publicar el ejecutor de v3 (token fresco y de un solo uso).
  useEffect(() => {
    if (!v3ExecutorRef) return;
    if (!siteKeyV3 || !ready) {
      v3ExecutorRef.current = null;
      return;
    }
    v3ExecutorRef.current = async () => {
      const g = window.grecaptcha;
      if (!g) return null;
      try {
        const fresh = await g.execute(siteKeyV3, { action });
        onV3Token?.(fresh);
        return fresh;
      } catch {
        onV3Token?.(null);
        return null;
      }
    };
    return () => {
      v3ExecutorRef.current = null;
    };
  }, [v3ExecutorRef, siteKeyV3, ready, action, onV3Token]);

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      {siteKeyV2 ? (
        <div ref={containerRef} data-testid="recaptcha-v2" />
      ) : (
        <p className="text-amber-400 text-[10px] font-bold text-center max-w-[260px]">
          reCAPTCHA sin configurar (falta la site key de esta web). Contacta con soporte.
        </p>
      )}
      {scriptError && (
        <p className="text-amber-400 text-[10px] font-bold text-center max-w-[260px]">
          No se pudo cargar reCAPTCHA. Revisa tu conexión o desactiva el bloqueador de scripts.
        </p>
      )}
      {siteKeyV2 && !token && !scriptError && (
        <span className="text-gray-500 text-[10px] font-bold">{hint}</span>
      )}
      {siteKeyV3 && (
        <span className="text-[9px] text-faint font-bold uppercase tracking-widest">
          Protegido con reCAPTCHA v2 + v3
        </span>
      )}
    </div>
  );
}
