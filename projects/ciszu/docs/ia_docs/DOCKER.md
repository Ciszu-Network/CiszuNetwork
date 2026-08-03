# Docker para Ciszu Network — Beneficios, Plan e Implementación

> **Estado (2 ago 2026)**: ✅ **Docker Desktop 29.6.2 instalado** (WSL2 + reinicio). ✅ **Docker movido a disco E:** (junctions, C: liberado de ~22 GB). ✅ Bot **ciszu-bot** corre en contenedor (Node 24 + pnpm, v3.0.0 TS). ✅ **Supabase local corriendo** con migraciones 01-12 aplicadas. Pendiente: docker build en CI.

## ¿Qué es Docker y por qué importa para Ciszu Network?

Docker empaqueta aplicaciones en contenedores ligeros y aislados que incluyen su código, runtime y dependencias. Un contenedor corre igual en Windows, Linux o un servidor — **elimina el "funciona en mi máquina"**.

### Beneficios concretos para este monorepo

| Beneficio | Aplicación en Ciszu Network |
|---|---|
| **Reproducibilidad** | Los 4 sitios Next.js + bot Discord corriendo con el MISMO entorno en cualquier máquina (la tuya, CI, servidores). Node 24, pnpm 11, Rust para Tauri — todo versionado en la imagen |
| **Supabase local idéntico** | `supabase start` YA usa Docker internamente (Postgres 17 + API + Storage). La base local no contamina producción y las migraciones se prueban ANTES de aplicarse |
| **CI/CD consistente** | GitHub Actions puede construir con la misma imagen que usas local → menos "pasa en CI pero no aquí". El bot (TS + discord.js) se empaqueta y corre como contenedor |
| **Microservicios futuros** | El roadmap incluye API Gateway, Network Dashboard, CLI. Docker Compose ya levanta el stack completo con `docker compose up` |
| **Aislamiento de dependencias** | Cada app Next.js tiene sus propias deps (Next 15, React 19, Tailwind 4). Los contenedores evitan conflictos entre apps del monorepo |
| **Seguridad (DevSecOps)** | Imágenes escaneables con `trivy image` (ya instalado), menos superficie que un servidor compartido, secretos vía variables de entorno (nunca en la imagen) |
| **Backups y despliegues** | El script `backup-db.js` puede correr en un contenedor programado; futuros servicios se despliegan con la misma herramienta |

## Limitaciones honestas (decididas en julio 2026)

- Las 4 webs se despliegan en **Vercel** (serverless) — **NO necesitan Docker para producción**. Docker aquí es para: desarrollo local reproducible, Supabase local, bot, y servicios futuros.
- MuzicMania Tauri empaqueta con Rust/NSIS en Windows — Docker no reemplaza ese flujo (pero puede cross-compilar el launcher en CI con `cross`).
- Coste de aprendizaje: Docker + WSL2 requiere curva inicial (~1-2 semanas de uso regular para dominarlo). Vale la pena por el roadmap (API Gateway, servicios propios).

## Estado de la implementación

### ✅ Preparado en el repo (agosto 2026)
| Archivo | Propósito |
|---|---|
| `docker-compose.yml` | Stack dev: `ciszu-bot` (bot Discord, puerto 5000) + `supabase-local` (Postgres 17, puertos estándar) |
| `projects/ciszubot/discord-bot/Dockerfile` | Imagen del bot Discord (Node 24 alpine, pnpm 11 multi-stage, token por env) |
| `.dockerignore` (raíz) | Contexto de build = raíz: incluye solo `projects/ciszubot/discord-bot/**`, `pnpm-workspace.yaml`, `pnpm-lock.yaml` |
| `projects/ciszubot/discord-bot/.dockerignore` | Excluye node_modules, .env, logs, public/docs de la imagen |
| `docs/ia_docs/DOCKER.md` (este) | Documentación oficial |

### ✅ Completado (2 ago 2026)
1. **Docker Desktop 29.6.2 instalado** (WSL2 + VirtualMachinePlatform + reinicio).
2. **Docker movido a E: (disco con espacio)**: el vhdx de WSL2 se trasladó a `E:\Docker Desktop\wsl\...` con junctions en `C:\Users\fplay\AppData\Local\Docker\wsl\{disk,main}`. ⚠️ NO usar `dataFolder` en settings-store.json (crea un vhdx nuevo en C:). C: pasó de ~6 GB a ~28 GB libres.
3. **Bot validado en contenedor**: `docker compose up -d --build ciszu-bot` → `CiszuBot#5704 está en línea` en 2 servidores. Contenedor `ciszubot` con `restart: unless-stopped`, usuario no-root, logs bind-mount en `logs/`.
4. **Bot modernizado a v3.0.0** (TS + pnpm + Node 24): ver README del bot y AGENTS.md → "CiszuBot (bot de Discord)".
5. **Slash commands globales registrados** (1 ago 2026): `Routes.applicationCommands` + preservación del Entry Point command (`launch`, type 4) → evita 50240. El bot debe invitarse con scope OAuth2 `applications.commands`.
6. **Supabase local corriendo**: `supabase start --ignore-health-check` desde `services/supabase` (Windows: usar el flag, studio queda unhealthy pero no es crítico). Migraciones 01-12 aplicadas; schemas `ciszubot`, `ciszunetwork`, `muzicmania` verificados.

### ⏳ Pendiente (opcional)
1. CI: añadir `docker build` al workflow del bot.

## Cómo instalar Docker Desktop (Windows)

```powershell
# 1. Requisito: WSL2 (una vez)
wsl --install

# 2. Reiniciar Windows (obligatorio)

# 3. Descargar e instalar Docker Desktop (GUI, aceptar licencia)
#    https://www.docker.com/products/docker-desktop/
#    winget install Docker.DockerDesktop

# 4. Verificar
docker --version
docker compose version
```

> Alternativa sin WSL2: Docker Desktop con Hyper-V backend, o Rancher Desktop/OrbStack como reemplazos gratuitos.

## Uso del stack preparado

```powershell
# Levantar todo (bot + supabase local)
docker compose up -d

# Solo el bot
docker compose up -d --build ciszu-bot

# Logs
docker compose logs -f ciszu-bot

# Apagar
docker compose down
```

El bot lee `BOT_TOKEN` y demás secretos de `.env` (nunca van en la imagen). Ver `projects/ciszubot/discord-bot/.env.example` como plantilla. Para reconstruir tras cambios: `docker compose up -d --build ciszu-bot` (contexto de build = raíz del repo; si el build falla con "checksum", limpiar con `docker build --no-cache` o eliminar volúmenes de cache).

## Supabase local

```powershell
cd services/supabase
supabase start --ignore-health-check   # Windows: health checks de analytics fallan
# API en :54321, DB en :54322
supabase status
supabase stop
```

## Verificación de seguridad (DevSecOps)

- Nunca commitear `.env` con tokens — Docker los inyecta en runtime
- Escanear imágenes antes de producción: `trivy image ciszubot:latest`
- El Dockerfile usa usuario no-root (`node`), pnpm `--frozen-lockfile` (imagen mínima, solo prod deps)
