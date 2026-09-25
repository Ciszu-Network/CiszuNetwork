# CHANGELOG_SYSTEM — Sistema de Changelog de los Proyectos (Ciszu Network)

Versión: 1.0.0
Actualización: 2026-09-16
Identificador: CHANGELOG_SYSTEM_V1.0.0_2026_09_16_ciszunetwork

> **Definición**: sistema que documenta el registro de cambios público (changelog) compartido por
> las webs del ecosistema: modelo de datos, lógica de filtrado/orden compartida, páginas de índice
> y de detalle, estado de despliegue, hoja de ruta, likes locales y verificación.

---

## 1. Propósito y alcance

El sistema de changelog publica la **evolución del producto** en cada web: qué cambió, cuándo,
con qué etiquetas, en qué fase va el despliegue y qué viene después. Además de informar al
visitante, actúa como **contrato de datos** entre proyectos: los tipos y las funciones de filtrado
son idénticos en todas las webs, así que el mismo contenido se comporta igual en cualquiera.

| Aspecto | Regla |
|---|---|
| **Fuente de datos** | Archivo estático por proyecto: `src/data/changelog.ts` (sin base de datos) |
| **Lógica** | Paquete compartido `@ciszunetwork/utils/changelog` (funciones puras) |
| **Preferencias de UI** | Hook compartido `useChangelogLikes` de `@ciszu/ui` (localStorage) |
| **Rutas** | `/changelog` (índice) y `/changelog/<id>` (detalle por entrada) |
| **Idioma de contenido** | Español; nombres de archivo y `code` en formato corto en inglés |
| **Render** | Client Components (`'use client'`) con `framer-motion` |

Referencia histórica: la primera implementación del sistema (con página de detalle incluida) nació
en **MuzicMania** y se usó como modelo visual. El resto de webs lo adoptan con su propia paleta:
ciszu y ciszukoantony usan tokens `brand-*`; ciszubot usa tokens `neon-*` sobre su tema claro/oscuro.
MuzicMania conserva su archivo de datos original (no se migró a los tipos compartidos).

## 2. Arquitectura por capas

| Capa | Ubicación | Responsabilidad |
|---|---|---|
| Datos | `projects/<web>/website/src/data/changelog.ts` | Entradas, estado de despliegue, glosario |
| Lógica | `packages/utils/src/changelog.ts` | Tipos, filtros, orden, paginación, roadmap |
| UI de datos | `packages/ui/src/useChangelogLikes.ts` | Voto del usuario persistido en el navegador |
| Página índice | `projects/<web>/website/src/app/changelog/page.tsx` | Hero, estado, filtros, lista, roadmap |
| Página detalle | `projects/<web>/website/src/app/changelog/[id]/page.tsx` | Bitácora completa e info enlazada |
| SEO | `projects/<web>/website/src/app/sitemap.ts` | Una URL por entrada del registro |

Flujo de lectura:

1. La página importa `CHANGELOG_DATA`, `CHANGELOG_STATUS` y `CHANGELOG_GLOSSARY` de su proyecto.
2. Pasa los datos por las funciones puras del paquete compartido (buscar, filtrar, ordenar, paginar).
3. Renderiza el estado de despliegue y la lista; cada tarjeta enlaza a `/changelog/<id>`.
4. La página de detalle vuelve a resolver la entrada por `id` y calcula sus relacionadas.

## 3. Modelo de datos

Tipos canónicos definidos en `@ciszunetwork/utils/changelog` y re-exportados por el archivo de datos
de cada web (para que el código de página nunca dependa de dos orígenes distintos).

### 3.1 Entrada del registro

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | `string` | Identificador de ruta (slug). Único por proyecto |
| `version` | `string` | Etiqueta visible de la versión (`PATCH V2.4.0`) |
| `code` | `string` | Código corto interno (`P-240-CD`) |
| `title` | `string` | Titular del cambio |
| `description` | `string` | Resumen largo usado también en la cita del detalle |
| `date` | `string` | Fecha ISO (`AAAA-MM-DD`); base del orden por fecha |
| `types` | `ChangelogType[]` | Etiquetas del cambio (ver §4) |
| `author` | `string` | Responsable de la entrada |
| `likes` | `number` | Contador base (el voto local se suma en cliente) |
| `details` | `ChangelogDetail[]` | Bitácora técnica: `{ text, type }` |

