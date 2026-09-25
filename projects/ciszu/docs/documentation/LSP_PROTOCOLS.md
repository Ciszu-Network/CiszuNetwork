# LSP_PROTOCOLS — Protocolos de Servidores LSP (Language Server Protocol)

Versión: 1.0.0
Actualización: 2026-08-19
Identificador: LSP_PROTOCOLS_V1.0.0_2026_08_19_ciszunetwork

> **Definición**: protocolo y catálogo de servidores LSP del ecosistema, cómo se usan en el
> agente opencode y en los editores, definición, ventajas, configuración aplicada y reglas de
> operación/seguridad. Fuente local: `AGENTS.md` §6.7 y `OPENCODE_SYSTEM.md` (sección LSP).

## 1. Qué es un servidor LSP

Un **LSP server** (Language Server Protocol) es un proceso que entiende un lenguaje de
programación de forma profesional (tipos, símbolos, referencias, hover, diagnósticos) y se
comunica con el cliente (editor o agente) **por un protocolo estandarizado** (JSON-RPC sobre
stdio/pipe). El cliente no necesita saber parses de cada lenguaje: habla un protocolo común y el
server entrega la inteligencia.

Beneficios de la arquitectura (por qué existe LSP en vez de un plugin por editor):

- **Un solo server por lenguaje** sirve a VS Code, Neovim, y al agente opencode a la vez.
- **El lenguaje se implementa una vez**: el conocimiento vive en el server, no duplicado en cada
  herramienta.
- **Feedback en vivo**: al escribir, el server emite diagnósticos (errores, warnings) sin que el
  usuario ejecute nada.

## 2. Cómo lo usa el agente opencode

- opencode integra los LSP servers **built-in** (~35 servidores). Están **desactivados por
  defecto**; se activan con `"lsp": true` (o un objeto `"lsp": {}`) en `opencode.json`.
- Al activarse, opencode arranca el server correspondiente **cuando lee un archivo** cuya
  extensión coincide y se cumplen los requisitos locales (p. ej. la dependencia `typescript`
  presente, o el comando `go` instalado).
- El resultado: **diagnósticos proactivos** (errores de tipos, imports rotos, lint) llegan al
  agente como feedback al decidir la siguiente acción, sin ejecutar comandos.
- `permission.lsp: "allow"` habilita además las **tools LSP del agente** (experimentales):
  queries de goDefinición, hover y referencias sobre el código real. Requiere la env var
  `OPENCODE_EXPERIMENTAL_LSP_TOOL=true` en el entorno antes de arrancar la sesión.

### 2.1 Estado actual en el ecosistema

- `opencode.json` (raíz del monorepo): `"lsp": true` + `"permission": { "lsp": "allow" }`.
- `package.json` (raíz): `typescript ^6.0.3` añadido a `devDependencies` (era requisito: la dep
  debe ser resoluble **desde la raíz del workspace**; pnpm no hoista deps de los workspaces al
  root). `eslint ^9.0.0` ya existía.
- Env vars de usuario (Windows, nivel usuario): `OPENCODE_EXPERIMENTAL_LSP_TOOL=true` y
  `OPENCODE_DISABLE_LSP_DOWNLOAD=true`.
- Verificado por log (2026-08-19): el server de opencode emitió `enabled LSP servers` con la
  lista completa al arrancar.

## 3. Catálogo de servers LSP relevantes para este monorepo

opencode habilita la lista completa de built-ins al poner `lsp: true`; de esa lista, los que
**realmente aplican** a este proyecto (por extensiones de archivo presentes):

