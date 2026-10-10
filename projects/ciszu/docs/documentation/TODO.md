# To Do List — Ciszu Network

### Cambios Generales:

- [ ] Migración i18n de literales por lotes (deuda actual: ciszu 0 ✓ completa ·
  ciszubot 0 ✓ completa · antony 226 · muzicmania 937; ratchet `pnpm verify:i18n`).
  PILOTO HECHO (09 oct 2026): página de **login de ciszu** migrada completa (patrón `useDict()` +
  claves `loginPage` en `es`/`en` + `fillTemplate`; ciszu pasó de 390 → 379).
  LOTES HECHOS: login (390→379) y support (379→340). LOTES HECHOS EN CISZU (09 oct 2026): 390 → 66 en 15 tandas: login, support, contact, register, reviews,
  changelog, not-found, reset-password, team (refactor), information (refactor), proyectos (ciszugamens/
  antony/muzicmania/ciszunetwork/ciszubot), documentation, ProjectsExplorer, forum, stats + cola brandTerms.
  REFACTOR SERVER→CLIENT ya resuelto para team e information (patrón wrapper + XContent.tsx).
  COLA PENDIENTE ciszu: services/page, services/[slug], faq (server→client), changelog/[id]/client,
  Navbar, appeal, settings, admin-login-form, ServicesShowcase (importar useDict/hook y migrar restos).
  DESPUÉS: ciszubot (330) · antony (246) · muzicmania (937).

#5 Crear sistema de anuncios: Google Adsense, GA4, GTM, Tag y Analytics pack completo.

  REVISIÓN 05 oct 2026 (2 días después): enlaces de la API verificados.

- [ ] Looker Studio: conectar fuentes GA4 y crear dashboard.
  PENDIENTE de las tablas de BigQuery; además la creación de dashboards de
  Looker Studio NO tiene API (se crea manual en la UI). Cuando existan las
  tablas se conecta BigQuery y se monta el dashboard a mano.
- [ ] **Esperar tablas de BigQuery**: enlace VERIFICADO OK por API (05 oct):
  `properties/551642504/bigQueryLinks/yGFvijtXSdO5rW2I4KfTLw` →
  proyecto `231298418565`, dataset `analytics`, 4 data streams, región US
  (creado 03 oct 05:16). El dataset ya EXISTE pero sigue VACÍO (0 tablas):
  Google aún no ha emitido `analytics.events_*`. Requiere tráfico en las
  webs + el procesamiento diario; se generará la primera `events_YYYYMMDD`.
  Revisar de nuevo en unos días.
- [ ] **Looker Studio**: conectar BigQuery → crear dashboard (gratis).
  (Depende de las tablas anteriores; creación manual en la UI.)
