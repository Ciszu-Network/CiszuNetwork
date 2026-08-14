# VPS_PLAN — Hosting 24/7 para CiszuBot en VPS (recomendación, ago 2026)

Versión: 2.0.0
Actualización: 2026-08-13
Identificador: VPS_PLAN_V2.0.0_2026_08_13_ciszunetwork

> **Definición**: plan para mover CiszuBot a un servidor 24/7 (VPS) para que no dependa del
> PC del usuario: opciones, procedimiento, alternativas sin tarjeta y estado actual.

> **Problema**: el bot corre en Docker Desktop en el PC del usuario. Si el PC se apaga, se reinicia o se corta la luz, **el bot muere** (los servidores de Discord no reciben respuestas, los slash commands fallan). Para que CiszuBot esté disponible 24/7 hay que moverlo a un servidor que nunca se apague.

## La respuesta corta

**Sí, el bot muere si apagas el PC.** El PC del usuario ES el servidor del bot. Docker solo hace que corra aislado, no que esté siempre encendido.

## Opciones (de más barata a más cara)

| Opción | Coste | Uptime | Complejidad | Veredicto |
|---|---|---|---|---|
| **Oracle Cloud Free Tier** (VPS ARM Ampere A1, 4 OCPU / 24 GB RAM) | **Gratis** | ~100% (SLA alto) | Media (crear cuenta, SSH, Docker) | ✅ **RECOMENDADA** |
| **VPS barato de pago** (Hetzner CX22, Contabo, Hostinger) | ~$4-6/mes | ~100% | Media | 👍 Buena si Oracle te rechaza |
| **Railway / Render / Fly.io** (PaaS con Docker) | ~$0-5/mes | ~99.9% | Baja (solo dockerfile + deploy) | 👍 Fácil, pero limitado |
| **Replit / Glitch / otros free hosts** | Gratis | Variable (sleeps) | Baja | ❌ No fiable para bots |
| **Raspberry Pi en casa** | ~$50 (una vez) | Depende de tu luz/red | Alta | ❌ Mismo problema que el PC |

### ¿Por qué Oracle Free Tier?

- **Gratis de verdad** (Always Free: ARM Ampere 4 OCPU + 24 GB RAM, 200 GB disco, 10 TB de transferencia).
- Docker corre perfecto (instalar docker + `docker compose up -d` y listo — el mismo `docker-compose.yml` del repo).
- IP pública fija, sin cortes por apagado (el servidor vive en un datacenter).
- Restricciones: requiere tarjeta de crédito válida para verificar (no cobran), la cuenta puede ser rechazada si no hay capacidad en tu región. Alternativa de pago: Hetzner CX22 (~€3.8/mes).

### ¿Qué habría que cambiar?

1. **`.env`**: mover `projects/ciszubot/discord-bot/.env` al VPS (nunca a git).
2. **Bot token**: el mismo sirve (Discord no ata el token a una IP). No hace falta re-invitar el bot.
3. **`docker-compose.yml`**: en el VPS solo se necesita el servicio `ciszu-bot` (no supabase-local).
4. **Panel web** (`:5000`): en el VPS queda expuesto — proteger con auth o no exponerlo al público (solo localhost + SSH tunnel).
5. **Supabase**: el bot ya está pensado para conectar a Supabase cloud (no local) — sin cambios.

## Procedimiento recomendado (una hora de trabajo)

1. Crear cuenta en Oracle Cloud → Compute → Instances → crear VM (Ubuntu 24.04 LTS, ARM Ampere A1).
2. Conectar por SSH. Instalar:
   ```bash
   sudo apt update && sudo apt install -y docker.io docker-compose-v2
   sudo systemctl enable docker
   ```
3. Subir el repo (o solo `projects/ciszubot/discord-bot/` + `docker-compose.yml` + `.env`):
   ```bash
   git clone https://github.com/Ciszu-Network/CiszuNetwork.git
   cd CiszuNetwork
   cp projects/ciszubot/discord-bot/.env.example projects/ciszubot/discord-bot/.env
   nano projects/ciszubot/discord-bot/.env   # pegar token real
   ```
4. Arrancar:
   ```bash
   docker compose up -d --build ciszu-bot
   docker compose logs -f ciszu-bot
   ```
5. Verificar `CiszuBot#5704 está en línea` en el log y probar `/ping` en Discord.
6. (Opcional) `docker compose restart` tras cada deploy; o configurar webhook de GitHub para auto-deploy.

## Alternativa sin tarjeta de crédito

Si Oracle pide tarjeta y no tienes o no quieres darla:

