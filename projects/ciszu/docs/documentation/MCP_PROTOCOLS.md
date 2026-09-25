# MCP_PROTOCOLS — Protocolos de Servidores MCP (Model Context Protocol)

Versión: 1.0.0
Actualización: 2026-08-19
Identificador: MCP_PROTOCOLS_V1.0.0_2026_08_19_ciszunetwork

> **Definición**: protocolo y catálogo de servidores MCP del ecosistema: qué son, cómo se
> registran en cada cliente (VSCode / opencode), inventario actual de los servidores
> configurados en este PC, ventajas, operación, seguridad y reglas de uso.

## 1. Qué es MCP

**MCP** (Model Context Protocol, spec open por Anthropic) es un protocolo estándar para que un
cliente de IA (agente, editor, IDE) **exponga herramientas externas al modelo** sin hardcodear
cada integración. Un **MCP server** ofrece capacidades como *tools* (funciones que el modelo
puede llamar) y *resources* (datos que puede leer), comunicándose por transporte:
**stdio** (proceso local) o **http/SSE** (servicio remoto).

Analogía: si LSP estandariza "el editor entiende de lenguajes", MCP estandariza "el agente puede
actuar sobre herramientas/servicios" (búsqueda web, navegador, BD, diseño, pagos…).

Ventajas de la arquitectura:

- **Un catálogo de servidores reutilizable** entre clientes (VSCode, opencode, Claude Desktop).
- **El modelo no depende de integraciones propietarias**: cualquier cliente que hable MCP usa el
  mismo server.
- **Aislamiento**: el server queda aislado del cliente y puede pedir credenciales/env propias.
- **Herramientas dinámicas**: un mismo servidor expone docenas de tools con schema JSON.

## 2. Estado actual en el ecosistema

### 2.1 En VSCode (Ciszuko) — servicio operativo

Ciszuko tiene **11 servidores MCP configurados** en el archivo global de VSCode:

`C:\Users\fplay\AppData\Roaming\Code\User\mcp.json`

```
- markitdown (microsoft)          stdio  uvx markitdown-mcp@0.0.1a4
- GitHub (github-mcp-server)      http   https://api.githubcopilot.com/mcp/
- Chrome DevTools (Google)        stdio  npx chrome-devtools-mcp@1.6.0
- Playwright (microsoft)          stdio  npx @playwright/mcp@latest
- Notion (makenotion)             http   https://mcp.notion.com/sse
- Supabase (com.supabase)         http   https://mcp.supabase.com/mcp
- Figma (com.figma)               http   https://mcp.figma.com/mcp
- Stripe (com.stripe)             http   https://mcp.stripe.com
- MongoDB (mongodb-js)            stdio  npx mongodb-mcp-server@1.14.0 (flags Atlas)
- Next.js DevTools (vercel)       stdio  npx next-devtools-mcp@0.3.6
- HuggingFace (huggingface)       http   https://huggingface.co/mcp?login
```

> Los servidores `stdio` arrancan bajo demanda con `uvx`/`npx`; los `http` apuntan a servicios
> remotos. Los de pago/credenciales (Stripe, MongoDB, GitHub, HuggingFace, Notion) exigen
> autenticación previa del usuario en su navegador o por input de VSCode (sobre todo MongoDB,
> con ~30 inputs para Atlas).

### 2.2 En opencode (agente) — actualmente NO hay MCP

El `opencode.json` global de `~/.config/opencode/` no define MCP, y el del proyecto (raíz del
monorepo) tampoco. opencode soporta MCP vía la clave `mcp` en la config (o archivo separado). Por
decisión: **no se han conectado todavía** — el agente usa sus tools nativas (bash, read, web,
grep…). La vía de integración futura está documentada en `OPENCODE_SYSTEM.md` (Nivel 3 ·
MCP servers).

> **Nota de acceso**: el agente NO ejecuta los MCP de VSCode en runtime (leer `mcp.json`
> no equivale a tener las tools). Para que el agente use un MCP, hay que registrarlo en la config
> MCP de opencode y reiniciar opencode.

## 3. Servidores MCP de VSCode — inventario detallado

