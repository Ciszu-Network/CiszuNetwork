# API Tests — Ciszu Network (Bruno)

Colección **Bruno** (open source, git-native) con health checks + endpoints REST del ecosistema.
**Formato: OpenCollection YAML** (`opencollection.yml` + `*.yml` — no mezclar con `.bru`).

## Requisitos

- **GUI**: Bruno 4.x → File → Open Collection → carpeta `E:\Ciszu Network\api-tests`
- **CLI**: `pnpm add -g @usebruno/cli` (instalado)

## Uso

```bash
# Health + REST de todo el ecosistema (excluye tests "local")
pnpm api:test

# Con report JSON (para el agente)
pnpm api:test:report

# Incluye tests locales (ej. bot :5000 cuando está corriendo)
pnpm api:test:local
```

## Estructura

```
api-tests/
├── opencollection.yml       # raíz de la colección (YAML)
├── health/                  # health checks por servicio (seq 1-5)
│   ├── folder.yml
│   ├── ciszunetwork.yml
│   ├── ciszukoantony.yml
│   ├── muzicmania.yml
│   ├── ciszubot-web.yml
│   └── bot-status.yml       # PostgREST → ciszubot.bot_status
├── rest/                    # endpoints REST reales
│   ├── folder.yml
│   ├── muzicmania-leaderboard.yml  # PostgREST scores (schema muzicmania)
│   ├── bot-status-full.yml         # bot_status completo
│   └── bot-stats-local.yml         # localhost:5000 (tag: local)
└── environments/
    ├── prod.example.yml     # plantilla (trackeada)
    └── prod.yml             # ⚠️ gitignored — secrets reales
```

## Secrets

- **NUNCA** poner tokens en archivos `.yml` de requests ni versionar `environments/prod.yml`.
- `prod.yml` (gitignored) usa el formato OpenCollection de lista: `variables: [{name, value}]`.
- O pasar por CLI: `bru run . -r --env prod --env-var SUPABASE_ANON_KEY=...`
