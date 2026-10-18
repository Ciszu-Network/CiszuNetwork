# To Do List — Ciszu Network

### Cambios Generales:

#5 Crear sistema de anuncios: Google Adsense, GA4, GTM, Tag y Analytics pack completo.

  REVISIÓN 05 oct 2026 (2 días después): enlaces de la API verificados.
  REVISIÓN 10 oct 2026 (por API con OAuth del vault): AdSense sigue en `NEEDS_ATTENTION` (revisión
  automática de Google); el enlace GA4→BigQuery EXISTE y está activo (`properties/551642504/   bigQueryLinks/yGFvijtXSdO5rW2I4KfTLw`, US — el endpoint que responde es v1alpha, v1beta da 404);
  el dataset `analytics` sigue con 0 tablas: Google aún no emite `analytics.events_*` (requiere
  tráfico + export diario). Ambas cosas son esperas externas, nada que ejecutar localmente.

  REVISIÓN 16 oct 2026 (token OAuth nuevo de ciszunetwork@gmail.com + permisos concedidos):

- AdSense: cuenta `pub-3471969072198962` en **READY** (aprobada). Sitios: ciszubot,
  ciszukoantony y ciszunetwork en `REQUIRES_REVIEW`; muzicmania en `GETTING_READY` (espera
  externa de Google).
- GA4 propiedad 551642504 y BigQuery: ciszunetwork@gmail.com ya tiene acceso (Editor GA4 +
  Viewer del dataset). GTM: los 4 contenedores responden por API.
- BigQuery: el dataset `analytics` seguía con 0 tablas → se activaron **`dailyExportEnabled`
  + `streamingExportEnabled`** en el enlace GA4→BigQuery (16 oct); el streaming creará
    `events_intraday_*` con los primeros eventos reales y el diario `events_YYYYMMDD`.
- AdSense→BigQuery por Data Transfer: la API exige **billing** en el proyecto 231298418565
  (no configurado) — pendiente decidir; mientras tanto Looker Studio puede usar el
  **conector nativo de AdSense** (sin BigQuery).
- OAuth: el token de ciszunetwork@gmail.com caduca cada **7 días** (app en modo Prueba);
  publicarla requiere dominio propio (vercel.app no vale como dominio autorizado).

  REVISIÓN 18 oct 2026 (reverificación completa por API — estados finales):

- **BigQuery: RESUELTO — el export SÍ funciona.** El error era mirar el dataset equivocado:
  Google escribe en **`analytics_551642504`** (no en `analytics`, que sigue vacío por diseño).
  Tablas reales verificadas: `events_20261016` (diario), `events_intraday_20261017` y
  `events_intraday_20261018` (streaming). Enlace OK (daily + streaming activos, US).
- **GA4 con tráfico real**: 16 usuarios activos y 271 eventos en los últimos 7 días
  (ciszubot 168, ciszukoantony 59, ciszunetwork 25, muzicmania resto). 6 conversiones y
  4 data streams activos.
- **ads.txt: ✅ correcto en las 4 webs** (HTTP 200 + línea `pub-3471969072198962` verificada
  en vivo el 18 oct). El "No encontrado" de la UI de AdSense es un escaneo viejo.
- AdSense: cuenta READY; sitios ciszubot/ciszukoantony/ciszunetwork `REQUIRES_REVIEW` y
  muzicmania `GETTING_READY` (espera externa de Google, sin acción local posible).
- **GA4 aviso "datos proporcionados por el usuario"**: la propiedad tiene UPDS activado pero
  no recibe `user_data` — el `user_id`/`user_data` NO está implementado en el código todavía
  (verificado con búsqueda). Pendiente: enviar `user_id` por dataLayer + variable DLV en los
  4 contenedores GTM, y opcionalmente `user_data` (hash) para enhanced conversions.
