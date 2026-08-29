# WORKFLOW_SYSTEM — Flujo de Trabajo (CiszuGamens)

Versión: 1.0.0
Actualización: 2026-08-29
Identificador: WORKFLOW_SYSTEM_V1.0.0_2026_08_29_ciszugamens

> **Definición**: Flujo de trabajo operativo del proyecto CiszuGamens: comandos, pipelines, convenciones git, CI/CD y protocolos de equipo.

## Comandos pnpm (desde raíz del monorepo)

| Comando | Descripción |
|---|---|
| `pnpm --filter ciszugamens-website dev` | Dev server landing (puerto 3004) |
| `pnpm --filter ciszugamens-website build` | Build producción |
| `pnpm --filter ciszugamens-website lint` | ESLint |
| `pnpm --filter ciszugamens-website exec tsc --noEmit` | Typecheck |
| `pnpm cdn:upload` | Sube `content/` a Supabase Storage `ciszu-cdn` |
| `pnpm cdn:verify` | Verifica integridad CDN |
| `pnpm docs:sync` | Sincroniza docs → public/ (`sync-public-docs.js`) |
| `pnpm docs:generate` | Genera protocolos (`globaldocsgen.js`) |

## Convenciones Git

- **Rama**: trabajo directo en `main`
- **Commits**: español, descriptivos, una línea, sin emojis
- **No pushear sin aprobación**: el CEO pushea manualmente
- **Repo público**: cero secretos en commits (ver `SECURITY_PROTOCOLS.md`)

### Pre-commit hooks

- `secretlint` + `gitleaks` en staged
- `eslint` + `prettier` en staged
- `--no-verify` solo con falso positivo justificado

## Pipeline de documentación

```
txt (source) → md (canónico) → docx (Office) → pdf (archivo)
```

Scripts:
- `scripts/txt2md.js` — txt → md
- `scripts/md2office.js` — md → docx
- `scripts/txt2pdf.py` — txt → pdf
- `scripts/sync-public-docs.js` — docs/documentation/ → website/public/docs/

## CI/CD (GitHub Actions)

Workflow: `.github/workflows/deploy-ciszugamens-website.yml` (por crear)

1. **Lint + Typecheck** → `pnpm lint && pnpm exec tsc --noEmit`
2. **Build** → `pnpm --filter ciszugamens-website build`
3. **Deploy** → `vercel --prod --yes --archive=tgz` (Root Directory = `projects/ciszugamens/website`)

## Protocolo de sesión (handover)

### Iniciar
1. Leer `PROJECT_STATE.md`, `PROJECT_HISTORY.md`, `TODO.md` (ciszu)
2. Leer `ARCHITECTURE.md`, `STACK_SYSTEM.md`, `WORKFLOW_SYSTEM.md` (ciszugamens)
3. Confirmar: "CISZU AI listo. [proveedor/modelo]."

### Cerrar
1. Actualizar `PROJECT_STATE.md`, `PROJECT_HISTORY.md` (ciszugamens)
2. Dejar siguiente paso claro en `TODO.md`
3. **No commitear sin aprobación explícita**

## Discord (Comunidad)

- **Invite**: https://discord.gg/W3kMtMMj6E
- **Bot List**: https://discordbotlist.com/servers/ciszugamens
- **Moderación**: `docs/docx/DISCORD_MODERATION_GUIDELINES.docx`

## Assets CDN

```bash
pnpm cdn:upload    # Sube projects/ciszugamens/content/** a ciszu-cdn
```

## Troubleshooting

| Problema | Solución |
|---|---|
| Assets no cargan en web | Verificar `NEXT_PUBLIC_CDN_URL` + `pnpm cdn:upload` |
| Build falla en Vercel | Revisar `Root Directory = projects/ciszugamens/website` |
| Docs no sincronizan | Ejecutar `pnpm docs:sync` y ver `sync-public-docs.js` |

---

_Última revisión: 29 ago 2026._