# To Do List — Ciszu Network

> Este archivo solo puede ser editado por Ciszuko Antony.

### Cambios Generales:

1. [x] #3 Plantear utilizar otro respaldador de archivos diferentes a github:
       Para no codigo y no cdn. Es decir un storage cloud privado, que pueda usarse con CLi o automatizacion con API. Como google drive, onedrive, terabox, dropbox entre otros para poder reguardar seguramente todo mi codigos exepto credenciales, mas centrado al contenido y docuemntacion que mi codigo.
       ✅ RESUELTO: elegido **Mega** (20GB gratis, cifrado E2E zero-knowledge, backend oficial de rclone + API REST + MEGAcmd). Script `scripts/backup-cloud.sh` con exclusiones (node_modules, .env\*, builds, logs) y papelera con fecha. Documentación completa, comparativa de todos los servicios (Google Drive, OneDrive, Terabox, Dropbox, pCloud, R2, B2, S3) y guía de restauración en `projects/ciszu/docs/documentation/BACKUP_SYSTEM.md`. Pendiente del usuario: crear cuenta Mega, `rclone config` y primer backup.
2. [x] #5 Crear sistema de anuncios: Google Adsense, GA4, GTM, Tag y Analytics pack completo.
    - [ ] AdSense dice “Preparando el sitio”: revisar cuenta/sitio aprobado y crear unidades de anuncio tras aprobación.
    - [ ] GA4: confirmar Realtime page_views (requiere acceso a analytics.google.com).
    - [ ] GTM: publicar/verificar contenedores (requiere acceso a tagmanager.google.com).
    - [ ] Looker Studio: conectar fuentes GA4 y crear dashboard (requiere acceso manual).

3. [x] #4 El sistema de los discleimers y ads no llegan en local ni en global. Actualmente no funciona el sistema de agregar discleimer ni ads desde la devcon, simplemente no agrega nada visualmente a pesar que desde la devcon parece que si, siempre sale el banner de esta website esta en beta, recuerda que el discleimer de devcon debe indicar que fue enviado por la devcon, ademas que independientemente de la cantidad actual almacenada el usuario siempre le debe salir. Por otro lado la opcion de ads de la devcon ni si quiera me deja crear un ad, directamente no hace nada.

    Luego de que el sistema funcione debugear con ads para arreglar el error de el logo actual de ciszugamens no es correcto, usa los colores incorrectos, debe ser el de C morado, y Z azul. Con degradados. Outline. Actualmente se usa una version azul de la C y Z blanca.

- [x] #1 Al registrarse o logearse debe haber cumplido la seguridad de cloudflare antes, y en ese instante un recaptcha, actualmente muzicmania tiene recaptcha. Siempre luego debe haber una pantalla para verificar el correo en momento de reggistrarse (pero es opcional, luego en sus configuraciones de cuenta puede terminar la verificacion) pero si el usuario tiene 2FA siempre debe haber una pantalla pidiendole una clave que empieze po C- y seguido de 6 digitos y en la mitad un espacio (C-123 434) clave oficial de ciszunetwork, temporal, expirable en 3 horas e indicar, unico por website, indicar si ya expiro y posibilidad de reenviar otro codigo con limites, al tercer limite se suspende temporalmente y localmente por que no logro iniciar sesion. (Primero arreglar todo lo de abajo)
- [x] #2 Cuando un usuario se registre luego se tiene que logear denuevo, si un usuario pierde su contra debe darle a olvide la contraseña y debe enviar una peticion, SOLAMENTE ESO, ya en su email se le enviare un link temporal de un oslo uso para recuperar su contra, con una pantalla exclusiva donde coloca su contraseña nueva y lo repite. No puede ser la antigua, luego requiere logearse. (Primero arreglar todo lo de abajo)

### Cambios por Website

**Ciszu Network Website:**

- [ ] Terminar idiomas en ingles (UK y USA) por separado.
- [ ] Terminar bien el tema claro (Todos los docks, modals o cards con fondo oscuro paran a claro, los textos oscuros o negros e iconos negros o oscuros.)

**Ciszubot Website:**

- [x] Nada.

**Ciszuko Antony Website:**

