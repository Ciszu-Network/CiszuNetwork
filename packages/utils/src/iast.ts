/**
 * IAST — Interactive Application Security Testing (sensor runtime ligero).
 *
 * Contrario al SAST (análisis estático) y al DAST (ataque externo), el IAST se
 * coloca COMO SENSOR DENTRO de la aplicación y observa el tráfico real en
 * tiempo de ejecución. Este módulo es un IAST práctico y sin dependencias npm:
 * analiza cada request en busca de payloads maliciosos conocidos (SQLi, XSS,
 * path traversal, command injection, exfiltración de secrets) y emite
 * observaciones estructuradas.
 *
 * - Edge-safe: solo regex puras y estructuras de datos planas (no usa Node
 *   APIs) → puede correr en el middleware de Next.js (edge runtime) y en
 *   cualquier runtime JS.
 * - Dedupe en memoria: evita spamear el log con el mismo ataque repetido
 *   (fingerprint = payload + ruta + método, TTL 5 min).
 * - No bloquea tráfico: solo observa y notifica (el bloqueo lo hacen
 *   Turnstile/rate limit). Los findings salen por `console.warn` con prefijo
 *   `[IAST]` (estructurado para ser consumido por logs de Vercel/Sentry).
 *
 * Uso (en el middleware de cada web):
 *   import { iastMiddleware } from '@ciszunetwork/utils';
 *   const iast = iastMiddleware('ciszunetwork');
 *   // en middleware(): iast.observe(request); // NextRequest edge-safe
 *
 * Tests: packages/utils/tests/iast.test.ts
 */

export type IastSeverity = 'info' | 'medium' | 'high' | 'critical';

export interface IastFinding {
  type: string;
  severity: IastSeverity;
  /** Regex (o nombre) que disparó el finding */
  rule: string;
  /** Valor visto (truncado, redactado de secrets) */
  evidence: string;
  /** Parametro o campo donde se encontró */
  source: 'path' | 'query' | 'body' | 'header';
}

export interface IastObservation {
  app: string;
  method: string;
  path: string;
  ip?: string;
  findings: IastFinding[];
  detectedAt: string;
}

/** Fingerprint de dedupe: tipo + ruta + método + evidencia truncada */
function fingerprint(f: IastFinding, method: string, path: string) {
  return `${f.type}|${method}|${path}|${f.evidence.slice(0, 64)}`;
}

const DEDUPE_TTL_MS = 5 * 60 * 1000;

/**
 * Reglas de detección. Cada regla: nombre, severidad y regex que busca en
 * valores de parámetros/headers/cuerpo. Las regex están diseñadas para
 * detectar PROBES y payloads conocidos: un falso positivo en una app de
 * contenido (blogs/landing) es aceptable porque el IAST solo observa.
 */