- **Hetzner CX22** (~€3.8/mes): mejor relación calidad/precio, sin sorpresas.
- **Railway.app**: deploy con solo apuntar al Dockerfile, ~$5/mes, pago con tarjeta igualmente.
- **Servidor de un amigo / NAS propio**: misma fiabilidad cuestionable que el PC.

## Estado actual

- [ ] No aplicado (el bot sigue en el PC del usuario).
- El `TODO.md` del usuario ya lista "Configurar hosting (VPS o similar, 24/7)" como tarea pendiente.

## Notas

- El bot no necesita GUI — corre headless. Cualquier VPS de 1 GB RAM y 1 vCPU basta (la imagen Node 24 alpine pesa < 500 MB).
- El DNS de la app (ciszubot.vercel.app) NO cambia — es la landing page en Vercel, independiente del bot.
- Si algún día se usa Cloudflare R2 o CDN desde el bot, el VPS sale de la IP del usuario — más limpio para Discord (IP residencial vs datacenter: Discord no penaliza bots por IP, pero un VPS con IP limpia evita bloqueos de rate-limit compartidos).

## Conceptos de hosting (contexto informático)

| Término | Definición |
|---|---|
| **VPS** (Virtual Private Server) | Servidor virtual dedicado |
| **Uptime** | Disponibilidad 24/7 |
| **PaaS** (Platform-as-a-Service) | Plataforma que despliega tu app (Railway/Fly) |
| **SLA** | Acuerdo de disponibilidad del proveedor |
| **SSH** | Acceso seguro al servidor |
| **ARM Ampere A1** | Arquitectura ARM (Oracle Free) |
| **Headless** | Sin interfaz gráfica (CLI only) |
| **IP pública** | Dirección del servidor en internet |
| **Docker Compose** | Orquestación de contenedores en el servidor |

## Comparativa rápida de opciones

| Opción | Coste | Uptime | Veredicto |
|---|---|---|---|
| Oracle Cloud Free (ARM) | $0 | ~100% | ✅ Recomendada |
| Hetzner CX22 | ~€3.8/mes | ~100% | 👍 De pago barato |
| Railway/Render/Fly | ~$0-5/mes | ~99.9% | 👍 Fácil |
| Replit/Glitch | $0 | Variable | ❌ No fiable |
| Raspberry Pi local | ~$50 | Tu red | ❌ Igual que el PC |

## Checklist de migración a VPS

- [ ] Cuenta Oracle creada (o Hetzner si no hay tarjeta).
- [ ] VM Ubuntu 24.04 LTS (ARM Ampere A1).
- [ ] Docker instalado (`docker.io` + `docker-compose-v2`).
- [ ] Repo (o solo bot + compose + `.env`) subido.
- [ ] `.env` con token real (nunca en git).
- [ ] `docker compose up -d --build ciszu-bot`.
- [ ] Verificar en línea: `/ping` responde.
- [ ] Panel `:5000` protegido (auth o SSH tunnel).
- [ ] Actualizar `MONITORING_SYSTEM.md` (monitor del bot).

## Requisitos del servidor

| Recurso | Mínimo recomendado | Justificación |
|---|---|---|
| RAM | 1 GB | La imagen Node 24 alpine pesa < 500 MB; el bot corre headless |
| vCPU | 1 | Basta para el bot; el free de Oracle (4 OCPU) sobra |
| Disco | 10 GB | Imagen + volumen de Docker + logs (podar con prune mensual) |
| SO | Ubuntu 24.04 LTS | Compatible con Docker Engine (`apt install docker.io`) |
| IP pública | Fija | Accesible para el monitor externo y con DNS/rate-limit limpio |

## Seguridad del servidor (antes de arrancar el bot)

1. **SSH por key, no contraseña**: generar `ssh-keygen` en el PC, subir la `.pub` a la VM y
   desactivar `PasswordAuthentication` en `/etc/ssh/sshd_config`.
2. **Firewall mínimo**: `ufw default deny incoming`, permitir solo SSH (y el puerto del panel
   si realmente se expone).
3. **Panel `:5000`**: en la mayoría de casos NO exponerlo al público — usar SSH tunnel
   (`ssh -L 5000:localhost:5000 user@vps`) o protegerlo con auth.
4. **Usuarios**: evitar trabajar como root en el día a día; el grupo `docker` da los
   permisos de contenedores sin root.
5. **Secretos**: `.env` con `chmod 600` y nunca en git (el `.env.example` del bot sirve de plantilla).
6. **Parches**: `unattended-upgrades` para los paquetes del SO.

## Mantenimiento programado

