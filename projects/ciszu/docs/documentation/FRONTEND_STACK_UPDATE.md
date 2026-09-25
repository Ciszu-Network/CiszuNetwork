# FRONTEND_STACK_UPDATE — Actualización de librerías frontend (2026-09-13)

Identificador: FRONTEND_STACK_UPDATE_V1.0.0_2026_09_13_ciszunetwork

> Actualiza el stack de las 4 webs Next.js con librerías nuevas preparadas para uso futuro.
> Complementa `FULL_STACK_SYSTEM.md`, `FRONTEND_SYSTEM.md`, `STYLES_SYSTEM.md` y `PACKAGES_SYSTEM.md`.

---

## 1. Objetivo

Instalar y dejar configuradas librerías auxiliares y motores de juego sin reescribir las páginas existentes. El foco es:

- Dejar las dependencias listas en las 4 webs.
- Configurar `shadcn/ui` para uso futuro.
- Instalar motores 2D en MuzicMania sin cambiar el gameplay actual todavía.
- Documentar el nuevo stack.

---

## 2. Cambios por proyecto

### 2.1 MuzicMania (`projects/muzicmania/website`)

**Nuevas dependencias:**

| Paquete | Versión | Propósito |
|---------|---------|-----------|
| `pixi.js` | latest | Motor 2D WebGL para futuro canvas del juego |
| `phaser` | latest | Framework de juego 2D con escenas, físicas y audio |
| `recharts` | latest | Charts para stats/leaderboards |
| `embla-carousel-react` | latest | Carruseles para galerías/niveles |
| `react-intersection-observer` | latest | Reveal on scroll |
| `next-themes` | latest | Tema claro/oscuro |
| `@heroui/react` | latest | NextUI (sucesor oficial) |
| `tailwindcss-animate` | latest | Animaciones para shadcn/ui |
| `class-variance-authority` | latest | Variantes de componentes |
| `clsx` | latest | Utilidad de clases |
| `tailwind-merge` | latest | Merge de clases Tailwind |

**Configuración agregada:**

- `components.json` con estilo `new-york`, aliases `@/components`, `@/lib/utils`, `@/components/ui`.
- `src/lib/utils.ts` con helper `cn()`.

### 2.2 Ciszu Network (`projects/ciszu/website`)

**Nuevas dependencias:**

| Paquete | Versión | Propósito |
|---------|---------|-----------|
| `recharts` | latest | Charts para stats/analíticas |
| `embla-carousel-react` | latest | Carruseles para proyectos/docs |
| `react-intersection-observer` | latest | Reveal on scroll |
| `next-themes` | latest | Tema claro/oscuro |
| `@heroui/react` | latest | NextUI (sucesor oficial) |
| `tailwindcss-animate` | latest | Animaciones para shadcn/ui |
| `class-variance-authority` | latest | Variantes de componentes |
| `clsx` | latest | Utilidad de clases |
| `tailwind-merge` | latest | Merge de clases Tailwind |

**Configuración agregada:**

- `components.json`
- `src/lib/utils.ts`

### 2.3 Ciszuko Antony (`projects/ciszukoantony/website`)

**Nuevas dependencias:**

| Paquete | Versión | Propósito |
|---------|---------|-----------|
| `recharts` | latest | Charts para estadísticas |
| `embla-carousel-react` | latest | Carruseles para portfolio/media |
| `react-intersection-observer` | latest | Reveal on scroll |
| `next-themes` | latest | Tema claro/oscuro |
| `@heroui/react` | latest | NextUI (sucesor oficial) |
| `tailwindcss-animate` | latest | Animaciones para shadcn/ui |
| `class-variance-authority` | latest | Variantes de componentes |
| `clsx` | latest | Utilidad de clases |
| `tailwind-merge` | latest | Merge de clases Tailwind |

**Configuración agregada:**

- `components.json`
- `src/lib/utils.ts`

### 2.4 CiszuBot (`projects/ciszubot/website`)

