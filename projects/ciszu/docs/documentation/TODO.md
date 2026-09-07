# To Do List — Ciszu Network

> Este archivo solo puede ser editado por Ciszuko Antony.

### Cambios Generales:

1. [x] #5 Crear sistema de anuncios: Google Adsense, GA4, GTM, Tag y Analytics pack completo.

2.  - [x] Implementar GoogleScripts/GoogleAnalytics en las 4 webs (GTM + GA4 + AdSense auto ads).
    - [x] Crear ads.txt en public/ de las 4 webs.
    - [x] Configurar CSP para permitir scripts de AdSense/GTM.
    - [ ] AdSense dice “Preparando el sitio”: revisar cuenta/sitio aprobado y crear unidades de anuncio tras aprobación.
        - [ ] Pasos en AdSense:
            - [ ] Enviar/verificar los 4 sitios en AdSense (requiere acceso a adsense.google.com).
            - [ ] Crear unidades de anuncio: al menos 1 unidad gráfica o nativa por sitio.
            - [ ] Esperar aprobación de cuenta y sitios (puede tardar días).
            - [ ] Una vez aprobado, sustituir auto-ads por unidades específicas si se desea.
    - [ ] GA4: confirmar Realtime page_views (requiere acceso a analytics.google.com).
        - [ ] Pasos en GA4:
            - [ ] Verificar en Realtime que llegan page_views de los 4 dominios.
            - [ ] Completar las tareas pendientes de configuración (6/11 actualmente).
            - [ ] Crear filtros/audiencias si se necesitan para Looker Studio.
    - [ ] GTM: publicar/verificar contenedores (requiere acceso a tagmanager.google.com).
        - [ ] Pasos en GTM:
            - [ ] Publicar cada contenedor (GTM-N7Q8DGX5, GTM-WNDXGD63, GTM-T9LG9N6C, GTM-N2SXL2FN).
            - [ ] Verificar que los tags de GA4/AdSense se disparan correctamente en Preview.
    - [ ] Looker Studio: conectar fuentes GA4 y crear dashboard (requiere acceso manual).
        - [ ] Pasos en Looker Studio:
            - [ ] Crear dashboard conectado a las 4 propiedades GA4.
            - [ ] Agregar métricas de ads si se desea (requiere AdSense activo).
    - [ ] Verificar en producción que no hay errores 400/500 en impresiones de ads.
    - [ ] Verificar CSP: AdSense puede requerir agregar ep2.adtrafficquality.google a script-src.

3. [ ] #4 El sistema de los discleimers y ads no llegan en local ni en global. Actualmente no funciona el sistema de agregar discleimer ni ads desde la devcon, simplemente no agrega nada visualmente a pesar que desde la devcon parece que si, siempre sale el banner de esta website esta en beta, recuerda que el discleimer de devcon debe indicar que fue enviado por la devcon, ademas que independientemente de la cantidad actual almacenada el usuario siempre le debe salir. Los fallbacks nunca llegan a su cometido.
    1. [ ] Luego de que el sistema funcione debugear con ads para arreglar el error de el logo actual de ciszugamens no es correcto, usa los colores incorrectos, debe ser el de C morado, y Z azul. Con degradados. Outline. Actualmente se usa una version azul de la C y Z blanca.

