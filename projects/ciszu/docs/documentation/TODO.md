# To Do List — Ciszu Network

> Este archivo solo puede ser editado por Ciszuko Antony.

### Cambios Generales:

1. [x] #5 Crear sistema de anuncios: Google Adsense, GA4, GTM, Tag y Analytics pack completo.
   - [x] Implementar GoogleScripts/GoogleAnalytics en las 4 webs (GTM + GA4 + AdSense auto ads).
   - [x] Crear ads.txt en public/ de las 4 webs.
   - [x] Configurar CSP para permitir scripts de AdSense/GTM.
   - [x] Actualizar IDs de GTM en Vercel: ciszunetwork GT-KV5477MC, ciszubot GT-WF8B9HT8, ciszukoantony GT-TXZGRRF9, muzicmania GT-K4Z6G8LS.
   - [x] Ajustar CSP en packages/utils/src/csp.ts para GA4/AdSense (img-src y connect-src extras).
   - [ ] AdSense: enviar/verificar los 4 sitios, esperar aprobación y crear unidades de anuncio por sitio.
   - [ ] GA4: confirmar Realtime page_views en los 4 dominios y completar tareas pendientes de configuración.
   - [ ] GTM: publicar/verificar contenedores y confirmar que los tags de GA4/AdSense se disparan en Preview.
   - [ ] Looker Studio: conectar fuentes GA4 y crear dashboard.
   - [ ] Verificar en producción que no hay errores 400/500 en impresiones de ads ni bloqueos de CSP.

3. [ ] #4 El sistema de ads no llegan en local ni en global y no funciona desde la devcon, simplemente no agrega nada visualmente a pesar que desde la devcon parece que si. Actualmente el sistema de ads el fallback de pendientes siempre dice timeout.
    1. [ ] Algunas opciones como desactivar anuncios temporalmente no funciona, ademas de que no esta muy claro exactmanete la funcion de cada opcion. Quitar anuncio deberia ser limpiar ads actuales, reactivar anuncios debe ser una opcion no 2, y desactivar anuncios debe ser 1 opcion. Resumen debe estar despues de enviar. Pule las opciones. Ademas las reactivaciones y desactivaciones tiene que ser por websites.
    2. [ ] Luego de que el sistema funcione debugear con ads para arreglar el error de el logo actual de ciszugamens no es correcto, usa los colores incorrectos, debe ser el de C morado, y Z azul. Con degradados. Outline. Actualmente se usa una version azul de la C y Z blanca.
4. [ ] Actualmente el sistema de discleimers tiene algunos errores no criticos pero que debemos arreglar,
    1. [ ] La opcion de "discleimer beta" eliminalo, no tiene sentido o renombralo a basic o info2.
    2. [ ] Actualmente en local o global, cuando un usuario cierra el discleimer usando la x (discleimer opcional) y cambia de pagina o espera un rato vuelve a parecer el discleimer, esto es un problema, si el usuario lo cierra no vuelve a aparecer, parecido al discleimer de beta testing default.
    3. [ ] Debe exister una seccion para eleguir si el discleimer debe tener la etiqueta de devcon o no. Para que en un futuro se use con fines no de prueba de devcon.
    4. [ ] Debe existir una seccion para que el discleimer soporte botones con acciones simples (abrir una pagina por ejemplo), es decir, un boton default, donde al darle click redireccione a algun lado o que cierre el propi discleimer estilo, "Estamos trabajando..." y el boton diga (OK) y que al darle click simplemente cierre el discleimer como si fuera un cierre de X, de esta manera podemos combinar con X, sin X, sin botones o con botones y botones de diferentes textos con diferentes acciones.
    5. [ ] Actualmente el contador de tiempo periodico de un discleiemr temporal con fecha definida se muestra con intervalos de segundos. Lo cual esta muy mal, es mucho mejor que siga un formato mas especifico y visualmente profesional y agradable, primero mostraras la fecha de inicio - fecha de culminacion, y luego mostraras un contador separados por ":" estilo reloj descendente. y por cada numero dentro de un ":" agregar que tipo de tiempo es, si segundos, minutos o horas, semanas, años. Por ejemplo: 12 de Mayo del 2025 - 28 de Mayo del 2025 0y:17d:3h:12m:43s (Esto es un ejemplo, los textos deben ser traducibles y debe estar colorados para mejor visualidad tecnica)

