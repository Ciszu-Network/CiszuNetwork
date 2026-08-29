# CiszuGamens — Comunidad Gaming

Proyecto de comunidad gaming y servidor Discord del ecosistema Ciszu Network.

- **Servidor Discord**: https://discord.gg/W3kMtMMj6E
- **Discord Bot List**: https://discordbotlist.com/servers/ciszugamens
- **Documentación**: `docs/documentation/`
- **Assets**: `content/` (logos, banners, thumbnails, flyers)
- **Web (futura)**: `website/` (Next.js landing)

---

## Estructura

```
projects/ciszugamens/
├── content/
│   ├── logos/images/outline/isotype/       # Isotipos (3 variantes)
│   ├── logos/images/outline/logotype/      # Logotipos (2 variantes)
│   ├── banners/images/
│   ├── flyers/images/
│   └── thumbnails/images/
├── docs/
│   └── documentation/                      # Docs técnicos (gitignored, force-add)
│       ├── README.md
│       ├── PROJECT_STATE.md
│       ├── PROJECT_HISTORY.md
│       ├── TODO.md
│       ├── ARCHITECTURE.md
│       ├── STACK_SYSTEM.md
│       ├── BRAND_PLAN.md
│       ├── WORKFLOW_SYSTEM.md
│       ├── DISCORD_SECURITY_PROTOCOLS.md
│       ├── PRD_PROTOCOLS.md
│       ├── TRD_PROTOCOLS.md
│       ├── WORKFLOW_APP_PROTOCOLS.md
│       ├── UIDBUXDB_PROTOCOLS.md
│       ├── BACKEND_SCHEMA_PROTOCOLS.md
│       └── IMPLEMENTATION_PLAN_PROTOCOLS.md
├── website/                                # Next.js landing (futuro)
│   ├── src/
│   ├── package.json
│   └── ...
└── README.md
```

---

## Integración en ecosistema

- Sistema de anuncios: `source: 'ciszugamens'` en `@ciszu/ui/Ads.tsx`
- Colores de énfasis: `#22d3ee` (cian)
- Discord invite: `https://discord.gg/W3kMtMMj6E`

---

## Comandos útiles

```bash
# Subir assets a CDN (cuando se añadan banners/thumbnails)
pnpm cdn:upload

# Generar docs (txt2md, md2office, etc.)
node scripts/txt2md.js
node scripts/sync-public-docs.js
```

---

_Última revisión: 29 ago 2026._