| Servidor | Transporte | Comando/URL | Para qué sirve | Relevancia para Ciszu Network |
| --- | --- | --- | --- | --- |
| **MarkItDown** (microsoft) | stdio | `uvx markitdown-mcp@0.0.1a4` | Convierte archivos (PDF, Office, HTML…) a Markdown | Alta — pipeline de documentación `txt→md→docx→pdf` (`txt2md.js`) |
| **GitHub** | http | `https://api.githubcopilot.com/mcp/` | Issues, PRs, repos del GitHub org | Media — operación CI/CD y review |
| **Chrome DevTools** | stdio | `npx chrome-devtools-mcp@1.6.0` | Inspección/automatización del navegador (console, DOM, network) | Alta — depuración de las 4 webs (ver `DEBUGGING_SYSTEM`) |
| **Playwright** | stdio | `npx @playwright/mcp@latest` | Automatización E2E del navegador (acciones reales) | Alta — suites E2E `test/` (Playwright) |
| **Notion** | http | `https://mcp.notion.com/sse` | Docs y bases de Notion | Baja-media — si se usara Notion como knowledge base |
| **Supabase** | http | `https://mcp.supabase.com/mcp` | Consultas/administración de proyectos Supabase | **Muy alta** — la BD del ecosistema (`obwzzmbvkrcscqwptlqo`) |
| **Figma** | http | `https://mcp.figma.com/mcp` | Ler archivos de diseño/tokens de Figma | Alta — diseño UI/UX (`UI_COMPONENTS_SYSTEM`) |
| **Stripe** | http | `https://mcp.stripe.com` | Pagos, suscripciones, clientes | Media — `PAYMENTS_SYSTEM` (monetización planificada) |
| **MongoDB** | stdio | `npx mongodb-mcp-server@1.14.0` (Atlas flags) | Consultas/operaciones MongoDB/Atlas | Baja — no hay MongoDB en este stack (Postgres/Supabase) |
| **Next.js DevTools** | stdio | `npx next-devtools-mcp@0.3.6` | Diagnóstico/telemetría de apps Next.js | Media — las 4 webs son Next.js 15 |
| **HuggingFace** | http | `https://huggingface.co/mcp?login` | Modelos/inferencia HF | Media — IAs locales/cloud (`AI_ART_PLAN`, `KNOWLEDGE_SYSTEM`) |

## 4. Cómo registrar un MCP en opencode

En `opencode.json` (raíz, versionable) o en el global (`~/.config/opencode/`):

```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "supabase": { "type": "http", "url": "https://mcp.supabase.com/mcp" },
    "playwright": { "type": "stdio", "command": ["npx", "@playwright/mcp@latest"] },
    "github": { "type": "http", "url": "https://api.githubcopilot.com/mcp/", "enabled": true }
  }
}
```

Reglas de registro:

- `type` **stdio** = proceso local (usar `command` array; NUNCA shell/concatenar).
- `type` **http/sse** = servicio remoto (usar `url`). Verificar CORS/auth del servicio.
- La config MCP se carga **al arrancar** opencode: tras añadir un server, **reiniciar opencode**
  (igual que LSP, §config).
- Never registrar un server con tokens en claro: usar `env`/input por variable.
- Mantener el inventario de `~/.config/opencode/` y el del monorepo sincronizado con este doc.

## 5. Ventajas de conectar MCP a opencode

1. **Herramientas sin escribir código de integración**: query a Supabase, abrir Chrome, correr
   Playwright o pulsar Figma, todo se expone como tools del agente.
2. **El modelo decide cuándo usar la tool** (función con schema), en lugar de comandos ad-hoc.
3. **Adaptadoras compartidas** con VSCode: los mismos servers sirven a ambos.
4. **Trazabilidad**: cada tool MCP es una llamada explícita en el log/diagnóstico.

## 6. Límites y desventajas

- **Consumo de procesos/memoria**: cada server stdio es un proceso vivo; en sesiones grandes
  (límite `AGENTS.md` §9) vigilar.
- **Escopetas**: MCP remoto (http) añade latencia y depende del servicio; un fetch del websearch
  nativo a veces es más fiable que un server remoto caído.
- **Confianza**: expone al agente entornos sensibles (pagos, BD). Conectar UNO a la vez y
  verificar permisos/RLS antes (ver `SECURITY_PROTOCOLS`).
- **No sustituye tools nativas**: para operación de sistema, git, lectura de archivos, las tools
  nativas del agente (bash/read/glob…) son más rápidas y sin dependencia externa.

## 7. Plan de uso recomendado (orden de valor para el ecosistema)

1. **Supabase MCP** — el que más valor aporta: consulta/administración directa de la BD sin
   `dbvr`/SQL manual. Requiere token seguro (env var/vault).
2. **Playwright / Chrome DevTools** — depuración y E2E de las webs sin scripts ad-hoc.
3. **GitHub** (org Ciszu-Network) — review de PRs/CI sin salir.
4. **Figma** — inspección de diseño cuando haya archivos conectados.
5. **Stripe** — cuando arranque la monetización (`PAYMENTS_SYSTEM`).
6. MarkItDown, Notion, MongoDB, Next.js DevTools, HuggingFace — bajo demanda real; no registrar
   por defecto en opencode si no se usan activamente.

## 8. Reglas de seguridad

- NUNCA registrar un MCP descargando/invocando paquetes sin revisar qué instala y qué credenciales
  pide (p. ej. MongoDB tiene ~30 inputs, muchos de pago/Atlas — no se usa en este stack).
