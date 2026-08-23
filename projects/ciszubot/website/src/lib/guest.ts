export const GUEST_KEY = 'ciszu_guest_name';

/** Los invitados SIEMPRE se muestran en inglés, sin importar el idioma de la web. */
function normalizeGuest(name: string): string {
  return name.replace(/^Invitado\s*/, 'Guest').replace(/^Invite\s*/, 'Guest');
}

export function generateGuestName(): string {
  const randomId = secureRandomDigits(6);
  return `Guest${randomId}`;
}

function secureRandomDigits(length: number): string {
  const bytes = new Uint32Array(1);
  let digits = '';
  for (let i = 0; i < length; i += 1) {
    crypto.getRandomValues(bytes);
    digits += (bytes[0] % 10).toString();
  }
  return digits;
}

export function getGuestName(): string {
  if (typeof window === 'undefined') return 'Guest';
  const saved = localStorage.getItem(GUEST_KEY);
  if (saved) {
    const normalized = normalizeGuest(saved);
    if (normalized !== saved) localStorage.setItem(GUEST_KEY, normalized);
    return normalized;
  }
  const name = generateGuestName();
  localStorage.setItem(GUEST_KEY, name);
  return name;
}

export function setGuestName(name: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(GUEST_KEY, name);
}

export function getGuestId(): string {
  return `@${getGuestName().toLowerCase()}`;
}