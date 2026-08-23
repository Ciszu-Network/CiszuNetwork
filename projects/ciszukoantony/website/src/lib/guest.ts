const GUEST_KEY = 'ciszu_guest_name';

function randomDigits(): string {
  const bytes = new Uint32Array(1);
  let digits = '';
  for (let i = 0; i < 6; i += 1) {
    crypto.getRandomValues(bytes);
    digits += (bytes[0] % 10).toString();
  }
  return digits;
}

/**
 * Sistema de invitados (solo frontend). Genera un nombre "Guest XXXXXX"
 * la primera vez y lo reutiliza desde localStorage. Nunca se persiste en BD.
 * Los invitados SIEMPRE se muestran en inglés, sin importar el idioma.
 */
export function getGuestName(): string {
  if (typeof window === 'undefined') return '';
  try {
    let name = window.localStorage.getItem(GUEST_KEY);
    if (!name) {
      name = `Guest ${randomDigits()}`;
      window.localStorage.setItem(GUEST_KEY, name);
    } else if (/^Invitado/.test(name)) {
      name = name.replace(/^Invitado\s*/, 'Guest ');
      window.localStorage.setItem(GUEST_KEY, name);
    }
    return name;
  } catch {
    return `Guest ${randomDigits()}`;
  }
}