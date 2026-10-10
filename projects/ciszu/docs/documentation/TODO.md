# To Do List — Ciszu Network

### Cambios Generales:

- [ ] Activar canal SMS para avisos de cuenta (código listo: `sendSms()` en `@ciszunetwork/utils`,
  preferencia `sms_enabled` en `notification_preferences` y teléfono en el panel; falta contratar
  un proveedor externo y poner sus credenciales en el vault + Vercel).
  ACTIVADO (09 oct 2026): **Textbelt** con key gratuita (1 SMS/día) — soporte en `sendSms()`,
  `SMS_PROVIDER`/`SMS_API_KEY` en el vault + los 4 proyectos Vercel, y aviso por SMS cableado en
  las sanciones del anti-cheat (MuzicMania) cuando el usuario activó `sms_enabled` y dejó teléfono.
  Para volumen real: key de pago de Textbelt o Twilio/Vonage (trials con crédito).
- [X] Agregar nuevos documentos a CERFS (12axis) y usarlos en el portfolio. HECHO (09 oct 2026): reporte 12axes (Technocracy, 2026-10-08) agregado a OTHER_DOCS del portfolio con PDF completo + resumen PNG, previews generados y subidos al CDN.
- [ ] Migración i18n de literales por lotes (deuda actual: ciszu 379 · ciszubot 326 ·
  antony 246 · muzicmania 937; ratchet `pnpm verify:i18n`).
  PILOTO HECHO (09 oct 2026): página de **login de ciszu** migrada completa (patrón `useDict()` +
  claves `loginPage` en `es`/`en` + `fillTemplate`; ciszu pasó de 390 → 379).
  LOTES HECHOS: login (390→379) y support (379→340). Próximos por impacto: reviews/contact/
  changelog/information de ciszu, y luego ciszubot/antony/muzicmania.

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
- [ ] Añadir VPS 24 7 AL BOT. (Tarea normal: desplegar el bot en un host 24/7 — panel gratuito
  tipo bot-hosting.net con `deploy/ciszubot-standalone.zip`, o VPS genérico; requiere cuenta y/o pago.)

**Ciszuko Antony Website:**

- [ ] Terminar idiomas en ingles UK.
- [ ] Terminar idiomas en ingles USA.
- [ ] Terminar idiomas en español LATAM.
- [ ] Terminar idiomas en español España.
- [X] Agregar nuevos documentos a cerfs (12axis) y usarlos para el portfolio. HECHO (09 oct 2026): ver entrada 12axes en certificates.ts (OTHER_DOCS) + CDN.

**MuzicMania Website:**

- [ ] Terminar idiomas en ingles UK.Explica
- [ ] Terminar idiomas en ingles USA.
- [ ] Terminar idiomas en español LATAM.
- [ ] Terminar idiomas en español España.
- [ ] Seguir con el desarollo del videojuego en su muzicmania TODO.md
