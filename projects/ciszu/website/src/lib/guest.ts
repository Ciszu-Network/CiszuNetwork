'use client';

/**
 * Helper de invitado — solo frontend, nunca va a base de datos.
 * Genera un nombre "Guest" + 6 dígitos aleatorios y lo reutiliza
 * desde localStorage (clave `ciszu_guest_name`).
 * Los invitados SIEMPRE se muestran en inglés, sin importar el idioma.
 */

export const GUEST_STORAGE_KEY = 'ciszu_guest_name';

function normalizeGuest(name: string): string {
  return name.replace(/^Invitado\s*/, 'Guest').replace(/^Invite\s*/, 'Guest');
}

export function getGuestName(): string {
  if (typeof window === 'undefined') return 'Guest';
  const existing = window.localStorage.getItem(GUEST_STORAGE_KEY);
  if (existing) {
    const normalized = normalizeGuest(existing);
    if (normalized !== existing) {
      try {
        window.localStorage.setItem(GUEST_STORAGE_KEY, normalized);
      } catch {
        /* sin persistencia: usar en memoria */
      }
    }
    return normalized;
  }
  const digits = Math.floor(100000 + Math.random() * 900000).toString();
  const name = `Guest${digits}`;
  try {
    window.localStorage.setItem(GUEST_STORAGE_KEY, name);
  } catch {
    // Sin persistencia posible: devolver el nombre generado en memoria.
  }
  return name;
}