- [ ] Terminar idiomas en ingles (UK y USA) por separado.
- [ ] Terminar bien el tema claro (Todos los docks, modals o cards con fondo oscuro paran a claro, los textos oscuros o negros e iconos negros o oscuros.)
- [ ] #1 Mejorar sistema de certificados de ciszukoantony, quiero que elimines la seccion de personal & supporting documents, y lo fusiones con el catalogo de arriba. Es decir, un solo catalogo, con su barra de busqueda y filtros. De esta maenra todos los documentos certificados o masters estaran alli. Agrega mas filtros y categorias si hace falta, agrega iconos por cada categoria e iconos en los datos por ejemplo en la fecha. Todos los documentos deben tener fecha, si no inventar. Fecha completo, otros datos puede ser mi nombre oficial FRANCISCO ANTONIO GARCIA MENOLASCINA. Mueve los oficial links hacia abajo del catalogo completo, y mueve el fait use debajo de los external links. Añadi iconos al fair use y al external links. Agrega mas external links, finalmente agrega mas opciones de orden del catalogo de documentos certificados, por ejemplo un boton de ordenar ascendente o desendente y otras opciones de filtros como importancia, por A-Z o Z-A, y fecha.
      Cada archivo debe tener su preview, y cada preview debe tener un boton de descarga o ir al archivo.
      Por otro lado, agrega otras opciones de filtros como casillas, para filtrar POR WEBSITE O ORGANIZACION, por ejemplo ibm, hp live, cisco networking entre otros (completa todos e incluso los que no tengo)
      Debajo del fair use, agrega una seccion de compañias, networking o academias mencionadas en los certificados, no solo universidades, si no tambien la plataforma en cuestion, agrega muchas e incluso las que por ahora no estan. Relacionadas a externaliks, su logo y descripcion con nombre.
- [ ] #2 Mejorar sistema de certificados de ciszukoantony, thumbnails y sincronizacion automatica desde shared/docs/certificados. Actualmente los previews y thumbnails estan mal, no cargan correctamente, debemos arreglar todos estos errores:

provider.js:2 Uncaught TypeError: Cannot redefine property: ethereum
at Object.defineProperty (<anonymous></anonymous>)
at provider.js:2:663867
at provider.js:2:663912
at t.default (provider.js:2:666327)
at provider.js:2:692461
at provider.js:2:692481
at provider.js:2:692485
10686381*11037949_1788416004123-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
896_fplayersoffcial%40gmail.com-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Logros%20-%20ciscoantonygarciam-8257%20*%20Microsoft%20Learn3-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
CSS*Essentials_certificate_fplayersoffcial-gmail-com_16350af5-66c7-4813-b024-360414a2b260-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Python_Essentials_2_certificate_fplayersoffcial-gmail-com_74a5d7a2-7fae-4812-bd49-f2662bebfa63-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Digital_Awareness_certificate_fplayersoffcial-gmail-com_6022fb74-41f5-414e-83f9-f5c84dd80fa6-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Python_Essentials_1_certificate_fplayersoffcial-gmail-com_0b6aae8e-2aa8-44be-8dfd-3945f0aa4dd1-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
chatgpt_Certificado_Francisco%20Antonio%20Garcia%20Menolascina-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
iaingresosCertificado_Francisco%20Antonio%20Garcia%20Menolascina-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
373_fplayersoffcial%40gmail.com-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
edicion_Certificado_Francisco%20Antonio%20Garcia%20Menolascina-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
autotub_Certificado_Francisco%20Antonio%20Garcia%20Menolascina-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Encontrar%20Financiamiento-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
La%20planificaci%C3%B3n%20estrat%C3%A9gica%20en%20la%20era%20de%20la%20IA-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Logros%20-%20ciscoantonygarciam-8257%20*%20Microsoft%20Learn2-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Comunicaci%C3%B3n%20Empresarial-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
4080*fplayersoffcial%40gmail.com-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
107_fplayersoffcial%40gmail.com-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
508_fplayersoffcial%40gmail.com-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Logros%20-%20ciscoantonygarciam-8257%20*%20Microsoft%20Learn-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Introduction*to_Modern_AI_certificate_fplayersoffcial-gmail-com_5128c26e-8386-4d23-bef9-94035d7b0bc5-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
HTML_Essentials_certificate_fplayersoffcial-gmail-com_e218c456-06c7-4e52-8ec4-57ae4246e019-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
109_fplayersoffcial%40gmail.com-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
3296_fplayersoffcial%40gmail.com-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Certificado%20de%20finalizacion%20*%20SkillsBuild-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Logros%20-%20ciscoantonygarciam-8257%20*%20Microsoft%20Learn1-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Marketing%20de%20Medios%20Sociales-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Introducci%C3%B3n%20a%20Destrezas%20Empresariales%20Digitales-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
capcut_Certificado_Francisco%20Antonio%20Garcia%20Menolascina-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
photoshop_Certificado_Francisco%20Antonio%20Garcia%20Menolascina-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
582_fplayersoffcial%40gmail.com-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Certificado%20de%20finalizacion%20*%20mSkillsBuild-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
phyton*Certificado_Francisco%20Antonio%20Garcia%20Menolascina-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Certificado%20de%20finalizacion%20*%20SkillsBuild1-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
ingles*Certificado_Francisco%20Antonio%20Garcia%20Menolascina-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
youtube_Certificado_Francisco%20Antonio%20Garcia%20Menolascina-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
finanzaspersonales_Certificado_Francisco%20Antonio%20Garcia%20Menolascina-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
171_fplayersoffcial%40gmail.com-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
1141_fplayersoffcial%40gmail.com-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Certificado%20de%20finalizacion%20*%20SkillsBuild2-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
1852*fplayersoffcial%40gmail.com-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
3030_fplayersoffcial%40gmail.com-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
learner_transcript-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Introducci%C3%B3n%20al%20Conocimiento%20de%20la%20Ciberseguridad-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Ciencia%20y%20An%C3%A1lisis%20de%20Datos-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Expediente%20-%20CiscoAntonyGarciaM-8257%20*%20Microsoft%20Learn-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
transcript-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
EF%20SET%20Certificate-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
certificates:1 Loading the image 'https://pagead2.googlesyndication.com/pagead/gen_204?id=ach_evt&tn=DIV&cls=fixed%20z-%5B50%5D&ign=false&pw=1324&ph=690&x=1299&y=665' violates the following Content Security Policy directive: "img-src 'self' data: blob: https://obwzzmbvkrcscqwptlqo.supabase.co". The action has been blocked.
certificates:1 Loading the image 'https://pagead2.googlesyndication.com/pagead/gen_204?id=ach_evt&tn=NAV&cls=fixed%20z-50%20transition-all%20duration-500%20ease-out%20top-0%20left-0%20w-full%20bg-transparent%20mt-0&ign=false&pw=1324&ph=690&x=0&y=0' violates the following Content Security Policy directive: "img-src 'self' data: blob: https://obwzzmbvkrcscqwptlqo.supabase.co". The action has been blocked.
Tu%20perfil%20\_%2016Personalities-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
transcript_hplive-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
pagead2.googlesyndication.com/:1 Framing 'https://googleads.g.doubleclick.net/' violates the following Content Security Policy directive: "frame-src 'self' https://challenges.cloudflare.com https://www.googletagmanager.com https://obwzzmbvkrcscqwptlqo.supabase.co". The request has been blocked.