- Deploy de cambios: `docker compose pull && docker compose up -d` (o webhook de GitHub).
- `docker system prune` mensual para liberar disco (imágenes antiguas, cache).
- `trivy image ciszubot:latest` periódico para revisar CVEs de la imagen.
- El monitor externo actúa de alerta de caída (ver `MONITORING_SYSTEM.md`).

## Supervisión y recuperación

- `restart: unless-stopped` en el contenedor reinicia el bot si el proceso muere; con
  `systemctl enable docker` el stack arranca solo tras un reboot del VPS.
- Añadir el monitor del endpoint del panel (`:5000`) en UptimeRobot + alerta de proceso
  muerto (tarea pendiente según `MONITORING_SYSTEM.md` §5).
- Si el VPS se cae por completo, el bot vuelve solo al arrancar el sistema.

## Relación con otros sistemas

- `DOCKER_SYSTEM.md` — el mismo `docker-compose.yml` y Dockerfile del repo sirven en el VPS.
- `REMOTE_CONTROL_SYSTEM.md` — acceso remoto (SSH/Tailscale) al servidor una vez creado.
- `MONITORING_SYSTEM.md` — alta del monitor del bot y alerta de proceso muerto (pendiente).
- `WORKFLOW_SYSTEM.md` — el deploy al VPS puede automatizarse con un workflow de GitHub Actions.
- `PROJECT_STATE.md` / toDo "24/7 pendiente" — estado de la migración en cada sesión.

## Preguntas frecuentes

**¿Hacen falta 4 OCPU / 24 GB RAM?** No: es lo que regala Oracle. El bot corre holgado con
1 GB de RAM y 1 vCPU.

**¿Puedo usar Railway/Render/Fly con el mismo Dockerfile?** Sí: el bot es Node 24 y el deploy
se hace apuntando al Dockerfile, con menos pasos que el VPS.

**¿El bot token cambia?** No: Discord no ata los tokens a una IP. No hace falta re-invitar el bot.

**¿Cómo pruebo antes de migrar?** Levantar el stack en el VPS de prueba, verificar `/ping` y
los logs, y solo entonces apagar el contenedor local.

## Checklist de operación continua

- [ ] VPS encendido 24/7 (datacenter, no el PC).
- [ ] Bot en Docker con `restart: unless-stopped` y Docker habilitado en boot.
- [ ] `.env` actualizado y con permisos seguros (`chmod 600`).
- [ ] Monitor externo del endpoint del bot activo.
- [ ] Deploy automatizado (manual con compose o CI).
- [ ] Logs y discos bajo control (`docker system prune` mensual).

## Costes y límites de las opciones (free sin tarjeta)

| Opción | Tarjeta | Coste real | Límites |
|---|---|---|---|
| Oracle Cloud Free ARM | Sí (solo verificación, no cobran) | $0 | 4 OCPU / 24 GB RAM / 200 GB disco / 10 TB transferencia |
| Hetzner CX22 | Sí | ~€3.8/mes | Recursos dedicados, sin límites de uso |
| Railway / Render / Fly | Sí | $0-5/mes | Sleeps en free; pago por uso |
| Replit / Glitch | No siempre | $0 | Sleeps frecuentes — no fiable para bots 24/7 |
| Raspberry Pi local | No | ~$50 una vez | Depende de luz/red del usuario |

> La regla de financiación de Ciszu Network prioriza **free sin tarjeta**: Oracle Free Tier
> es la primera opción; Hetzner queda como alternativa de pago si Oracle rechaza la cuenta o
> no hay capacidad en la región.

## Comandos útiles una vez en el VPS

```bash
sudo systemctl enable docker          # arranque automático de Docker
docker compose up -d --build ciszu-bot
docker compose logs -f --tail 50 ciszu-bot
docker system prune -f                # limpiar sin pedir confirmación
ssh -L 5000:localhost:5000 user@vps   # tunnel al panel sin exponerlo
```

## Conceptos de hosting — preguntas frecuentes

**¿Cuál es la diferencia entre VPS y PaaS para el bot?** El VPS da control total (SSH, Docker
propio, puertos) a cambio de administrarlo; el PaaS (Railway/Fly) despliega con un click pero
con menos control (sleeps, límites de ram/CPU).

**¿El bot necesita base de datos en el VPS?** No: el bot ya está pensado para conectar a
Supabase cloud (no local). El VPS solo corre el proceso del bot.

_Última revisión: 13 ago 2026._ Relacionado: `MONITORING_SYSTEM.md`, `REMOTE_CONTROL_SYSTEM.md`,
`DOCKER_SYSTEM.md`, `SCHEDULE_PROTOCOLS.md`.
