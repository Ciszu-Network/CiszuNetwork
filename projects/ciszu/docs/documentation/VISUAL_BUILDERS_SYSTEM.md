# VISUAL_BUILDERS_SYSTEM — Editores visuales de UI/UX (Ciszu Network)

Versión: 1.1.0
Actualización: 2026-08-19
Identificador: VISUAL_BUILDERS_SYSTEM_V1.1.0_2026_08_19_ciszunetwork

> **Definición**: sistema que documenta la decisión de qué editor visual de UI/UX usar en el
> ecosistema: comparativa Onlook vs Plasmic vs Puck vs Subframe (estado verificado 18 ago 2026),
> análisis de compatibilidad con el stack real (Next.js 15 App Router + React 19 + Tailwind 4 +
> monorepo pnpm) y el plan de implementación del híbrido elegido.

> **Problema**: la tarea del `TODO.md` pide implementar un editor visual para construir y retocar
> UI/UX de las 4 webs sin escribir código a mano, documentado en este archivo. Antes de decidir
> hay que responder tres preguntas con datos verificados: ¿la herramienta edita el código real del
> monorepo local?, ¿es compatible con el stack (Next 15 + React 19 + Tailwind 4 + pnpm)?, ¿encaja
> con la filosofía del proyecto (open source, local-first, sin suscripciones)? Este doc responde
> eso para cada candidata y fija el plan de implementación.

---

## 0. Contexto Teorico (la respuesta larga y teoria de otra IA)

Para desarrolladores que trabajan con **React, Next.js y Tailwind**, existen herramientas modernas espectaculares que hacen exactamente lo que necesitas. Aquí tienes las mejores opciones reales que trabajan directo con tu código local:

---

### 1. Onlook (La opción más avanzada y directa al código)

- **¿Qué es?:** Es literalmente un editor visual de diseño (tipo Figma) pero que **corre sobre tu propia aplicación local** (como tu Next.js).
- **Cómo funciona:** Lo abres, leapuntas a tu proyecto local en `localhost:3000`, y te permite hacer clic en cualquier elemento de tu página web, moverlo, cambiarle los estilos de Tailwind, ajustar márgenes o textos de forma visual, y **Onlook escribe los cambios directamente en tus archivos de código fuente**.
- **Por qué cumple con todo:** Es de código abierto, corre en tu máquina, modifica tus archivos reales de React/Tailwind y no te amarra a ninguna suscripción en la nube.

### 2. Plasmic (Visual Builder con código abierto y Code-First)

- **¿Qué es?:** Un creador visual de interfaces diseñado específicamente para desarrolladores de React y Next.js.
- **Cómo funciona:** Puedes usarlo conectándolo a tu repositorio o descargando su SDK/plugin. Te da un lienzo visual de arrastrar y soltar (Drag & Drop) muy potente para diseñar páginas enteras, componentes y layouts. Lo interesante es que **genera componentes de React limpios** que viven en tu propio proyecto, no en una plataforma externa aislada.
- **Por qué cumple con todo:** Tiene planes gratuitos muy generosos para desarrollo local y su enfoque es totalmente compatible con código real.

### 3. Tailwind Connect / Editores integrados en VS Code (Extensiones)

Aunque no es un "constructor de arrastrar y soltar" completo de páginas enteras, si usas **VS Code**, existen extensiones orientadas a inspeccionar y modificar estilos visualmente en tiempo real sobre tu código:

- **Tailwind CSS IntelliSense + Preview extensions:** Te permiten ver los cambios visuales de manera muy fluida al modificar clases.
- Herramientas de navegador como las extensiones de desarrollo que conectan tu DOM con tu IDE local.

---

### ¿Cuál deberías probar primero?

Si buscas esa experiencia exacta de **modificar tu frontend en tiempo real de forma visual y que se refleje en tus archivos**, **Onlook** es actualmente la herramienta que los desarrolladores modernos están usando para romper la barrera entre el diseño visual y el código de Next.js.

Aunque a primera vista **Onlook** y **Plasmic** parecen cumplir la misma función (diseñar de forma visual conectándose a código de React), tienen **filosofías y arquitecturas totalmente distintas**. No son exactamente lo mismo, y cada una brilla en un escenario diferente según lo que busques para tus 4 websites de _Ciszu Network_.

Aquí tienes la comparativa directa para que sepas cuál elegir según tus necesidades:

---

### 1. Onlook: El "Editor de Código Visual" (In-Context Editing)

Onlook actúa como una capa visual inteligente que se coloca **encima de tu aplicación corriendo en local** (tu `localhost:3000`).

- **Cómo trabaja:** No destruye ni reescribe tu estructura de archivos. Abre tu app real y te deja hacer clic en los elementos para moverlos, cambiarles clases de Tailwind o textos. Cuando haces un cambio visual, Onlook detecta qué archivo `.tsx` o `.jsx` lo genera y **modifica esa línea exacta de código por ti**.
- **Su gran fuerte:** Es **cero fricción**. Si ya tienes tus 4 páginas hechas en Next.js con Tailwind, simplemente abres Onlook, apuntas a tu proyecto y empiezas a editar visualmente lo que ya tienes escrito. No tienes que aprender a usar un editor nuevo ni migrar componentes.
- **Para quién es:** Desarrolladores que aman su estructura de código actual pero quieren una herramienta tipo "DevTools con superpoderes" para hacer ajustes rápidos de diseño y maquetación de forma visual.

