const GUEST_KEY = 'ciszu_guest_name';

function randomDigits(): string {
  let digits = '';
  for (let i = 0; i < 6; i += 1) {
    digits += Math.floor(Math.random() * 10).toString();
  }
  return digits;
}

/**
 * Sistema de invitados (solo frontend). Genera un nombre "Invitado XXXXXX"
 * la primera vez y lo reutiliza desde localStorage. Nunca se persiste en BD.
 */
export function getGuestName(): string {
  if (typeof window === 'undefined') return '';
  try {
    let name = window.localStorage.getItem(GUEST_KEY);
    if (!name) {
      name = `Invitado ${randomDigits()}`;
      window.localStorage.setItem(GUEST_KEY, name);
    }
    return name;
  } catch {
    return `Invitado ${randomDigits()}`;
  }
}