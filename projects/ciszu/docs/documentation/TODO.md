# To Do List — Ciszu Network

> Este archivo solo puede ser editado por Ciszuko Antony.

### Cambios a todas las Websites

- [ ] Sincronizar AUTH. De manera que implementemos la primera fase del auth, segun su documentacion cada webapp debe tener un AUTH oficial, finalmente el unico que tendra un oAUTH aparte sera ciszubot con discord, los auth no puedes ser tan diferentes. Todos deben decir iniciarse sesion o registarse. Muy parecido a MuzicMania. Pero al entrar a registrase o logearse, en su pantalla. Debe salir la seccion de logear/registrase con CISZU ID (normal, default o por defecto con correo contraseña etc, el auth que tiene el mejor diseño y es el de muzicmania, debemos crear la base de datos de cada pagina dentro de ciszunetwork con respecto al auth no centralizada, pero en un futuro si), y opciones adicionales como google, microsoft entre otros. PERO estas opciones por ahora funcionaran como placeholder, al darle click saldra un error de beta. Pero el unico que funcionara sera el de discord de ciszubot. De hecho, es obligatorio usar el registro y login de discord en ciszubot indiferentemente si tiene CISZU ID)
- [ ] IMPLEMENTAR SISTEMA DE INVITADOS, actualmente implemente en muzicmania un sistema de invitados, un ID unico local con nomenclatura especial. Para crear un nametag de "invitado", el problema es que actualmente solo esta en /play de muzicmania. Ni si quiera esta afuera de play en muzicmania. ¿Que debmemos hacer? simple, en una web misma, el invitado sera el auth sin registro o login, al entrar al boton de auth saldra un icono de invitado generico + el nombre de invitado. Este invitado usara preferencias locales pero nunca tendra presencia en base de datos, seguira siendo un usuario no logeado o no registrado aun. Esto con el fin de incentivar a los usuarios a registrarse y personalizar su foto y nombre. Existe exepciones como en muzicmania que los invitados pueden jugar y guardar sus leaderboard. Pero no hay que darles prioridad. Este sistema solo esta en muzicmania, pero debemos llevarlo a ciszubot, ciszunetwork y ciszukoantony de manera mas simplificada. No importa si el ID generado del invitado cambia al actualizar o cambia por website, es solo frotend y no importa. Lo importante es mantener un diseño coherente, replicar si hace falta y guiarnos por muzicmania que lo tiene implementado parcialmente (solo en play), ojo, en muzicmania si debe ser siempre el mismo ID, tanto el del header como en la seccion dentro de play, para no crear confusion.
- [ ] IMPLEMENTAR PREFERENCIAS LOCALES, a diferencias de configuraciones o opciones de perfil. Las preferencias simpre estaran disponibles para todos los usuarios. De esta manera, para acceder siempre sera dando el boton de AUTH (Logeado o no, debe salir) estas preferencias se guardan siempre localmente, pero si logeado si debe guardarlo. Las opciones de preferencias seran el idioma, el tema, una pequeña seccion de ayuda, hacer zoom o disminuir el zoom, y otras opciones de interaccion directa con el navageador, como silenciar la pestaña entre otras. Y que los usuarios no se quejen por que esten obligados a registrarse, estas opciones siempre se guardan localmente, es basicamente un menu rapido de opciones y preferencias para todos invitados o usuarios registrados. Se debe usar los mismos botones de theme y lenguaje que en los navbars
- [ ] POST-OSINT | Despues de terminar al anterior tarea de ciberseguridad, investigar estas herramientas para autocomplementarlos:

1. Búsqueda de números de teléfono
   PhoneInfoga: Es una de las herramientas más conocidas para la búsqueda avanzada de números de teléfono. Es gratuita, de código abierto y permite recopilar información técnica (como el país de origen, proveedor de servicios y tipo de línea) y buscar rastros del número en la web.

SEON: Ofrece una herramienta de "huella digital" (digital footprint) que, al introducir un número, intenta verificar en qué redes sociales y servicios digitales está registrado ese número. Es muy utilizada en entornos profesionales para prevención de fraude.

2. Búsqueda de correos electrónicos
   Have I Been Pwned?: Es el estándar de oro para verificar si un correo (o teléfono) ha aparecido en filtraciones de datos (breaches). Es esencial para saber si esa cuenta ha sido comprometida en algún servicio.

Epieos: Excelente herramienta para obtener información sobre una cuenta de correo electrónico de Google. Te indica si el correo está asociado a perfiles en servicios como Google Maps, Google Calendar o Google Photos (siempre que la configuración de privacidad del objetivo lo permita).

Hunter.io: Muy efectiva si estás investigando correos corporativos. Te permite encontrar direcciones asociadas a un dominio específico (ejemplo: @empresa.com), lo cual ayuda a mapear a las personas que trabajan allí.

Thatsthem: Permite realizar búsquedas inversas de correos intentando vincularlos con registros públicos para obtener nombre, ubicación o teléfonos asociados.

3. Herramientas de investigación integral (Frameworks)
   Si buscas realizar una investigación más profunda que conecte varios puntos (nombres, alias, correos, IPs):

Maltego: Es una herramienta profesional de minería de datos y visualización de vínculos. Permite "conectar los puntos" entre diferentes tipos de información. Tiene una versión comunitaria gratuita que es muy potente.

SpiderFoot: Automatiza la búsqueda de información sobre un objetivo en cientos de fuentes públicas. Es ideal para recopilar datos de forma masiva (correos, números, nombres, dominios) y organizarlos.

Google Dorking (Búsqueda avanzada): Nunca subestimes el poder de los operadores de búsqueda. Combinar búsquedas entre comillas "correo@ejemplo.com" o usar comandos como site:linkedin.com "nombre de la persona" suele dar mejores resultados que muchas herramientas automatizadas.

- [ ] IMPLEMENTACION DE EDITOR VISUAL UI/UX, documentar en VISUAL_BUILDERS_SYSTEM.md. Comparar cual seria el mejor para el proyecto o usar hibrido.

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

### Cambios por Website

**Ciszu Network Website:**

- [ ] Nada

**Ciszubot Website:**

- [ ] Nada

**Ciszuko Antony Website:**

- [ ] Nada

**MuzicMania Website:**

- [ ] Nada
