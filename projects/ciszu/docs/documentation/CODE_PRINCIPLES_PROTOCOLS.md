# 🧠 CODE_PRINCIPLES_PROTOCOLS — Principios de Programación y Protocolos de Ingeniería (Ciszu Network)

Versión: 2.0.0
Actualización: 2026-08-13
Identificador: CODE_PRINCIPLES_PROTOCOLS_V2.0.0_2026_08_13_ciszunetwork

> Documentación para agentes de IA. Define las reglas de oro de diseño y calidad de software
> aplicables a todo el código del monorepo, así como los **protocolos de trabajo del equipo
> de ingeniería** (agente + humano). Criterio: profesional, serio, bajo marcos de ingeniería
> estables (Pragmatic Programmer, Robert C. Martin / SOLID). Estatus: **protocolo vinculante**.

---

## 0. Protocolo de trabajo del ingeniero (agente)

Reglas operativas que todo agente debe cumplir al tocar el monorepo:

1. **Leer primero**: `STATUS_SYSTEM.md`, `PROJECTS_SYSTEM.md`, `AGENTS.md` y la doc del sistema
   afectado antes de escribir código.
2. **Ejecutar scripts sin preguntar** si son seguros (pnpm install, pnpm dev, lint, test, build).
3. **No commitear ni pushear sin solicitud explícita** del usuario.
4. **Verificar con fuentes externas** (build output, curl a producción, dbvr) — no confiar solo
   en el estado local.
5. **Proponer librerías nuevas y esperar aprobación**; nunca instalar sin validar.
6. **Mensajes de commit en español**, descriptivos, una línea, sin emojis.
7. Tras cambios en policies/funciones de Supabase: verificar Security + Performance Advisors.
8. **Cerrar sesión**: actualizar `STATUS_SYSTEM.md`, `PROJECTS_SYSTEM.md`, `PROJECT_HISTORY.md`
   (historial dentro de `PROJECTS_SYSTEM.md`) y dejar instrucciones en `WORKFLOW_SYSTEM.md`.

---

## 1. DRY — Don't Repeat Yourself (No te repitas)

**Cada pieza de conocimiento, lógica o funcionalidad debe tener una representación única, inequívoca y autoritaria** dentro del sistema.

- Si escribes el mismo bloque de código (o muy similar) **dos o más veces**, estás rompiendo DRY.
- **Cómo se aplica en este monorepo**:
  - Lógica compartida de assets → `packages/cdn` (`assetResolver.resolve`, `resolveIcon`).
  - Componentes UI compartidos → `packages/ui` (`Icon.tsx` con registro generado).
  - Tipos/config compartidos → `packages/config`, `packages/utils`.
  - El sistema de iconos: el registro se genera una sola vez desde `shared/icons/svg/` (nunca duplicar SVGs en las apps).
- **Equilibrio**: no caer en sobreingeniería — si la lógica es distinta aunque parecida, no forzar la unificación. La regla es no repetirse cuando la lógica es **exactamente la misma**.

## 2. KISS — Keep It Simple (Mantenlo simple)

La mayoría de los sistemas funcionan mejor si se mantienen simples.

- Si puedes resolver un problema con una función sencilla, no inventes una arquitectura de diez capas.
- El código simple es más fácil de leer, probar y corregir.

## 3. YAGNI — You Aren't Gonna Need It (No lo vas a necesitar)

No escribas código ni añadas funcionalidades **hasta que realmente las necesites en el presente**.

- Prohibido "dejar funciones preparadas por si acaso": es código muerto que acumula deuda técnica.
- Si no hay un requerimiento actual, no se implementa.

## 4. SOLID

| Principio | Significado |
|---|---|
| **S**ingle Responsibility | Una clase/módulo debe tener una, y solo una, razón para cambiar (hacer una sola cosa y bien). |
| **O**pen/Closed | Abierto a extensión, cerrado a modificación: añadir funciones sin alterar código que ya funciona. |
| **L**iskov Substitution | Las clases hijas deben poder sustituir a las padres sin romper el programa. |
| **I**nterface Segregation | Muchas interfaces pequeñas y específicas, no una gigantesca que obligue a implementar lo que no se usa. |
| **D**ependency Inversion | Los módulos de alto nivel no dependen de los de bajo nivel; ambos dependen de abstracciones. |

