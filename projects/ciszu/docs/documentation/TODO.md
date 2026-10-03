# To Do List — Ciszu Network

### Cambios Generales:

#5 Crear sistema de anuncios: Google Adsense, GA4, GTM, Tag y Analytics pack completo.

- [X] Implementar GoogleScripts/GoogleAnalytics en las 4 webs (GTM + GA4 + AdSense auto ads).
- [X] Crear ads.txt en public/ de las 4 webs.
- [X] Configurar CSP para permitir scripts de AdSense/GTM.
- [X] Actualizar IDs de GTM en Vercel: ciszunetwork GTM-N7Q8DGX5, ciszubot GTM-T9LG9N6C, ciszukoantony GTM-WNDXGD63, muzicmania GTM-N2SXL2FN.
- [X] Ajustar CSP en packages/utils/src/csp.ts para GA4/AdSense (img-src y connect-src extras).
- [X] AdSense: enviar/verificar los 4 sitios (ya en revisión GETTING_READY).
- [X] GA4: confirmar Realtime page_views en los 4 dominios (verificado con tráfico real).
- [X] GTM: verificar contenedores y tags (verificados; vacíos por diseño).
- [ ] Looker Studio: conectar fuentes GA4 y crear dashboard.
- [X] Verificar en producción que no hay errores 400/500 en impresiones de ads ni bloqueos de CSP.

  ESTADO VERIFICADO (02 oct 2026, acceso OAuth completo):
  - GA4: 1 propiedad (`properties/551642504`, "Ciszu Network") con los 4 data streams
    (G-TQH12LRZK6, G-V6E1QC7GQM, G-GQ197GD1RH, G-Y3X7RSM2J3). Tráfico real confirmado
    (Home de las 4 webs: 1795/576/522/456 views desde sep 2026). Realtime OK.
  - GTM: 4 contenedores EXISTEN pero están VACÍOS (0 tags/triggers/variables). GA4/AdSense
    funcionan por carga directa en `GoogleScripts` (SSR), no vía GTM. Publicar tags en GTM
    duplicaría la medición — se recomienda dejar GTM vacío o configurar tags SOLO si se
    elimina la carga directa.
  - AdSense: cuenta READY (`pub-3471969072198962`), los 4 sitios en GETTING_READY (revisión
    automática de Google, no se acelera). ads.txt servido con ca-pub correcto en las 4 webs.
    Crear ad units por API NO permitido (solo AdSense for Platforms) → manual en la UI.
  - Search Console: los 4 sitios verificados como siteOwner. Datos incipientes.
  - Producción: cero errores de consola ni bloqueos CSP en las 4 webs (GTM+GA4+AdSense
    cargan). Los ERR_ABORTED de doubleclick son flujo normal sin sitios aprobados aún.
  - GA4→BigQuery: datasets `analytics` listos en los 4 proyectos GCP; el ENLACE se hace en
    la UI de GA4 (no hay API). Looker Studio: sin API, se arma en la UI.
- [ ] **Enlace GA4 → BigQuery** (manual, por cada propiedad GA4): GA4 → Admin → Propiedad → Enlaces
      de BigQuery → Vincular → elegir el proyecto GCP (`ciszunetwork`, `ciszubot`,
      `ciszukoantony`, `muzicmania-1779157973357`) y el dataset **`analytics`** (ya creado) →
      flujo *Transmitir*. Los datos llegan en 24-48h.
- [ ] **Looker Studio**: conectar BigQuery → crear dashboard (gratis) con las fuentes GA4.
- [ ] **AdSense — crear unidades de anuncio** (manual, en la UI de AdSense → Anuncios →
      Unidad de anuncio → *Anuncio adaptable*): no se puede por API (solo AdSense for
      Platforms). Crear una por web cuando los sitios pasen de GETTING_READY a aprobados.
- [ ] **Publicar container GTM de MuzicMania** (manual, 1 min): el agente no tiene permiso de
      publish en ese container (los otros 3 se publicaron por API). Los tags GA4 + AdSense ya
      están en el workspace de muzicmania; falta: tagmanager.google.com → container
      `muzicmania.vercel.app` → Enviar/Publicar.
- [ ] **Aprobar sitios AdSense**: los 4 sitios están en GETTING_READY (revisión automática de
      Google). No requiere acción; verificar en unos días en la UI de AdSense.

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
  - GTM IDs corregidos en Vercel production + `.env.local` de las 4 webs:
    ciszunetwork `GTM-N7Q8DGX5`, ciszubot `GTM-T9LG9N6C`, ciszukoantony `GTM-WNDXGD63`,
    muzicmania `GTM-N2SXL2FN` (antes tenían IDs clásicos incorrectos GT-*).
  - Verificado en producción: las 4 webs cargan su GTM correcto; GA4 (g/collect) y AdSense
    (adsbygoogle) disparan via GTM en ciszunetwork/ciszubot/antony.

  USER-ID — IMPLEMENTADO (03 oct 2026):
  - [X] `setGaUserId()` en `GoogleAnalytics` (exportado de @ciszu/ui): hace
        `gtag('set', {user_id})` al dataLayer.
  - [X] Los 4 AuthProviders llaman `setGaUserId(user.id)` al cargar sesión y en
        SIGNED_IN/USER_UPDATED/TOKEN_REFRESHED; `setGaUserId(null)` en SIGNED_OUT.
  - [X] Activado a nivel de propiedad: `reportingIdentity=BLENDED` + Google Signals
        ENABLED + CONSENTED (verificado por API, 03 oct 2026).
- [ ] Los emails actualmente que se envian no estan customizados, los envia "supabase" lo cual puede confundir siempre debe ser ciszunetwork | (pagina en cuestion) ademas de un diseño interno diferente con botones y diseño. Terminos y condiciones y aclaracion de que este email no es de patrocinamiento o anuncio. Los que si son siempre se debe recalcar.
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