- **Looker Studio: DESBLOQUEADO** — los datos de GA4→BigQuery ya existen; el dashboard se crea
  manual en la UI (Looker no tiene API de creación). Fuentes: BigQuery `analytics_551642504`
  + conector nativo de AdSense (sin BigQuery).

- [ ] Looker Studio: conectar BigQuery (`analytics_551642504`) + AdSense nativo → crear dashboard.
  (18 oct: datos LISTOS; solo queda crearlo a mano en la UI de Looker Studio.)
- [x] **Tablas de BigQuery**: RESUELTO 18 oct — existen en `analytics_551642504`
  (`events_20261016`, `events_intraday_20261017/18`). El dataset `analytics` (vacío) era el error de lectura.
- [ ] **Aprobar sitios AdSense (ESPERA externa)**: cuenta READY; los 4 sitios en revisión de
  Google (no se acelera). Revisar la UI de AdSense en unos días.
- [ ] **Datos proporcionados por el usuario (GA4)**: implementar `user_id` vía dataLayer + DLV
  en GTM (y opcional `user_data` hasheado) para limpiar el aviso de "Corregir problemas con los datos".
- [ ] **Conversión de compra en GTM (Google Ads)**: requiere crear la acción de conversión en la
  cuenta de Google Ads (7969562321) para obtener `AW-`/ID + etiqueta de conversión; después se
  crea la etiqueta en GTM por API. Sin acceso a la API de Google Ads desde el vault.

- [ ] Looker Studio: conectar fuentes GA4 y crear dashboard.
  PENDIENTE de las tablas de BigQuery; además la creación de dashboards de
  Looker Studio NO tiene API (se crea manual en la UI). Cuando existan las
  tablas se conecta BigQuery y se monta el dashboard a mano.
  (16 oct: el conector NATIVO de AdSense en Looker ya se puede usar sin
  BigQuery; el de GA4/BigQuery espera la primera tabla.)
- [ ] **Esperar tablas de BigQuery**: enlace VERIFICADO OK por API (05 oct):
  `properties/551642504/bigQueryLinks/yGFvijtXSdO5rW2I4KfTLw` →
  proyecto `231298418565`, dataset `analytics`, 4 data streams, región US
  (creado 03 oct 05:16). El dataset ya EXISTE pero sigue VACÍO (0 tablas):
  Google aún no ha emitido `analytics.events_*`. Requiere tráfico en las
  webs + el procesamiento diario; se generará la primera `events_YYYYMMDD`.
  Revisar de nuevo en unos días. (16 oct: streaming+daily ACTIVADOS; con el
  primer evento real aparecerá `events_intraday_*`.)
- [ ] **Looker Studio**: conectar BigQuery → crear dashboard (gratis).
  (Depende de las tablas anteriores; creación manual en la UI.)
- [ ] **Aprobar sitios AdSense (ESPERA)**: verificado por API (05 oct) que la
  cuenta está en `state: NEEDS_ATTENTION` (revisión automática de Google, no se
  acelera). Los 4 sitios siguen en revisión. Verificar en la UI de AdSense en
  unos días. (16 oct: la CUENTA ya está READY; quedan los sitios en revisión.)

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
- [ ] Debuggear todos los sistemas de devcon nuevos.
- [ ] Integrar formulario de contacto funcionales y verificar soporte y contacto.

**Ciszubot:**