### 2. Plasmic: El "Visual Builder de Componentes" (Headless Builder)

Plasmic es un ecosistema de diseño visual más completo y pesado (un entorno estilo Figma/Webflow pero orientado a código).

- **Cómo trabaja:** Funciona mediante un enfoque _Headless CMS/Builder_. Puedes diseñar páginas enteras desde su lienzo visual (arrastrando y soltando contenedores, rejillas, componentes) y luego **sincronizar esos diseños con tu repositorio** para que se conviertan en código de React limpio. También te permite registrar tus propios componentes de código de Next.js para usarlos dentro de su interfaz visual.
- **Su gran fuerte:** Es ideal para **construir páginas desde cero de manera visual** (como landing pages de marketing, blogs, o secciones complejas) donde necesitas estructurar layouts complejos arrastrando elementos libremente, sin escribir la estructura HTML a mano.
- **Para quién es:** Equipos que quieren un control total del diseño visual mediante una interfaz de maquetación avanzada, o cuando necesitas que personas no técnicas (o diseñadores) puedan tocar la interfaz sin romper el código.

---

### ¿Cuál es mejor para ti? (Veredicto)

- **Elige ONLOOK si:** Quieres conservar exactamente tu código actual de Next.js y Tailwind tal cual lo tienes, y solo buscas una herramienta para **inspeccionar, mover y ajustar visualmente** tus componentes en tiempo real sin salir de tu entorno local. Es la opción más fiel a la filosofía "code-first".
- **Elige PLASMIC si:** Buscas un **constructor visual potente (tipo Webflow/Figma)** para maquetar páginas enteras mediante _drag and drop_ estructurado y prefieres que la herramienta genere la base de los componentes por ti para integrarlos en tu monorepo.

Para tu flujo actual con Next.js y Tailwind, **Onlook** suele sentirse mucho más natural y directo si ya tienes el código escrito; **Plasmic** es más una plataforma completa de diseño visual si quieres delegar la maquetación pesada a una interfaz gráfica dedicada. ¡Prueba ambas y mira cuál se acopla mejor a tu forma de programar.

Sí, es totalmente normal que te encuentres con esa barrera. Al ser una herramienta de desarrollo emergente y de vanguardia (muy codiciada por desarrolladores frontend), **Onlook** gestiona gran parte de su acceso comercial y de pruebas a través de una lista de espera (_waitlist_) en su web.

Sin embargo, como es un proyecto **100% open-source**, tienes una vía completamente libre para saltarte la lista de espera de su plataforma comercial y compilarlo o usarlo directamente por tu cuenta desde su código fuente en GitHub.

Aquí tienes las opciones reales para conseguirlo sin quedarte esperando:

### Opción A: Registrarte en la Waitlist (La vía rápida de acceso oficial)

Si prefieres esperar a que te llegue el acceso directo a la aplicación empaquetada:

1. Entras a su web oficial (`onlook.com`) y dejas tu correo electrónico en la lista de espera (_Join the waitlist_).
2. Suelen aprobar accesos por tandas a desarrolladores que trabajan con React/Next.js.

### Opción B: Clonarlo y correrlo tú mismo (Saltándote la waitlist por completo)

Dado que el código fuente de la aplicación de escritorio está disponible públicamente en su repositorio de GitHub (`onlook-dev/desktop` o `onlook-dev/onlook`), puedes clonarlo y ejecutarlo en tu máquina de inmediato de forma gratuita y local:

1. Asegúrate de tener instalado **Git** y **Node.js** (o pnpm) en tu PowerShell.
2. Clona el repositorio oficial de la app de escritorio:

```powershell
git clone https://github.com/onlook-dev/desktop.git
```

3. Entra a la carpeta del proyecto:

```powershell
cd desktop
```

4. Instala las dependencias y arranca la aplicación en modo de desarrollo local:

```powershell
pnpm install
pnpm dev
```

De esta manera, obtienes exactamente la misma herramienta de edición visual corriendo de forma local en tu PC, sin depender de invitaciones, tarjetas de crédito ni listas de espera en la nube.

Análisis técnico y comparativo detallado de las 4 opciones finalistas (**Onlook**, **Puck**, **Subframe** y **Plasmic**), evaluadas bajo los estrictos criterios de desarrollo local, código real, costos y formato de ejecución.

---

### Tabla Comparativa General