- [ ] Al registrarse o logearse debe haber cumplido la seguridad de recaptcha. Siempre luego debe haber una pantalla para verificar el correo en momento de registrarse, pero si el usuario tiene 2FA siempre debe haber una pantalla pidiendole una clave que empieze po C- y seguido de 6 digitos y en la mitad un espacio (C-123 434) clave oficial de ciszunetwork, temporal, expirable en 3 horas e indicar, unico por website, indicar si ya expiro y posibilidad de reenviar otro codigo con limites, al tercer limite se suspende temporalmente y localmente por que no logro iniciar sesion.
- [ ] Los emails actualmente que se envian no estan customizados, los envia "supabase" lo cual puede confundir siempre debe ser ciszunetwork | (pagine en cuestion) ademas de un diseño interno diferente con botones y diseño. Terminos y condiciones y aclaracion de que este email no es de patrocinamiento o anuncio. Los que si son siempre se debe recalcar.
- [ ] Cuando un usuario se registre luego se tiene que logear denuevo.
- [ ] Actualmente el sistema OTP de las cuentas cuando le das a olvide la contraseña esa bien al inicio pero requiere muchas puliciones, actualmente cuando se entra a un link con token valido simplemente entra y ya, sin pantalla de recuperacion de contraseña cambiando la contraseña, con una pantalla exclusiva donde coloca su contraseña nueva y lo repite. No puede ser la antigua, luego se deslogea automaticamente para que se requiera logearse. Es decir es una sesion temporal, ademas de captar rate limits. En la pantalla de olvide contraseña si el usuario ya pidio varias veces en poco tiempo debe esperar 12 horas.
- [ ] Cuando un usuario entra a un link invalido expirado, es cierto que no se logea. Pero no existe ninguna indicacion, debes crear un modal o advertencia de que ese link estuvo invalido por X tiempo, por la razon. Ademas de recordarle al usuario en la pantalla de login de olvide contraseña que el link es 1 solo uso.
- [ ] Al cerrar sesion manual o automaticamente SIEMPRE redirigir a /index o home de la webpage.
- [ ] TODAS las paginas de registro deben tener el recaptacha al final del formulario antes del boton de registrarse, Y tambien OBLIGATORIAMENTE debe haber 2 casillas de verificacion obligatorias para aceptar los terminos y condiciones y otras cosas.
- [ ] Actualmente cuando un usuario le da al boton de "seguir usando adblocker" en la eleccion doble del modal de guard del anti adblocker, si es verdad que lo deja seguir pero no le permite al usuario scrollear o hacer click en el body, muy raro. El usuario tiene que actualizar para que funcione bien la pagina, debemos arreglar esto.

### Cambios por Website

**Ciszu Network Website:**

- [ ] Terminar idiomas en ingles (UK y USA) por separado.
- [ ] Terminar bien el tema claro (Todos los docks, modals o cards con fondo oscuro paran a claro, los textos oscuros o negros e iconos negros o oscuros.)

**Ciszubot Website:**

- [ ] Termina el sistema de quickdocks en ciszubot, parecido a las demas websites. Un modal de acceso directos. Ademas, veo que varios de las opciones/paginas de los quickdocks al entrar no tienen el quickdock en especial terminos y politicas. TODAS las paginas que tienen quickdocks como acceso rapido debe tambien tener el quickdock.
- [ ] Terminar idiomas en ingles (UK y USA) por separado.

**Ciszuko Antony Website:**

- [ ] Terminar idiomas en ingles (UK y USA) por separado.
- [ ] Terminar bien el tema claro (Todos los docks, modals o cards con fondo oscuro paran a claro, los textos oscuros o negros e iconos negros o oscuros.)
- [ ] #1 Mejorar sistema de certificados de ciszukoantony, Agrega iconos unicos por cada categoria. TODOS los documentos deben estar respaldados por mi nombre FRANCISCO ANTONIO GARCIA MENOLASCINA. Modificar el icono dal fair use debido que actualmente el icono fue generado la i del icono de informacion esta mal hecho. Actualmente los iconos y logos de los external links y las emrpesas/instituciones NO son correctas, debes indexarlo oficialmente descargandolo de forma segura, no usar emojis siempre svg, subir a CDN. El fitlrado actual esta muy feo y no personalizado (ordenamiento) mejoralo. TODOS los archivos deben tener fecha Actualmente los previews y thumbnails estan mal, no cargan correctamente, cuando el usuario entra al archivo si lo muestra pero despues de un tiempo, pero por fuera que es lo importante No muestra nada. Debemos arreglar todos estos errores:

