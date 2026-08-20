export const GUEST_KEY = 'ciszu_guest_name';

export function generateGuestName(): string {
  const randomId = Math.floor(100000 + Math.random() * 900000).toString();
  return `Invitado${randomId}`;
}

export function getGuestName(): string {
  if (typeof window === 'undefined') return 'Invitado';
  const saved = localStorage.getItem(GUEST_KEY);
  if (saved) return saved;
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