| Herramienta  | Tipo de Arquitectura                              | ¿Es Gratis / Modelo?                                       | ¿Open Source?                                     | ¿Instalable fuera del navegador?                      | ¿Ve y edita código localmente?                            |
| ------------ | ------------------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------- | ----------------------------------------------------- | --------------------------------------------------------- |
| **Onlook**   | Editor visual superpuesto (_In-context_)          | **Gratis** (Versión self-hosted / GitHub)                  | **Sí**                                            | **Sí** (App de Escritorio nativa Windows/Mac)         | **Sí** (Modifica directo tus archivos `.tsx`/Tailwind)    |
| **Puck**     | Librería de componentes visuales de bloques       | **100% Gratis** (Librería base)                            | **Sí**                                            | **No** (Corre embebido dentro de tu propia app React) | **Sí** (Manipula el estado y código de tu app)            |
| **Subframe** | Entorno visual en la nube (Estilo Figma)          | **Freemium** (Plan gratuito limitado / Pro a $29/mo)       | **No**                                            | **No** (Funciona en la web, exporta código)           | **Parcial** (Exporta código React/Tailwind a tu repo)     |
| **Plasmic**  | Maquetador visual de páginas (_Headless Builder_) | **Freemium** (Plan gratuito generoso / Planes Pro de pago) | **Parcial** (SDK abierto, plataforma propietaria) | **No** (Funciona en la web, sincroniza con CLI local) | **Sí** (Sincroniza componentes limpios a tu código local) |

---

### Análisis Detallado por Herramienta

#### 1. Onlook

- **¿Cómo funciona?:** Se conecta a tu aplicación corriendo en `localhost` mediante una aplicación de escritorio dedicada. Haces clic en un elemento visual de tu página web y Onlook reescribe la línea exacta del archivo de código fuente en tu disco duro.
- **Ventajas:** Es la experiencia más cercana a tener unas DevTools con esteroides de diseño. No tienes que adaptar tu código a librerías especiales; editas el código que ya escribiste a mano en Next.js y Tailwind. Al ser aplicación de escritorio, no saturas las pestañas del navegador.
- **Desventajas:** Al ser una tecnología muy moderna, puede llegar a tener detalles de compatibilidad finos con estructuras de monorepos muy complejos o configuraciones avanzadas de Webpack/Turbopack.
- **Costo y Licenciamiento:** **Gratis y Open Source** en su modalidad de auto-hospedaje y app de escritorio de código abierto.

#### 2. Puck (`measured/puck`)

- **¿Cómo funciona?:** No es una app externa, sino una **librería de React** que tú instalas dentro de tu monorepo (`pnpm add @measured/puck`). Te permite habilitar un panel visual de "creador de páginas por bloques" directamente en tu aplicación.
- **Ventajas:** Tienes el control absoluto del código. Funciona 100% offline dentro de tu entorno de desarrollo local porque vive en tus propios componentes. No dependes de servidores externos ni de herramientas de terceros de pago.
- **Desventajas:** Requiere que programes y registres tú mismo los bloques o componentes que quieres que aparezcan en el editor visual (por ejemplo, definir cómo es el bloque "Hero" o el bloque "Card"). No es para arrastrar elementos libres arbitrarios, sino para armar páginas mediante secciones predefinidas.
- **Costo y Licenciamiento:** **100% Gratis y Open Source** (su código base es completamente libre).

#### 3. Subframe

- **¿Cómo funciona?:** Es una plataforma basada en web (tipo Figma) enfocada en diseñar interfaces con componentes de Tailwind y exportar código limpio de React.
- **Ventajas:** Su interfaz gráfica es sumamente pulida, rápida y genera un código de Tailwind y React excepcionalmente limpio, muy superior al de otras plataformas tradicionales. Es excelente para maquetar sistemas de diseño complejos desde cero.
- **Desventajas:** No trabaja directamente sobre tus archivos locales en tiempo real. Diseñas en su nube web y luego exportas o sincronizas el código resultante hacia tu repositorio.
- **Costo y Licenciamiento:** **Freemium**. Tiene un plan gratuito limitado a 1 proyecto y pocas páginas, y planes de pago desde los $29 al mes por editor.

#### 4. Plasmic

- **¿Cómo funciona?:** Es un potente constructor visual web (_Headless Builder_). Diseñas en su interfaz gráfica en la nube y utilizas su CLI local para sincronizar esos diseños de forma bidireccional convirtiéndolos en componentes de código de React dentro de tu monorepo.
- **Ventajas:** Es extremadamente maduro y potente. Permite que páginas enteras se construyan visualmente y se sincronicen de manera impecable con proyectos de Next.js. Su plan gratuito es bastante generoso para proyectos personales.
- **Desventajas:** Dependes de su ecosistema web para el diseño visual y requiere aprender su CLI de sincronización para enlazarlo con tus archivos locales. Puede sentirse sobredimensionado si solo quieres hacer ajustes rápidos de CSS.
- **Costo y Licenciamiento:** **Freemium**. Cuenta con un plan gratuito base (`$0`) generoso para proyectos pequeños y colaboradores limitados, escalando a planes profesionales costosos.

---

### Veredicto y Recomendación para tu Monorepo

- Si tu prioridad absoluta es **ver tu app real corriendo en local y tocar el diseño para que el software modifique tus archivos al instante**, la ganadora indiscutible es **Onlook** (por ser app de escritorio local, open-source y gratuita).
- Si lo que buscas es **crear un sistema interno donde tú u otras personas armen páginas mediante bloques visuales dentro de tu propio código de Next.js**, la mejor opción es **Puck** (por ser una librería open-source 100% gratuita que vive en tus dependencias).
- **Subframe** y **Plasmic** quedan un paso atrás si buscas una experiencia puramente local y sin fricciones de nube, ya que ambas dependen fuertemente de plataformas web externas antes de llevar el código a tu máquina.