Failed to load resource: the server responded with a status of 400 ()
EF%20SET%20Certificate-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Introduction*to_Modern_AI_certificate_fplayersoffcial-gmail-com_5128c26e-8386-4d23-bef9-94035d7b0bc5-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Python_Essentials_2_certificate_fplayersoffcial-gmail-com_74a5d7a2-7fae-4812-bd49-f2662bebfa63-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
10686381_11037949_1788416004123-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
obwzzmbvkrcscqwptlqo.supabase.co/storage/v1/object/public/ciszu-cdn/shared/docs/certificados/previews/896_fplayersoffcial%40gmail.com-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
CSS_Essentials_certificate_fplayersoffcial-gmail-com_16350af5-66c7-4813-b024-360414a2b260-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
learner_transcript-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Python_Essentials_1_certificate_fplayersoffcial-gmail-com_0b6aae8e-2aa8-44be-8dfd-3945f0aa4dd1-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Digital_Awareness_certificate_fplayersoffcial-gmail-com_6022fb74-41f5-414e-83f9-f5c84dd80fa6-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
phyton_Certificado_Francisco%20Antonio%20Garcia%20Menolascina-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
ingles_Certificado_Francisco%20Antonio%20Garcia%20Menolascina-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
photoshop_Certificado_Francisco%20Antonio%20Garcia%20Menolascina-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
capcut_Certificado_Francisco%20Antonio%20Garcia%20Menolascina-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
iaingresosCertificado_Francisco%20Antonio%20Garcia%20Menolascina-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
chatgpt_Certificado_Francisco%20Antonio%20Garcia%20Menolascina-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
provider.js:2 Uncaught TypeError: Cannot redefine property: ethereum
at Object.defineProperty (<anonymous></anonymous>)
at provider.js:2:663867
at provider.js:2:663912
at t.default (provider.js:2:666327)
at provider.js:2:692461
at provider.js:2:692481
at provider.js:2:692485
4080_fplayersoffcial%40gmail.com-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
autotub_Certificado_Francisco%20Antonio%20Garcia%20Menolascina-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
edicion_Certificado_Francisco%20Antonio%20Garcia%20Menolascina-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
youtube_Certificado_Francisco%20Antonio%20Garcia%20Menolascina-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
finanzaspersonales_Certificado_Francisco%20Antonio%20Garcia%20Menolascina-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
107_fplayersoffcial%40gmail.com-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
508_fplayersoffcial%40gmail.com-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
373_fplayersoffcial%40gmail.com-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
3296_fplayersoffcial%40gmail.com-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
3030_fplayersoffcial%40gmail.com-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
582_fplayersoffcial%40gmail.com-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
1141_fplayersoffcial%40gmail.com-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
1852_fplayersoffcial%40gmail.com-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
171_fplayersoffcial%40gmail.com-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
109_fplayersoffcial%40gmail.com-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Marketing%20de%20Medios%20Sociales-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
La%20planificaci%C3%B3n%20estrat%C3%A9gica%20en%20la%20era%20de%20la%20IA-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Comunicaci%C3%B3n%20Empresarial-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Encontrar%20Financiamiento-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Introducci%C3%B3n%20al%20Conocimiento%20de%20la%20Ciberseguridad-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Certificado%20de%20finalizacion%20*%20SkillsBuild-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Introducci%C3%B3n%20a%20Destrezas%20Empresariales%20Digitales-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
transcript-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Certificado%20de%20finalizacion%20*%20SkillsBuild1-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Certificado%20de%20finalizacion%20*%20SkillsBuild2-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
32Connecting to '<URL></url>' violates the following Content Security Policy directive: "connect-src 'self' <URL></url> <URL></url> <URL></url> <URL></url> <URL></url> <URL></url> <URL></url> <URL></url> <URL></url> <URL></url> <URL></url> <URL></url> <URL></url> <URL></url>". The action has been blocked.
Tu%20perfil%20*%2016Personalities-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Certificado%20de%20finalizacion%20*%20mSkillsBuild-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Expediente%20-%20CiscoAntonyGarciaM-8257%20*%20Microsoft%20Learn-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Logros%20-%20ciscoantonygarciam-8257%20*%20Microsoft%20Learn-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Logros%20-%20ciscoantonygarciam-8257%20*%20Microsoft%20Learn3-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Logros%20-%20ciscoantonygarciam-8257%20*%20Microsoft%20Learn2-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Logros%20-%20ciscoantonygarciam-8257%20*%20Microsoft%20Learn1-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
transcript_hplive-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Ciencia%20y%20An%C3%A1lisis%20de%20Datos-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
obwzzmbvkrcscqwptlqo.supabase.co/storage/v1/object/public/ciszu-cdn/shared/docs/certificados/previews/896_fplayersoffcial%40gmail.com-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
10686381_11037949_1788416004123-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Python_Essentials_2_certificate_fplayersoffcial-gmail-com_74a5d7a2-7fae-4812-bd49-f2662bebfa63-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
EF%20SET%20Certificate-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
learner_transcript-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
CSS_Essentials_certificate_fplayersoffcial-gmail-com_16350af5-66c7-4813-b024-360414a2b260-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
HTML_Essentials_certificate_fplayersoffcial-gmail-com_e218c456-06c7-4e52-8ec4-57ae4246e019-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Introduction_to_Modern_AI_certificate_fplayersoffcial-gmail-com_5128c26e-8386-4d23-bef9-94035d7b0bc5-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
chatgpt_Certificado_Francisco%20Antonio%20Garcia%20Menolascina-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Digital_Awareness_certificate_fplayersoffcial-gmail-com_6022fb74-41f5-414e-83f9-f5c84dd80fa6-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
iaingresosCertificado_Francisco%20Antonio%20Garcia%20Menolascina-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
phyton_Certificado_Francisco%20Antonio%20Garcia%20Menolascina-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Python_Essentials_1_certificate_fplayersoffcial-gmail-com_0b6aae8e-2aa8-44be-8dfd-3945f0aa4dd1-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
photoshop_Certificado_Francisco%20Antonio%20Garcia%20Menolascina-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
ingles_Certificado_Francisco%20Antonio%20Garcia%20Menolascina-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
youtube_Certificado_Francisco%20Antonio%20Garcia%20Menolascina-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
edicion_Certificado_Francisco%20Antonio%20Garcia%20Menolascina-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
autotub_Certificado_Francisco%20Antonio%20Garcia%20Menolascina-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
capcut_Certificado_Francisco%20Antonio%20Garcia%20Menolascina-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
4080_fplayersoffcial%40gmail.com-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
finanzaspersonales_Certificado_Francisco%20Antonio%20Garcia%20Menolascina-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
107_fplayersoffcial%40gmail.com-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
11certificates:1 Uncaught (in promise) Error: Could not establish connection. Receiving end does not exist.
impression:1 Failed to load resource: the server responded with a status of 500 ()
envelope/?sentry_version=7&sentry_key=ce5ec67b5591c63dc7803229bbdcfc52&sentry_client=sentry.javascr…:1 Failed to load resource: net::ERR_CONNECTION_CLOSED
envelope/?sentry_version=7&sentry_key=ce5ec67b5591c63dc7803229bbdcfc52&sentry_client=sentry.javascr…:1 Failed to load resource: net::ERR_CONNECTION_CLOSED
global_announcement_settings?id=eq.1&select=enabled:1 Failed to load resource: net::ERR_CONNECTION_CLOSED
global_disclaimer_settings?id=eq.1&select=enabled:1 Failed to load resource: net::ERR_CONNECTION_CLOSED
impression:1 Failed to load resource: the server responded with a status of 500 ()
envelope/?sentry_version=7&sentry_key=ce5ec67b5591c63dc7803229bbdcfc52&sentry_client=sentry.javascr…:1 Failed to load resource: net::ERR_CONNECTION_CLOSED
content.js:18 Uncaught (in promise) TypeError: Cannot read properties of undefined (reading 'useCache')
at me (content.js:18:84376)
polyfill.js:496 Uncaught (in promise) Error: Could not establish connection. Receiving end does not exist.
at wrappedSendMessageCallback (polyfill.js:496:18)
impression:1 Failed to load resource: the server responded with a status of 500 ()
41certificates:1 Uncaught (in promise) Error: Could not establish connection. Receiving end does not exist.
zrt_lookup_fy2021.html:1 Uncaught (in promise)
polyfill.js:496 Uncaught (in promise)
polyfill.js:496 Uncaught (in promise)
2inpage.js:7 Uncaught (in promise)
3zrt_lookup_fy2021.html:1 Uncaught (in promise)
impression:1 Failed to load resource: the server responded with a status of 500 ()
show_ads_impl_fy2021.js:94 Loading the script 'https://ep2.adtrafficquality.google/sodar/sodar2.js' violates the following Content Security Policy directive: "script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com https://static.cloudflareinsights.com https://us.i.posthog.com https://us-assets.i.posthog.com https://va.vercel-scripts.com https://www.googletagmanager.com https://pagead2.googlesyndication.com https://cdnjs.cloudflare.com". Note that 'script-src-elem' was not explicitly set, so 'script-src' is used as a fallback. The action has been blocked.
(anonymous) @ show_ads_impl_fy2021.js:94
show_ads_impl_fy2021.js:94 Uncaught (in promise) undefined
impression:1 Failed to load resource: the server responded with a status of 500 ()
cdn-cgi/challenge-platform/h/g/c/a36abf8869ae0899:1 Failed to load resource: the server responded with a status of 404 ()
Python_Essentials_2_certificate_fplayersoffcial-gmail-com_74a5d7a2-7fae-4812-bd49-f2662bebfa63-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
EF%20SET%20Certificate-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
obwzzmbvkrcscqwptlqo.supabase.co/storage/v1/object/public/ciszu-cdn/shared/docs/certificados/previews/896_fplayersoffcial%40gmail.com-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
10686381_11037949_1788416004123-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
learner_transcript-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
CSS_Essentials_certificate_fplayersoffcial-gmail-com_16350af5-66c7-4813-b024-360414a2b260-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Introduction_to_Modern_AI_certificate_fplayersoffcial-gmail-com_5128c26e-8386-4d23-bef9-94035d7b0bc5-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
HTML_Essentials_certificate_fplayersoffcial-gmail-com_e218c456-06c7-4e52-8ec4-57ae4246e019-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Python_Essentials_1_certificate_fplayersoffcial-gmail-com_0b6aae8e-2aa8-44be-8dfd-3945f0aa4dd1-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Digital_Awareness_certificate_fplayersoffcial-gmail-com_6022fb74-41f5-414e-83f9-f5c84dd80fa6-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
phyton_Certificado_Francisco%20Antonio%20Garcia%20Menolascina-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
iaingresosCertificado_Francisco%20Antonio%20Garcia%20Menolascina-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
chatgpt_Certificado_Francisco%20Antonio%20Garcia%20Menolascina-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
edicion_Certificado_Francisco%20Antonio%20Garcia%20Menolascina-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
ingles_Certificado_Francisco%20Antonio%20Garcia%20Menolascina-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
photoshop_Certificado_Francisco%20Antonio%20Garcia%20Menolascina-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
capcut_Certificado_Francisco%20Antonio%20Garcia%20Menolascina-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
youtube_Certificado_Francisco%20Antonio%20Garcia%20Menolascina-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
autotub_Certificado_Francisco%20Antonio%20Garcia%20Menolascina-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
finanzaspersonales_Certificado_Francisco%20Antonio%20Garcia%20Menolascina-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
373_fplayersoffcial%40gmail.com-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
4080_fplayersoffcial%40gmail.com-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
1141_fplayersoffcial%40gmail.com-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
3296_fplayersoffcial%40gmail.com-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
508_fplayersoffcial%40gmail.com-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
107_fplayersoffcial%40gmail.com-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
3030_fplayersoffcial%40gmail.com-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
171_fplayersoffcial%40gmail.com-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
1852_fplayersoffcial%40gmail.com-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Comunicaci%C3%B3n%20Empresarial-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
582_fplayersoffcial%40gmail.com-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Encontrar%20Financiamiento-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Marketing%20de%20Medios%20Sociales-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
La%20planificaci%C3%B3n%20estrat%C3%A9gica%20en%20la%20era%20de%20la%20IA-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
109_fplayersoffcial%40gmail.com-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Introducci%C3%B3n%20al%20Conocimiento%20de%20la%20Ciberseguridad-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Introducci%C3%B3n%20a%20Destrezas%20Empresariales%20Digitales-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Certificado%20de%20finalizacion%20*%20SkillsBuild2-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Certificado%20de%20finalizacion%20*%20SkillsBuild-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
transcript-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Tu%20perfil%20*%2016Personalities-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Certificado%20de%20finalizacion%20*%20SkillsBuild1-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Certificado%20de%20finalizacion%20*%20mSkillsBuild-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Logros%20-%20ciscoantonygarciam-8257%20*%20Microsoft%20Learn-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Logros%20-%20ciscoantonygarciam-8257%20*%20Microsoft%20Learn1-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Logros%20-%20ciscoantonygarciam-8257%20*%20Microsoft%20Learn3-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Logros%20-%20ciscoantonygarciam-8257%20*%20Microsoft%20Learn2-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Expediente%20-%20CiscoAntonyGarciaM-8257%20*%20Microsoft%20Learn-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
transcript_hplive-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Ciencia%20y%20An%C3%A1lisis%20de%20Datos-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
4certificates:1 Uncaught (in promise) Error: Could not establish connection. Receiving end does not exist.
Logros%20-%20ciscoantonygarciam-8257%20*%20Microsoft%20Learn2-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
polyfill.js:496 Uncaught (in promise) Error: Could not establish connection. Receiving end does not exist.
at wrappedSendMessageCallback (polyfill.js:496:18)
polyfill.js:496 Uncaught (in promise)
polyfill.js:496 Uncaught (in promise)
obwzzmbvkrcscqwptlqo.supabase.co/storage/v1/object/public/ciszu-cdn/shared/docs/certificados/previews/896*fplayersoffcial%40gmail.com-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
EF%20SET%20Certificate-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
HTML_Essentials_certificate_fplayersoffcial-gmail-com_e218c456-06c7-4e52-8ec4-57ae4246e019-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Python_Essentials_1_certificate_fplayersoffcial-gmail-com_0b6aae8e-2aa8-44be-8dfd-3945f0aa4dd1-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Introduction_to_Modern_AI_certificate_fplayersoffcial-gmail-com_5128c26e-8386-4d23-bef9-94035d7b0bc5-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
learner_transcript-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Python_Essentials_2_certificate_fplayersoffcial-gmail-com_74a5d7a2-7fae-4812-bd49-f2662bebfa63-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Digital_Awareness_certificate_fplayersoffcial-gmail-com_6022fb74-41f5-414e-83f9-f5c84dd80fa6-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
CSS_Essentials_certificate_fplayersoffcial-gmail-com_16350af5-66c7-4813-b024-360414a2b260-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
EF%20SET%20Certificate-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
obwzzmbvkrcscqwptlqo.supabase.co/storage/v1/object/public/ciszu-cdn/shared/docs/certificados/previews/896_fplayersoffcial%40gmail.com-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
phyton_Certificado_Francisco%20Antonio%20Garcia%20Menolascina-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
iaingresosCertificado_Francisco%20Antonio%20Garcia%20Menolascina-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
photoshop_Certificado_Francisco%20Antonio%20Garcia%20Menolascina-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
chatgpt_Certificado_Francisco%20Antonio%20Garcia%20Menolascina-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
ingles_Certificado_Francisco%20Antonio%20Garcia%20Menolascina-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
10686381_11037949_1788416004123-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
capcut_Certificado_Francisco%20Antonio%20Garcia%20Menolascina-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
edicion_Certificado_Francisco%20Antonio%20Garcia%20Menolascina-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
4080_fplayersoffcial%40gmail.com-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
youtube_Certificado_Francisco%20Antonio%20Garcia%20Menolascina-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
autotub_Certificado_Francisco%20Antonio%20Garcia%20Menolascina-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
finanzaspersonales_Certificado_Francisco%20Antonio%20Garcia%20Menolascina-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
508_fplayersoffcial%40gmail.com-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
373_fplayersoffcial%40gmail.com-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
107_fplayersoffcial%40gmail.com-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
1141_fplayersoffcial%40gmail.com-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
1852_fplayersoffcial%40gmail.com-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
3296_fplayersoffcial%40gmail.com-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
171_fplayersoffcial%40gmail.com-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Comunicaci%C3%B3n%20Empresarial-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
3030_fplayersoffcial%40gmail.com-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
582_fplayersoffcial%40gmail.com-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Marketing%20de%20Medios%20Sociales-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
109_fplayersoffcial%40gmail.com-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Encontrar%20Financiamiento-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Introducci%C3%B3n%20al%20Conocimiento%20de%20la%20Ciberseguridad-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Introducci%C3%B3n%20a%20Destrezas%20Empresariales%20Digitales-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
La%20planificaci%C3%B3n%20estrat%C3%A9gica%20en%20la%20era%20de%20la%20IA-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
transcript-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Certificado%20de%20finalizacion%20*%20SkillsBuild-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Certificado%20de%20finalizacion%20*%20SkillsBuild2-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Certificado%20de%20finalizacion%20*%20SkillsBuild1-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Certificado%20de%20finalizacion%20*%20mSkillsBuild-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Logros%20-%20ciscoantonygarciam-8257%20*%20Microsoft%20Learn-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Logros%20-%20ciscoantonygarciam-8257%20*%20Microsoft%20Learn2-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Tu%20perfil%20*%2016Personalities-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Logros%20-%20ciscoantonygarciam-8257%20*%20Microsoft%20Learn1-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
EF%20SET%20Certificate-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
obwzzmbvkrcscqwptlqo.supabase.co/storage/v1/object/public/ciszu-cdn/shared/docs/certificados/previews/896_fplayersoffcial%40gmail.com-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
10686381_11037949_1788416004123-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Expediente%20-%20CiscoAntonyGarciaM-8257%20*%20Microsoft%20Learn-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
transcript*hplive-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Logros%20-%20ciscoantonygarciam-8257%20*%20Microsoft%20Learn3-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Ciencia%20y%20An%C3%A1lisis%20de%20Datos-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Python*Essentials_2_certificate_fplayersoffcial-gmail-com_74a5d7a2-7fae-4812-bd49-f2662bebfa63-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
learner_transcript-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
HTML_Essentials_certificate_fplayersoffcial-gmail-com_e218c456-06c7-4e52-8ec4-57ae4246e019-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
CSS_Essentials_certificate_fplayersoffcial-gmail-com_16350af5-66c7-4813-b024-360414a2b260-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Introduction_to_Modern_AI_certificate_fplayersoffcial-gmail-com_5128c26e-8386-4d23-bef9-94035d7b0bc5-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Python_Essentials_1_certificate_fplayersoffcial-gmail-com_0b6aae8e-2aa8-44be-8dfd-3945f0aa4dd1-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Digital_Awareness_certificate_fplayersoffcial-gmail-com_6022fb74-41f5-414e-83f9-f5c84dd80fa6-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
chatgpt_Certificado_Francisco%20Antonio%20Garcia%20Menolascina-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
iaingresosCertificado_Francisco%20Antonio%20Garcia%20Menolascina-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
photoshop_Certificado_Francisco%20Antonio%20Garcia%20Menolascina-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
4080_fplayersoffcial%40gmail.com-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
phyton_Certificado_Francisco%20Antonio%20Garcia%20Menolascina-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
ingles_Certificado_Francisco%20Antonio%20Garcia%20Menolascina-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
capcut_Certificado_Francisco%20Antonio%20Garcia%20Menolascina-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
youtube_Certificado_Francisco%20Antonio%20Garcia%20Menolascina-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
edicion_Certificado_Francisco%20Antonio%20Garcia%20Menolascina-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
CSS_Essentials_certificate_fplayersoffcial-gmail-com_16350af5-66c7-4813-b024-360414a2b260-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
HTML_Essentials_certificate_fplayersoffcial-gmail-com_e218c456-06c7-4e52-8ec4-57ae4246e019-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Python_Essentials_2_certificate_fplayersoffcial-gmail-com_74a5d7a2-7fae-4812-bd49-f2662bebfa63-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Python_Essentials_1_certificate_fplayersoffcial-gmail-com_0b6aae8e-2aa8-44be-8dfd-3945f0aa4dd1-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Introduction_to_Modern_AI_certificate_fplayersoffcial-gmail-com_5128c26e-8386-4d23-bef9-94035d7b0bc5-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
learner_transcript-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
chatgpt_Certificado_Francisco%20Antonio%20Garcia%20Menolascina-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Digital_Awareness_certificate_fplayersoffcial-gmail-com_6022fb74-41f5-414e-83f9-f5c84dd80fa6-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
phyton_Certificado_Francisco%20Antonio%20Garcia%20Menolascina-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
ingles_Certificado_Francisco%20Antonio%20Garcia%20Menolascina-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
photoshop_Certificado_Francisco%20Antonio%20Garcia%20Menolascina-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
autotub_Certificado_Francisco%20Antonio%20Garcia%20Menolascina-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
iaingresosCertificado_Francisco%20Antonio%20Garcia%20Menolascina-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
4080_fplayersoffcial%40gmail.com-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
finanzaspersonales_Certificado_Francisco%20Antonio%20Garcia%20Menolascina-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
capcut_Certificado_Francisco%20Antonio%20Garcia%20Menolascina-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
edicion_Certificado_Francisco%20Antonio%20Garcia%20Menolascina-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
youtube_Certificado_Francisco%20Antonio%20Garcia%20Menolascina-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
508_fplayersoffcial%40gmail.com-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
373_fplayersoffcial%40gmail.com-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
171_fplayersoffcial%40gmail.com-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
107_fplayersoffcial%40gmail.com-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
3296_fplayersoffcial%40gmail.com-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
1141_fplayersoffcial%40gmail.com-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
582_fplayersoffcial%40gmail.com-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
3030_fplayersoffcial%40gmail.com-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
1852_fplayersoffcial%40gmail.com-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Comunicaci%C3%B3n%20Empresarial-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Encontrar%20Financiamiento-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Marketing%20de%20Medios%20Sociales-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
La%20planificaci%C3%B3n%20estrat%C3%A9gica%20en%20la%20era%20de%20la%20IA-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
109_fplayersoffcial%40gmail.com-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
transcript-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Introducci%C3%B3n%20a%20Destrezas%20Empresariales%20Digitales-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Introducci%C3%B3n%20al%20Conocimiento%20de%20la%20Ciberseguridad-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Certificado%20de%20finalizacion%20*%20SkillsBuild-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Certificado%20de%20finalizacion%20*%20SkillsBuild1-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Certificado%20de%20finalizacion%20*%20SkillsBuild2-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Certificado%20de%20finalizacion%20*%20mSkillsBuild-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Logros%20-%20ciscoantonygarciam-8257%20*%20Microsoft%20Learn-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Tu%20perfil%20*%2016Personalities-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Logros%20-%20ciscoantonygarciam-8257%20*%20Microsoft%20Learn1-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Expediente%20-%20CiscoAntonyGarciaM-8257%20*%20Microsoft%20Learn-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Logros%20-%20ciscoantonygarciam-8257%20*%20Microsoft%20Learn2-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
transcript*hplive-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Ciencia%20y%20An%C3%A1lisis%20de%20Datos-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Logros%20-%20ciscoantonygarciam-8257%20*%20Microsoft%20Learn3-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
obwzzmbvkrcscqwptlqo.supabase.co/storage/v1/object/public/ciszu-cdn/shared/docs/certificados/previews/896_fplayersoffcial%40gmail.com-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
obwzzmbvkrcscqwptlqo.supabase.co/storage/v1/object/public/ciszu-cdn/shared/docs/certificados/previews/896_fplayersoffcial%40gmail.com-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
impression:1 Failed to load resource: the server responded with a status of 500 ()
impression:1 Failed to load resource: the server responded with a status of 500 ()
impression:1 Failed to load resource: the server responded with a status of 500 ()
impression:1 Failed to load resource: the server responded with a status of 500 ()

**MuzicMania Website:**

- [ ] Terminar idiomas en ingles (UK y USA) por separado.
- [ ] Terminar bien el tema claro (Todos los docks, modals o cards con fondo oscuro paran a claro, los textos oscuros o negros e iconos negros o oscuros)