- [ ] **Aprobar sitios AdSense (ESPERA)**: verificado por API (05 oct) que la
  cuenta está en `state: NEEDS_ATTENTION` (revisión automática de Google, no se
  acelera). Los 4 sitios siguen en revisión. Verificar en la UI de AdSense en
  unos días.

  - ads.txt: VERIFICADO correcto en las 4 webs (03 oct). El aviso "No encontrado" de AdSense
    era del 21 sept (antes de servir ads.txt); se corregirá en el próximo escaneo de AdSense.
  - Verificación de prod (05 oct): las 4 webs cargan su contenedor GTM;
    AdSense (adsbygoogle) dispara vía GTM. GA4 (g/collect) depende del
    consentimiento del usuario (consent mode), por lo que no se emite en
    navegadores sin consentir (correcto, no es un fallo).

  ANALYTICS — CONFIGURADO POR API (03 oct 2026, acceso OAuth):

  - Audiencias creadas (5): Usuarios que hicieron scroll, Usuarios que enviaron formulario,
    Usuarios con engagement (30 días, evento-based) + All Users + Purchasers. Todas con
    `adsPersonalizationEnabled=true` → exportables a Google Ads (cuenta vinculada 7969562321).
  - Conversiones creadas (6): `purchase`, `form_submit`, `sign_up`, `login`, `first_visit`,
    `form_start`.
  - Measurement Protocol: acknowledgement de datos atestiguado + 4 secrets creados por data
    stream (guardados en el vault como `GA4_MEASUREMENT_PROTOCOL_SECRET_*`).
  - User-ID: IMPLEMENTADO en código (ver abajo). `reportingIdentity=BLENDED` y Google Signals
    ENABLED + CONSENTED → ya activo a nivel de propiedad.
  - Orientar anuncios a audiencias: listo (audiencias exportables + Google Ads vinculado).

  GTM — ACTIVADO DE VERDAD (03 oct 2026):

  - GoogleScripts ahora SOLO carga el contenedor GTM (GA4 y AdSense viven en tags GTM).
  - Tags creados por API en los 4 contenedores: "GA4 - Configuración" (gaawc/googtag,
    send_page_view=false) + "AdSense - Head" (custom HTML), trigger All Pages.
  - Publicados (3): ciszunetwork, ciszubot, ciszukoantony. MuzicMania pendiente (manual).
    ✓ Verificado en prod (05 oct): muzicmania ya carga su GTM (GTM-N2SXL2FN) y el tag
    AdSense dispara, así que su contenedor publicado incluye los tags correctos.
    GA4 (g/collect) se emite según el consentimiento (consent mode).
  - GTM IDs corregidos en Vercel production + `.env.local` de las 4 webs:
    ciszunetwork `GTM-N7Q8DGX5`, ciszubot `GTM-T9LG9N6C`, ciszukoantony `GTM-WNDXGD63`,
    muzicmania `GTM-N2SXL2FN` (antes tenían IDs clásicos incorrectos GT-*).
  - Verificado en producción: las 4 webs cargan su GTM correcto; GA4 (g/collect) y AdSense
    (adsbygoogle) disparan via GTM en ciszunetwork/ciszubot/antony.