| Server | Extensiones | Requisito local | Uso real en el repo |
| --- | --- | --- | --- |
| `typescript` | `.ts`, `.tsx`, `.js`, `.jsx`, `.mjs`, `.cjs`, `.mts`, `.cts` | dep `typescript` en el proyecto | **Principal**: 4 webs Next.js + bot Discord + packages TS |
| `eslint` | `.ts`, `.tsx`, `.js`, `.jsx`, `.mjs`, `.cjs`, `.mts`, `.cts`, `.vue` | dep `eslint` en el proyecto | **Principal**: lint de todos los workspaces |
| `yaml-ls` | `.yaml`, `.yml` | autoinstala Red Hat yaml-ls | Workflows de GitHub (`.github/workflows/*.yml`), configs |
| `bash` | `.sh`, `.bash`, `.zsh`, `.ksh` | autoinstala bash-language-server | Scripts `scripts/*.sh` (si existen en el futuro) |
| `dockerfile` | `Dockerfile` | — | Dockerfile del bot Discord (`projects/ciszubot/discord-bot/`) |
| `astro` | `.astro` | autoinstala para proyectos Astro | Ninguno actualmente |
| `vue` | `.vue` | autoinstala | Ninguno actualmente |
| `prisma` | `.prisma` | comando `prisma` | Ninguno (se usa Drizzle, no Prisma) |
| `json` (via typescript) | `.json` | gestionado por typescript en TS projects | tsconfig, package.json de todos los workspaces |

Los servers con requisito ausente (clangd, gopls, rust, pyright, etc.) **se habilitan pero no se
arrancan**: opencode solo los inicia si abre un archivo de su extensión Y el requisito local
existe. No consumen memoria al estar inactivos.

### 3.1 Catálogo completo de built-ins de opencode (referencia)

Lista oficial de servers integrados en opencode, con su extensión y requisito local (fuente:
doc oficial opencode, 2026-08):

| Server | Extensiones | Requisito local |
| --- | --- | --- |
| `astro` | `.astro` | autoinstala (proyectos Astro) |
| `bash` | `.sh`, `.bash`, `.zsh`, `.ksh` | autoinstala bash-language-server |
| `clangd` | `.c`, `.cpp`, `.cc`, `.cxx`, `.c++`, `.h`, `.hpp`, `.hh`, `.hxx`, `.h++` | autoinstala (proyectos C/C++) |
| `csharp` | `.cs` | .NET SDK instalado |
| `clojure-lsp` | `.clj`, `.cljs`, `.cljc`, `.edn` | comando `clojure-lsp` |
| `dart` | `.dart` | comando `dart` |
| `deno` | `.ts`, `.tsx`, `.js`, `.jsx`, `.mjs` | comando `deno` (detecta `deno.json`) |
| `elixir-ls` | `.ex`, `.exs` | comando `elixir` |
| `eslint` | `.ts`, `.tsx`, `.js`, `.jsx`, `.mjs`, `.cjs`, `.mts`, `.cts`, `.vue` | dep `eslint` en el proyecto |
| `fsharp` | `.fs`, `.fsi`, `.fsx`, `.fsscript` | .NET SDK instalado |
| `gleam` | `.gleam` | comando `gleam` |
| `gopls` | `.go` | comando `go` |
| `hls` | `.hs`, `.lhs` | comando `haskell-language-server-wrapper` |
| `jdtls` | `.java` | Java SDK (21+) instalado |
| `julials` | `.jl` | `julia` + `LanguageServer.jl` |
| `kotlin-ls` | `.kt`, `.kts` | autoinstala (proyectos Kotlin) |
| `lua-ls` | `.lua` | autoinstala (proyectos Lua) |
| `nixd` | `.nix` | comando `nixd` |
| `ocaml-lsp` | `.ml`, `.mli` | comando `ocamllsp` |
| `oxlint` | `.ts`, `.tsx`, `.js`, `.jsx`, `.mjs`, `.cjs`, `.mts`, `.cts`, `.vue`, `.astro`, `.svelte` | dep `oxlint` en el proyecto |
| `php intelephense` | `.php` | autoinstala (proyectos PHP) |
| `prisma` | `.prisma` | comando `prisma` |
| `pyright` | `.py`, `.pyi` | dep `pyright` instalada |
| `ruby-lsp` | `.rb`, `.rake`, `.gemspec`, `.ru` | comandos `ruby` y `gem` |
| `rust` | `.rs` | comando `rust-analyzer` |
| `sourcekit-lsp` | `.swift`, `.objc`, `.objcpp` | `swift` (Xcode en macOS) |
| `svelte` | `.svelte` | autoinstala (proyectos Svelte) |
| `terraform` | `.tf`, `.tfvars` | autoinstala (releases GitHub) |
| `tinymist` | `.typ`, `.typc` | autoinstala (releases GitHub) |
| `typescript` | `.ts`, `.tsx`, `.js`, `.jsx`, `.mjs`, `.cjs`, `.mts`, `.cts` | dep `typescript` en el proyecto |
| `vue` | `.vue` | autoinstala (proyectos Vue) |
| `yaml-ls` | `.yaml`, `.yml` | autoinstala Red Hat yaml-language-server |
| `zls` | `.zig`, `.zon` | comando `zig` |