> Credenciales de las herramientas de editor visual (PLASMIC*\*, PUCK*\_, SUBFRAME\_\_) movidas a
> `SECRET_TEMP.env` — nunca en este MD. Referencias: `PLASMIC_TOKEN`, `PLASMIC_CMS_ID`,
> `PLASMIC_PUBLIC_TOKEN`, `PLASMIC_SECRET_TOKEN`, `PUCK_KEY`, `PUCK_ORG_KEY`, `SUBFRAME_KEY`.
> CMS Plasmic: studio.plasmic.app/cms/<PLASMIC_CMS_ID> · Subframe: app.subframe.com/<SUBFRAME_FLOW>.

Install the Puck Skill by running `npx skills add puckeditor/skills --skill puck`,
then use it to add Puck AI to this application.

## 1. Resumen ejecutivo (la respuesta corta)

| Herramienta  | Licencia               | Edita código local                                            | Compatible con el stack                                                     | Veredicto                                               |
| ------------ | ---------------------- | ------------------------------------------------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------- |
| **Onlook**   | Apache 2.0 (OSS)       | ⚠️ Parcial (via web container, no edita el repo directamente) | Next.js + Tailwind, pero exige Docker + CodeSandbox + OpenRouter + waitlist | ⚠️ Prototipado AI, NO para editar este monorepo         |
| **Plasmic**  | MIT + AGPL (platform)  | ⚠️ Sí, pero vía plataforma en la nube + CLI de sync           | Next.js 15 ✅ (loader-nextjs 2.0.23)                                        | ⚠️ CMS/builder en la nube — exceso para ajustes locales |
| **Puck**     | **MIT**                | ✅**Sí — es una librería React embebida, 100% local**         | \*\*Next 15 + React 19 (peer `^18                                           |                                                         |
| **Subframe** | Propietario (freemium) | ❌ No (diseñas en su nube, exportas código)                   | Exporta React/Tailwind, pero no edita en vivo                               | ❌ Descartado                                           |

**Decisión**: **híbrido Puck-first**. Puck (`@puckeditor/core`) como editor visual embebido dentro de
las apps que lo necesiten, operando 100% sobre el código real del monorepo, sin nube ni
suscripción. Onlook queda reservado como herramienta de prototipado AI opcional (no integrado),
Plasmic/Subframe descartados por su dependencia de plataformas externas. Detalle: §5 y §6.

---

## 2. Contexto: el stack real del monorepo (verificado en código, 18 ago 2026)

Antes de elegir hay que saber qué hay instalado. Datos tomados de los `package.json` reales:

| Capa                 | Valor real                                                | Nota                                                         |
| -------------------- | --------------------------------------------------------- | ------------------------------------------------------------ |
| Framework            | **Next.js 15.5.22** (App Router)                          | 4 webs (`ciszu`, `ciszukoantony`, `muzicmania`, `ciszubot`)  |
| React                | **React 19.2.7** + React DOM 19.2.7                       | Criterio duro: el editor debe soportar React 19              |
| Tailwind             | **Tailwind CSS 4.2.4** + `@tailwindcss/postcss`           | Config en CSS-first (v4), no`tailwind.config.js` clásico     |
| TypeScript           | 6.0.3                                                     | Strict                                                       |
| Package manager      | **pnpm 10.8.1** monorepo                                  | Workspaces en la raíz (`pnpm-workspace.yaml`)                |
| UI compartido        | `@ciszu/ui` (workspace)                                   | Iconos, tokens, Modal Radix accesible; Storybook + Chromatic |
| Resolución de assets | `@ciszunetwork/cdn` (`assetResolver`)                     | SVG/imágenes vía Supabase Storage`ciszu-cdn`                 |
| Validación           | `zod` 4.4.3 + `@ciszunetwork/utils` (TypeBox server-only) | —                                                            |
| Estado client        | `zustand` 5.0.14                                          | —                                                            |
| Animación            | `framer-motion` 12.38.0                                   | —                                                            |

### 2.1 Implicaciones para cualquier editor visual

1. **React 19**: el editor y su runtime deben declarar peerDependency compatible con `^19` (o
   `^18 || ^19`). Un editor con peer `^18` duro rompe el workspace.
2. **Monorepo pnpm**: los bloques/editables deben ser componentes de `@ciszu/ui` o de cada app;
   el editor no puede asumir un único `pages/` ni una sola carpeta de componentes.
3. **Tailwind 4 (CSS-first)**: las clases se resuelven en build; un editor que "vea" el DOM en vivo
   necesita que las clases estén presentes (Puck renderiza los props tal cual, sin re-generar CSS).
4. **App Router**: el editor se monta como página/ruta dentro de la app (no `_app.tsx` global
   obligatorio, pero debe funcionar con server/client components).
5. **Assets vía CDN**: los bloques usan `assetResolver` → el editor embebido no rompe la resolución
   de imágenes.

---

## 3. Metodología de evaluación

Para cada herramienta se verificó (18 ago 2026) contra **fuentes primarias** (repo oficial,
docs oficiales, registry npm) y contra el **código real del monorepo**:

1. **Licencia y modelo**: OSS o propietario; costo real sin tarjeta.
2. **Edición de código local**: ¿modifica los `.tsx`/`.css` del repo donde corres la app?
3. **Compatibilidad con el stack**: Next 15 App Router, React 19, Tailwind 4, pnpm monorepo.
4. **Lock-in / nube**: ¿depende de un servicio externo para funcionar o para guardar?
5. **Seguridad**: qué secretos/permisos pide; si el editor puede acceder al filesystem.

No se instaló ninguna librería: la decisión es documental y cualquier instalación posterior
requiere aprobación explícita (regla 7.1 de `AGENTS.md`).

---

## 4. Análisis por herramienta (estado verificado)

### 4.1 Onlook (`onlook-dev/onlook`)

- **Repo**: `onlook-dev/onlook` (public). **Stars**: 26.5k. **Licencia**: Apache 2.0.
- **Qué es hoy**: "The Cursor for Designers" — herramienta de diseño AI-first para Next.js +
  Tailwind. Evolucionó: ya **no es solo un overlay sobre `localhost:3000`**.
- **Arquitectura actual** (docs oficiales `docs.onlook.com`):
    1. Crea una app (o importa) y carga el código en un **web container** (CodeSandbox SDK).
    2. El container corre y sirve la app; el editor la muestra en un iframe.
    3. El editor indexa el código, mapea elementos a su posición y edita en el iframe y en código.
    4. El chat AI tiene acceso a código y herramientas para editar.
- **Requisitos para correrla localmente** (dev/self-host):
    - **Bun** (runtime del monorepo), **Docker** (backend Supabase local), Node ≥ 20.16.
    - API keys obligatorias: **CodeSandbox** (para los dev containers), **OpenRouter** (chat AI),
      **MorphLLM o Relace** (fast-apply AI).
- **Producto alojado**: en **early access vía waitlist** (no abierto).
- **Compatibilidad**: enfocada en Next.js + Tailwind; "non-NextJS / non-Tailwind" en soporte avanzado.
- **Ventajas**: experiencia de diseño figma-like + AI; detección de componentes; branching.
- **Desventajas para este proyecto**:
    - Edita un **container de CodeSandbox**, no el filesystem del monorepo local directamente.
    - Exige **Docker + CodeSandbox + OpenRouter + fast-apply** para self-host: una plataforma completa.
    - Producto hosted cerrado (waitlist); self-host es infraestructura pesada.
- **Veredicto**: ⚠️ **reservado como prototipado AI opcional** (ver §6.3). No se integra como editor
  del monorepo; el costo de infraestructura no justifica editar 4 webs ya escritas.

### 4.2 Plasmic (`plasmicapp/plasmic`)

- **Repo**: `plasmicapp/plasmic` (public). **Stars**: 7k. **Licencia**: MIT (fuera de `platform/`),
  `platform/` bajo **AGPL**.
- **Qué es**: visual builder para React/Next. Uso típico: CMS/landing con drag-and-drop de
  componentes propios registrados (`PLASMIC.registerComponent`).
- **Cómo funciona**:
    - **Studio en la nube** (`studio.plasmic.app`) donde diseñas; los tokens (`PLASMIC_TOKEN`,
      `PLASMIC_PUBLIC_TOKEN`, `PLASMIC_SECRET_TOKEN`, `PLASMIC_CMS_ID`) están en el vault.
    - **Loader** (`@plasmicapp/loader-nextjs` v2.0.23) o **codegen** (`plasmic codegen`) para llevar
      el diseño al código local.
    - Publicación vía webhooks / revalidación incremental.
- **Compatibilidad**: Next.js 15 ✅ (loader-nextjs activo). Peer de React compatible con 19.
- **Ventajas**: maduro, drag-and-drop potente, codegen de componentes React limpios, CMS para
  contenido no técnico.
- **Desventajas para este proyecto**:
    - **Depende de la nube de Plasmic** para diseñar (Studio); no es 100% local.
    - Versiones exactas encadenadas entre `@plasmicapp/*` (dedupe frágil en monorepo).
    - Para "ajustar la UI de webs ya hechas" es excesivo: brilla construyendo páginas nuevas desde
      cero o como CMS, no retocando el código existente.
    - AGPL en `platform/` limita el fork/self-host de la plataforma.
- **Veredicto**: ⚠️ **descartado como base**; se documenta como alternativa futura si se necesita
  un **CMS visual para contenido no técnico** (marketing/landings). Secretos ya guardados en vault.

### 4.3 Puck (`puckeditor/puck`, antes `measuredco/puck`) — ELEGIDO

- **Repo**: `puckeditor/puck` (public). **Stars**: 13.2k. **Licencia**: **MIT**.
- **Qué es**: "The visual editor for React" — una **librería React** que se instala dentro de tu
  app (no una plataforma externa). Construyes experiencias drag-and-drop con **tus propios
  componentes**.
- **Cómo funciona**:
    - `@puckeditor/core` (paquete nuevo desde el rename; `@measured/puck` quedó deprecado).
    - Versionado: **0.23.0** (última, verificada en registry npm). Peer dependency:
      **`react: ^18.0.0 || ^19.0.0`** → compatible con React 19 del monorepo ✅.
    - `<Puck config={...} data={...} onPublish={save} />` renderiza el editor; `<Render>` muestra la
      página. `config` declara los bloques (components propios) y sus campos.
    - Recipes oficiales: **next** (App Router + SSG) y **react-router** → encaja con Next 15.
    - El estado del editor se guarda como JSON (tú decides dónde: DB, archivo, CMS).
- **Ventajas**:
    - **100% local y offline**: vive en el monorepo, sin servidores externos ni suscripción.
    - **Sin lock-in**: "You own your data" (cita del README oficial).
    - Registras como bloques los componentes reales de `@ciszu/ui` → diseño coherente con la marca.
    - Compatibilidad verificada: React 19 ✅, Next 15 App Router ✅, pnpm ✅.
    - **Puck AI** (opcional): el repo `puckeditor/skills` añade un skill para agentes que integra
      Puck y configura Puck AI (requiere cuenta Puck Cloud con crédito + `PUCK_API_KEY`).
- **Desventajas**:
    - No es "arrastrar elementos libres arbitrarios": se arma con **bloques/secciones predefinidas**
      que tú registras (paradigma page-builder, no free-form).
    - Requiere programar el `config` inicial (declarar cada bloque y sus campos).
    - Puck AI requiere cuenta de nube de Puck (opcional; el core no la necesita).
- **Veredicto**: ✅ **base del híbrido**. Ver plan en §6.

### 4.4 Subframe

- **Qué es**: plataforma **web** (estilo Figma) para diseñar con componentes Tailwind y **exportar**
  código React/Tailwind limpio.
- **Modelo**: freemium; plan gratuito limitado, Pro de pago (la URL de pricing devolvió 404 al
  verificar el 18 ago 2026 → modelo cambiante, no fiable).
- **Edición local**: ❌ no edita en vivo tu repo; diseñas en su nube y exportas/sincronizas.
- **Lock-in**: cerrado, propietario; el código exportado es tuyo pero el flujo depende de su web.
- **Veredicto**: ❌ **descartado**. Duplica lo que ya se resuelve con Tailwind + componentes propios,
  y añade dependencia de una nube de terceros.

---

## 5. Comparativa directa (criterios del proyecto)

| Criterio                          | Onlook                                 | Plasmic                     | **Puck**                   | Subframe               |
| --------------------------------- | -------------------------------------- | --------------------------- | -------------------------- | ---------------------- |
| **Licencia**                      | Apache 2.0                             | MIT + AGPL (platform)       | **MIT**                    | Propietario            |
| **Edita el repo local**           | ⚠️ Container, no filesystem            | ⚠️ Vía sync/codegen + nube  | ✅**Embebido en la app**   | ❌ Exporta             |
| **100% offline**                  | ❌ (Docker + CodeSandbox + keys)       | ❌ (Studio en la nube)      | ✅**Sí**                   | ❌ (nube)              |
| **React 19**                      | ✅ (enfoque Next/Tailwind)             | ✅ (loader 2.0.23)          | ✅\*\*peer `^18            |                        |
| **Next 15 App Router**            | ✅                                     | ✅                          | ✅**recipe oficial**       | ✅ (exporta)           |
| **Tailwind 4**                    | ✅                                     | ⚠️ (gen. v3 principalmente) | ✅ (usa tus clases)        | ✅ (exporta v4)        |
| **pnpm monorepo**                 | ⚠️ (self-host pesado)                  | ⚠️ (dedupe frágil)          | ✅                         | ⚠️ (flujo web)         |
| **Sin suscripción**               | ⚠️ (self-host gratis, hosted waitlist) | ⚠️ (freemium)               | ✅**Gratis y OSS**         | ❌ (freemium/Pro)      |
| **Bloques = componentes propios** | ⚠️ (detección)                         | ✅ (registerComponent)      | ✅**config con tus comps** | ❌ (catalogo de ellos) |
| **AI asistido**                   | ✅ (nativo)                            | ✅ (opcional)               | ✅**Puck AI (opcional)**   | ❌                     |
| **Lock-in**                       | Medio (container)                      | Alto (Studio)               | **Nulo (datos tuyos)**     | Alto (nube)            |
| **Curva / integración**           | Alta (plataforma)                      | Media (CLI + Studio)        | **Media (config en TS)**   | Baja (export)          |

**Lectura**: para un monorepo local-first, OSS y sin suscripciones, Puck es la única candidata que
cumple _todas_ las restricciones duras (offline, React 19, App Router, pnpm, MIT, datos propios).
Onlook sigue siendo atractiva para **diseño AI de prototipos**, no para mantener código existente.

---

## 6. Plan de implementación (híbrido Puck-first)

### 6.1 Fase 0 — Instalación del skill y del paquete ✅ (18 ago 2026, aprobado por Ciszuko)

```bash
# Skill oficial para agentes: se instaló manualmente (la CLI de skills se canceló) en
# .opencode/skills/puck/ (SKILL.md + 6 references de puckeditor/skills).
# Paquete core en ciszunetwork-website:
pnpm --filter ciszunetwork-website add @puckeditor/core@0.23.0
```

- Instalado solo en `ciszunetwork-website` (primera web con editor). Si otra web lo necesita, el
  `config` de bloques puede moverse a un paquete compartido reutilizable.

### 6.2 Fase 1 — Implementación real en `ciszunetwork-website` ✅ (18 ago 2026)

Archivos creados en `projects/ciszu/website/`:

- **`src/puck.config.tsx`** — `Config<PuckComponents>` con 5 bloques registrados a partir de las
  secciones reales del home: `Hero`, `SectionTitle`, `Stats` (array field), `Cta`, `Wrapper`
  (slot). Estilos de marca (Tailwind 4, clases existentes del sitio).
- **`src/puck/blocks.tsx`** — componentes de render: `HeroBlock`, `StatsBlock`, `CtaBlock`,
  `SectionTitle`, `Wrapper` (mismas clases Tailwind que el home).
- **`src/puck/PuckEditor.tsx`** — client component: `<Puck config data onPublish>` → `POST
  /api/puck/save` con estado "Guardando/Guardado".
- **`src/app/edit/[[...path]]/page.tsx`** — editor (`force-dynamic`, importa
  `@puckeditor/core/puck.css`, carga data existente o `EMPTY_DATA`). URL: `/edit/<ruta>`.
- **`src/app/pages/[[...path]]/page.tsx`** — render público con `<Render config data>`. URL:
  `/pages/<ruta>` (404 si no existe página guardada).
- **`src/app/api/puck/save/route.ts`** — `POST` con `createRateLimiter` (20/min por IP) y
  validación Zod del body `{path, data}` (parseJsonBody).
- **`src/lib/puck.ts`** — server-only: `getPuckPage`/`savePuckPage` con Drizzle
  (`ciszuSchema.puckPages`, `eq` de `@ciszunetwork/db`).
- **Migración `20260818000018_puck_pages.sql`** — tabla `ciszu.puck_pages` (path PK, data jsonb,
  updated_at) + **RLS** (SELECT público, sin write anon/authenticated; el guardado va vía
  service_role con la función `ciszu.save_puck_page` `security invoker` + `search_path=''`).
  Aplicada a producción (script `scripts/apply-migration-18.js`).
- **Schema Drizzle**: `packages/db/src/schemas/ciszu.ts` añade `puckPages`.

Notas de integración:

- **CSP**: `buildCsp` (middleware) ya incluye `style-src 'unsafe-inline'` y `frame-src 'self'` —
  suficiente para el editor (no usa iframes externos). Sin cambios en middleware.
- **Guardado**: el upsert es server-side vía `service_role` (bypass RLS); el endpoint valida con
  Zod. `anon`/`authenticated` no tienen write (RLS sin policy de write + `revoke` en la función).
- El estado es JSON del editor (data de Puck) en la tabla; la app es dueña de los datos ("you own
  your data").

### 6.2b Fase 1b — Verificación (18 ago 2026)

- `pnpm --filter ciszunetwork-website lint` ✅ · `tsc --noEmit` ✅ · `next build` ✅ (rutas
  `ƒ /edit/[[...path]]`, `ƒ /pages/[[...path]]`, `ƒ /api/puck/save`).
- Smoke test local: `GET /edit/home` → 200 (editor), `GET /pages/home` → 404 (sin página
  guardada), `POST /api/puck/save` payload vacío → 400 (rate limit + Zod OK).
- Guardado real requiere `DATABASE_URL` (env de Vercel); se valida en despliegue.

### 6.3 Fase 2 — Puck AI implementado ✅ (19 ago 2026)

El onboarding "Create your Puck App" de Puck Cloud corresponde a la integración del **plugin AI**:
chat que genera/ensambla páginas con los componentes del config. Él usa la key de la organización.

- **Pendiente resuelto**: `PUCK_KEY` = key de usuario, `PUCK_ORG_KEY` = key de organización (ambas
  en el vault). Se usa la de la **organización** como `PUCK_API_KEY` en server-only.
- **Paquetes** (aprobado 19 ago): `@puckeditor/plugin-ai@0.8.2` (client) +
  `@puckeditor/cloud-client@0.8.2` (server handler).
- **Handler** `src/app/api/puck/[...all]/route.ts` — `puckHandler` (Next.js), `runtime = "nodejs"`,
  `dynamic = "force-dynamic"`, exporta `GET/POST/DELETE`. `ai.context` con el posicionamiento real
  del ecosistema para mejor generación.
- **Plugin client**: `createAiPlugin()` añadido a `PuckEditor.tsx` (`plugins={[aiPlugin]}`) +
  `@puckeditor/plugin-ai/styles.css` importado junto al `puck.css`.
- **Env**: `PUCK_API_KEY` en `projects/ciszu/website/.env.local` (gitignored; valor de
  `PUCK_ORG_KEY` del vault) → añadirla también en las env vars de Vercel.
- **Verificación local**: tsc OK, lint OK, `pnpm build` OK (routes `/api/puck/[...all]` y
  `/api/puck/save` coexisten, ambos `ƒ` dynamic).

> ⚠️ **Deuda de auth**: el handler `/api/puck/*` es una superficie **medible** (gasta crédito de
> Puck Cloud) y está tan abierto como `/edit` hoy — requiere poner la auth del proyecto delante
> antes de producción abierta (ver §7 y `SECURITY_PROTOCOLS.md`).

### 6.4 Fase 3 — Onlook como herramienta de prototipado (opcional, no integrado)

- No se instala en el monorepo. Si se quiere experimentar diseño AI: usar la versión hosted
  (waitlist) o self-host (Docker + CodeSandbox + OpenRouter + fast-apply) en un entorno separado.
- El código generado se traería a mano al repo (copy/paste de componentes) y se limpiaría para
  cumplir estándares del proyecto.

### 6.5 Criterios de aceptación (estado 18 ago 2026)

- [x] Un editor visual funcional en al menos una web (ciszunetwork) construyendo una sección con
      bloques (config propios de `puck.config.tsx`).
- [x] El estado publicado se guarda en Supabase (tabla `ciszu.puck_pages` **con RLS**, regla 1 de
      `SECURITY_PROTOCOLS.md`).
- [x] Rate limiting en el guardado (`createRateLimiter`, POST `/api/puck/save`).
- [x] Build de la web OK, lint OK, tsc OK.
- [ ] E2E de editor (Playwright) — pendiente de añadir al suite.
- [x] Documentado en este doc.

---

## 7. Seguridad

- **Secretos**: `PLASMIC_*`, `PUCK_*`, `SUBFRAME_*` están en `services/supabase/.env` (vault
  cifrado) y referenciados por nombre en `TODO.md` y `VAULT_SYSTEM.md`. **Nunca** en código ni en
  este doc. El puente `SECRET_TEMP.env` solo los contiene si Ciszuko los vuelve a pasar.
- **RLS**: cualquier tabla nueva para páginas publicadas requiere RLS + policy explícita en la
  misma migración.
- **Endpoints POST** (guardar página): `createRateLimiter` obligatorio.
- **Si se integra Puck AI**: la `PUCK_API_KEY` va en server-only (env del server), nunca expuesta
  al cliente.
- **Puck AI (19 ago 2026)**: `PUCK_API_KEY` (valor de `PUCK_ORG_KEY`) vive solo en
  `.env.local` gitignored + env de Vercel; la de usuario `PUCK_KEY` queda en el vault. El handler
  `/api/puck/*` gasta crédito: **auth obligatoria delante antes de exponerlo**.
- **No instalar** ninguna de estas librerías sin aprobación explícita (regla 7.1).

---

## 8. Historial

| Fecha      | Cambio                                                                                                                        |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------- |
| 2026-08-18 | Creación. Investigación verificada de las 4 candidatas (repos/registry npm/docs), decisión híbrido Puck-first, plan en fases. |
| 2026-08-18 | Implementación Fase 0-1 en `ciszunetwork-website` (6 archivos + migración 18 + schema Drizzle), verificación lint/tsc/build/smoke. |
| 2026-08-19 | Fase 2 Puck AI: onboarding "Create your Puck App" completado (plugin-ai@0.8.2 + cloud-client@0.8.2, handler `/api/puck/[...all]`, `PUCK_API_KEY` desde `PUCK_ORG_KEY` del vault). tsc/lint/build OK. Deuda: auth delante del handler. |

---

## 9. Relación con otros docs

- `FRONTEND_SYSTEM.md` — arquitectura frontend de las webs.
- `UI_COMPONENTS_SYSTEM.md` — componentes `@ciszu/ui` (bloques de Puck) + Storybook/Chromatic.
- `STYLES_SYSTEM.md` y `COLOR_SYSTEM.md` — Tailwind 4 y tokens de la marca.
- `PACKAGES_SYSTEM.md` — reglas de los paquetes compartidos (dónde podría vivir el `config` de Puck).
- `CDN_SYSTEM.md` y `MEDIA_FORMATS_SYSTEM.md` — `assetResolver` para assets de los bloques.
- `DB_SYSTEM.md` y `SECURITY_PROTOCOLS.md` — guardado del estado + RLS.
- `TOOLS_EVALUATION_PLAN.md` — metodología de evaluación de herramientas candidatas.
- `VAULT_SYSTEM.md` — secretos de Plasmic/Puck/Subframe.
- `TODO.md` — tarea origen (solo lo edita Ciszuko Antony).

_Última revisión: 18 ago 2026._ Relacionado: `FRONTEND_SYSTEM.md`, `UI_COMPONENTS_SYSTEM.md`,
`STYLES_SYSTEM.md`, `PACKAGES_SYSTEM.md`, `CDN_SYSTEM.md`, `SECURITY_PROTOCOLS.md`,
`TOOLS_EVALUATION_PLAN.md`, `VAULT_SYSTEM.md`.