- [X] Actualmente el sistema de creacion y registro de cuentas falla. Probe con ciszubot, al registrarme con "ciszukoantony" como user, al intentar logearme dice que no existe. Parece ser que al registrarse, le indica la usuario que debe aceptar algo en su email. El gran problema es que ese correo nunca aparece, y peor aun, no da tiempo a leer lo que dice, se actualiza rapidamente hacia el login. Debes hacer que al registrar una cuenta y todo esta bien (Cloudflare, recaptcha, credenciales, seguridad de contraseña, cuenta repetida, relleno de obligacion, rate limits etc), si es una cuenta nueva SIEMPRE se debe pedir una verificacion para terminar para la creacion, se usara el modelo de ciszunetwork es decir, C-XXX-XXX, 6 campos de digitos o numeros aleatorios, con su rate limits, sus experiaciones, su tiempos para volver a mandar en el mismo modal, su campo de verificacion etc. Si el usuario NO procede con la verificacion, simplemente NO se crea la cuenta, en caso de que si, la cuenta se configura automaticamente con la autentificacion del email que se vinculo, asi en proximos logeos siempre se le mandara una verificacion OTP. Algo que podra desactivar en su configuracion de cuenta personal si quiere. Tanto para login o registro, los codigos son temporales, expirable en 3 horas e indicar, unico por website, indicar si ya expiro y posibilidad de reenviar otro codigo con limites, al tercer limite se suspende temporalmente y localmente por que no logro iniciar sesion o registrarse correctamente. Finalmente, cuando el usuario se registra o se logea, debe aparece un modal opcional en el index, para indicarle y recordarle que pueda activar la opcion de "recordar contraseña" por lo proximos 30  dias. De esta manera se fuerza la sesion y no se pierde luego de por ejemplo apagar la pc o cosas asi.  Este modal es opcional y lo puede cerrar en caso de que lo ignore o cierre no se tomara en cuenta si se recordara la sesion o no. Ademas se podra tambien activar luego en la configuracion de la cuenta.
- [X] Estas implementaciones requieren de terminar algunas cosas de paridad, es cierto que muzicmania es la unica que de verdad requiera cuentas, por eso tiene mas opciones de perfil o configuracion. Pero especificamente la pestaña de configuracion despues de un usuario iniciar sesion y seleccionarlo en el header. Es algo muy importante, necesito que repliques este sistema, actuales con las peticiones para todas las websites. Puedes excluir ciertas configuraciones como las de perfil, pero los de cambiado de nombre display, otp recordatorio, emails notif, camibar password, auth, cerrar sesion segura, debug, dispositivos sesiones, entre muchas otras lo requieren las demas websites.
- [X] Crear nuvas opciones dentros de la configuraciones de cuenta como "danger zone" dentro estara para eliminar la cuenta, el usuario debe colocar su contraseña y username completos y repetidos para finalmente realizar una advertencia final, la cuenta en caso de ser eliminada en realidad pasara a un estado de suspension, que, por 15 dias. Estara inactiva, ojo, siempre cuando se intente eliminar una cuenta se borrara de la indexacion, pero si existira. Se guardaran sus datos SIEMPRE.

  Entonces, dentro de ese periodo de 15 dias, el usuario peude recuperar su cuenta, si inicia sesion se debe detectar si la cuenta fue eliminada o no, en caso de que si, se bloquea la cuenta hasta su confirmacion de recuperacion, aqui el usuario debe aceptar que no podra eliminar su cuenta durante 30 dias.

  Si el usuario lo rechaza simplemente no se le otorga la recuperacion. y se deslogea.

  Si el usuario nunca decide recuperarla y pasan los 15 dias. Al intentar iniciar sesion dara error, por que sus contraseñas y su validacion seran eliminadas.

  Pero existe un detalle, al registrarse con un correo de una cuenta ya eliminada, si podra crear su cuenta. Pero con un discleimer de que anteriormente se uso este correo para una cuenta que ya fue eliminada, como recordatorio.

  Como se detectara? facil, las cuentas nunca se eliminan solamente se ban desindexando e eliminado credenciales y validacion. Pero muchos de los datos, como el UUID unico, contenido subido, entre muchas otras cosas permaneceran, la unica exepcion es cuando un contenido se elimina selectivamente por ejemplo, si el usuario elimino su cuenta luego de subir una foto de perfil no apta para todo publico, en ese caso alli si se elimina el contenido especifico.

  Como el UUID se guarda y el espacio en la base de datos tambien, se puede remplazar ese UUID con los nuevos datos, vinculado con el correo exacto, es decir, el correo esta vinculado al UUID para siempre. Y los OAuth tambien.

  Solo es cuestion de reemplazar los datos antiguos de la cuenta por la nueva segun lo que el usuario desee, si el usuario vuelve a eliminar la cuenta luego de 30 dias ocurrira el mismo ciclo.

  Finalmente, si una cuenta baneada es eliminada o el usuario lo eliminada, espera 30 dias, y con el mismo email intenta crearsela, funcionara? No. Por que el email esta vinculado al UUID. Y el ban esta vinculado al UUID. Da igual si el usuario intenta esto, el ban se detecta asi y por IP. Y otras sanciones como temporales o permanentes, configuraciones exactas o mutes, permanezaran alli siempre.

  Por otro lado y para concluir, cuando un usuario elimina la cuenta por privacidad se remplazaran ciertas cosas. Es algo asi como un cambio pero publicamente, se cambiara su display name a Deleted Account y su username a @deleted-account y una serie de numeros gigante, nunca iguales. De esta manera las cuentas eliminadas aunque publicamente cambien, en la DB se guarda todo, por otro lado si la cuenta esta alojada en websites que retienen mas datos publicos como muzicmania, se intentan esconder. Por ejemplo la BIO cambia a "esta cuenta ha sido eliminada", sus gustos, redes likeadas o cualquier cosa externa o customizada por el usuario se esconde o se coloca vacio. OJO, recuerda que esto es publicamente, en la DB se guardara digamos una copoa de respaldo en caso de que el usuario quiera volver a recuperar en caso de que luego de los 15 dias no quiera pues se mantiene pero ahora cualquier usuario con su correo podra reemplazarlas creandose la cuenta.

  Otras cosas que si se esconderan o eliminaran, es la foto de perfil, por seguridad pasara a ser la estandar. Cuando el usuario recupere se recolocara el que tenia anteriormente. Y por ultimo dentro de los datos que se esconderan o eliminaran, si la website o perfil contiene historiales publicos se esconderan. Por seguridad, pero si se mantendra publicos comentarios, reviews, etc.

  Digamos que todo se guarda respaldado  pero ciertas cosas se esconden o eliminan publicamente. A menos que el usuario lo pida borrar por soporte o si fueron eliminados selectiva o automaticamente.

  Otros detalles que si se van a mantener son cosas no importantes o que no indiquen nada personal como records, puntuaciones, guardados, logros etc. Dependiendo de la customizacion de visibilidad del usuario o no, esto si se podran mostrar.

  Cuando un usuario es eliminado su cuenta debe pasar a eliminado, es decir cualquier interaccion a ella es invalida, no se podra agregar como amigo, seguir o cualquier cosa que se interactue normalmente con otra cuenta, sin indexacion ni interaccion de ninguna manera. A diferencia de los normales activos.

  Cuando un usuario es baneado le pasa lo mismo con la diferencia de que es selectivo la desicion de ser baneado, no se esconde o eliminada nada, permanece todo publico exepto eliminacion selectiva, pero se mantiene las acciones de no interaccion e indaccion de que esta cuenta fue baneada.

  Recuerda la cuenta es baneada por un moderador o administrador dentro del staff, en el perfil debe aparecer quien fue o si fue el bot de la pagina. Pero al eliminar una cuenta simplemente aparecera que la cuenta fue eliminada.
