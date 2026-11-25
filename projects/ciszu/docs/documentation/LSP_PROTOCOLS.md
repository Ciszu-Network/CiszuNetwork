# LSP_PROTOCOLS — LSP en editores y verificación (OpenCode V2)

Versión: 2.0.0
Actualización: 2026-11-22
Identificador: LSP_PROTOCOLS_V2.0.0_2026_11_22_ciszunetwork

> **Definición**: estado del Language Server Protocol (LSP) en el ecosistema tras migrar a
> OpenCode V2, catálogo de servidores LSP que siguen activos en los editores y reglas de
> verificación de código del agente. **OpenCode V2 no ejecuta LSP.**

## 1. Qué es un servidor LSP

Un **LSP server** es un proceso que entiende un lenguaje de programación (tipos, símbolos,
referencias, hover, diagnósticos) y habla JSON-RPC sobre stdio/pipe con el cliente. El cliente
no necesita implementar el parser de cada lenguaje: el server aporta la inteligencia.

Beneficios en un editor:

- **Un server por lenguaje** sirve a VS Code, Neovim y otros clientes.
- **Feedback en vivo**: diagnósticos al escribir, sin ejecutar un build.
- **Navegación semántica**: definiciones, referencias y hover sobre el AST real.
- **Refactorings asistidos**: renombrados y extracciones con validación del lenguaje.

## 2. Estado en OpenCode V2 — LSP retirado del agente

OpenCode V2 **no arranca servidores LSP, no expone tools LSP y no entrega diagnósticos al
agente**. El campo `"lsp"` se acepta por compatibilidad con V1, pero se ignora; `permission.lsp`
tampoco es una acción válida de V2.

La ausencia de LSP en el agente no es un bug de configuración ni algo que se pueda recuperar
añadiendo una clave: es una decisión de diseño de V2. Cualquier intento de reactivarlo con
`lsp`/`permission.lsp` no produce diagnósticos y solo deja configuración muerta.

Consecuencias directas:

- `opencode.json` no debe declarar `"lsp": true` ni `"permission": { "lsp": "allow" }`.
- Las variables `OPENCODE_EXPERIMENTAL_LSP_TOOL` y `OPENCODE_DISABLE_LSP_DOWNLOAD` no aplican
  al agente V2; se pueden retirar del entorno de usuario.
- El agente no recibe diagnósticos al leer un archivo: debe ejecutar `tsc`, `eslint` o el build.
- Los editores (VS Code) mantienen su LSP propio; no dependen de OpenCode.

### 2.1 Historia (V1)

En OpenCode V1 se activó `"lsp": true` con los servers built-in y `permission.lsp: allow` para
las tools experimentales. Esa configuración se retiró al migrar a V2. El historial se conserva
en `STATUS_SYSTEM.md` y en el historial de commits; no debe reintroducirse en la configuración
actual.

## 3. Estado actual del repositorio

- `opencode.json` (raíz) **no** contiene `lsp` ni `permission.lsp`.
- `typescript` y `eslint` siguen en `devDependencies` de la raíz para los comandos de
  verificación y el tooling del monorepo, no para LSP del agente.
- `opencode debug config` debe mostrar la configuración V2 sin `lsp`. Si aparece un `lsp`
  heredado, eliminarlo del archivo correspondiente y guardar; V2 recarga la configuración.
- Los servidores LSP de VS Code viven en la configuración del editor, no en el repo.

### 3.1 LSP, typechecker y build: no son lo mismo

| Capa | Qué valida | Dónde corre | Uso en este repo |
| --- | --- | --- | --- |
| LSP del editor | Tipos locales, símbolos y lint mientras escribes | VS Code / Neovim | Ayuda humana; no es del agente |
| `tsc --noEmit` | Programa TypeScript completo del workspace | Terminal/CI | Verificación obligatoria |
| `eslint` | Reglas de estilo y errores estáticos | Terminal/CI | Verificación obligatoria |
| `next build` | Rutas, RSC, bundling, imports y SSG/ISR | Terminal/CI | Capa 0 para las webs |
| `pnpm test` / `pnpm e2e` | Comportamiento y flujos reales | Terminal/CI | Verificación funcional |

Un archivo puede verse perfecto en el editor y romper `next build` por un import dinámico, una
ruta mal resuelta o una regla de Next.js. Por eso el LSP del editor nunca se reporta como
"verificación terminada".