### Cambios por Website

**Ciszu Network Website:**

- [ ] Terminar idiomas en ingles UK.
- [ ] Terminar idiomas en ingles USA.
- [ ] Terminar paginas de proyectos y por cada proyecto.
  Actualmente al darle click a la seccion de proyectos NO va a la pagina de proyectos, deberia ser dinamico y tambien al darle click al proyectos ir a todos los proyectos.

  Debe existir un search, filtradores y ordenamiento segun ascendente o descendente. Para buscar y filtrar los proyectos.

  Las cards de cada proyectos deben ser mas unicos e especiales menos genericos, quita ese icono generico por cada card, y usa sus logotipos o isotipos, fondos diferentes segun el color del logo.

  Utiliza banners, flayers, herotitles o taglines. Al darle click al proyecto un modal personalizado y alli adentro un boton para ir al proyecto especificamente.

  Es decir trata hacer que esta pagina este mas completa, que cada proyecto sea un mundo diferente, que tenga suficiente espacio sin juntarlos. Como un index o home gigante.

  Por cada proyecto:

  Utiliza dentro de cada proyecto, logos, isotipos banneres, flayers, taglines herotitles entre muchas otras cosas agrega mucho informacion. Secciones, corrige los widgets y sus tamaños. Docks, modales, cards. sliders, animaciones, cada pagina con un background diferente, cambios de tipogragia. Hipervinculos, enlaces, no te pido que todo sea generico o compartido debe ser unico. Interactivos, responsivo.

  Por ejemplo muzicmania esta demasiado vacio, necesito que por cada proyecto agreges secciones unicas segun el proecty por ejemplo muzicmania y su library, ciszubot y sus comandos. Entre otras cosas. Ademas cada tag, titulo, seccion, dock o card debe tener iconos.

  Obviamente debe tener cosas como el stack tecnologico, informacion, que es, como se usa, propietarios, comunidad, redes sociales e incluso la pagina oficial si es que posee por ejemplo ciszukoantony tiene pagina oficial.

  Puedes usar sistemas de otras webs, o imagenes especificas por ejemplo ciszukoantony puedes usar mis selfies o certificados.

  Recuerda todo esto dentro de ciszunetwork.
- [ ] Terminar idiomas en español LATAM.
- [ ] Terminar idiomas en español España.

**Ciszubot Website:**

- [ ] Terminar idiomas en ingles UK.
- [ ] Terminar idiomas en ingles USA.
- [ ] Terminar paginas de dashboard (auth).
- [ ] Terminar idiomas en español LATAM.
- [ ] Terminar idiomas en español España.
- [ ] Arreglar AUTH error, "[ciszubot.vercel.app/?auth=error](https://ciszubot.vercel.app/?auth=error)", debemos corregir el auth de discord.
- [ ] Añadir VPS 24 7 AL BOT.

**Ciszuko Antony Website:**

- [ ] Terminar paginas de portfolio, crearlos si hace falta e indexarlos.
  El icono actual es una paleta de pintura, nada que ver con un portfolio cambialo oficialmente con un svg real.
- [ ] Terminar paginas de curriculum, crearlos si hace falta e indexarlos.
  - [ ] Terminar paginas de proyectos y por cada proyecto

Actualmente al darle click a la seccion de proyectos NO va a la pagina de proyectos, deberia ser dinamico y tambien al darle click al proyectos ir a todos los proyectos.

Debe existir un search, filtradores y ordenamiento segun ascendente o descendente. Para buscar y filtrar los proyectos.

Las cards de cada proyectos deben ser mas unicos e especiales menos genericos, quita ese icono generico por cada card, y usa sus logotipos o isotipos, fondos diferentes segun el color del logo.

Utiliza banners, flayers, herotitles o taglines. Al darle click al proyecto un modal personalizado y alli adentro un boton para ir al proyecto especificamente.

Es decir trata hacer que esta pagina este mas completa, que cada proyecto sea un mundo diferente, que tenga suficiente espacio sin juntarlos. Como un index o home gigante.

Por cada proyecto:

Utiliza dentro de cada proyecto, logos, isotipos banneres, flayers, taglines herotitles entre muchas otras cosas agrega mucho informacion. Secciones, corrige los widgets y sus tamaños. Docks, modales, cards. sliders, animaciones, cada pagina con un background diferente, cambios de tipogragia. Hipervinculos, enlaces, no te pido que todo sea generico o compartido debe ser unico. Interactivos, responsivo. Entre otras cosas. Ademas cada tag, titulo, seccion, dock o card debe tener iconos.

Obviamente debe tener cosas como el stack tecnologico, informacion, que es, como se usa, propietarios, comunidad, redes sociales e incluso la pagina oficial si es que posee por ejemplo ciszukoantony tiene pagina oficial.

Puedes usar sistemas de otras webs, o imagenes especificas por ejemplo ciszukoantony puedes usar mis selfies o certificados.

Recuerda todo esto dentro de ciszukoantony.

Recuerda que los proyectos de ciszukoantony, es asi mismo, musicboard (proyecto musical de ciszukoantony), Francisco Garcia" (persona), ciszunetwork (como empresa)

- [ ] Terminar idiomas en ingles UK.
- [ ] Terminar idiomas en ingles USA.
- [ ] Terminar idiomas en español LATAM.
- [ ] Terminar idiomas en español España.

**MuzicMania Website:**

- [ ] Terminar idiomas en ingles UK.
- [ ] Terminar idiomas en ingles USA.
- [ ] Terminar idiomas en español LATAM.
- [ ] Terminar idiomas en español España.
- [ ] Seguir con el desarollo del videojuego en su muzicmania TODO.md