- [ ] Un problema grave es el orden actual del devcon, existen varias opciones de discleimers y advisor fuera de su seccion. Necesito que, al iniciar el devcon. Las opciones de anuncios se llame ADS, luego los demas sea Discleimers, Advisor. Nada de opcion secundarias, ahora bien. Al entrar en cada uno debe siempre existir tanto ads, discleimers y advisors. 3 opciones, global, local e hibrido. De esta manera las opciones se dividiran en local para mi pc localhost, global para sitios webs y hibrido es en ambas. Debe funcionar y elimina opciones internas para global o local, ya que sera respondido antes. Por otro lado las opciones de kill swtich agregala tambien dentro de la seccion de cada estas 3 opciones.
- [ ] Al registrarse o logearse debe haber cumplido la seguridad de recaptcha. Siempre luego debe haber una pantalla para verificar el correo en momento de registrarse, pero si el usuario tiene 2FA siempre debe haber una pantalla pidiendole una clave que empieze po C- y seguido de 6 digitos y en la mitad un espacio (C-123 434) clave oficial de ciszunetwork, temporal, expirable en 3 horas e indicar, unico por website, indicar si ya expiro y posibilidad de reenviar otro codigo con limites, al tercer limite se suspende temporalmente y localmente por que no logro iniciar sesion.
- [ ] Los emails actualmente que se envian no estan customizados, los envia "supabase" lo cual puede confundir siempre debe ser ciszunetwork | (pagine en cuestion) ademas de un diseño interno diferente con botones y diseño. Terminos y condiciones y aclaracion de que este email no es de patrocinamiento o anuncio. Los que si son siempre se debe recalcar.
- [ ] Cuando un usuario se registre luego se tiene que logear denuevo.
- [ ] Actualmente el sistema OTP de las cuentas cuando le das a olvide la contraseña esa bien al inicio pero requiere muchas puliciones, actualmente cuando se entra a un link con token valido simplemente entra y ya, sin pantalla de recuperacion de contraseña cambiando la contraseña, con una pantalla exclusiva donde coloca su contraseña nueva y lo repite. No puede ser la antigua, luego se deslogea automaticamente para que se requiera logearse. Es decir es una sesion temporal, ademas de captar rate limits. En la pantalla de olvide contraseña si el usuario ya pidio varias veces en poco tiempo debe esperar 12 horas.
- [ ] Cuando un usuario entra a un link invalido expirado, es cierto que no se logea. Pero no existe ninguna indicacion, debes crear un modal o advertencia de que ese link estuvo invalido por X tiempo, por la razon. Ademas de recordarle al usuario en la pantalla de login de olvide contraseña que el link es 1 solo uso.

    Actualmente al intentar enrtar a un enalce valido si me salto un panel para camibar mi contraseña PERO de un momento a otra lo cambio a invalido por alguna razon, ademas. El icono de error de enlace invalida esta mal, debe ser una advertencia.

- [ ] Al cerrar sesion manual o automaticamente SIEMPRE redirigir a /index o home de la webpage. Ademas, si el usuario entra a un enlace expiraodo o no invalido nunca se debe iniciarse sesion, es decir, primero evalua el enlace y verificalo en caso de que este bien si inicia sesion temporalmente hasta que cambie su contraseña pero si sale da error.
- [ ] TODAS las paginas de registro deben tener el recaptacha al final del formulario antes del boton de registrarse, Y tambien OBLIGATORIAMENTE debe haber 2 casillas de verificacion obligatorias para aceptar los terminos y condiciones y otras cosas. Actualmente no se muestra en ninguna pagina el recaptcha debes arreglar esto.
- [ ] Actualmente cuando un usuario le da al boton de "seguir usando adblocker" en la eleccion doble del modal de guard del anti adblocker, si es verdad que lo deja seguir pero no le permite al usuario scrollear o hacer click en el body, muy raro. El usuario tiene que actualizar para que funcione bien la pagina, debemos arreglar esto.