### 3.2 Estado y roadmap

| Tipo | Campos principales | Uso |
|---|---|---|
| `ChangelogStatus` | `headline`, `progress`, `version`, `deploy`, `developer`, `nodes`, `phases` | Estado global del proyecto |
| `ChangelogPhase` | `id`, `name`, `status` (`done`/`current`/`planned`), `progress`, `tasks[]` | Hoja de ruta |
| `ChangelogNode` | `label`, `desc`, `status` (`done`/`next`/`locked`) | Diagrama de próximos nodos |

Constantes exportadas por cada proyecto:

- `CHANGELOG_DATA: ChangelogItem[]` — entradas del registro.
- `CHANGELOG_STATUS: ChangelogStatus` — barra de progreso, tarjetas de estado, nodos y fases.
- `CHANGELOG_GLOSSARY: { type, desc }[]` — descripción legible de las etiquetas.

Regla de contenido: **no inventar hechos**. Las cifras de `progress`, la `version` y las tareas de
cada fase deben corresponder al estado real del proyecto en el momento de la edición.

## 4. Etiquetas (`ChangelogType`) y glosario

El tipo `ChangelogType` admite 22 valores: `hotfix`, `add`, `ui`, `bugfix`, `perf`, `ux`, `sec`,
`refactor`, `build`, `test`, `docs`, `chore`, `feat`, `style`, `rework`, `sync`, `node`, `delete`,
`ci`, `revert`, `fix`, `bump`.

Cada etiqueta tiene un estilo declarado en `src/config/changelogIcons.tsx` (`TAG_CONFIG`):
icono SVG, color de texto y gradiente. Ese archivo es **idéntico en las cuatro webs**.

| Elemento | Regla |
|---|---|
| Iconos | Solo SVG inline del set `I`; nunca emojis |
| Colores | Tokens del tema (`text-neon-*`, `text-brand-*`) |
| Etiqueta visible | `TAG_CONFIG[type].label`; si falta, se muestra el valor crudo |
| Etiquetas desconocidas | El componente devuelve `null` y no rompe el render |
| Glosario | Solo se listan las 9 etiquetas de referencia declaradas en `CHANGELOG_GLOSSARY` |

## 5. Lógica compartida (`@ciszunetwork/utils/changelog`)

Módulo **puro** (sin React, sin red, sin `document`), por lo que es testeable y reutilizable tanto
en componentes cliente como en scripts.

| Función | Firma resumida | Semántica |
|---|---|---|
| `normalizeText` | `(value: string) => string` | Minúsculas, sin acentos, sin espacios sobrantes |
| `changelogMatches` | `(item, query) => boolean` | Búsqueda en campos indexables + filtro OR por etiquetas |
| `sortChangelog` | `(items, sortBy, sortDir) => ChangelogItem[]` | Orden por `date` o `likes`; no muta el array |
| `filterChangelog` | `(items, query) => ChangelogItem[]` | Filtra y ordena en un paso |
| `getTagStats` | `(items) => Record<string, number>` | Frecuencia por etiqueta (chips de distribución) |
| `getMostRecentId` | `(items) => string \| null` | Id más reciente; `null` si la lista está vacía |
| `getChangelogById` | `(items, id) => ChangelogItem \| undefined` | Resolución de la ruta de detalle |
| `paginate` | `(items, page, size?) => ChangelogPage<T>` | Paginación segura con página recortada |
| `getRelatedChangelog` | `(target, items, limit?) => ChangelogItem[]` | Relacionadas por etiquetas compartidas |
| `clampProgress` | `(value) => number` | Recorta a 0–100 (evita barras desbordadas) |
| `getCurrentPhase` | `(phases) => ChangelogPhase \| undefined` | Fase `current`; si no, la primera `planned` |
| `getOverallProgress` | `(phases, fallback?) => number` | Media de fases; usa `fallback` si no hay fases |
| `getPhaseProgress` | `(phase) => number` | Deriva el progreso de las tareas de la fase |

