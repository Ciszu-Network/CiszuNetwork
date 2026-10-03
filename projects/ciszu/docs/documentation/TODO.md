# To Do List — Ciszu Network

### Cambios Generales:

#5 Crear sistema de anuncios: Google Adsense, GA4, GTM, Tag y Analytics pack completo.

- [X] Implementar GoogleScripts/GoogleAnalytics en las 4 webs (GTM + GA4 + AdSense auto ads).
- [X] Crear ads.txt en public/ de las 4 webs.
- [X] Configurar CSP para permitir scripts de AdSense/GTM.
- [X] Actualizar IDs de GTM en Vercel: ciszunetwork GT-KV5477MC, ciszubot GT-WF8B9HT8, ciszukoantony GT-TXZGRRF9, muzicmania GT-K4Z6G8LS.
- [X] Ajustar CSP en packages/utils/src/csp.ts para GA4/AdSense (img-src y connect-src extras).
- [ ] AdSense: enviar/verificar los 4 sitios, esperar aprobación y crear unidades de anuncio por sitio.
- [ ] GA4: confirmar Realtime page_views en los 4 dominios y completar tareas pendientes de configuración.
- [ ] GTM: publicar/verificar contenedores y confirmar que los tags de GA4/AdSense se disparan en Preview.
- [ ] Looker Studio: conectar fuentes GA4 y crear dashboard.
- [ ] Verificar en producción que no hay errores 400/500 en impresiones de ads ni bloqueos de CSP.
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
- [ ] #6 Integrar Google Cloud Console, gracias a recaptcha integre los 4 projectos creados pero aun no hay funcionalidad exacta, talvez podriamos investigar para que pueda servir.
- [X] Se debe crear un metodo de cierre de sesion remoto utilizado para cerrar sesion a cierta persona, este metodo solo lo podran ejecutar los moderadores, admins y owners. Con el fin de cerrar alguna sesion incluso de una cuenta por cada rango, es decir un mod no puede cerrar la sesion de un admin. Esto por seguridad de hackeos a cuentas. Esta opcion debe estar tanto para la GUI de cada website segun el debug y cuenta, y para la devconsole.
- [X] Se debe crear un modal cuando una cuenta es baneada, el usuario automaticamente se redirecionara asu profile y aparecera un modal de su cuenta fue baneada e informacion del baneo. Razon fecha provocante etc. Lo mismo con los mutes.

### Cambios por Website

**Ciszu Network Website:**

- [ ] Terminar idiomas en ingles UK.
- [ ] Terminar idiomas en ingles USA.
- [ ] Terminar paginas de proyectos y por cada proyecto, crearlos si hace falta e indexarlos.
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
- [ ] Terminar paginas de curriculum, crearlos si hace falta e indexarlos.
- [ ] Terminar paginas de proyectos y por cada proyecto, crearlos si hace falta e indexarlos.
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

### Google Cloud — pasos manuales (02 oct 2026)

Todo lo automatizable de Google Cloud quedó hecho (ver `GOOGLE_SYSTEM.md` §10 y
`AUTH_HARDENING_SYSTEM.md` §3): reCAPTCHA Enterprise activo en las 4 webs (keys INVISIBLE +
API keys restringidas, sin secretos), datasets `analytics` creados en los 4 proyectos,
APIs habilitadas. Lo siguiente requiere acciones tuyas en la consola (no las puede hacer
el agente):

- [ ] **Enlace GA4 → BigQuery** (por cada propiedad GA4): GA4 → Admin → Propiedad → Enlaces
      de BigQuery → Vincular → elegir el proyecto GCP (`ciszunetwork`, `ciszubot`,
      `ciszukoantony`, `muzicmania-1779157973357`) y el dataset **`analytics`** (ya creado) →
      flujo *Transmitir*. Los datos llegan en 24-48h.
- [ ] **Looker Studio**: conectar BigQuery → crear dashboard (gratis) con las fuentes GA4.
- [ ] **Decidir sobre uptime checks**: los de Cloud Monitoring requieren **billing activado**
      (proyectos sin facturación). Mientras tanto seguimos con UptimeRobot (activo). Si algún
      día activas billing, el workflow `gcp-infra.yml` (GitHub Actions, manual) los crea solo.
- [ ] **Borrar el proyecto huérfano `utilitarian-utility-94jp1`** (sin nombre, con la cuenta de
      billing `01400A-193CC1-29BA63` ligada): el agente no tiene rol `owner`/deleter en él
      (API da 404). Bórralo desde la consola → IAM → *seleccionar proyecto* → *Eliminar*
      (solo tú tienes los permisos de org). La cuenta de billing queda intacta.
- [ ] **reCAPTCHA clásico**: las claves v2/v3 clásicas de las webs quedaron sin uso tras la
      migración a Enterprise. Puedes eliminarlas en `https://www.google.com/recaptcha/admin`
      (no afecta a Enterprise), o mantenerlas como respaldo.
- [ ] **(Opcional) Workload Identity Federation**: el workflow `gcp-infra.yml` quedó preparado
      para operar GCP desde CI sin claves. Si quieres que GitHub Actions haga operaciones de
      GCP (uptime checks, etc.), hay que crear el pool/provider OIDC en la consola
      (ver comentarios del propio workflow). Hoy se opera con `gcloud auth application-default`
      desde este PC, que ya funciona.
- [ ] **(Opcional) CiszuAI**: el proyecto `gen-lang-client-0885445248` está documentado en
      `projects/ciszuai/` (capa de IA Gemini). Decidir si se le añade BigQuery/datasets o se
      queda solo con Generative Language.
