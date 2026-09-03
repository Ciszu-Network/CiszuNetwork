# GLOBAL_ADVISOR_SYSTEM — Sistema de Mensajes Globales (Ciszu Network)

Versión: 2.0.0
Actualización: 2026-08-25
Identificador: GLOBAL_ADVISOR_SYSTEM_V2.0.0_2026_08_25_ciszunetwork

> **Definición**: sistema que permite al staff (admin) enviar **mensajes globales** a una o varias
> webs del ecosistema desde la **dev console**, mostrados como toasts en cada página. Incluye
> selección de webs, tipos de mensaje, **kill switch** global, **confirmación de entrega por web**,
> **filtro de profanidad**, **emisores verificados** (cuenta real + badge) y **log de auditoría**.
> Tarea `TODO.md #3`.

---

## 1. Visión general

El `GLOBAL_ADVISOR_SYSTEM` es un "chat" de una sola dirección: **solo el admin habla** (desde la
dev console local o la API) y las **webs escuchan** mostrando el mensaje como toast. Pensado para
avisos de mantenimiento, anuncios, notificaciones de incidentes o comunicados oficiales, sin tocar
código ni hacer deploy.

| Componente | Rol | Ubicación |
|---|---|---|
| `global_announcements` | Almacén de los mensajes (+ perfil verificado del emisor) | Supabase, schema `ciszunetwork` |
| `global_announcement_settings` | **Kill switch** global (`enabled`) — detiene todos los mensajes al instante | Supabase, schema `ciszunetwork` |
| `global_announcement_deliveries` | Confirmación de entrega por web (para `--wait`) | Supabase, schema `ciszunetwork` |
| `announcement_reads` / `staff_members` | Vistos por usuario / quién puede enviar | Supabase, schema `ciszunetwork` |
| `GlobalAdvisor` (frontend) | Polling + toast + kill switch + entrega + badge verificado | `@ciszu/ui` → `src/GlobalAdvisor.tsx` |
| `scripts/advisor.js` (CLI) | Enviar/status/toggle/clear + espera de entrega + filtro profanidad + log | `scripts/advisor.js` (+ `scripts/profanity.js`) |
| `dev_console.ps1` | Login con password + menú TUI + kill switch + borrado | `test/website/debug/dev_console.ps1` |
| **Log de auditoría** | Registro de cada acción (quién/qué/cuándo/sesión) | `test/website/debug/local-logs/advisor-<fecha>.log` |

### Flujo

```
dev_console (password) -> scripts/advisor.js (service role)
        |  (filtro profanidad, perfil verificado, kill switch)
        v
 Supabase: global_announcements  +  global_announcement_deliveries
        ^                                      ^
        | poll 30s                              | marca entrega
 <GlobalAdvisor> en cada web  <------------  (componente)
        |
        +-- toast (info/success/warning/error) con emisor verificado si procede
```

---

## 2. Schema (migraciones)

- `20260824000021_global_announcements.sql` — tablas base (`staff_members`,
  `global_announcements`, `announcement_reads`) + RLS.
- `20260824000022_global_announcements_fix.sql` — completa orden de dependencias + grants.
- `20260824000023_global_advisor_settings_deliveries.sql` — **kill switch**
  (`global_announcement_settings`, fila única `id=1`) y **entregas**
  (`global_announcement_deliveries`, PK `(announcement_id, site)`).
- `20260824000024_global_announcements_sender_profile.sql` — columnas del perfil verificado:
  `sender_display_name`, `sender_username`, `sender_site`.

### Seguridad (RLS)

| Tabla | Lectura | Escritura |
|---|---|---|
| `global_announcements` | anon (solo activos) | INSERT/UPDATE/DELETE: admin o `staff_members` (service role bypasa) |
| `global_announcement_settings` | anon | UPDATE: admin o staff (el devcon usa service role) |
| `global_announcement_deliveries` | anon | INSERT/UPDATE: anon (el front marca su entrega) |
| `announcement_reads` | propio usuario | INSERT: propio usuario |
| `staff_members` | propio / admin | admin |

