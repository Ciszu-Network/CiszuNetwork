# WORKFLOW_SYSTEM — Flujo de Trabajo del Portfolio (Ciszuko Antony)

Versión: 1.0.0
Actualización: 2026-08-13
Identificador: WORKFLOW_SYSTEM_V1.0.0_2026_08_13_ciszunetwork

> **Definición**: sistema que documenta el flujo de trabajo diario del portfolio de Ciszuko
> Antony: comandos de desarrollo, pipeline de documentación (`txt2md`, `md2office`,
> `txt2pdf`), convenciones de git, protocolo de inicio/cierre de sesión, troubleshooting y
> zonas de trabajo.

---

## 1. Propósito y alcance

Este documento define **cómo se trabaja** en el proyecto `ciszukoantony` de forma práctica:
los comandos que se ejecutan, el orden de las tareas, las reglas de git y qué hacer cuando
algo falla. Su objetivo es que cualquier sesión (humana o de agente) siga el mismo flujo y
deje el repo en un estado consistente.

## 2. Comandos de desarrollo

Todos los comandos se ejecutan desde la raíz del monorepo usando pnpm workspaces.

### 2.1 Tabla de comandos

| Comando | Acción |
|---|---|
| `pnpm --filter ciszukoantony-website dev` | Servidor de desarrollo |
| `pnpm --filter ciszukoantony-website build` | Build de producción |
| `pnpm --filter ciszukoantony-website lint` | Lint (ESLint) |
| `pnpm --filter ciszukoantony-website verify` | Lint + build (verificación completa) |
| `pnpm install` | Instalar dependencias de todos los workspaces |
| `pnpm dev` / `pnpm build` / `pnpm lint` | Turbo: todos los apps |

> El nombre del filtro es `ciszukoantony-website` (definido en `website/package.json`).

## 3. Comandos de documentación

El portfolio genera su documentación en varios formatos. Los scripts de conversión se usan
sobre `docs/`:

| Comando | Conversión | Descripción |
|---|---|---|
| `txt2md` | `docs/txt/ → docs/md/` | Texto plano a Markdown |
| `md2office` | `docs/md/ → docs/docx/` y `docs/md/ → docs/pdf/` | Markdown a Word/PDF |
| `txt2pdf` | `docs/txt/ → docs/pdf/` | Texto plano a PDF (ruta alternativa) |

### 3.1 Reglas del pipeline

- La **fuente de verdad** es `docs/txt/`; las carpetas `md/`, `docx/` y `pdf/` se generan.
- Los archivos especiales `GUIDELINES`, `RULES` y `ACTA` **se saltan** en `md2office`
  (composición manual; ver `ARCHITECTURE.md` §5.3).
- Tras generar formatos, se copian a `website/public/docs/` para publicarlos en la web.

### 3.2 Flujo de publicación de documentación

```
1. Editar fuente   → docs/txt/<DOC>.txt
2. Regenerar       → txt2md, md2office (salta especiales), txt2pdf
3. Publicar        → copiar docs/ a website/public/docs/
4. Verificar       → revisar que los formatos existen y son válidos
```

## 4. Convenciones de git

### 4.1 Mensajes de commit

- En **español**, descriptivos, **una línea**.
- Prefijo por tipo cuando aporta claridad (`docs:`, `fix:`, `feat:`, `refactor:`).

Ejemplos:

```
docs: migrar documentación del portfolio al estándar de Ciszu Network
fix: resolver error de resolución de assets en layout
feat: añadir página de certificados
```

### 4.2 Reglas

- **No commitear ni pushear** sin solicitud explícita del usuario.
- El push desde este PC puede fallar por DNS (github.com no resuelve); el usuario hace push
  manualmente.
- No subir archivos grandes (`.mp4`, `.gif`, `.exe`, `.mp3`), `content/` ni secrets
  (gestionado por `.gitignore`).
- Si se añade un patrón nuevo al `.gitignore`, ejecutar `git rm -r --cached <ruta>`.

### 4.3 Flujo de cambio típico

1. `git status` → revisar el estado.
2. Editar archivos relevantes.
3. `git diff` → revisar cambios antes de commitear.
4. `git add <archivos>` → stage selectivo (nunca secrets).
5. Commit en español, una línea.
6. Push manual del usuario.

## 5. Flujo de trabajo diario

### 5.1 Inicio de sesión

1. Leer `PROJECT_STATE.md`, `PROJECT_STATE.md`, `TODO.md` y `PROJECT_HISTORY.md`.
2. Revisar `README.md` de `docs/documentation/` para contexto del índice.
3. Ejecutar `git status` para conocer el estado del working tree.
4. Si hay tareas pendientes, empezar por las de prioridad alta (ver `TODO.md`).

### 5.2 Durante la sesión

- Comunicación en español, tono profesional y directo.
- No preguntar por defecto: ejecutar scripts y comandos seguros automáticamente; informar
  solo si hay un bloqueo.
- Verificar cambios con lint + build antes de darlos por cerrados.
- Si se toca documentación, seguir el pipeline de la §3.

### 5.3 Cierre de sesión

