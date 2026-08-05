# Contribución a Ciszu Network

¡Gracias por tu interés en contribuir a **Ciszu Network**! Este repositorio es un **monorepo** con 4 webs (Next.js 15 + Tailwind 4), un bot de Discord (Discord.js), un juego de música (web + app Tauri), paquetes compartidos y el CDN de assets sobre Supabase Storage. Este documento establece las pautas para colaborar de forma ordenada.

> **Importante**: el repositorio es **privado**. Cualquier credencial (Supabase, Vercel, Discord, tokens) filtrada en un PR será rechazada y rotada. Revisa `AGENTS.md` antes de empezar.

---

## 1. Código de Conducta

Al participar en este proyecto, te comprometes a mantener un ambiente respetuoso, colaborativo y constructivo con todos los miembros de la comunidad y del equipo de desarrollo. Ver `CODE_OF_CONDUCT.md`.

---

## 2. ¿Cómo puedes contribuir?

Puedes ayudar de diversas maneras:

- Reportando errores (*bugs*) abriendo un *Issue*.
- Proponiendo nuevas funcionalidades o mejoras en la arquitectura.
- Resolviendo *issues* abiertos o enviando *Pull Requests* (PR).
- Mejorando la documentación (`README.md`, `AGENTS.md`, `projects/*/docs/`).

---

## 3. Flujo de trabajo (Git Workflow)

Para mantener la estabilidad de los despliegues y builds de producción:

1. **Crea una rama** desde `main` para tu funcionalidad o corrección:
```bash
git checkout -b feature/nombre-de-la-funcionalidad
# o para correcciones:
git checkout -b fix/nombre-del-error
```

2. **Realiza tus cambios** siguiendo los estándares del proyecto (ver sección 4).
3. **Haz commit** con mensajes claros, descriptivos y **en español**:
```bash
git commit -m "feat: añade nueva funcionalidad"
git commit -m "fix: corrige error en el resolver del CDN"
```

4. **Sube la rama** a tu repositorio remoto:
```bash
git push origin feature/nombre-de-la-funcionalidad
```

5. **Abre un Pull Request** hacia `main` describiendo detalladamente los cambios y el problema que resuelven.

---

## 4. Estándares y directrices de código

### Terminología

- Cada producto web es un **website** (cúmulo de webpages). Los pnpm filter names, workflows y carpetas usan `-website` (nunca `-webpage`).
- Cada producto vive bajo `projects/<nombre>/` con su `website/`, `content/` y `docs/` propios (estructura 2.5, ago 2026).

### Stack y estructura

- **Package manager**: pnpm v10.8.1 (workspaces). Node >= 20. Nada de npm/yarn para instalar.
- **Apps**: `projects/<nombre>/website` — Next.js 15 + Tailwind 4, con `images.unoptimized: true`.
- **Paquetes compartidos**: `packages/cdn` (`@ciszunetwork/cdn`), `packages/ui` (`@ciszu/ui`).
- **CI/CD**: GitHub Actions en `.github/workflows/` — CI + CodeQL + 4 deploys a Vercel (`deploy-*-website.yml`). Los deploys se disparan con cambios en `projects/<proyecto>/**`, `packages/**` o `scripts/copy-assets.js`.
- **No toques** `.github/workflows/*.yml` salvo que sepas qué haces: desplegar SIEMPRE desde la raíz (`vercel --prod` con `working-directory: .`), nunca `vercel pull/prebuilt` dentro de `projects/*/website`.

### Verificación local (obligatoria antes del PR)

```bash
pnpm install              # instalar workspaces
pnpm lint                 # lint de todas las apps (el CI lo ejecuta)
pnpm build                # build de todas las apps
pnpm --filter <nombre> dev # probar tu app individualmente
```

- Asegúrate de que tu app **compila** (`pnpm build`) y **pasa el lint**.
- Verifica que tus cambios no rompan las rutas del CDN (`packages/cdn` + `NEXT_PUBLIC_CDN_URL`) ni los assets estáticos. El bucket `ciszu-cdn` espeja las rutas del repo.

### Seguridad (DevSecOps)

- **Nunca** uses `innerHTML`/`dangerouslySetInnerHTML` sin escapar: usa `escapeHtml()` o `textContent`; sanitiza entrante con DOMPurify.
- **Nunca** concatenes strings en SQL: usa el ORM de Supabase parametrizado o RPC con objetos.
- **Nunca** subas credenciales: secretlint + gitleaks corren en pre-commit (puedes ignorarlo con `--no-verify` solo en desarrollo local, jamás en un PR).
- Evita código comentado innecesario, archivos basura o binarios grandes (los `.gif`, `.mp4`, `.exe` están excluidos globalmente).

---

## 5. Recursos de referencia

- `README.md` — estructura, quick start, CDN, Supabase, CI/CD.
- `AGENTS.md` — gestión del multiworkspace, gotchas y checklist de implementación.
- `projects/ciszu/docs/documentation/CODE_PRINCIPLES.md` — estándares de ingeniería (DRY, KISS, SOLID…).
- `projects/ciszu/docs/documentation/DEVSECOPS.md` — SAST/DAST, shift-left y herramientas.
- `apis/bruno/` — colecciones API (OpenCollection YAML): `pnpm api:test`.

---

¡Gracias por formar parte de **Ciszu Network**! 🚀