const RULES: Array<{ type: string; severity: IastSeverity; re: RegExp }> = [
  // SQL Injection
  {
    type: 'sql-injection',
    severity: 'critical',
    re: /\b((union)\s+(all\s+)?select|select\s+.*\s+(from|where)|insert\s+into|drop\s+table|update\s+\w+\s+set|or\s+1=1|or\s+'1'='1|--\s*$|;\s*(exec|shutdown)|@@version|pg_sleep|sleep\s*\(\d{2,}\))/i,
  },
  // XSS
  {
    type: 'xss',
    severity: 'high',
    re: /(<script[\s>/]|<\/script>|javascript:\s*(alert|prompt|confirm|fetch|eval)|onerror\s*=|onload\s*=|onclick\s*=|<img[^>]+onerror|<svg\s+onload|<iframe[\s>]|document\.cookie|\.innerHTML\s*=)/i,
  },
  // Path Traversal
  {
    type: 'path-traversal',
    severity: 'high',
    re: /(\.\.\/|\.\.\\|\.\.%2f|\.\.%5c|%2e%2e%2f|(etc|windows)\/(passwd|system32)|file:\/\/\/|file:\/\/)/i,
  },
  // Command Injection
  {
    type: 'command-injection',
    severity: 'critical',
    re: /(;\s*(rm|cat|ls|curl|wget|id|whoami|uname|nc)\b|(\|\||&&|;)\s*(bash|sh|cmd|powershell)\b|\$\(|`|\${IFS}|%0a|%0d%0a)/i,
  },
  // Exfiltración de secrets en parámetros/headers (DACP runtime)
  {
    type: 'secret-in-request',
    severity: 'high',
    re: /(api[_-]?key|secret|token|password|passwd|client[_-]?secret|private[_-]?key|authorization)\s*[=:]+\s*([a-z0-9_\-]{16,})/i,
  },
  // SSRF-aware URL smuggling (localhost / red privada)
  {
    type: 'ssrf-localhost',
    severity: 'high',
    re: /(https?:\/\/(127\.0\.0\.1|localhost|0\.0\.0\.0|10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.|169\.254\.))(:\d+)?(\/|$)/i,
  },
  // Detección de escáneres (probes de bots maliciosos)
  {
    type: 'scanner-probe',
    severity: 'medium',
    re: /(\.env|\.git\/|\.aws\/|wp-admin|phpinfo|\.htaccess|\.ssh\/|admin\.php|config\.json|docker-compose|web\.config|bash_history)/i,
  },
];

/** Máximo de caracteres que se analizan del cuerpo (evita DoS por body gigante) */
export const MAX_BODY_SCAN = 4096;
/** Longitud máxima de evidencia en el finding (redacción) */
const MAX_EVIDENCE = 200;

function truncate(v: string): string {
  return v.length > MAX_EVIDENCE ? `${v.slice(0, MAX_EVIDENCE)}…` : v;
}

/** Redacta secretos largos de la evidencia (DACP: no re-exponer el valor) */
function redact(v: string): string {
  return v.replace(/(=|\s)[a-z0-9_\-]{16,}([=&'"\s]|$)/gi, (m) =>
    m.replace(/[a-z0-9_\-]{16,}/i, '[REDACTED]')
  );
}

function scanValue(value: string): IastFinding[] {
  const findings: IastFinding[] = [];
  for (const rule of RULES) {
    const m = rule.re.exec(value);
    if (m) {
      findings.push({
        type: rule.type,
        severity: rule.severity,
        rule: m[0].slice(0, 48),
        evidence: truncate(redact(value)),
        source: 'query',
      });
    }
  }
  return findings;
}

export interface IastController {
  /** Analiza método + path + query params (edge-safe), emite warnings con dedupe */
  observe(method: string, path: string, params?: Record<string, string>): IastObservation | null;
  /** Analiza un cuerpo JSON/texto opcional (fuera del middleware si se consume el body) */
  observeBody(body: string | undefined): IastFinding[];
  /** Expone los hallazgos activos (útiles para tests/estadísticas) */
  stats(): { total: number; last: IastObservation | null };
}

const _dedupe = new Map<string, number>();

/**
 * Crea un sensor IAST por aplicación (las 4 webs usan la misma implementación,
 * cada una con su contexto de app). Retorna null cuando no hay findings
 * (para no modificar el flujo del middleware).
 */
export function createIast(app: string, options?: { enabled?: boolean }): IastController {
  const enabled = options?.enabled !== false;
  let total = 0;
  let last: IastObservation | null = null;

  const emit = (obs: IastObservation) => {
    total++;
    last = obs;
    if (enabled) {
      // Prefijo [IAST] estructurado — consumible por Vercel Logs/Sentry
      console.warn(`[IAST] ${JSON.stringify(obs)}`);
    }
  };

  const record = (method: string, path: string, rawFindings: IastFinding[]): IastObservation | null => {
    if (!rawFindings.length) return null;
    // Dedupe interno: mismo tipo + misma fuente + misma regla disparada
    // (p.ej. el payload aparece a la vez en el valor y en el par k=v →
    // colapsa a una sola entrada; variantes distintas sí se conservan).
    const seen = new Set<string>();
    const findings = rawFindings.filter((f) => {
      const k = `${f.type}|${f.source}|${f.rule}`;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
    if (!findings.length) return null;
    const obs: IastObservation = { app, method, path, findings, detectedAt: new Date().toISOString() };

    // Dedupe: registrar solo si no se vio el mismo fingerprint hace < TTL
    const fps = findings.map((f) => fingerprint(f, method, path));
    const now = Date.now();
    const fresh = fps.filter((fp) => {
      const prev = _dedupe.get(fp);
      if (prev && now - prev < DEDUPE_TTL_MS) return false;
      _dedupe.set(fp, now);
      return true;
    });
    if (!fresh.length) return obs; // reiteración del mismo ataque: no re-emitir
    emit(obs);
    return obs;
  };

  return {
    observe(method, path, params) {
      const findings: IastFinding[] = [];
      // Path en crudo (decodificado simple)
      const pathFindings = scanValue(path);
      findings.push(
        ...pathFindings.map((f) => ({ ...f, source: 'path' as const }))
      );
      // Parámetros de query
      if (params) {
        for (const [k, v] of Object.entries(params)) {
          if (v === undefined || v === null) continue;
          const val = String(v);
          // El nombre del parámetro también puede tener payload (p.ej. ?<script>=1)
          const keyFindings = scanValue(k).map((f) => ({ ...f, source: 'query' as const }));
          const valFindings = scanValue(val);
          // La regla de secrets necesita el par nombre=valor (p.ej. api_key=xxx)
          const pairFindings = scanValue(`${k}=${val}`).map((f) => ({ ...f, source: 'query' as const }));
          findings.push(...keyFindings, ...valFindings, ...pairFindings);
        }
      }
      return record(method, path, findings);
    },
    observeBody(body) {
      if (!body) return [];
      return scanValue(body.slice(0, MAX_BODY_SCAN));
    },
    stats() {
      return { total, last };
    },
  };
}

/** Instancia global por defecto (patrón utilidades del repo) */
const defaultIast = createIast('default-utils');
export const iast = defaultIast;

/** Reset del dedupe global (uso en tests) */
export function resetIastDedupe(): void {
  _dedupe.clear();
}