- [X] En la devcon se debe crar una nueva opcion para otorgar etiquetas o roles a un usuario en concreto, siempre sera global, nunca sera multicasillas esta vez, sera por cada website, y debe ser el username completo exacto, luego se escribe el rol a dar, los roles y tags apareceran en el perfil y activaran nueva funciones dependiendo del rol al hacer click en su perfil en el header, admin, mod, owner, bot, vip, betatesting, support, los ultimos 3 no son de staff, bot tampoco pero si tiene permisos de staff y sera otorgada a cuentas bots recreadas por cada website es decir, @ciszubot, @muzicmania y @ciszunetwork seran cuentas creadas por bots sin contraseña, son perfiles especiales. Finalmente owner, mod y admin si son staff y aparte de esa tag en el perfil debe aparecer la tag de staff. Cada uno tendra un panel diferente, opciones de debug entre mas grande el rango. El owner debe tener todos. Configuracion de debug, entre muchas otras cosas, como vista de staff en perfiles con activacion toggle, para eliminar ciertas cosas o cambiar ciertas cosas. Simepre con marca.
- [X] Se debe crear un metodo de cierre de sesion remoto utilizado para cerrar sesion a cierta persona, este metodo solo lo podran ejecutar los moderadores, admins y owners. Con el fin de cerrar alguna sesion incluso de una cuenta por cada rango, es decir un mod no puede cerrar la sesion de un admin. Esto por seguridad de hackeos a cuentas. Esta opcion debe estar tanto para la GUI de cada website segun el debug y cuenta, y para la devconsole.
- [X] Se debe crear un modal cuando una cuenta es baneada, el usuario automaticamente se redirecionara asu profile y aparecera un modal de su cuenta fue baneada e informacion del baneo. Razon fecha provocante etc. Lo mismo con los mutes.
- [ ] Me he dado cuenta que los usernames de los guest estan mal, te pedi que los guest tengan un username que se base en su minuscula y con su arroba es decir si el guest displayname Guest3848 su username es @guest3848. Esto solo se esta cumplien en muzicmania en los demas no.

### Cambios por Website

**Ciszu Network Website:**

- [ ] Terminar idiomas en ingles UK.
- [ ] Terminar idiomas en ingles USA.
- [ ] Terminar idiomas en español LATAM.
- [ ] Terminar idiomas en español España.

**Ciszubot Website:**