### Cambios por Website

**Ciszu Network Website:**

- [ ] Terminar idiomas en ingles (UK y USA) por separado.
- [ ] Terminar bien el tema claro (Todos los docks, modals o cards con fondo oscuro paran a claro, los textos oscuros o negros e iconos negros o oscuros.)

**Ciszubot Website:**

- [ ] Terminar idiomas en ingles (UK y USA) por separado.

**Ciszuko Antony Website:**

- [ ] Terminar idiomas en ingles (UK y USA) por separado.
- [ ] Terminar bien el tema claro (Todos los docks, modals o cards con fondo oscuro paran a claro, los textos oscuros o negros e iconos negros o oscuros.)
- [ ] Los botones de "view" de cada archivo de la pagina de certificados esta usando un icono erroeno generado por ia o bugeado visualmente, debes ser un ojo correctamente.
- [ ] #1 Mejorar sistema de certificados de ciszukoantony, Agrega iconos unicos por cada categoria. TODOS los documentos deben estar respaldados por mi nombre FRANCISCO ANTONIO GARCIA MENOLASCINA. Modificar el icono dal fair use debido que actualmente el icono fue generado la i del icono de informacion esta mal hecho. Actualmente los iconos y logos de los external links y las emrpesas/instituciones NO son correctas, debes indexarlo oficialmente descargandolo de forma segura, no usar emojis siempre svg, subir a CDN. El fitlrado actual esta muy feo y no personalizado (ordenamiento) mejoralo. TODOS los archivos deben tener fecha Actualmente los previews y thumbnails estan mal, no cargan correctamente, cuando el usuario entra al archivo si lo muestra pero despues de un tiempo, pero por fuera que es lo importante No muestra nada. Debemos arreglar todos estos errores:

Uncaught TypeError: Cannot redefine property: ethereum
at Object.defineProperty (<anonymous></anonymous>)
at provider.js:2:663867
at provider.js:2:663912
at t.default (provider.js:2:666327)
at provider.js:2:692461
at provider.js:2:692481
at provider.js:2:692485
js?id=G-V6E1QC7GQM:289 Connecting to 'https://stats.g.doubleclick.net/g/collect?v=2&tid=G-V6E1QC7GQM&cid=1201055832.1788658217&gtm=45je6921v9262328478za200zb9262306660zd9262306660&rcb=12&aip=1&dma=0&gcd=13l3l3l3l1l1&npa=0&frm=0&tag_exp=115938466~115938469~118897920~118897930~120213116~120385423~120469145~120469153~120914214' violates the following Content Security Policy directive: "connect-src 'self' https://obwzzmbvkrcscqwptlqo.supabase.co https://us.i.posthog.com https://us-assets.i.posthog.com https://static.cloudflareinsights.com https://cloudflareinsights.com https://challenges.cloudflare.com https://va.vercel-scripts.com https://_.ingest.us.sentry.io https://www.googletagmanager.com https://ciszunetwork.vercel.app https://www.google-analytics.com https://_.google-analytics.com https://analytics.google.com https://ep1.adtrafficquality.google". The action has been blocked.
rd @ js?id=G-V6E1QC7GQM:289
5Loading the image '<URL></url>' violates the following Content Security Policy directive: "img-src 'self' data: blob: <URL></url> <URL></url>". The action has been blocked.
ciszunetwork.vercel.app/api/ads/impression:1 Failed to load resource: the server responded with a status of 500 ()
3ciszukoantony.vercel.app/:1 Uncaught (in promise) Error: Could not establish connection. Receiving end does not exist.
chrome-extension://g…ution/content.js:18 Uncaught (in promise) TypeError: Cannot read properties of undefined (reading 'useCache')
at me (chrome-extension://gighmmpiobklfepjocnamgkkbiglidom/vendor/@eyeo/webext-ad-filtering-solution/content.js:18:84376)
chrome-extension://g…dom/polyfill.js:496 Uncaught (in promise) Error: Could not establish connection. Receiving end does not exist.
at wrappedSendMessageCallback (chrome-extension://gighmmpiobklfepjocnamgkkbiglidom/polyfill.js:496:18)
ciszunetwork.vercel.app/api/ads/impression:1 Failed to load resource: the server responded with a status of 500 ()
cdn-cgi/challenge-platform/h/g/c/a37964c6fd7d3c67:1 Failed to load resource: the server responded with a status of 404 ()
ep2.adtrafficquality.google/:1 Framing 'https://ep2.adtrafficquality.google/' violates the following Content Security Policy directive: "frame-src 'self' https://challenges.cloudflare.com https://www.googletagmanager.com https://googleads.g.doubleclick.net https://obwzzmbvkrcscqwptlqo.supabase.co". The request has been blocked.

ep2.adtrafficquality.google/:1 Framing 'https://www.google.com/' violates the following Content Security Policy directive: "frame-src 'self' https://challenges.cloudflare.com https://www.googletagmanager.com https://googleads.g.doubleclick.net https://obwzzmbvkrcscqwptlqo.supabase.co". The request has been blocked.

(index):1947 Uncaught TypeError: Cannot read properties of undefined (reading 'isFeatureEnabled')
at (index):1947:25
(index):1947 Uncaught TypeError: Cannot read properties of undefined (reading 'isFeatureEnabled')
at (index):1947:25
chrome-extension://g…dom/polyfill.js:496 Uncaught (in promise) Error: Could not establish connection. Receiving end does not exist.
at wrappedSendMessageCallback (chrome-extension://gighmmpiobklfepjocnamgkkbiglidom/polyfill.js:496:18)
2chrome-extension://g…dom/polyfill.js:496 Uncaught (in promise)
content.js:1 Uncaught (in promise) Could not establish connection. Receiving end does not exist.
Comunicaci%C3%B3n%20Empresarial-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Introducci%C3%B3n%20al%20Conocimiento%20de%20la%20Ciberseguridad-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Ciencia%20y%20An%C3%A1lisis%20de%20Datos-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
EF%20SET%20Certificate-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Marketing%20de%20Medios%20Sociales-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
capcut*Certificado_Francisco%20Antonio%20Garcia%20Menolascina-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
autotub_Certificado_Francisco%20Antonio%20Garcia%20Menolascina-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
3030_fplayersoffcial%40gmail.com-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
896_fplayersoffcial%40gmail.com-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
chatgpt_Certificado_Francisco%20Antonio%20Garcia%20Menolascina-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Encontrar%20Financiamiento-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
CSS_Essentials_certificate_fplayersoffcial-gmail-com_16350af5-66c7-4813-b024-360414a2b260-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
3296_fplayersoffcial%40gmail.com-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
HTML_Essentials_certificate_fplayersoffcial-gmail-com_e218c456-06c7-4e52-8ec4-57ae4246e019-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
learner_transcript-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
phyton_Certificado_Francisco%20Antonio%20Garcia%20Menolascina-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
109_fplayersoffcial%40gmail.com-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
edicion_Certificado_Francisco%20Antonio%20Garcia%20Menolascina-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
373_fplayersoffcial%40gmail.com-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Python_Essentials_2_certificate_fplayersoffcial-gmail-com_74a5d7a2-7fae-4812-bd49-f2662bebfa63-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Logros%20-%20ciscoantonygarciam-8257%20*%20Microsoft%20Learn3-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Expediente%20-%20CiscoAntonyGarciaM-8257%20*%20Microsoft%20Learn-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
582_fplayersoffcial%40gmail.com-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
1141_fplayersoffcial%40gmail.com-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
171_fplayersoffcial%40gmail.com-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
10686381_11037949_1788416004123-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Introduction_to_Modern_AI_certificate_fplayersoffcial-gmail-com_5128c26e-8386-4d23-bef9-94035d7b0bc5-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
4080_fplayersoffcial%40gmail.com-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Digital_Awareness_certificate_fplayersoffcial-gmail-com_6022fb74-41f5-414e-83f9-f5c84dd80fa6-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
photoshop_Certificado_Francisco%20Antonio%20Garcia%20Menolascina-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Logros%20-%20ciscoantonygarciam-8257%20*%20Microsoft%20Learn2-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Certificado%20de%20finalizacion%20*%20SkillsBuild2-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
ingles_Certificado_Francisco%20Antonio%20Garcia%20Menolascina-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
iaingresosCertificado_Francisco%20Antonio%20Garcia%20Menolascina-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
transcript-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
107_fplayersoffcial%40gmail.com-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
508_fplayersoffcial%40gmail.com-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
youtube_Certificado_Francisco%20Antonio%20Garcia%20Menolascina-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
finanzaspersonales_Certificado_Francisco%20Antonio%20Garcia%20Menolascina-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Python_Essentials_1_certificate_fplayersoffcial-gmail-com_0b6aae8e-2aa8-44be-8dfd-3945f0aa4dd1-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
1852_fplayersoffcial%40gmail.com-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Logros%20-%20ciscoantonygarciam-8257%20*%20Microsoft%20Learn-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
La%20planificaci%C3%B3n%20estrat%C3%A9gica%20en%20la%20era%20de%20la%20IA-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Introducci%C3%B3n%20a%20Destrezas%20Empresariales%20Digitales-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Tu%20perfil%20*%2016Personalities-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Certificado%20de%20finalizacion%20*%20mSkillsBuild-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
transcript*hplive-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Certificado%20de%20finalizacion%20*%20SkillsBuild1-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Certificado%20de%20finalizacion%20*%20SkillsBuild-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Logros%20-%20ciscoantonygarciam-8257%20*%20Microsoft%20Learn1-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
896*fplayersoffcial%40gmail.com-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
learner_transcript-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
ciszunetwork.vercel.app/api/ads/impression:1 Failed to load resource: the server responded with a status of 500 ()
8certificates:1 Uncaught (in promise) Error: Could not establish connection. Receiving end does not exist.
ciszunetwork.vercel.app/api/ads/impression:1 Failed to load resource: the server responded with a status of 500 ()
photoshop_Certificado_Francisco%20Antonio%20Garcia%20Menolascina-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
edicion_Certificado_Francisco%20Antonio%20Garcia%20Menolascina-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
iaingresosCertificado_Francisco%20Antonio%20Garcia%20Menolascina-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
ciszunetwork.vercel.app/api/ads/impression:1 Failed to load resource: the server responded with a status of 500 ()
4certificates:1 Uncaught (in promise) Error: Could not establish connection. Receiving end does not exist.
finanzaspersonales_Certificado_Francisco%20Antonio%20Garcia%20Menolascina-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Encontrar%20Financiamiento-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Tu%20perfil%20*%2016Personalities-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
EF%20SET%20Certificate-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
896*fplayersoffcial%40gmail.com-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
10686381_11037949_1788416004123-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
capcut_Certificado_Francisco%20Antonio%20Garcia%20Menolascina-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
109_fplayersoffcial%40gmail.com-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Ciencia%20y%20An%C3%A1lisis%20de%20Datos-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
373_fplayersoffcial%40gmail.com-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Comunicaci%C3%B3n%20Empresarial-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
edicion_Certificado_Francisco%20Antonio%20Garcia%20Menolascina-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
3296_fplayersoffcial%40gmail.com-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Introducci%C3%B3n%20a%20Destrezas%20Empresariales%20Digitales-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
transcript-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Certificado%20de%20finalizacion%20*%20SkillsBuild1-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Python*Essentials_1_certificate_fplayersoffcial-gmail-com_0b6aae8e-2aa8-44be-8dfd-3945f0aa4dd1-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
CSS_Essentials_certificate_fplayersoffcial-gmail-com_16350af5-66c7-4813-b024-360414a2b260-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
3030_fplayersoffcial%40gmail.com-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
iaingresosCertificado_Francisco%20Antonio%20Garcia%20Menolascina-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Introduction_to_Modern_AI_certificate_fplayersoffcial-gmail-com_5128c26e-8386-4d23-bef9-94035d7b0bc5-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
4080_fplayersoffcial%40gmail.com-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Marketing%20de%20Medios%20Sociales-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
autotub_Certificado_Francisco%20Antonio%20Garcia%20Menolascina-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
chatgpt_Certificado_Francisco%20Antonio%20Garcia%20Menolascina-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
107_fplayersoffcial%40gmail.com-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
HTML_Essentials_certificate_fplayersoffcial-gmail-com_e218c456-06c7-4e52-8ec4-57ae4246e019-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
La%20planificaci%C3%B3n%20estrat%C3%A9gica%20en%20la%20era%20de%20la%20IA-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
1852_fplayersoffcial%40gmail.com-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
508_fplayersoffcial%40gmail.com-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
phyton_Certificado_Francisco%20Antonio%20Garcia%20Menolascina-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
learner_transcript-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
photoshop_Certificado_Francisco%20Antonio%20Garcia%20Menolascina-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Logros%20-%20ciscoantonygarciam-8257%20*%20Microsoft%20Learn3-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Introducci%C3%B3n%20al%20Conocimiento%20de%20la%20Ciberseguridad-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
ingles*Certificado_Francisco%20Antonio%20Garcia%20Menolascina-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
582_fplayersoffcial%40gmail.com-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
1141_fplayersoffcial%40gmail.com-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
youtube_Certificado_Francisco%20Antonio%20Garcia%20Menolascina-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Logros%20-%20ciscoantonygarciam-8257%20*%20Microsoft%20Learn1-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Digital*Awareness_certificate_fplayersoffcial-gmail-com_6022fb74-41f5-414e-83f9-f5c84dd80fa6-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Logros%20-%20ciscoantonygarciam-8257%20*%20Microsoft%20Learn2-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Python*Essentials_2_certificate_fplayersoffcial-gmail-com_74a5d7a2-7fae-4812-bd49-f2662bebfa63-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
171_fplayersoffcial%40gmail.com-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
transcript_hplive-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Expediente%20-%20CiscoAntonyGarciaM-8257%20*%20Microsoft%20Learn-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Certificado%20de%20finalizacion%20*%20SkillsBuild2-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Certificado%20de%20finalizacion%20*%20mSkillsBuild-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Certificado%20de%20finalizacion%20*%20SkillsBuild-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Logros%20-%20ciscoantonygarciam-8257%20*%20Microsoft%20Learn-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
EF%20SET%20Certificate-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
10686381*11037949_1788416004123-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
ingles_Certificado_Francisco%20Antonio%20Garcia%20Menolascina-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
896_fplayersoffcial%40gmail.com-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
capcut_Certificado_Francisco%20Antonio%20Garcia%20Menolascina-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
edicion_Certificado_Francisco%20Antonio%20Garcia%20Menolascina-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Certificado%20de%20finalizacion%20*%20SkillsBuild2-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
photoshop*Certificado_Francisco%20Antonio%20Garcia%20Menolascina-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
ciszunetwork.vercel.app/api/ads/impression:1 Failed to load resource: the server responded with a status of 500 ()
Tu%20perfil%20*%2016Personalities-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
EF%20SET%20Certificate-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
autotub*Certificado_Francisco%20Antonio%20Garcia%20Menolascina-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
photoshop_Certificado_Francisco%20Antonio%20Garcia%20Menolascina-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
3030_fplayersoffcial%40gmail.com-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Marketing%20de%20Medios%20Sociales-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
896_fplayersoffcial%40gmail.com-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
capcut_Certificado_Francisco%20Antonio%20Garcia%20Menolascina-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
109_fplayersoffcial%40gmail.com-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
CSS_Essentials_certificate_fplayersoffcial-gmail-com_16350af5-66c7-4813-b024-360414a2b260-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
1141_fplayersoffcial%40gmail.com-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
508_fplayersoffcial%40gmail.com-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
HTML_Essentials_certificate_fplayersoffcial-gmail-com_e218c456-06c7-4e52-8ec4-57ae4246e019-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
10686381_11037949_1788416004123-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
iaingresosCertificado_Francisco%20Antonio%20Garcia%20Menolascina-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
finanzaspersonales_Certificado_Francisco%20Antonio%20Garcia%20Menolascina-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
edicion_Certificado_Francisco%20Antonio%20Garcia%20Menolascina-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
582_fplayersoffcial%40gmail.com-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
4080_fplayersoffcial%40gmail.com-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
phyton_Certificado_Francisco%20Antonio%20Garcia%20Menolascina-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Python_Essentials_1_certificate_fplayersoffcial-gmail-com_0b6aae8e-2aa8-44be-8dfd-3945f0aa4dd1-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Introduction_to_Modern_AI_certificate_fplayersoffcial-gmail-com_5128c26e-8386-4d23-bef9-94035d7b0bc5-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
3296_fplayersoffcial%40gmail.com-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
chatgpt_Certificado_Francisco%20Antonio%20Garcia%20Menolascina-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
youtube_Certificado_Francisco%20Antonio%20Garcia%20Menolascina-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
373_fplayersoffcial%40gmail.com-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
ingles_Certificado_Francisco%20Antonio%20Garcia%20Menolascina-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Python_Essentials_2_certificate_fplayersoffcial-gmail-com_74a5d7a2-7fae-4812-bd49-f2662bebfa63-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Digital_Awareness_certificate_fplayersoffcial-gmail-com_6022fb74-41f5-414e-83f9-f5c84dd80fa6-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
171_fplayersoffcial%40gmail.com-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Logros%20-%20ciscoantonygarciam-8257%20*%20Microsoft%20Learn3-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
learner*transcript-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
La%20planificaci%C3%B3n%20estrat%C3%A9gica%20en%20la%20era%20de%20la%20IA-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Encontrar%20Financiamiento-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Ciencia%20y%20An%C3%A1lisis%20de%20Datos-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Introducci%C3%B3n%20al%20Conocimiento%20de%20la%20Ciberseguridad-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Certificado%20de%20finalizacion%20*%20SkillsBuild-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Logros%20-%20ciscoantonygarciam-8257%20*%20Microsoft%20Learn2-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Introducci%C3%B3n%20a%20Destrezas%20Empresariales%20Digitales-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Certificado%20de%20finalizacion%20*%20SkillsBuild1-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
transcript*hplive-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Expediente%20-%20CiscoAntonyGarciaM-8257%20*%20Microsoft%20Learn-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Tu%20perfil%20*%2016Personalities-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Logros%20-%20ciscoantonygarciam-8257%20*%20Microsoft%20Learn-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Certificado%20de%20finalizacion%20*%20mSkillsBuild-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
107_fplayersoffcial%40gmail.com-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Comunicaci%C3%B3n%20Empresarial-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Logros%20-%20ciscoantonygarciam-8257%20*%20Microsoft%20Learn1-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
Certificado%20de%20finalizacion%20\_%20SkillsBuild2-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
transcript-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
1852_fplayersoffcial%40gmail.com-preview.png:1 Failed to load resource: the server responded with a status of 400 ()
ciszunetwork.vercel.app/api/ads/impression:1 Failed to load resource: the server responded with a status of 500 ()

**MuzicMania Website:**

- [ ] Terminar idiomas en ingles (UK y USA) por separado.
- [ ] Terminar bien el tema claro (Todos los docks, modals o cards con fondo oscuro paran a claro, los textos oscuros o negros e iconos negros o oscuros)