Detalles que evitan bugs conocidos:

- **Buscador tolerante**: `normalizeText` quita acentos, así «busqueda» encuentra «búsqueda».
- **Campos indexables**: `id`, `version`, `code`, `title`, `description`, `author`, etiquetas y el
  texto de toda la bitácora. Permite buscar por código (`P-240-CD`) o por versión (`v2.0.1`).
- **Etiquetas con semántica OR**: una entrada se muestra si comparte **al menos una** etiqueta activa.
- **Orden determinista**: ante empate de fecha o de likes se desempata por `id` ascendente, para que
  la lista no «baile» entre renders.
- **Paginación blindada**: `paginate` recorta la página solicitada a `[1, totalPages]` y devuelve
  `totalPages: 1` con listas vacías, además de `start`/`end` para el contador «Mostrando X–Y de Z».
- **Listas vacías**: `getMostRecentId` devuelve `null` en lugar de lanzar excepción.

`CHANGELOG_PAGE_SIZE` (5) es la constante de tamaño de página usada por las tres webs.

## 6. Likes (`useChangelogLikes` de `@ciszu/ui`)

El changelog es contenido estático, así que el «me gusta» se resuelve en el navegador:

| Aspecto | Comportamiento |
|---|---|
| Clave de almacenamiento | `ciszu:changelog-likes:v1` (constante `CHANGELOG_LIKES_KEY`) |
| Formato | `{ "<id>": true }` — solo se guardan los votos emitidos |
| Contador mostrado | `likes.getLikes(id, item.likes)` = base + voto local |
| Alternar | `toggleLike(id)` marca o desmarca el voto y persiste |
| Hidratación | El primer render (servidor y cliente) usa el valor base; el voto se aplica al hidratar |
| Auth | Sin sesión se abre `AuthWarningModal`; con sesión se registra el voto |
| Entorno hostil | `localStorage` bloqueado o corrupto no rompe: el estado en memoria sigue activo |

## 7. Rutas y secciones de página

### 7.1 Índice `/changelog`

Orden exacto de secciones (de arriba a abajo):

| # | Sección | Contenido |
|---|---|---|
| 1 | Hero | Icono `I.history`, título «Changelog» y subtítulo bilingüe |
| 2 | Estado actual | Barra de progreso animada (`role="progressbar"`) y porcentaje |
| 3 | Estado del proyecto | Tarjetas de versión, servidores y desarrollador |
| 4 | Próximos nodos | Diagrama con nodos `done` / `next` (`ACTUAL`) / `locked` |
| 5 | Búsqueda | Campo con icono SVG; reinicia la paginación al escribir |
| 6 | Filtros y orden | Gestor de etiquetas, chips de distribución clicables, orden y contador |
| 7 | Registro | Tarjetas de entrada con bitácora resumida, likes y botón «DETALLES» |
| 8 | Paginación | Anterior, números de página y siguiente |
| 9 | Hoja de ruta | Fases con progreso y checklist de tareas |
| 10 | Glosario | Diccionario de etiquetas |
| 11 | Protocolos | CTA interrogativo que enlaza a `/documentation` |
| 12 | Cierre | `AuthWarningModal` y `QuickDocks` |

El CTA de protocolos se coloca **después de la hoja de ruta y del glosario** y **antes de
`QuickDocks`**, de modo que el visitante revise la documentación antes de usar los docks rápidos.

Filtros realmente funcionales:

- El botón «GESTIONAR FILTROS» despliega el selector completo de etiquetas y muestra el número de
  filtros activos.
