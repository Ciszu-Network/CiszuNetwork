# CiszuGamens — Comunidad Gaming

Proyecto de comunidad gaming y servidor Discord del ecosistema Ciszu Network.

- **Servidor Discord**: https://discord.gg/W3kMtMMj6E
- **Discord Bot List**: https://discordbotlist.com/servers/ciszugamens
- **Documentación**: `docs/documentation/`
- **Assets**: `content/` (logos, banners, thumbnails, flyers, icons, assets)
- **Reglas del servidor**: `docs/{txt,md,docx,pdf}/SERVER_RULES.*` (plantilla template v4.2.0.0)

---

## Estructura

```
projects/ciszugamens/
├── content/
│   ├── logos/images/                       # Isotipos + logotipos (outline/not-outline, color/gradient/monochrome)
│   ├── logos/video/                        # GIFs/videos de logo
│   ├── banners/images/
│   ├── thumbnails/images/ + videos/
│   ├── flyers/
│   ├── icons/
│   └── assets/                             # Videos de stock
├── docs/
│   ├── documentation/                      # Docs técnicos (gitignored, force-add)
│   ├── txt/md/docx/pdf/                    # Distribución de docs (SERVER_RULES, DISCORD_MODERATION_GUIDELINES)
│   ├── backups/                            # Backups JSON/xlsx del servidor
│   └── davinci_resolve/                    # Proyectos de edición
└── README.md
```

> **Sin website**: ciszugamens es un proyecto de comunidad/servidor Discord, no de
> programación. No tiene landing web ni deploy en Vercel.

---

## Integración en ecosistema

- Sistema de anuncios: `source: 'ciszugamens'` en `@ciszu/ui/Ads.tsx` (isotipo y logotipo reales vía CDN)
- Colores de énfasis: `#22d3ee` (cian)
- Discord invite: `https://discord.gg/W3kMtMMj6E`

---

## Comandos útiles

```bash
# Subir assets a CDN (content y docs)
pnpm cdn:upload

# Limpiar objetos del bucket que ya no existen localmente
pnpm cdn:upload -- --prune

# Generar derivadas de entrega (webp/avif) desde los PNG
python scripts/convert-media.py --all

# Generar docs (txt2md, md2office, txt2pdf)
node scripts/md2office.js projects/ciszugamens/docs
python scripts/txt2pdf.py projects/ciszugamens/docs
```

---

_Última revisión: 01 sep 2026._