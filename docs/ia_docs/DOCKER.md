# Docker para Ciszu Network — Beneficios, Plan e Implementación

> **Estado (1 ago 2026)**: documentación + archivos de infraestructura PREPARADOS. Docker Desktop NO instalado aún (requiere instalación gráfica + WSL2 — pasos al final).

## ¿Qué es Docker y por qué importa para Ciszu Network?

Docker empaqueta aplicaciones en contenedores ligeros y aislados que incluyen su código, runtime y dependencias. Un contenedor corre igual en Windows, Linux o un servidor — **elimina el "funciona en mi máquina"**.

### Beneficios concretos para este monorepo

| Beneficio | Aplicación en Ciszu Network |
|---|---|
| **Reproducibilidad** | Los 4 sitios Next.js + bot Discord corriendo con el MISMO entorno en cualquier máquina (la tuya, CI, servidores). Node >=20, pnpm 10.8.1, Rust para Tauri — todo versionado en la imagen |
| **Supabase local idéntico** | `supabase start` YA usa Docker internamente (Postgres 17 + API + Storage). Con Docker aislado, tu base local nunca contamina la producción y las migraciones 04-12 se prueban ANTES de aplicarse |
| **CI/CD consistente** | GitHub Actions puede construir con la misma imagen que usas local → menos "pasa en CI pero no aquí". El bot (vanilla JS + discord.js) puede empaquetarse y correr 24/7 como contenedor |
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
| `docker-compose.yml` | Stack dev: `ciszu-bot` (bot Discord) + `supabase-local` (Postgres 17, puertos estándar) |
| `apps/ciszubot/discord-bot/Dockerfile` | Imagen del bot Discord (Node 20 alpine, npm ci, token por env) |
| `.dockerignore` | Excluye node_modules, .next, .turbo, binarios, content/ de las imágenes |
| `docs/ia_docs/DOCKER.md` (este) | Documentación oficial |

### ⏳ Pendiente (requiere intervención del usuario — instalación gráfica)
1. **Instalar Docker Desktop** (ver pasos abajo) — requiere WSL2, aprobación de licencia y un reinicio. No se puede automatizar de forma fiable.
2. Ejecutar `docker compose up -d` para validar el bot en contenedor.
3. (Opcional) `supabase start` para base local Dockerizada y probar las migraciones 04-12 localmente.
4. (Opcional) CI: añadir `docker build` al workflow del bot.

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
docker compose up -d ciszu-bot

# Logs
docker compose logs -f ciszu-bot

# Apagar
docker compose down
```

El bot lee `DISCORD_TOKEN` y demás secretos de `.env` (nunca van en la imagen). Ver `apps/ciszubot/discord-bot/.env.example` como plantilla.

## Verificación de seguridad (DevSecOps)

- Nunca commitear `.env` con tokens — Docker los inyecta en runtime
- Escanear imágenes antes de producción: `trivy image ciszubot:latest`
- El Dockerfile usa usuario no-root (`node`) y `npm ci --omit=dev` (imagen mínima)