pagead2.googlesyndication.com/:1 Framing 'https://googleads.g.doubleclick.net/' violates the following Content Security Policy directive: "frame-src 'self' https://challenges.cloudflare.com https://www.googletagmanager.com https://obwzzmbvkrcscqwptlqo.supabase.co". The request has been blocked.

(index):1947 Uncaught TypeError: Cannot read properties of undefined (reading 'isFeatureEnabled')
at (index):1947:25
(index):1947 Uncaught TypeError: Cannot read properties of undefined (reading 'isFeatureEnabled')
at (index):1947:25
HTML*Essentials_certificate_fplayersoffcial-gmail-com_e218c456-06c7-4e52-8ec4-57ae4246e019-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
2950-b9eff73b2e03ee82.js:15 Connecting to 'https://ep1.adtrafficquality.google/getconfig/sodar?sv=200&tid=gda&tv=r20260902&st=env&sjk=7483590691748001' violates the following Content Security Policy directive: "connect-src 'self' https://obwzzmbvkrcscqwptlqo.supabase.co https://us.i.posthog.com https://us-assets.i.posthog.com https://static.cloudflareinsights.com https://cloudflareinsights.com https://challenges.cloudflare.com https://va.vercel-scripts.com https://*.ingest.us.sentry.io https://www.googletagmanager.com https://ciszunetwork.vercel.app https://www.google-analytics.com https://_.google-analytics.com https://analytics.google.com". The action has been blocked.
(anonymous) @ 2950-b9eff73b2e03ee82.js:15
2950-b9eff73b2e03ee82.js:7 POST https://ciszunetwork.vercel.app/api/ads/impression 500 (Internal Server Error)
(anonymous) @ 2950-b9eff73b2e03ee82.js:7
(anonymous) @ 9112-85e69906e3ca1c47.js:1
(anonymous) @ 9112-85e69906e3ca1c47.js:1
(anonymous) @ 9112-85e69906e3ca1c47.js:1
(anonymous) @ 9112-85e69906e3ca1c47.js:1
l @ 2950-b9eff73b2e03ee82.js:2
2950-b9eff73b2e03ee82.js:7 POST https://ciszunetwork.vercel.app/api/ads/impression 500 (Internal Server Error)
(anonymous) @ 2950-b9eff73b2e03ee82.js:7
(anonymous) @ 9112-85e69906e3ca1c47.js:1
(anonymous) @ 9112-85e69906e3ca1c47.js:1
(anonymous) @ 9112-85e69906e3ca1c47.js:1
(anonymous) @ 9112-85e69906e3ca1c47.js:1
l @ 2950-b9eff73b2e03ee82.js:2

**MuzicMania Website:**

- [ ] En las preferencias locales. No tiene el sistema de idiomas correcto, copiar de ciszu network arreglado. Actualmente todos los idiomas estan bloqueadas, y ademas el boton para entrar al menu de lenguaje es diferente. Debemos mejorar la apariencia y que se parezca a los de los demas.
- [ ] Terminar idiomas en ingles (UK y USA) por separado.
- [ ] Terminar bien el tema claro (Todos los docks, modals o cards con fondo oscuro paran a claro, los textos oscuros o negros e iconos negros o oscuros.)