El **service role key** (solo local, `services/supabase/.env` o `.env.local` de las webs) permite
al devcon/CLI escribir como admin sin pasar por RLS.

---

## 3. Frontend `GlobalAdvisor` (`@ciszu/ui`)

Montado en los 4 layouts: `<GlobalAdvisor site="ciszu" />` (ciszukoantony / muzicmania / ciszubot).

Comportamiento:
1. **Polling** cada **20s** a `global_announcements` (no expirados, últimos 7 días) y filtro en JS
   por `target`: `global` o lista separada por comas (`muzicmania,ciszu,...` del multi-select del
   devcon) que contenga el `site` actual.
2. **Kill switch**: consulta `global_announcement_settings`; si `enabled=false` **limpia los toasts
   mostrados y no muestra nada** (fail-open si la consulta falla).
3. **Entrega**: en **cada fetch** hace **upsert** en `global_announcement_deliveries`
   (`announcement_id, site`) para **todo anuncio relevante** (target global o que incluya el site),
   independientemente de si el usuario ya lo vio. Así el `--wait` del devcon confirma la llegada a
   cada web de forma fiable y rápida (≤ un ciclo de poll).
4. **Persistencia de vistos**: los anuncios cerrados se guardan en `localStorage`
   (`global_advisor_seen_<site>`); al **recargar la página no reaparecen**. Solo los no vistos se
   muestran.
5. **Emisor verificado**: si el anuncio tiene `sender_username`, muestra
   `display_name · @username` con **badge verificado** ✓ (azul) y enlace a su perfil. Hoy **solo
   muzicmania** tiene ruta pública y resuelve por **username con prefijo `@`**
   (`https://muzicmania.vercel.app/profile/@<username>` — sin `@` da 404). Si no hay perfil, se
   muestra la versión normal (`sender · source`).
6. Toast pill oscura centrada (bottom-14, z-1100) con color por tipo. Los mensajes se stackean de
   arriba a abajo (más antiguo arriba).

### Confirmación server-side (`GlobalAdvisorConfirm`)

Además del cliente, hay un componente **RSC** `GlobalAdvisorConfirm` (`@ciszu/ui/server`) montado
en los 4 layouts. En cada render de página confirma la entrega de los anuncios relevantes del site
(upsert en `global_announcement_deliveries`) usando la anon key pública — **independiente del
usuario**: si el mensaje llega a la web, se marca aunque nadie lo lea/cierre. Así el `--wait` del
devcon refleja la llegada real y permite enviar seguido sin esperas falsas.

---

## 4. CLI `scripts/advisor.js`

Usa el **service role key** local (busca en vault + `.env.local` de las webs). Autocarga de env.

```bash
# Enviar (con espera de entrega y filtro de profanidad)
node scripts/advisor.js "Mensaje" --target ciszu,muzicmania --kind warning --sender ciszukoantony --session <id> --wait

# Estado / kill switch
node scripts/advisor.js --status                      # enabled + anuncios activos
node scripts/advisor.js --toggle on|off --sender admin  # activar/desactivar mensajes

# Listar / borrar (reset por error o seguridad)
node scripts/advisor.js --list
node scripts/advisor.js --clear <id> [ids...]
node scripts/advisor.js --clear-all
```

Opciones: `--target` (global o webs separadas por coma) · `--kind` (info/success/warning/error) ·
`--sender` · `--source` (default dev-console) · `--expires` (ISO) · `--wait` · `--session`.
**Límite del mensaje**: entre **2 y 620 caracteres** (validado en el CLI y en el devcon).

### Filtro de profanidad (`scripts/profanity.js`)

Antes de enviar, valida **mensaje y autor** contra una lista de insultos/obscenidades en **español e
inglés** (con normalización leet: `p0lla`, `m13rda`, `@sshole`). Si detecta algo:
1. Registra el intento en el **log de auditoría** (sesión + fecha + campo + valor + palabra).
2. Sale con **exit code 2** → el devcon **cierra la consola** por seguridad.

### Perfil verificado del emisor