## 4. Catálogo de LSP para editores

La siguiente tabla es una referencia de los servidores que aportan valor en este monorepo si se
usan desde VS Code u otro editor. No implica que OpenCode los ejecute.

| Server | Extensiones | Requisito local | Uso real en el repo |
| --- | --- | --- | --- |
| `typescript` | `.ts`, `.tsx`, `.js`, `.jsx`, `.mjs`, `.cjs`, `.mts`, `.cts` | `typescript` resoluble | **Principal**: 4 webs Next.js + bot Discord + packages TS |
| `eslint` | `.ts`, `.tsx`, `.js`, `.jsx`, `.mjs`, `.cjs`, `.mts`, `.cts`, `.vue` | `eslint` resoluble | **Principal**: lint de todos los workspaces |
| `yaml-ls` | `.yaml`, `.yml` | Red Hat YAML extension | Workflows de GitHub (`.github/workflows/*.yml`), configs |
| `bash` | `.sh`, `.bash`, `.zsh`, `.ksh` | bash-language-server | Scripts de shell |
| `dockerfile` | `Dockerfile` | Extensión Docker | Dockerfile del bot Discord |
| `json` | `.json` | Gestionado por VS Code/TypeScript | `tsconfig`, `package.json`, configs |
| `prisma` | `.prisma` | Extensión Prisma | No aplica: el stack usa Drizzle |
| `vue` | `.vue` | Extensión Vue | No aplica actualmente |
| `astro` | `.astro` | Extensión Astro | No aplica actualmente |
| `rust` | `.rs` | `rust-analyzer` | No aplica al monorepo principal |

Los servidores de lenguajes ausentes no se instalan solo por tener la extensión: el editor los
arranca cuando abre un archivo de su extensión y el requisito local existe.

## 5. Verificación del LSP del editor

1. Abrir un `.tsx` del monorepo en VS Code.
2. Confirmar que la extensión de TypeScript/ESLint está activa y que el archivo no muestra
   `Initializing` indefinidamente.
3. Comprobar `TypeScript: Restart TS Server` si los tipos quedan desincronizados.
4. Revisar la salida de la extensión (`Output → TypeScript` / `ESLint`) ante errores raros.
5. Recordar que el LSP del editor **no** es el LSP del agente: no hay puente entre ambos en V2.

### 5.4 Seguridad de las extensiones LSP

- Instalar extensiones solo desde el marketplace oficial o una fuente revisada.
- No dar a una extensión acceso a `.env`, vaults ni claves; el LSP no necesita secretos para
  tipar el código.
- Revisar actualizaciones automáticas de extensiones que ejecutan binarios locales.
- Mantener el workspace sin rutas absolutas de un solo PC en archivos versionados.
- Recordar que el LSP del editor no tiene relación con los permisos del agente OpenCode.

## 6. Regla de oro: verificación por comando

El LSP es una ayuda del editor; nunca sustituye la verificación real del repositorio. Antes de
reportar una tarea terminada, ejecutar según el área:

```bash
pnpm --filter <web> exec tsc --noEmit
pnpm lint
pnpm --filter <web> build
pnpm test
```

- No asumir que "tipo bien" por no ver errores en el editor.
- Si el editor y `tsc` discrepan, manda `tsc`.
- Para cambios de Next.js, `next build` es la comprobación final.
- Para tests de interacción/UI, usar `pnpm e2e` o los comandos documentados en
  `LOCAL_TESTING_PROTOCOLS.md` §3.3.

## 7. Límites y riesgos

- **Desincronización**: un LSP puede quedarse con estado viejo si el proyecto cambia fuera del
  archivo abierto; reiniciar el server del editor lo corrige.
- **Memoria**: cada server activo es un proceso; no abrir monorepos gigantes sin necesidad.
- **Variación por versión**: la extensión y la versión de TypeScript/ESLint del workspace pueden
  dar diagnósticos distintos.
- **Falsa confianza**: un archivo aislado puede tipar bien y romper el build por imports,
  rutas o configuración de Next.js. El build manda.
- **OpenCode V2 no ofrece LSP**: no hay tools `lsp_*` ni diagnósticos automáticos al agente.

## 8. Troubleshooting (editor)

