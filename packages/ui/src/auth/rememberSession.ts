/**
 * Persistencia de sesión "recordar" (por website).
 *
 * - Con "recordar" activo: la sesión de Supabase se guarda en `localStorage`
 *   y sobrevive reinicios del navegador.
 * - Sin "recordar": se guarda en `sessionStorage` y se pierde al cerrar el
 *   navegador (comportamiento conservador por defecto).
 *
 * La expiración ABSOLUTA de la sesión la define Supabase Auth (configuración
 * del proyecto); esto decide la persistencia en el dispositivo. La clave es
 * por website para que cada web pueda tener su propia decisión.
 */

const KEY = (site: string) => `ciszu-remember-session:${site}`;

export function isRememberEnabled(site: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(KEY(site)) === 'on';
  } catch {
    return false;
  }
}

export function setRememberEnabled(site: string, enabled: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(KEY(site), enabled ? 'on' : 'off');
    migrateAuthTokens(enabled);
  } catch {
    /* almacenamiento no disponible */
  }
}

/** Pasa los tokens de auth ya existentes al almacén recién elegido. */
function migrateAuthTokens(toLocal: boolean): void {
  const isAuthKey = (k: string) => k.startsWith('sb-') && k.includes('auth-token');
  const from = toLocal ? sessionStorage : localStorage;
  const to = toLocal ? localStorage : sessionStorage;
  const keys: string[] = [];
  for (let i = 0; i < from.length; i++) {
    const k = from.key(i);
    if (k && isAuthKey(k)) keys.push(k);
  }
  for (const k of keys) {
    const value = from.getItem(k);
    if (value != null) to.setItem(k, value);
    from.removeItem(k);
  }
}

/** Adaptador de almacenamiento para `createClient({ auth: { storage } })`. */
export function createRememberStorage(site: string): {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
} {
  return {
    getItem(key) {
      if (typeof window === 'undefined') return null;
      try {
        return isRememberEnabled(site)
          ? (localStorage.getItem(key) ?? sessionStorage.getItem(key))
          : (sessionStorage.getItem(key) ?? localStorage.getItem(key));
      } catch {
        return null;
      }
    },
    setItem(key, value) {
      if (typeof window === 'undefined') return;
      try {
        if (isRememberEnabled(site)) {
          localStorage.setItem(key, value);
          sessionStorage.removeItem(key);
        } else {
          sessionStorage.setItem(key, value);
          localStorage.removeItem(key);
        }
      } catch {
        /* almacenamiento no disponible */
      }
    },
    removeItem(key) {
      if (typeof window === 'undefined') return;
      try {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
      } catch {
        /* almacenamiento no disponible */
      }
    },
  };
}