> Regla: para este monorepo solo se usan activamente `typescript`, `eslint`, `yaml-ls`, `bash` y
> `dockerfile`. El resto quedan habilitados pero dormidos hasta que abra un archivo de su extensión.

## 4. Configuración en opencode.json

Todo se define en `opencode.json` (raíz del monorepo) — config del proyecto, versionable.

```json
{
  "$schema": "https://opencode.ai/config.json",
  "lsp": true,
  "permission": {
    "lsp": "allow"
  }
}
```

Variantes útiles (si algún día se necesitan):

```json
{
  "lsp": {
    "typescript": {
      "initialization": {
        "preferences": { "importModuleSpecifierPreference": "relative" }
      }
    },
    "eslint": {},
    "rust": { "disabled": true }
  }
}
```

- `"lsp": true` → habilita TODOS los built-in.
- `"lsp": {}` → mantiene todos los built-in y permite configurar overrides.
- `"lsp": false` → deshabilita todo (si otra config los había activado).
- `"lsp": { "<server>": { "disabled": true } }` → deshabilita uno concreto.
- Por server se puede fijar: `command` (array), `extensions`, `env`, `initialization`,
  `disabled`.
- Servers personalizados (custom LSP) usan `command` + `extensions`.

> **Regla**: nunca configurar `lsp` en el `opencode.json` global de `~/.config/opencode/` salvo
> que aplique a todos los proyectos; este monorepo lo declara en el de la raíz.

## 5. Ventajas operativas (para el agente y el flujo de trabajo)

1. **Diagnósticos en vivo**: errores de tipos/imports/lint llegan al agente al leer el archivo,
   sin ejecutar `tsc`/`eslint`.
2. **Menos ciclos de verificación**: el agente no lanza typechecks a ciegas; conoce el estado y
   ataca el problema exacto.
3. **Refactorings precisos**: definiciones, referencias y hover viajan sobre el AST real, no por
   búsquedas de texto.
4. **Primera línea de detección**: atrapa errores que el build es más lento en evidenciar
   (tipos en un solo archivo abierto).

## 6. Límites y desventajas (honestidad técnica)

- **Puede desincronizarse**: un server puede quedarse con estado viejo si el proyecto cambia
  fuera del archivo abierto; los diagnósticos no siempre reflejan el estado global.
- **Consumo de memoria**: cada server es un proceso; en sesiones grandes (~120k tokens de
  contexto cerca del límite documentado en `AGENTS.md` §9) conviene vigilar.
- **Variación por versión**: los servers dependen de las versiones de las deps del proyecto;
  una dep en un workspace puede dar diagnósticos distintos a la raíz.
- **Anti-patrón conocido**: en proyectos donde el tipo es simple, el LSP añade ruido sobre
  ejecutar `lint`/`typecheck` directo. Por eso **NUNCA sustituye** el build real.

## 7. Regla de oro: el LSP no sustituye la verificación por comando

Los diagnósticos LSP son una **alerta temprana**, NO la garantía de que el código compila. Antes
de reportar una tarea terminada, ejecutar (ver `LOCAL_TESTING_PROTOCOLS.md` §3.3):

```
pnpm --filter <web> exec tsc --noEmit     # o el typecheck del workspace
eslint  .                                  # lint
pnpm --filter <web> build                  # next build = capa 0 (TESTING_SYSTEM §9A)
pnpm test                                  # unit (Vitest)
```

