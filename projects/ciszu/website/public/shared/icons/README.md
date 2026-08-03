# Sistema de Iconos de Ciszu Network

## Estadísticas
- **Total SVGs**: 5,194 iconos unificados
- **filled/** — 3,335 iconos
- **outline/** — 1,814 iconos
- **flags/** — 45 banderas
- **Formato único**: SVG (sin PNG, sin AI, sin sprites)
- **Fuentes**: Font Awesome + Remix Icons + Material Design

---

## Estructura

```
shared/icons/
└── svg/
    ├── filled/       # Iconos rellenos
    ├── outline/      # Iconos con contorno
    └── flags/        # Banderas de países
```

---

## Nomenclatura

```
shared/icons/svg/{estilo}/{nombre}.svg
```

El nombre del archivo es el nombre semántico del icono. El estilo lo define la carpeta que lo contiene, no el nombre del archivo.

### Reglas

1. **Sin prefijo de fuente**: Font Awesome (`fa-*`), Remix Icons (`ri-*`), flags (`flag-*`) → prefijo eliminado
2. **Sin sufijo de estilo**: `_filled`, `_outline`, `_flag` → eliminado (el estilo es la carpeta)
3. **Sin números/letras genéricos**: `0.svg`, `a.svg` se conservan solo si existen con ese nombre oficial (Font Awesome tiene iconos para letras A-Z y números)

### Ejemplos

| Ruta | Fuente original |
|---|---|
| `filled/address-book.svg` | Font Awesome (`fa-filled-address-book`) |
| `outline/address-book.svg` | Font Awesome (`fa-outline-address-book`) |
| `outline/ri-24-hours.svg` | Remix Icons (`ri-outline-24-hours`) |
| `filled/md-cloud.svg` | Material Design (colisión con FA, prefijo `md-`) |
| `flags/ar.svg` | Bandera Argentina (antes `flag-ar` o `ar_flag`) |

### Banderas

Los nombres de banderas usan el código ISO 3166-1 alpha-2 del país en minúsculas:

```
flags/ar.svg    # Argentina
flags/br.svg    # Brasil
flags/cl.svg    # Chile
flags/es.svg    # España
flags/us.svg    # Estados Unidos
flags/ve.svg    # Venezuela
```

### Prefijos especiales

| Prefijo | Fuente | Ejemplo |
|---|---|---|
| `ri-` | Remix Icons | `ri-24-hours.svg`, `ri-admin.svg` |
| `md-` | Material Design (solo si hay colisión) | `md-battery-full.svg`, `md-cloud.svg` |
| (ninguno) | Font Awesome / genérico | `address-book.svg`, `user.svg` |

---

## Uso en código

```typescript
import { resolveIcon } from '@ciszunetwork/cdn';

// Font Awesome
resolveIcon('address-book', 'filled');
// → /icons/svg/filled/address-book.svg

// Remix Icons
resolveIcon('ri-24-hours', 'outline');
// → /icons/svg/outline/ri-24-hours.svg

// Bandera
resolveIcon('ar', 'flag');
// → /icons/svg/flags/ar.svg
```

---

## Notas

- Los SVG son la fuente de verdad única. No se generan PNG ni se almacenan archivos AI.
- Para subir al CDN, usar `pnpm cdn:upload` que sube `shared/icons/svg/` completo.
- Los iconos numéricos (`0.svg`…`9.svg`) y alfabéticos (`a.svg`…`z.svg`) son los caracteres de Font Awesome, no errores de nomenclatura.