**En la práctica (este monorepo)**: los servicios Supabase se separan por dominio (`auth.ts`, `stats.ts`...), los componentes UI tienen responsabilidad única, y las apps consumen los paquetes compartidos por sus interfaces (`packages/cdn`), no por su implementación.

## 5. Separation of Concerns (Separación de intereses)

Dividir el programa en secciones independientes; cada sección se ocupa de un aspecto:

- **Frontend** (Next.js) no ejecuta lógica de negocio pesada ni se conecta directamente a la DB — usa RPC de Supabase.
- **Backend** (Supabase/Postgres) gestiona datos y seguridad (RLS, functions SECURITY INVOKER).
- **Arquitectura de referencia**: MVC / capas (UI → servicios → datos).

## 6. Principle of Least Astonishment (Menor sorpresa)

Un componente debe comportarse como la mayoría de los desarrolladores esperan:

- `calcularImpuesto()` debe devolver un número; nunca borrar registros ni enviar correos.
- Nombres descriptivos: si una función se llama `getUser`, que devuelva el usuario.
- Nada de efectos secundarios ocultos.

## 7. Calidad y observabilidad

- **TypeScript estricto** en todos los proyectos (tipos = contrato).
- **Documentación viva**: este documento + `SECURITY_PROTOCOLS.md` + `DEVSECOPS_SYSTEM.md` son
  la fuente de verdad del estilo.
- **Código limpio > código ingenioso**: legibilidad para el próximo programador (humano o IA).
- **Cero regresiones**: todo cambio se verifica con lint + build (`pnpm lint`, `pnpm build`).

## 8. Checklist del agente antes de escribir código

1. ¿Existe ya esta funcionalidad en `packages/`? → **DRY**: reutilizar.
2. ¿Es más simple de lo que lo estoy haciendo? → **KISS**.
3. ¿Alguien pidió esto ahora? → **YAGNI**.
4. ¿El módulo hace UNA sola cosa? → **SRP**.
5. ¿El nombre refleja exactamente lo que hace? → **Least Astonishment**.
6. ¿Toca datos sensibles? → ver `SECURITY_PROTOCOLS.md` y `DEVSECOPS_SYSTEM.md`.

## 9. Protocolos de calidad del código

### 9.1 Naming conventions

| Entidad | Convención | Ejemplo |
|---|---|---|
| Variables/funciones TS | `camelCase` | `getUserById` |
| Componentes React | `PascalCase` | `CloudflareGuard` |
| Archivos de componente | `PascalCase.tsx` | `PostHogAnalytics.tsx` |
| Rutas API Next.js | `kebab-case` | `verify-turnstile` |
| Tablas Supabase | `snake_case`, prefijo por dominio | `muzicmania.scores`, `ciszubot.bot_status` |
| Migraciones BD | `apply-migration-XX.js` | `apply-migration-17.js` |
| Commits | español, una línea | `feat: añade guard turnstile` |

### 9.2 Estructura de un cambio (feature o bugfix)

1. **Explorar**: entender el sistema afectado (leer docs `_SYSTEM`).
2. **Reutilizar**: buscar en `packages/` antes de crear.
3. **Implementar**: mínimo viable (YAGNI), simple (KISS), sin repetir (DRY).
4. **Testear**: añadir/actualizar tests Vitest donde aplique.
5. **Verificar**: `pnpm lint`, `pnpm test`, `pnpm build`.
6. **Documentar**: actualizar el doc `_SYSTEM` correspondiente + refs cruzadas.

### 9.3 Código defensivo

- Tipos explícitos, nunca `any` (salvo zonas de integración justificadas).
- Manejo de errores siempre (try/catch en server, error boundaries en cliente).
- No exponer secretos: `process.env.X` solo en server-only (regla de `SECURITY_PROTOCOLS.md`).
- Sin `console.log` en producción (usar logger/IAST/observabilidad).

### 9.4 Rendimiento (reglas base)

- Assets vía resolver/CDN (`@ciszunetwork/cdn`), nunca en `public/` duplicado.
- Imágenes con `SmartImage` + variantes avif/webp (ver `MEDIA_FORMATS_SYSTEM.md`).
- RPC de Supabase antes que lecturas pesadas; caché multi-tienda (ver `CACHING_SYSTEM.md`).
- Evitar re-renders: memo/useMemo donde aporte; no micro-optimizar sin medir.

