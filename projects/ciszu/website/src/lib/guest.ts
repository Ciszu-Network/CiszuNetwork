'use client';

/**
 * Helper de invitado — solo frontend, nunca va a base de datos.
 * Genera un nombre "Invitado" + 6 dígitos aleatorios y lo reutiliza
 * desde localStorage (clave `ciszu_guest_name`).
 */

export const GUEST_STORAGE_KEY = 'ciszu_guest_name';

export function getGuestName(): string {
  if (typeof window === 'undefined') return 'Invitado';
  const existing = window.localStorage.getItem(GUEST_STORAGE_KEY);
  if (existing) return existing;
  const digits = Math.floor(100000 + Math.random() * 900000).toString();
  const name = `Invitado${digits}`;
  try {
    window.localStorage.setItem(GUEST_STORAGE_KEY, name);
  } catch {
    // Sin persistencia posible: devolver el nombre generado en memoria.
  }
  return name;
}