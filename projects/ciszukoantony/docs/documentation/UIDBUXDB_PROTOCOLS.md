# Ciszuko Antony — UI/UX Design Brief

Version: 1.0.0
Actualizacion: 2026-08-26
Identificador: UIDBUXDB_ciszukoantony_PROTOCOLS_V1.0.0_2026_08_26_ciszunetwork

> **Definicion**: Brief de diseno UI/UX de Ciszuko Antony.

---


## 1. Identidad

- **Vibe**: artista/creativo, suave. **Paleta**: violeta/lavanda + cyan. **Tipografia**: Exo2 / Rajdhani. **Tema**: dark + light.

## 2. Principios de diseno

- Neon sobre oscuro; acentos de marca; claro/oscuro consistente.
- Componentes compartidos via @ciszu/ui (Modal, Toast, Ads, Navbar/Footer propios por web).
- Los anuncios NUNCA se incrustan: overlays flotantes (regla de diseno).

## 3. Sistema de componentes

- Radix (Dialog, Toast), Tailwind, iconos CDN. Tokens en `@ciszu/ui`.
- Storybook/Chromatic para documentar componentes (dev-only).

## 4. Accesibilidad y responsive

- Contraste, foco, ARIA; mobile-first; animaciones suaves (framer-motion).

## 5. Marca y assets

- Assets via CDN (`@ciszunetwork/cdn`, Supabase Storage). Logos de marca en `projects/<web>/content`.

---
_Ultima revision: 2026-08-26_. Relacionado: GLOBAL_SYSTEM (GLOBAL_COMPONENTS, STYLES, COLOR), UI_COMPONENTS_SYSTEM.