## 10. Protocolos de revisión (code review)

1. Cambios de `packages/` → afectan a las 4 apps: revisar builds de las 4.
2. Cambios de SQL/policies → verificar Advisors (Security + Performance) tras aplicar.
3. Nuevas dependencias → aprobación humana obligatoria.
4. Secreto nuevo en código → rechazo automático (secretlint/gitleaks fallan el push).
5. Antes de anunciar "listo": build local OK + verify externo.

## 11. Protocolo de documentación

- Los docs de `documentation/` son la **fuente comprimida**; el código es la fuente real.
- Nomenclatura: `_SYSTEM` (sistemas), `_PLAN` (roadmaps/guías), `_PROTOCOLS` (normas).
- Todo doc nuevo: cabecera con Versión, Actualización e Identificador.
- Al cerrar tarea: actualizar el doc del sistema tocado, no duplicar información.

## 12. Antipatrones a evitar (checklist negativo)

- **Dios-objeto / clase supergigante**: una clase o módulo que mezcla responsabilidades no
  relacionadas (rompe SRP). Separar por dominio.
- **Inyección de dependencias por magia**: dependencias que se resuelven por convención de
  nombres o globals en vez de inyectarse explícitamente — la lógica se vuelve indescifrable.
- **Copiar-pegar con variaciones (boilerplate)**: si dos bloques difieren solo en constantes,
  extraer la función (DRY). Copiar código duplicado es deuda con interés compuesto.
- **Optimización prematura**: micro-optimizar hot paths que nunca se miden. Perfilizar antes.
- **Feature flags eternos**: flags de feature que nunca se retiran acumulan ramas muertas.
  Todo flag debe tener dueño y fecha de expiración.
- **Commit-granulares**: un commit que toca 15 archivos de 4 sistemas distintos hace imposible
  el revert y el blame. Commits atómicos por tema.
- **Comentarios que repiten el código**: `// incrementa i` no aporta. El comentario debe
  explicar el *porqué*, no el *qué*.
- **Dependencias "por si acaso"**: cada dependencia nueva es superficie de ataque y peso de
  build. Instalar solo cuando el beneficio supera el costo.

## 13. Atributos de código de calidad

| Atributo | Pregunta guía |
|---|---|
| Legible | ¿Se entiende sin comentarios ni astucia? |
| Simple | ¿Es la solución más simple que funciona (KISS)? |
| Testable | ¿Se puede probar sin efectos secundarios globales? |
| Reutilizable | ¿El componente vive en `packages/` si lo usan 2+ apps? |
| Seguro por defecto | ¿Fallan si no se valida input (fail-closed)? |
| Mantenible | ¿Un nuevo miembro lo entiende en <10 min? |
| Eficiente | ¿No hace trabajo duplicado (memo, índices, cachés)? |

## 14. Cómo el agente aplica estos principios en Ciszu Network

- **Antes de escribir**: buscar si ya existe un módulo/componente que haga lo mismo
  (`pnpm lint`, `rg` en `packages/`). Reutilizar > reescribir.
- **Node + Next.js**: server components para datos, client components solo con interactividad.
  Hooks propios con tipos. `@ciszu/ui` para UI compartida.
- **SQL**: siempre parametrizado (RPC/ORM); RLS en cada tabla; policies por comando.
- **Discord.js**: separar commands de listeners; handlers por carpeta; tipado estricto.
- **Tauri/Web**: lógica de juego en módulos puros (testables), UI delgada.
- **Después de escribir**: lint + tests + build + verify externo (curl/dbvr). Documentar.

## 15. Relación con los estándares del repo

- `AGENTS.md` — reglas operativas del agente (referencia rápida).
- `SECURITY_PROTOCOLS.md` — checklist no negociable de seguridad por implementación.
- `DEVSECOPS_SYSTEM.md` — SAST/DAST, shift-left.
- `TESTING_SYSTEM.md` — cómo se prueba cada capa.
- `WORKFLOW_SYSTEM.md` — protocolo de tarea, inicio y cierre de sesión.

_Última revisión: 13 ago 2026._ Relacionado: `SECURITY_PROTOCOLS.md`, `DEVSECOPS_SYSTEM.md`,
`WORKFLOW_SYSTEM.md`, `TESTING_SYSTEM.md`, `DB_SYSTEM.md`.