`--sender` se compara (case-insensitive, sin `@`, tolera `_` finales) contra los `profiles` de cada
web destino (`<web>.profiles`). Si coincide, el anuncio guarda `sender_display_name`,
`sender_username` y `sender_site` y el front muestra el badge verificado. Si no existe, versión
normal.

### Confirmación de entrega (`--wait`)

Tras insertar, consulta `global_announcement_deliveries` cada 2.5s (máx ~60s) hasta que TODAS las
webs destino confirmen la entrega, imprimiendo un log por web:
`✅ <site> entregado <hora>` / `⏳ <site> pendiente...` / `⚠️ <site> sin confirmación (timeout)`.

> **Garantía backend**: al enviar, `advisor.js` confirma la entrega de TODAS las webs destino
> directamente en `global_announcement_deliveries` (service role), porque el mensaje ya está en la
> BD compartida que todas las webs consultan. Así el `--wait` completa **al instante** y no depende
> de que un usuario abra/visite cada web. La confirmación real por sitio (GlobalAdvisor cliente +
> GlobalAdvisorConfirm RSC) se suma de forma idempotente cuando la web efectivamente la recibe.

---

## 5. Dev console (`dev_console.ps1`)

### Login de acceso

Al arrancar el modo TUI pide la **contraseña** (`DEVCON_PASSWORD`, en el vault
`services/supabase/.env`, **nunca mostrada**; input con `Read-Host -AsSecureString`). Si falla →
cierra la consola. El valor vive en el **vault cifrado** (`vault.ps1 crypt`) y en Bitwarden.

### Menú Advisor (Herramientas extras → 📢)

- **Selección de webs** con multi-select (sin opción "todas": la tecla **A** marca todas; Espacio
  marca/desmarca; **Q/Esc** vuelve). La selección **persiste entre mensajes**.
- **Tipo** (info/success/warning/error) y **autor** (persistentes).
- Envía con `--wait`: espera y muestra el log de entrega por web.
- Al terminar permite **enviar otro mensaje** (Enter) con las mismas opciones o **volver al menú**
  (Q/Esc).
- Si `advisor.js` devuelve **exit 2** (profanidad) → la consola **se cierra** tras registrar el
  intento.

### Kill switch (🔘) y borrado (🗑)

- **🔘 activar/desactivar mensajes globales**: pide la **contraseña** de nuevo y llama a
  `--toggle`. Con el borrado, permite **detener los mensajes globales al instante** si el sistema se
  ve comprometido.
- **🗑 borrar mensajes enviados**: pide la **contraseña**, lista los anuncios y permite borrar por
  IDs o **todos** (A) — útil ante un error o por seguridad.

Todas las acciones quedan **registradas en el log de auditoría** con la sesión.

---

## 6. Seguridad

1. **Solo staff/admin envía**: RLS en `global_announcements`; el devcon usa service role local.
2. **Kill switch**: `global_announcement_settings.enabled`; el front respeta y limpia al instante.
   Puede apagarse desde el devcon (con password) aunque el sistema esté comprometido.
3. **Filtro de profanidad** en mensaje y autor (es/en + leet). Si se detecta → se cierra el devcon y
   queda registrado el intento (con la sesión) para poder atrapar al emisor.
4. **Emisores verificados**: si el autor es una cuenta real de alguna web (profiles), el mensaje
   muestra badge ✓ y enlace a su perfil, dando seguridad de que es un emisor oficial.
5. **Log de auditoría** — cada acción del advisor se registra en
   **`test/website/debug/local-logs/advisor-<fecha>.log`** (una línea JSON por evento, gitignored,
   un archivo por día). Cubre:
   - **Envíos** (`send`): `{ ts, session, action, id, sender, source, target, kind, message, sender_profile }`.
   - **Bloqueos por profanidad** (`blocked-profanity`): campo (`message`/`sender`), valor y palabra
     detectada — clave para atrapar al emisor aunque use un usuario no válido.
   - **Errores de usuario** (`error`): args inválidos, fallos de API, etc.
   - **Kill switch bloqueando envío** (`blocked-killswitch`).
   - **Toggles** (`toggle-on`/`toggle-off`) y **borrados** (`clear`/`clear-all`).
   Permite trackear **quién envió qué y cuándo** por sesión y fecha. El `session` lo genera el
   devcon al arrancar (p.ej. `devcon-20260825-123456-ab12cd34`).