- [ ] Terminar idiomas en ingles UK.
- [ ] Terminar idiomas en ingles USA.
- [ ] Terminar paginas de dashboard (auth).
- [ ] Terminar idiomas en español LATAM.
- [ ] Terminar idiomas en español España.
- [ ] Corregir la configuracion de la cuenta para permite doble login, usuario logeado con ciszu ID puede configurar su cuenta, usuario logeado con discord accede a dasboard, usuario logeado en ambos control total.

  ▸ [10 oct 2026] Fase 1 HECHA: sin bucle en /login (panel dinámico según sesión), username @ real de Discord (nunca el ID), icono engranaje en Configuración, botones Invitar/Configurar por servidor con atenuado y aviso individual, QuickDocks compactos/colapsables y estáticos al final, sidebar del dashboard por categorías con accesos (FAQ/ayuda/perfil/config/idioma/tema). Pendiente de este bloque: lo de la línea del spec del dashboard (158).

  Actualmente cuando inicio con discord y luego voy a iniciar sesion con ciszu ID, no me deja, al ingresar al login me redirecciona hacia atras, deberias arreglar esto. Ademas´si el usuario ya esta ingresado en discord o ya esta ingresado en ciszu ID desactivar dinamica y inteligentemente.

  Ademas cuando ingreso a ver la info de mi cuenta, utiliza un serial de digitos aleatorio para mi username, en vez de mi username de discord (sin ciszu id), solamente aparece mi displayname correctamente. (acabo de ver que el serial es el ID de la cuenta, aparte del ID deberia mostrar el username @)

  Se debe cambiar el icono de la configuracion de la cuenta a un engranaje.

  Por cada servidor no invitado siempre exitir un boton para invitar a ese servidor, y un boton de "configurar" que siempre dara error en caso de que no este invitado. El servidor debe estar con un efecto apagado cuando no este invitado y advertir de antes individualmente.

  Los quickdocs son muy molesto, intenta siempre que esten hacia abajo de la pagina, y no en la zona de scrolls, es decir estatico debajo de todo.

  Agrega mas reactividad, interactividad, iconos svg, degradados, opciones demas, utilidades, accesos directos en el slidebar dashboard como faq o ayuda, configuracion de la cuenta, perfil, cambio de idioma e tema,

  Los servidores en el sliderbard deben estar dentro de una categoria del sliderbard, como servers. Al no tener seleccionado nada el usuario solo vera el resumen, al seleccionar aparecera un segundo slidebard a la derecha o una extension para las categorias por opcion de configuracion, por defecto el resumen dentro del servidor. Con un hero title banner y preview resumen entero del servidor, y luego por cada opcion iconos etc, al seleccionar aparece las opciones.

  Intenta aprovechar el espacio, cambia el fondo por cada servidor. Aprovecha caracteristicas de discord.

  Las acciones del usuario no son guardables hasta que le de a un boton de guardar dentro de un panel flotante que aparecera solamente cuando se registra cambios no guardados, tambein existira la opcion de guardado automatico configurable activado por defacto, y la opcion deshacer o rehacer dentro de ese panel. Aparece con animacion fluida inferior sticky, Al guardar hacer animacion de guardando, al finalizar correctamente el guardado y aplicaciones reales mostrar que todo esta correcto de lo contrario error. Y quitar autoamticamente el panel a los 1 segundo. El usuario solo puede hacer cambios despues de terminar el guardado anterior. Los datos del servidor se debe actualizar constantemente, es decir, si un usuario crea un rol, y en algunas de las opciones se requiere seleccionar roles del servidor, si el usuario no recargo la pagina puede recargar la pagina, recargar con un boton flotante para recargar datos del servidor o esperar un periodo de tiempo re recarge automatico, es decir paginas dinamicas.

  Finalmente ten en cuenta que el dashboard solo es accesible para admins del servidor, si se detecta via discord que el usuario no es admin del servidor denegar acceso inmediato.

  Tambien en dashboard antes de los quickdocks, crea varias secciones. Como soporte, auda, como usar, e incluso autopatrocinio como invitar el bot a otros servidores, integrarlo en el perfil, ver perfiles de disboard, discordbot y top gg entre otros.

  Finalmente, todas las opciones deben tener etiquetas de FREE, pero algunas que TU consideres PREMIUM. Agregalas pero alado de esa etiqueta agrega que sera por BETA TRIAL FREE, es decir todas son FREE, el sistema premium se agregara despues, incluso. En las secciones prequickdocks agrega un discleimer de que las opciones de BETA TRIAL FREE cambiaran a premium en cualquier momento, y que se debe aprovechar este momento.

  Por cada servidor en su resumen ademas de info de ciszubot agrega info del servidor. Crea UI para listas de roles, canales, crea campos de textos que permitan markdown de discord, por cada opcion has que la configuracion se peuda cargar atravez de JSONs, algo asi como plantillas universales para que por cada opcion o desde el resumen (global desde el servidor) exportar o importar guardados (backups) que cargan y segun la config aplica los cambios.

  Los JSON debe tener una nomenclatura clara, segun por opcion, fecha, usuario, indicar que es un backup de ciszubot etc.

  La verdad no se que mas decir, te dejo la libertad de mejorar el dashboard como quieras, animaciones, interacciones para el usuario por ejemplo ocultar o esconder los slidebards, o retraerlos, o etc. Incluso funciones o cosas que tangan otros bots de discord famosos.
