# TEST_FUNNY — Proyectos, Páginas y Pruebas con Humor (Ciszu Network)

Versión: 1.0.0
Actualización: 2026-09-02
Identificador: TEST_FUNNY_V1.0.0_2026_09_02_ciszunetwork

> **Definición**: catálogo de proyectos, páginas y pruebas creadas con fines de
> **humor y diversión** dentro del ecosistema Ciszu Network. Estas páginas NO son
> oficiales, no representan la marca ni la estética de las webs productivas, y se
> usan solo para reír, probar efectos o experimentar sin arriesgar el sitio real.

---

## 1. Reglas generales

- **No oficiales**: nunca se enlazan desde navbars, footers, sitemaps ni la web real.
- **No indexadas**: `robots: { index: false, follow: false }` en todas sus páginas.
- **Desnudas**: se renderizan sin el chrome del sitio (Navbar, Footer, anuncios,
  guards, disclaimers, botones flotantes) vía el header `x-is-bare` del middleware.
- **Sin secretos**: nunca usan APIs privadas, credenciales ni datos reales.
- **Autocontenidas**: dependen solo de assets propios (preferentemente generados
  en `public/test/<nombre>/`) y Web APIs del navegador.
- **Registro**: cada "test funny" se documenta aquí con su ruta y efectos.

---

## 2. Catálogo

### 2.1 `/youareanidiot` (Ciszu Network)

- **Ruta**: `projects/ciszu/website/src/app/youareanidiot/`
- **URL**: `https://ciszunetwork.vercel.app/youareanidiot`
- **Origen**: parodia del famoso virus "You are an idiot" de antaño.
- **Estado**: 🟢 activo (prueba).

**Efectos**:

| Efecto | Detalle |
|---|---|
| Pantalla completa | Se activa solo al entrar y **re-aparece si el usuario intenta salir** (Esc/F11/gesto) |
| Fondo intermitente | Cambia entre **blanco y negro** cada ~260 ms |
| Caras | **SVGs** de cara feliz y cara riéndose (no emojis), alternando según el fondo |
| Frases | Spam de "YOU ARE AN IDIOT", "HA HA HA", "STOP", "LOL"… alternando cada 600 ms |
| Mensajes spam | Palabras dispersas por toda la pantalla (aparecen/desaparecen) |
| Ventanas | Ventanas falsas (`YouAreAnIdiot.exe`) que se abren y cierran recurrentemente |
| Audio | **Música de circo + risas** generadas con **Web Audio API** (autocontenido) |

**Assets**: `projects/ciszu/website/public/test/youareanidiot/` (carpeta lista para
colocar `circus.mp3` / `laugh.mp3` si en el futuro se prefiere audio real; por
defecto la página genera el audio sintéticamente).

---

## 3. Cómo crear un nuevo "test funny"

1. Crear la ruta en `projects/<web>/website/src/app/<slug>/` con `page.tsx`
   (`"use client"` si usa hooks) y `layout.tsx` con `robots: noindex`.
2. Añadir el slug al header `x-is-bare` del middleware para que se renderice
   desnudo (sin chrome del sitio).
3. Guardar los assets en `public/test/<slug>/`.
4. Registrar la entrada en este doc (§2) y añadir el doc al índice de
   `documentation/` si se considera estable.

---

## 4. Historial

| Fecha | Cambio |
|---|---|
| 2026-09-02 | Doc creada (v1.0.0). Registrado el primer "test funny": `/youareanidiot` (Ciszu Network) |

---

_Última revisión: 02 sep 2026._ Relacionado: `AD_SYSTEM.md`, `FRONTEND_SYSTEM.md`,
`GLOBAL_COMPONENTS_SYSTEM.md`, `SECURITY_PROTOCOLS.md`.