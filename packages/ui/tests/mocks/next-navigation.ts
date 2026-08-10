// Stub de next/navigation para tests de @ciszu/ui (vitest corre desde la raíz del
// monorepo, donde next no está instalado — ver alias en vitest.config.mts).
export function usePathname() {
  return '/';
}

export function useSearchParams() {
  return new URLSearchParams();
}