- [ ] Cada categoria de comandos en help debe tener un emoji diferente.
- [ ] Cuando me uno a un VC y hago play el bot no entra y sigue diciendo que no estoy en un VC.
- [X] Se necesita agregar comandos de economia basicos como work, tambien se debe agregar en la seccion de config comandos para cambiar el icono de la moneda del servidor,  para administracion agregar o quitar dinero de balance en banco o no de usuarios. Tambien en el dashboard se podra configurar todo esto. Se debe crear un sistema de drops configurable por default desactivado donde el bot automaticamente creara drops, cada servidor tendra un limite de 3 drops por servidor (free, con premium ilimitados) donde el usuario podra desed comandos de config o desde la dashboard agregar o qutiar drops, que se enviaran en canales especificos o globales, con periodios de tiempo de recoleccion y de aparecimiento diferentes configurables, con mensajes de drop tambien personalizable, algo asi como unbealiveboat. Por default mensajes default en ingles, emoji de moneda de discord, etc. Tambien existen opciones de exclusion de roles para reclamacion.
- [X] Necesito que tambien el bot soporte configuraciones de rol staff o admin tanto dashboard en la seccion de preferencias o admin como configurable con comandos.
- [X] Actualmente en la devcon las opciones del bot se ve todo feo, la info es escasa o se ven como comandos, adiferencias de otras opciones.. No existe fallback, no existe si ocurrio todo bien el proceso o accion o no. Los mensajes de forzeo no aparecen, e inclusos la aplicaciones en la website coom forzar el online o offline no funcionan. El resumen se ve horrible. Se necesita mejoras.
- [X] Actualizar la informacion interrna del bot a la version mas reciente.
- [X] Agregar comandos para links de donacion, partner, info, ayuda. Basicamente un comando por cada pagina en la website oficial. Incluso para auth.
- [X] Agrega mas miscelaneo o utilidades que un bot pueda hacer.
- [X] Sistema de nivel real con mensaje customizable, sistema de roles por nivel alcanzado, comando de leaderboard global o servidor, sistema de embeds y creacion de embeds para admins para crear acciones o embeds personalizados, el bot debe permitir enviarse por webhooks e incluso utilizar el sistema de embeds para asi el usuario crear mensajes custom embeds, sistema de perfiles, casamiento entre usuario, divorcio, sociales, xp, sistema de moderacion y automoderacion reales con comandos funcionales, permisos segun el comando, todo en el dashboard con exclusiones de roles, permisos por el rol de staff etc.
- [X] Utiliza los imagotipos, logotipos, thumnails logos banners entre otros para por ejemplo mensajes de premium o descarga iconos svg o imagen para esto.
- [X] Rate limits par ael bot, si un usuario spamea un comando utilizar el sistema de moo o automod configurable, mensaje de "espera x segundos"
- [X] comandos para activar o desactivar el premium segun el perfil vinculado a la cuenta con el plan, debe ser admin y activara la funcion en todo el servidor.
- [X] opcion en devcon para activar o desactivar premium segun el ID del servidor forzar por parte del bot.
- [X] sistema de bienvenidas o despedidas (mensaje custom, embed, activable o no, canal), invitaciones con puntos de invitacion (recompensas por invitaciones, canal de invitaciones), canal de starboard, canal de logs, canal de canales vc privados con paneles globales o privados de configuracion, con creacion de un canal "para crear el vc privado" guardado en el servidor, sistema de stats del servidor config setup canales vc con datos reales del servidor. comando o autoreconocer que un usuario envia un emoji premium o nitro y el bot lo envia gratis.
- [X] Finalmente categoria secreta, solamente acto para uso de staff de cisuzbot (por lista blanca de ID de usuario) en mi caso 627304822017622016 donde se probara comandos mas tecnicos, status real de todo, configuracion del servidor, manejo del bot total, stats secreatas o peligrosas.
- [ ] Corregir slidebar server desbode.
- [ ] Agregar icono a embeds creator.
- [ ] La opcion de config general fijar hacia arriba.
- [ ] En preferences del bot, tambien habra una zona para configurar los roles admins, mods, owner, bots, mute roles, etc. Tambien se repartira en el auto mod y en las config de admin o mod.
- [ ] Minigames deberia ser una sola opcion de config y dentro de esa opcion config por separado las subopciones de minijuegos, fusiona los actuales.
- [ ]
- [ ] Al cambiar el idioma desde la dashboard ya sea en bot preferences o en otro lado se actualiza pero pierde el estado y vuelve al default de USA.