| Síntoma | Causa probable | Acción |
| --- | --- | --- |
| VS Code no muestra tipos | TS Server detenido o versión incorrecta | `TypeScript: Restart TS Server`; seleccionar la versión del workspace |
| ESLint no marca nada | Extensión desactivada o `eslint` no resoluble | Activar ESLint; verificar `pnpm --filter <web> exec eslint --version` |
| Diagnósticos viejos | Cache del editor | Reiniciar TS Server / recargar ventana |
| `Cannot find module` en el editor | `pnpm install` incompleto | `pnpm install` y reiniciar el server del editor |
| El agente no ve errores de tipos | Es lo esperado en V2 | Ejecutar `tsc --noEmit` en la terminal |
| Quiero LSP en el agente | V2 no lo soporta | Usar comandos; no reintroducir `lsp` en `opencode.json` |

## 9. FAQ

**¿OpenCode V2 puede activar LSP con `lsp: true`?** No. El campo se acepta por compatibilidad,
pero V2 no ejecuta servers ni expone tools LSP.

**¿Debo borrar `OPENCODE_EXPERIMENTAL_LSP_TOOL` del entorno?** Sí, no tiene efecto en V2. No es
un secreto; se puede eliminar de las variables de usuario.

**¿El LSP del editor y el agente comparten estado?** No. Son procesos independientes; el agente
solo ve lo que devuelven sus tools y comandos.

**¿Cómo obtengo diagnósticos automáticos en el agente?** No hay una vía LSP en V2. La vía es
ejecutar `tsc`/`eslint`/`build` y leer su salida, o usar un plugin de servidor que implemente
la API V2 si se justifica.

**¿Los `devDependencies` de TypeScript/ESLint siguen siendo necesarios?** Sí, para los comandos
de verificación y el tooling; ya no para LSP del agente.

**¿Un proyecto nuevo debe configurar LSP?** Solo en el editor. El repo no debe declarar LSP
para el agente en V2. Si el equipo usa VS Code, cada persona instala sus extensiones; no se
versionan rutas absolutas ni credenciales de extensiones.

**¿Cómo sé si un error viene del editor o del proyecto?** Ejecuta el mismo chequeo en terminal.
Si `tsc`/`eslint` pasan, el problema es del estado del editor; si fallan, es del código.

### 8.2 Checklist de migración V1 → V2

- [ ] Quitar `"lsp": true` de `opencode.json` (raíz y global).
- [ ] Quitar `permission.lsp` de `permissions`/`permission`.
- [ ] Retirar `OPENCODE_EXPERIMENTAL_LSP_TOOL` y `OPENCODE_DISABLE_LSP_DOWNLOAD` del entorno.
- [ ] Verificar que `opencode debug config` no muestre LSP activo.
- [ ] Confirmar que el editor sigue tipando con su propio LSP (no es requisito del agente).
- [ ] Ejecutar `tsc`, `eslint`, `next build` y tests antes de cerrar la tarea.

### 8.3 Verificación de que no queda configuración V1

```bash
rg -n '"lsp"|permission\.lsp|OPENCODE_EXPERIMENTAL_LSP' opencode.json .opencode AGENTS.md
```

El comando debe devolver solo referencias históricas/documentales, nunca configuración activa.

## 10. Referencias

- `OPENCODE_SYSTEM.md` — estado V2, voz y comandos.
- `AGENTS.md` §6.7 — regla de verificación por comando.
- `LOCAL_TESTING_PROTOCOLS.md` §3.3 — pruebas locales obligatorias.
- `TESTING_SYSTEM.md` §9A — Next.js como capa 0.
- `FRAMEWORKS_SYSTEM.md` — versiones de TypeScript/ESLint.
- OpenCode V2: `https://opencode.ai/docs/migrate-v1` y `https://opencode.ai/docs/config`.

## 11. Registro de cambios

| Fecha | Cambio |
| --- | --- |
| 2026-08-19 | LSP del agente activado en OpenCode V1 (`lsp: true`, `permission.lsp`, `OPENCODE_EXPERIMENTAL_LSP_TOOL`). |
| 2026-11-22 | Migración a OpenCode V2: LSP retirado del agente; se conserva el LSP de los editores y la verificación por comando. Configuración V1 eliminada de `opencode.json`. |

_Última revisión: 22 nov 2026._ Relacionado: `OPENCODE_SYSTEM.md`, `AGENTS.md`,
`FRAMEWORKS_SYSTEM.md`, `TESTING_SYSTEM.md`, `LOCAL_TESTING_PROTOCOLS.md`, `MCP_PROTOCOLS.md`.