**Nuevas dependencias:**

| Paquete | Versión | Propósito |
|---------|---------|-----------|
| `recharts` | latest | Charts para dashboard/stats |
| `embla-carousel-react` | latest | Carruseles para features |
| `react-intersection-observer` | latest | Reveal on scroll |
| `next-themes` | latest | Tema claro/oscuro |
| `@heroui/react` | latest | NextUI (sucesor oficial) |
| `tailwindcss-animate` | latest | Animaciones para shadcn/ui |
| `class-variance-authority` | latest | Variantes de componentes |
| `clsx` | latest | Utilidad de clases |
| `tailwind-merge` | latest | Merge de clases Tailwind |

**Configuración agregada:**

- `components.json`
- `src/lib/utils.ts`

---

## 3. Configuración técnica

### 3.1 shadcn/ui

Cada web tiene un `components.json` con:

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.mjs",
    "css": "src/app/globals.css",
    "baseColor": "slate",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "iconLibrary": "lucide"
}
```

Y `src/lib/utils.ts`:

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### 3.2 Tailwind

- Tailwind 4 con configuración en `globals.css` (`@theme {}`).
- `tailwind.config.mjs` queda como archivo de compatibilidad vacío.
- No se requiere modificación adicional por ahora.

### 3.3 Temas

- `next-themes` instalado. No activado todavía; se activará cuando se implemente el toggle de tema claro/oscuro en layouts.

---

## 4. Uso y próximos pasos

### 4.1 Motores de juego (MuzicMania)

**Estado actual:**

- `pixi.js` y `phaser` instalados pero **no integrados** al juego todavía.
- El gameplay actual sigue usando el canvas 2D vanilla en `src/hooks/useGameEngine.ts`.

**Próximos pasos sugeridos:**

1. Crear `src/engine/pixi/` y `src/engine/phaser/` como wrappers separados.
2. Migrar el render de flechas/notas a PixiJS manteniendo la lógica de `useGameEngine`.
3. Evaluar si Phaser aporta valor en modos específicos (editor de charts, tutorial, cinemáticas).
4. NO mezclar PixiJS + Phaser en el mismo gameplay sin una capa de abstracción clara.

### 4.2 shadcn/ui

- Los componentes se pueden agregar con `pnpm dlx shadcn@latest add <componente>`.
- Primeros candidatos: `Button`, `Card`, `Dialog`, `Sheet`, `DropdownMenu`.
- Se recomienda usar `@heroui/react` para componentes complejos y `shadcn/ui` para componentes ligeros.

### 4.3 Librerías de apoyo

- `recharts`: usar en `/stats` de MuzicMania y páginas de estadísticas generales.
- `embla-carousel-react`: usar en `/cursos`, `/projects`, galleries.
- `react-intersection-observer`: usar para reveal animations en home y about.
- `next-themes`: activar en `MainLayout` o layout global cuando se implemente el toggle.

---

## 5. Notas importantes

- **No se rewrites páginas existentes**: solo se instalaron dependencias y configuración base.
- **Framer Motion** ya estaba presente en todas las webs; se mantiene.
- **@ciszu/ui** sigue siendo el paquete compartido principal; las nuevas libs son por-proyecto.
- **nextlib**: no se instaló porque no hay un paquete React oficial reconocido con ese nombre; se descartó `com.next.nextlib` (Unity). Si hay una librería específica en mente, indicar el paquete npm exacto.

---

## 6. Verificación

- `pnpm run lint` en las 4 webs: OK.
- `pnpm exec tsc --noEmit` en las 4 webs: OK.
- No hay cambios rotativos en páginas existentes.

---

_Última revisión: 13 sep 2026._ Relacionado: `FULL_STACK_SYSTEM.md`, `FRONTEND_SYSTEM.md`, `STYLES_SYSTEM.md`, `PACKAGES_SYSTEM.md`, `PROJECTS_SYSTEM.md`, `STATUS_SYSTEM.md`.