1. Actualizar `PROJECT_HISTORY.md` (changelog cronológico).
2. Actualizar `PROJECT_STATE.md` (estado detallado).
3. Actualizar `PROJECT_STATE.md` (resumen ejecutivo).
4. Dejar instrucciones del próximo paso en `MIGRATION_HANDOVER.md` (ciszu) cuando aplique.
5. Verificar que no quedan archivos temporales en `.opencode/temp/`.
6. Commitear el trabajo (si el usuario lo autoriza).

## 6. Zonas de trabajo

| Zona | Ruta | Qué se hace ahí | Riesgo |
|---|---|---|---|
| Código de la web | `website/src/` | Páginas, componentes, config | Alto — mantener lint/build |
| Assets | `content/` | Logos y media de marca | Bajo — no editar directo |
| Documentación fuente | `docs/txt/` | Fuente de verdad de docs | Medio — regenerar formatos |
| Formatos generados | `docs/md/`, `docx/`, `pdf/` | Derivados | Bajo — no editar a mano |
| Config OBS | `docs/obs/` | Escenas de streaming | Bajo — manual |
| Docs para agentes | `docs/documentation/` | Este sistema | Medio — seguir estándar |
| Público de la web | `website/public/` | docs/pwa/sw | Bajo — regenerado |

## 7. Protocolo de inicio/cierre con límite de contexto

- Al acercarse a ~110-120k tokens de contexto, avisar por push (`pnpm notify`) y proponer
  cambiar de sesión.
- Antes de cambiar: commitear, actualizar estado (PROJECT_STATE/PROJECT_HISTORY) y
  dejar resumen del próximo paso.
- La nueva sesión empieza con "continúa" + el resumen guardado.
- No escribir código nuevo tras el umbral salvo trivial: priorizar guardar estado.

## 8. Troubleshooting

| Síntoma | Causa probable | Solución |
|---|---|---|
| `pnpm --filter ... dev` no arranca | Node <20 o pnpm desactualizado | Usar Node >=20 y pnpm 10.8.1 (`pnpm install -g pnpm@10.8.1`) |
| Push falla por DNS | github.com no resuelve | Hacer push manual o reintentar más tarde |
| Lint falla | Errores de ESLint | Correr `pnpm --filter ciszukoantony-website lint` y corregir |
| Build falla | TypeScript o dependencias | Corregir tipos; verificar que los paquetes `workspace:*` están instalados |
| Assets no cargan | `@ciszunetwork/cdn` o Supabase | Verificar que el asset existe en Storage y la ruta del resolver |
| Faltan formatos de docs | No se corrió el pipeline | Ejecutar `txt2md` / `md2office` / `txt2pdf` |
| Cambios de `docs/md/` se pierden | Edición manual de derivados | Editar `docs/txt/` y regenerar |
| Build vercel falla en deploy | Rama o dependencias | Verificar `main` y `pnpm install --frozen-lockfile` |

## 9. Buenas prácticas operativas

- **Verificar con fuentes externas**: output de build, deploy de Vercel o resultados de
  herramientas; no confiar solo en el estado local.
- **Temporales**: usar `E:\Ciszu Network\.opencode\temp/` (gitignored); borrarlos al
  terminar o limpiar los antiguos (>1 semana). Nunca usar el temp de Windows.
- **Disco**: comprobar espacio (`Get-PSDrive C,E`) antes de descargas grandes.
- **Una cosa a la vez**: no mezclar cambios de código con cambios de documentación en el
  mismo commit.

## 10. FAQ

**¿Cómo arranco solo el portfolio?** Con `pnpm --filter ciszukoantony-website dev`.

**¿Cuál es el comando de verificación completo?** `pnpm --filter ciszukoantony-website verify`
(equivale a lint + build).

**¿Puedo editar los PDF/Word directamente?** No: se regeneran desde `docs/txt/`.

**¿Qué hago si el push no funciona?** No reintentar de forma agresiva; avisar y dejar el
commit listo para que el usuario haga push manual.

**¿Cómo publico la documentación en la web?** Regenerando formatos y copiando a
`website/public/docs/` (ver §3.2).

**¿Dónde registro lo hecho en la sesión?** En `PROJECT_HISTORY.md` (historial) y `PROJECT_STATE.md`
(resumen).

## 11. Checklist de fin de sesión

- [ ] Cambios verificados con lint + build.
- [ ] Documentación fuente y derivados coherentes.
- [ ] `PROJECT_HISTORY.md`, `PROJECT_STATE.md` y `PROJECT_STATE.md` actualizados.
- [ ] Temporal limpio (`E:\Ciszu Network\.opencode\temp/`).
- [ ] Instrucciones del próximo paso dejadas para la siguiente sesión.
- [ ] Commit autorizado y listo para push manual.

## 12. Resumen ejecutivo

- Desarrollo: `pnpm --filter ciszukoantony-website dev|build|lint|verify`.
- Documentación: pipeline `txt → md → docx → pdf` con `txt2md`, `md2office`, `txt2pdf`;
  especiales (GUIDELINES/RULES/ACTA) manuales.
- Git: commits en español de una línea; sin push automático (falla DNS local).
- Inicio/cierre de sesión con lectura y actualización de los docs de estado.

_Última revisión: 13 ago 2026._ Relacionado: `ARCHITECTURE.md`, `STACK_SYSTEM.md`,
`BRAND_PLAN.md`, `PROJECT_STATE.md`, `PROJECT_STATE.md`, `PROJECT_HISTORY.md`, `TODO.md`,
`README.md`.