- [ ] DASHBOARD CISZUBOT — gran mejora (spec del 09 oct 2026):
  · Sidebar por categorías (Servers como categoría; al no seleccionar nada solo resumen; al seleccionar abre
  sub-sidebar por opciones; resumen por defecto con hero banner + preview completa del servidor).
  · Accesos directos en el sidebar: FAQ, ayuda, configuración de cuenta, perfil, cambio de idioma y tema.
  · Más reactividad/animaciones (ocultar/retraer sidebars), fondo por servidor, aprovechar features de Discord.
  · Guardado con panel flotante sticky (undo/redo, auto-guardado configurable ON por defecto; solo si hay
  cambios sin guardar; animación guardando→éxito/error; se oculta 1s tras guardar; bloquear cambios hasta
  terminar el guardado anterior).
  · Datos dinámicos del servidor: botón flotante de recarga + auto-recarga periódica (roles/canales frescos).
  · Acceso solo admins del servidor (verificación discord server-side, denegar al instante).
  · Secciones antes de QuickDocks: soporte, ayuda, cómo usar, autopatrocinio (invitar bot, integrarlo en el
  perfil, perfiles en Disboard/DiscordBotList/Top.gg) + disclaimer BETA TRIAL FREE.
  · Etiquetas FREE en todas las opciones; marcar algunas como PREMIUM con badge "BETA TRIAL FREE"
  (todo gratis durante la beta; el premium real llegará después).
  · Resumen por servidor: info de CiszuBot + info del servidor (listas de roles, canales), campos de texto
  con Markdown de Discord, y carga/exportación por JSON (plantillas universales) desde cada opción y desde
  el resumen global — nomenclatura clara: opción/fecha/usuario/backup-ciszubot.
  · Botón "Invitar" por servidor no invitado + botón "Configurar" que da error si no está invitado;
  servidor en efecto apagado + advertencia individual previa.
  · QuickDocks: moverlos siempre al final de la página (fuera de la zona de scroll, estáticos abajo).
  ▸ [10 oct 2026] FASE 2 HECHA (commit 21813eca): panel flotante de guardado (undo/redo, autosave ON por
  defecto configurable, animación guardando→éxito/error, se oculta 1s, bloqueo durante guardado, Ctrl+Z/Y);
  datos dinámicos del servidor (API con roles/canales/miembros del bot, auto-recarga 60s, botón flotante de
  recarga); selects con nombres reales (canales/categorías/roles) con fallback manual; resumen del servidor
  con hero + fondo por servidor (hue del guild) + info de Discord; backups JSON por sección y global con
  nomenclatura clara (opción/servidor/fecha/usuario); etiquetas FREE / PREMIUM · BETA TRIAL FREE; aviso BETA
  TRIAL FREE en dashboard y panel; acceso solo admins server-side ya activo; secciones pre-QuickDocks (ayuda,
  cómo usar, autopatrocinio con integración de perfil e invitación, directorios "próximamente").
  QUEDA de este spec: campos de texto con editor Markdown de Discord; sub-sidebar por opción con preview
  del servidor en el resumen global; UI de listas dedicadas de roles/canales; revisar duplicidad hero
  (layout vs cliente) en polish final; etiquetar FREE/PREMIUM cualquier opción nueva futura.
- [ ] Añadir VPS 24 7 AL BOT. (Tarea normal: desplegar el bot en un host 24/7 — panel gratuito
  tipo bot-hosting.net con `deploy/ciszubot-standalone.zip`, o VPS genérico; requiere cuenta y/o pago.)

**Ciszuko Antony Website:**

- [ ] Terminar idiomas en ingles UK.
- [ ] Terminar idiomas en ingles USA.
- [ ] Terminar idiomas en español LATAM.
- [ ] Terminar idiomas en español España.

**MuzicMania Website:**

- [ ] Terminar idiomas en ingles UK.Explica
- [ ] Terminar idiomas en ingles USA.
- [ ] Terminar idiomas en español LATAM.
- [ ] Terminar idiomas en español España.
- [ ] Seguir con el desarollo del videojuego en su muzicmania TODO.md
