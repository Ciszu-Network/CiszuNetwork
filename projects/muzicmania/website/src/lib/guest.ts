export const GUEST_KEY = 'play_guest_name';

/** Los invitados SIEMPRE se muestran en inglés, sin importar el idioma de la web. */
function normalizeGuest(name: string): string {
  return name.replace(/^Invitado\s*/, 'Guest').replace(/^Invite\s*/, 'Guest');
}

export function generateGuestName(): string {
  const randomId = Math.floor(100000 + Math.random() * 900000).toString();
  return `Guest${randomId}`;
}

export function getGuestName(): string {
  if (typeof window === 'undefined') return generateGuestName();
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