6. **Service role key nunca en el repo**: vive solo en el vault local / `.env.local` (gitignored).
7. **Mensajes escapados**: el front renderiza `message` como texto (sin `dangerouslySetInnerHTML`).

---

## 7. Funcionamiento en Vercel y en local

- **Supabase es la fuente de verdad** (REST, schema `ciszunetwork`). Funciona idéntico en
  producción (Vercel) y en desarrollo local: las webs consultan la misma base.
- En **local** el devcon usa el service role del vault; en **producción** los deploys no ejecutan el
  devcon: los mensajes se envían desde la máquina de Ciszuko con el mismo `advisor.js`/devcon
  (service role local apunta al mismo proyecto Supabase).
- El `GlobalAdvisor` usa `NEXT_PUBLIC_SUPABASE_URL`/`ANON_KEY` de cada web (públicos por diseño);
  la RLS permite a anon leer anuncios activos y marcar entregas, y al service role gestionarlo todo.
- **Entrega**: en producción el poll de cada web (Vercel) marca su `global_announcement_deliveries`;
  el `--wait` del devcon la espera aunque las webs estén en Vercel.

---

## 8. Operación recurrente

- **Semanal**: `node scripts/advisor.js --status` y revisar `local-logs/advisor-*.log`.
- **Vault → Bitwarden**: tras añadir/rotar secretos en `services/supabase/.env`, ejecutar
  `pnpm vault:bw` (o `.\scripts\vault-bitwarden.ps1`) para reflejar el vault en Bitwarden (item
  "Ciszu Network Vault (.env)"). Pide la master password si la sesión está bloqueada.
- **Tras un anuncio**: borrarlo con `--clear <id>` o dejar que expire.
- **Incidente de seguridad**: apagar el kill switch (🔘) + borrar mensajes (🗑) desde el devcon;
  revisar el log de auditoría.
- **Nuevo miembro staff**: `INSERT INTO ciszunetwork.staff_members (user_id, display_name, role)
  VALUES ('<uuid>', 'Nombre', 'admin');` (solo admin).

---

## 9. Roadmap (mejoras futuras)

- [ ] Realtime (Postgres changes) en vez de polling de 30s.
- [ ] Mensajes programados (fecha de inicio además de expiración).
- [ ] Mensajes por usuario/grupo (target por user_id o rol).
- [ ] Página pública de perfil en las 4 webs (hoy solo muzicmania) para el badge verificado.

---

## 10. Relacionado: Disclaimers GLOBALES (replica)

El mismo patrón de GLOBAL_ADVISOR_SYSTEM se replicó para disclaimers de cabecera
(`GlobalDisclaimer`): tablas `global_disclaimers` + `global_disclaimer_settings` (kill
switch) + `global_disclaimer_deliveries`, script `scripts/disclaimer.js` y opciones en el
devcon. Detalle en `DEV_CONSOLE_SYSTEM.md` §4.6b y en `Disclaimer.tsx` del paquete `@ciszu/ui`.
- [ ] Notificación push (ntfy) para incidentes críticos.

---

## 10. Referencias

- `TODO.md` — tarea #3 (origen de este sistema).
- `DEV_CONSOLE_SYSTEM.md` — la consola TUI/CLI de desarrollo.
- `GLOBAL_COMPONENTS_SYSTEM.md` — sistema de toasts/notificaciones del ecosistema (incl. Toast con tipos).
- `DB_SYSTEM.md` — esquemas y RLS de Supabase.
- `SECURITY_PROTOCOLS.md` — RLS obligatorio en tablas nuevas.
- `VAULT_SYSTEM.md` — gestión de secrets (service role key, DEVCON_PASSWORD).

---

_Última revisión: 25 ago 2026. Mantener este documento vivo._
_Relacionados: DEV_CONSOLE_SYSTEM · GLOBAL_COMPONENTS_SYSTEM · DB_SYSTEM · VAULT_SYSTEM · TODO.md_