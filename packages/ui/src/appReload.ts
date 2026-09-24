/**
 * Recargas VOLUNTARIAS de la aplicación (compartido por las 4 webs).
 *
 * Problema: `AdBlockerGuard` (y cualquier guard) re-evalúa su estado en cada
 * recarga MANUAL (F5 / Ctrl+R / botón recargar) porque la mayoría de adblockers
 * se activan/desactivan recargando. Pero hay recargas que NO son del usuario
 * pulsando F5, sino consecuencia de una acción DENTRO de la app (cambiar
 * tema/idioma, aceptar/rechazar cookies, etc.). Esas recargas son voluntarias y
 * provocadas por una acción explícita, así que el guard NO debe volver a
 * aparecer por ellas.
 *
 * Solución: antes de recargar, se marca `markVoluntaryReload()` (flag en
 * sessionStorage con marca de tiempo). Al arrancar la página, el guard llama a
 * `consumeVoluntaryReload()`: si la marca es reciente, la recarga se trata como
 * navegación normal (se respeta la elección guardada) y la marca se consume para
 * que un posterior F5 real vuelva a re-evaluar.
 *
 * El flag vive en sessionStorage (sobrevive a la recarga, muere con la pestaña)
 * y expira por TTL para no suprimir un F5 legítimo mucho después.
 */

export const VOLUNTARY_RELOAD_KEY = 'ciszu_voluntary_reload';
const DEFAULT_TTL_MS = 30 * 1000; // 30s

/** Marca que la próxima recarga es voluntaria (provocada por una acción de la UI). */
export function markVoluntaryReload(): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(VOLUNTARY_RELOAD_KEY, String(Date.now()));
  } catch {
    /* sessionStorage no disponible: se ignora */
  }
}

/**
 * ¿La recarga recién ocurrida fue voluntaria? Consume la marca (se lee una sola
 * vez) para que una recarga posterior no se vea afectada.
 */
export function consumeVoluntaryReload(ttlMs: number = DEFAULT_TTL_MS): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const raw = window.sessionStorage.getItem(VOLUNTARY_RELOAD_KEY);
    if (!raw) return false;
    window.sessionStorage.removeItem(VOLUNTARY_RELOAD_KEY);
    const at = Number(raw);
    return Number.isFinite(at) && Date.now() - at <= ttlMs;
  } catch {
    return false;
  }
}

/**
 * Recarga la página marcándola como voluntaria. Usar SIEMPRE en recargas que
 * dispara la propia UI (cambiar tema/idioma, cookies, etc.).
 * Los llamados repetidos reinician el temporizador (no se acumulan recargas).
 */
let reloadTimer: number | null = null;

export function reloadPage(delayMs = 0): void {
  if (typeof window === 'undefined') return;
  const doReload = () => {
    reloadTimer = null;
    markVoluntaryReload();
    window.location.reload();
  };
  if (reloadTimer !== null) window.clearTimeout(reloadTimer);
  if (delayMs > 0) reloadTimer = window.setTimeout(doReload, delayMs);
  else doReload();
}