- Los chips de distribución **son botones**: cada uno activa o desactiva su etiqueta.
- «LIMPIAR TODO» aparece solo cuando hay búsqueda o filtros activos y reinicia ambos más la página.
- El contador «Mostrando X–Y de Z entradas» refleja el resultado real del filtrado.
- Los controles de orden tienen `aria-pressed` y la dirección se indica con `aria-label`.

### 7.2 Detalle `/changelog/<id>`

| Bloque | Contenido |
|---|---|
| Volver | Enlace a `/changelog` con icono `I.back` |
| Hero | Icono y gradiente de la etiqueta primaria, versión, fecha, código, autor, likes y etiquetas |
| Cita | `description` como cita destacada |
| Bitácora técnica | Todas las entradas de `details` con su icono, color y etiqueta |
| Info enlazada | Hasta 3 entradas relacionadas por etiquetas compartidas, cada una enlazada |
| Protocolos | CTA a `/documentation` |
| Cierre | `AuthWarningModal` y `QuickDocks` |

La banda «NUEVO» se muestra en la entrada más reciente (`getMostRecentId`) tanto en el índice como en
el detalle. Si el `id` no existe, se renderiza el estado «VERSIÓN NO ENCONTRADA» con enlace de vuelta
(la ruta responde 200 con la página informativa, no un error de servidor).

## 8. Estado de despliegue, hoja de ruta y glosario

| Elemento | Fuente | Notas |
|---|---|---|
| Barra «Estado actual» | `CHANGELOG_STATUS.progress` | Refleja el avance del parche en curso |
| Progreso global | `getOverallProgress(phases, progress)` | Media de fases; distinto del anterior |
| Fase activa | `getCurrentPhase(phases)` | Se muestra al pie de la hoja de ruta |
| Progreso de fase | `getPhaseProgress(phase)` | Derivado de `tasks[].done` cuando existen |
| Glosario | `CHANGELOG_GLOSSARY` | Etiqueta + descripción de una línea |

## 9. Cobertura por proyecto

| Proyecto | Índice | Detalle | Paleta | Notas |
|---|---|---|---|---|
| ciszu | Sí | Sí | `brand-light` / `brand-accent` | Referencia de esta migración |
| ciszukoantony | Sí | Sí | `brand-light` / `brand-300` | No define `brand-accent` en su tema |
| ciszubot | Sí | Sí | `neon-blue` / `neon-cyan` / `neon-pink` | Tema claro/oscuro; sin token `neon-green` |
| muzicmania | Sí | Sí | `neon-*` | Implementación original; mantiene `data/changelog.ts` propio |

Todas las webs comparten el mismo `src/config/changelogIcons.tsx`, el mismo hook de likes y la misma
lógica de filtrado. Lo único específico por proyecto es la paleta de clases y el contenido de
`src/data/changelog.ts`.

## 10. SEO y sitemap

Cada `sitemap.ts` publica la ruta del índice y **una URL por entrada**:

```ts
import { CHANGELOG_DATA } from '@/data/changelog';

const ROUTES = [
  // ...
  'changelog',
  ...CHANGELOG_DATA.map((item) => `changelog/${item.id}`),
];
```

Regla: al añadir una entrada a `CHANGELOG_DATA`, su URL aparece en el sitemap automáticamente. No hay
que editar el sitemap a mano.

## 11. Tests y verificación

| Comprobación | Comando |
|---|---|
| Tests de la lógica compartida | `npx vitest run packages/utils/tests/changelog.test.ts` |
| Tipos de todo el monorepo | `pnpm typecheck` |
| Lint del directorio | `npx eslint src/app/changelog src/data/changelog.ts` |
| Build de la web | `npx next build` (dentro de `projects/<web>/website`) |
| Rutas generadas | Revisar `.next/app-path-routes-manifest.json` |
| Render real | `npx next start` y comprobar `/changelog`, `/changelog/<id>` y un id inexistente |