- No asumir que "tipo bien" solo porque el LSP no reporta errores.
- Si un diagnóstico LSP y `tsc` discrepan, **manda el comando** (el build real).

## 8. Troubleshooting

| Síntoma | Causa probable | Acción |
| --- | --- | --- |
| UI opencode muestra LSP "disabled" | Config no cargada (server viejo persistente) o dep no resoluble en la raíz | Verificar `node -e "require.resolve('typescript')"`; **cerrar opencode del todo** y relanzar (la config se lee al arrancar el server, no la TUI) |
| Server tipo TS no inicia | Falta `typescript` en deps de la raíz del workspace | `pnpm add -w typescript` + `pnpm install` + reiniciar |
| Descargas fallan en red restringida | Servers que se autoinstalan (yaml-ls, bash…) | `OPENCODE_DISABLE_LSP_DOWNLOAD=true` (ya en el entorno) |
| Tools LSP del agente no aparecen | Falta env var o permiso | `permission.lsp: allow` + `OPENCODE_EXPERIMENTAL_LSP_TOOL=true` antes de arrancar |
| LSP lento en sesión grande | Memoria del servidor | Revisar `AGENTS.md` §9 (límite de contexto); deshabilitar servers no usados |

### 8.1 Procedimiento rápido de verificación de estado

1. Confirmar que `opencode.json` raíz tiene `"lsp": true` y `permission.lsp: allow`.
2. Confirmar resolución: `node -e "require.resolve('typescript')"` devuelve una ruta bajo
   `E:\Ciszu Network\node_modules\.pnpm\...`.
3. Confirmar env vars: `[Environment]::GetEnvironmentVariable('OPENCODE_EXPERIMENTAL_LSP_TOOL','User')`
   → `true`.
4. Abrir un `.tsx` en la sesión y ver el log: `enabled LSP servers` (o `disabled` → reiniciar).
5. Si todo lo anterior OK y la UI insiste en "disabled", **reiniciar el server** (cerrar opencode
   por completo, validar `Get-Process opencode` vacío y relanzar).

### 8.2 FAQ

**¿El LSP consume memoria todo el tiempo?** No. Los servers se arrancan bajo demanda al leer un
archivo de su extensión y con requisito cumplido; los inactivos no viven en RAM.

**¿Por qué `typescript` no inicia si las webs traen TS?** Porque el server depende de la dep
`typescript` **resoluble desde la raíz del workspace**, y pnpm no hoista deps de los workspaces al
root. Se resuelve añadiendo la dep a la raíz (`pnpm add -w typescript`).

**¿Se activan en móvil/remoto (Termius)?** Los servers viven en el server local del PC; una sesión
remota por ntfy/SSH usa el mismo server y hereda el estado del PC (ver `REMOTE_CONTROL_SYSTEM.md`).

**¿Puedo añadir servers propios?** Sí: sustituir `lsp: true` por un objeto con la clave del server
(ver §4) usando `command` + `extensions` para servers custom.

**¿El LSP reemplaza a los tests?** No, es diagnóstico en vivo. La verificación por comando
(`tsc`, `next build`, `pnpm test`) sigue siendo obligatoria (§7).

## 9. Referencias

- `OPENCODE_SYSTEM.md` — sección LSP (activación, beneficios, operación), v2.1.0.
- `AGENTS.md` §6.7 — estado actual del LSP del agente.
- `FRAMEWORKS_SYSTEM.md` — versiones de las herramientas (TypeScript, ESLint).
- `TESTING_SYSTEM.md` §9A — Next.js como capa 0 de verificación.
- `LOCAL_TESTING_PROTOCOLS.md` §3.3 — verificación por comando obligatoria.

_Última revisión: 19 ago 2026._ Relacionado: `OPENCODE_SYSTEM.md`, `AGENTS.md`, `FRAMEWORKS_SYSTEM.md`,
`TESTING_SYSTEM.md`, `LOCAL_TESTING_PROTOCOLS.md`, `MCP_PROTOCOLS.md`.