- Servers `http` con credenciales del usuario: requires OAuth/API key; guardarlas en el vault
  (`VAULT_SYSTEM`), NUNCA en el repo, y referenciarlas por env.
- Antes de usar un MCP sobre datos productivos (Supabase/Stripe), verificar políticas RLS/permisos
  (ver `SECURITY_PROTOCOLS.md`).
- Si se agrega un server a `opencode.json` del repo, el archivo viaja con el repo: no dejar
  secretos en `command`/`env` literales.

### 8.1 Procedimiento de registro seguro (paso a paso)

1. **Evaluar necesidad**: ¿la tool nativa del agente (bash, read, curl) ya cubre la tarea? Si sí,
   no registrar. (Principio YAGNI de `CODE_PRINCIPLES_PROTOCOLS`).
2. **Revisar el server antes de añadirlo**: `npx <paquete> --help` / doc oficial, y qué credenciales
   pide (OAuth browser vs token).
3. **Registrar en `opencode.json` del repositorio** con solo `type` + `command`/`url`; los tokens
   van por `env` referenciado a variable de usuario o `SECRET_TEMP.env` + vault.
4. **Reiniciar opencode** para que cargue el server (config se lee al arranque).
5. **Probar en modo controlado**: una única tool en un entorno acotado (p. ej. supabase en read-only
   SELECT con RLS) antes de habilitar tools de mutación.
6. **Documentar**: actualizar §2.2 (estado en opencode) y el inventario; ninguna herramienta MCP
   operativa puede quedar sin su fila aquí.

### 8.2 Ejemplo de registro con secretos vía env (sin literales en el repo)

```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "supabase": {
      "type": "http",
      "url": "https://mcp.supabase.com/mcp",
      "env": { "SUPABASE_ACCESS_TOKEN": "{env:SUPABASE_ACCESS_TOKEN}" }
    }
  }
}
```

- El valor real vive en el vault (`VAULT_SYSTEM`) o variable de entorno de usuario; el repo solo
  referencia el nombre de la variable.
- `{env:...}` es el patrón de referencia de opencode para variables de entorno.

## 9. Operación y verificación de un MCP conectado

- **Estado**: opencode lista los servers MCP y su estado; verificar que el server quedó
  `enabled` tras el reinicio.
- **Latencia**: servers `http` remotos dependen del servicio; si un server remoto responde lento
  o cae, el agente debe poder seguir usando sus tools nativas (el fallback nunca se pierde).
- **Logs**: los errores de inicialización de un server MCP aparecen en el log de opencode
  (`E:\Ciszu Network\.opencode\data\log\opencode.log`); buscar el nombre del server para
  diagnosticar CORS/auth.
- **Limpieza**: deshabilitar un server que deja de usarse (no acumular) para no consumir memoria
  ni exponer endpoints.

## 10. FAQ

**¿Qué diferencia hay entre MCP `stdio` y `http`?** `stdio` lanza un proceso local (requiere que
`npx`/`uvx`/lang disponible en el PATH del server); `http` habla con un servicio remoto vía SSE
(u OAuth) y no instala nada local.

**¿Por qué MarkItDown es el primero recomendado?** Porque el ecosistema genera mucha
documentación en formato `txt→md→docx→pdf` (`txt2md.js`); MarkItDown convierte PDF/Office a MD y
complementa el pipeline de `DOCUMENTATION_SYSTEM`.

**¿Puedo conectar los mismos servers en opencode que en VSCode?** Sí, MCP es agnóstico de cliente:
el mismo server (mentalidad y URL) se registra en ambos. La config de VSCode vive en su `mcp.json`;
la de opencode en `opencode.json`. Son configuraciones independientes.

**¿Un MCP del repo se sincroniza entre PCs?** Depende: `opencode.json` de la raíz sí (viaja en el
repo), pero los tokens/env no (quedan en cada entorno vía vault). Por eso el patrón del §8.2.

**¿El agente puede usar hoy los MCP de mi VSCode?** No en runtime: leer su config no equivale a
tener las tools. Para hacerlos operativos hay que registrarlos en opencode (§4) y reiniciar.

## 11. Referencias

- `OPENCODE_SYSTEM.md` — Nivel 3 · MCP servers en opencode (configuración).
- `SECURITY_PROTOCOLS.md` — permisos y credenciales (RLS, vault).
- `DB_SYSTEM.md` / `PAYMENTS_SYSTEM.md` / `UI_COMPONENTS_SYSTEM.md` — dominos donde un MCP añade valor.
- Config real de VSCode: `C:\Users\fplay\AppData\Roaming\Code\User\mcp.json`.

_Última revisión: 19 ago 2026._ Relacionado: `LSP_PROTOCOLS.md`, `OPENCODE_SYSTEM.md`, `SECURITY_PROTOCOLS.md`,
`DB_SYSTEM.md`, `PAYMENTS_SYSTEM.md`, `UI_COMPONENTS_SYSTEM.md`.