El archivo `packages/utils/tests/changelog.test.ts` cubre 23 casos: normalización de acentos, búsqueda
por versión/código/bitácora, filtro OR por etiquetas, orden en ambos sentidos, determinismo ante
empates, estadísticas de etiquetas, `getMostRecentId` con lista vacía, paginación fuera de rango y con
lista vacía, relacionadas y ayudantes del roadmap. El runner raíz de Vitest ya incluye
`packages/utils/tests/**/*.test.ts`, así que `pnpm test` los ejecuta sin configuración adicional.

## 12. Cómo ampliar el sistema

### 12.1 Añadir una entrada al registro

1. Añadir un objeto a `CHANGELOG_DATA` con `id` único, `version`, `code`, `title`, `description`,
   `date`, `author`, `types`, `likes` y `details`.
2. Usar etiquetas existentes de `ChangelogType` (si hace falta una nueva, añadirla al tipo, a
   `TAG_CONFIG` y al glosario de las cuatro webs).
3. Verificar: `pnpm typecheck` y el build del proyecto.
4. La página de detalle y el sitemap se generan solos a partir del `id`.

### 12.2 Cambiar el estado de despliegue

1. Editar `CHANGELOG_STATUS` (`progress`, `version`, `deploy`, `nodes`).
2. Actualizar la fase en curso en `CHANGELOG_STATUS.phases` (marcar tareas `done` y ajustar
   `progress`).
3. Mantener coherencia: `progress` de la fase `current` debe aproximarse al de la barra de estado.

### 12.3 Replicar a un proyecto nuevo

1. Copiar el par de páginas (`changelog/page.tsx` y `changelog/[id]/page.tsx`) y adaptar la paleta.
2. Crear `src/data/changelog.ts` importando los tipos desde `@ciszunetwork/utils/changelog`.
3. Verificar que existen `QuickDocks`, `AuthWarningModal`, `usePageTitle` y `useAppStore` en el
   proyecto; si falta alguno, sustituirlo por el equivalente local.
4. Añadir las rutas al `sitemap.ts`.

## 13. Troubleshooting

| Síntoma | Causa probable | Solución |
|---|---|---|
| La lista no filtra al escribir | Se pasó `search` sin reiniciar la página | Reiniciar `currentPage` a 1 en el `onChange` |
| El resultado está vacío tras filtrar | Filtros y búsqueda combinados sin coincidencia | Mostrar el estado vacío y ofrecer «REINICIAR BÚSQUEDA» |
| Las etiquetas no se ven | Tipo no declarado en `TAG_CONFIG` | Añadir la etiqueta al config o revisar el `type` del dato |
| La página de detalle muestra «no encontrada» | `id` no coincide con ninguna entrada | Comprobar el slug en `CHANGELOG_DATA` |
| El contador de likes se reinicia | Nunca se votó en ese navegador | Es el comportamiento esperado (persistencia local) |
| Error de hidratación en el contador | Se usó el voto local en el primer render | Usar siempre el valor base hasta `ready` |
| Fase sin progreso | `tasks` vacío y `progress` en 0 | Declarar tareas o fijar `progress` |

## 14. Relación con otros sistemas

- `PACKAGES_SYSTEM.md`: define el paquete `@ciszunetwork/utils` donde vive la lógica compartida.
- `GLOBAL_COMPONENTS_SYSTEM.md`: `QuickDocks` y `AuthWarningModal`, usados en el cierre de página.
- `STATUS_SYSTEM.md`: el estado de despliegue público de cada web.
- `PROJECTS_SYSTEM.md`: catálogo de proyectos y su documentación asociada.
- `TESTING_SYSTEM.md`: convenciones de tests y runner del monorepo.
- `DOCUMENTATION_SYSTEM.md`: estándar de cabecera, nomenclatura y límites de líneas.

_Última revisión: 2026-09-16._ Relacionado: `PACKAGES_SYSTEM.md`, `GLOBAL_COMPONENTS_SYSTEM.md`, `TESTING_SYSTEM.md`, `DOCUMENTATION_SYSTEM.md`.
