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

2. [ ] #4 El sistema de ads no llegan en local ni en global y no funciona desde la devcon, simplemente no agrega nada visualmente a pesar que desde la devcon parece que si. Actualmente el sistema de ads el fallback de pendientes siempre dice timeout.
    1. [ ] Algunas opciones como desactivar anuncios temporalmente no funciona, ademas de que no esta muy claro exactmanete la funcion de cada opcion. Quitar anuncio deberia ser limpiar ads actuales, reactivar anuncios debe ser una opcion no 2, y desactivar anuncios debe ser 1 opcion. Resumen debe estar despues de enviar. Pule las opciones. Ademas las reactivaciones y desactivaciones tiene que ser por websites.
    2. [ ] Luego de que el sistema funcione debugear con ads para arreglar el error de el logo actual de ciszugamens no es correcto, usa los colores incorrectos, debe ser el de C morado, y Z azul. Con degradados. Outline. Actualmente se usa una version azul de la C y Z blanca.

3. [ ] Actualmente el sistema de discleimers tiene algunos errores no criticos pero que debemos arreglar,
    1. [ ] La opcion de "discleimer beta" eliminalo, no tiene sentido o renombralo a basic o info2.
    2. [ ] Actualmente en local o global, cuando un usuario cierra el discleimer usando la x (discleimer opcional) y cambia de pagina o espera un rato vuelve a parecer el discleimer, esto es un problema, si el usuario lo cierra no vuelve a aparecer, parecido al discleimer de beta testing default.
    3. [ ] Debe exister una seccion para eleguir si el discleimer debe tener la etiqueta de devcon o no. Para que en un futuro se use con fines no de prueba de devcon.
    4. [ ] Debe existir una seccion para que el discleimer soporte botones con acciones simples (abrir una pagina por ejemplo), es decir, un boton default, donde al darle click redireccione a algun lado o que cierre el propio discleimer estilo, "Estamos trabajando..." y el boton diga (OK) y que al darle click simplemente cierre el discleimer como si fuera un cierre de X, de esta manera podemos combinar con X, sin X, sin botones o con botones y botones de diferentes textos con diferentes acciones.
    5. [ ] Actualmente el contador de tiempo periodico de un discleiemr temporal con fecha definida se muestra con intervalos de segundos. Lo cual esta muy mal, es mucho mejor que siga un formato mas especifico y visualmente profesional y agradable, primero mostraras la fecha de inicio - fecha de culminacion, y luego mostraras un contador separados por ":" estilo reloj descendente. y por cada numero dentro de un ":" agregar que tipo de tiempo es, si segundos, minutos o horas, semanas, años. Por ejemplo: 12 de Mayo del 2025 - 28 de Mayo del 2025 0y:17d:3h:12m:43s (Esto es un ejemplo, los textos deben ser traducibles y debe estar colorados para mejor visualidad tecnica)

- [ ] Actualmente el devcon varias opciones no funcionan y no dejan entrar. Un problema grave es el orden actual del devcon, existen varias opciones de discleimers y advisor fuera de su seccion. Necesito que, al iniciar el devcon. Las opciones de anuncios se llame ADS, luego los demas sea Discleimers, Advisor. Nada de opcion secundarias, ahora bien. Al entrar en cada uno debe siempre existir tanto ads, discleimers y advisors. 3 opciones, global, local e hibrido. De esta manera las opciones se dividiran en local para mi pc localhost, global para sitios webs y hibrido es en ambas. Debe funcionar y elimina opciones internas para global o local, ya que sera respondido antes. Por otro lado las opciones de kill swtich agregala tambien dentro de la seccion de cada estas 3 opciones.
- [ ] Al registrarse o logearse debe haber cumplido la seguridad de recaptcha. Siempre luego debe haber una pantalla para verificar el correo en momento de registrarse, pero si el usuario tiene 2FA siempre debe haber una pantalla pidiendole una clave que empieze po C- y seguido de 6 digitos y en la mitad un espacio (C-123 434) clave oficial de ciszunetwork, temporal, expirable en 3 horas e indicar, unico por website, indicar si ya expiro y posibilidad de reenviar otro codigo con limites, al tercer limite se suspende temporalmente y localmente por que no logro iniciar sesion.
- [ ] Los emails actualmente que se envian no estan customizados, los envia "supabase" lo cual puede confundir siempre debe ser ciszunetwork | (pagina en cuestion) ademas de un diseño interno diferente con botones y diseño. Terminos y condiciones y aclaracion de que este email no es de patrocinamiento o anuncio. Los que si son siempre se debe recalcar.
- [ ] Cuando un usuario se registre luego se tiene que logear denuevo.
- [ ] Actualmente el sistema OTP de las cuentas cuando le das a olvide la contraseña esa bien al inicio pero requiere muchas puliciones, actualmente cuando se entra a un link con token valido simplemente entra y ya, sin pantalla de recuperacion de contraseña cambiando la contraseña, con una pantalla exclusiva donde coloca su contraseña nueva y lo repite. No puede ser la antigua, luego se deslogea automaticamente para que se requiera logearse. Es decir es una sesion temporal, ademas de captar rate limits. En la pantalla de olvide contraseña si el usuario ya pidio varias veces en poco tiempo debe esperar 12 horas.
- [ ] Cuando un usuario entra a un link invalido expirado, es cierto que no se logea. Pero no existe ninguna indicacion, debes crear un modal o advertencia de que ese link estuvo invalido por X tiempo, por la razon. Ademas de recordarle al usuario en la pantalla de login de olvide contraseña que el link es 1 solo uso.

    Actualmente al intentar entrar a un enlace valido si me salto un panel para camibar mi contraseña PERO de un momento a otra lo cambio a invalido por alguna razon, ademas. El icono de error de enlace invalida esta mal, debe ser una advertencia.

- [ ] Al cerrar sesion manual o automaticamente SIEMPRE redirigir a /index o home de la webpage.
- [ ] Si el usuario entra a un enlace expirado o no invalido nunca se debe iniciarse sesion, es decir, primero evalua el enlace y verificalo en caso de que este bien si inicia sesion temporalmente hasta que cambie su contraseña pero si sale da error.
- [ ] TODAS las paginas de registro deben tener el recaptacha al final del formulario antes del boton de registrarse. Actualmente el sistema de recaptchas de los sitiowebs estaban rotos por que no habia creado los proyectos y sus ids / tokens eran inexistentes. Implementa las veresiones 2 y 3 de cada catpcha de cada website. Debemos implementar esto aun, no aparecen en los register.
- [ ] Tambien OBLIGATORIAMENTE debe haber 2 casillas de verificacion obligatorias para aceptar los terminos y condiciones y otras cosas. Actualmente no se muestra en ninguna pagina el recaptcha debes arreglar esto. Acualmente las paginas que poseen esto es CiszukoAntony y Muzicmania. Falta Ciszubot y Ciszunetwork.
- [x] Actualmente cuando un usuario le da al boton de "seguir usando adblocker" en la eleccion doble del modal de guard del anti adblocker, si es verdad que lo deja seguir pero no le permite al usuario scrollear o hacer click en el body, muy raro. El usuario tiene que actualizar para que funcione bien la pagina, debemos arreglar esto.
- [ ] Para no falsificar los "reviews", si no se encuentra ninguna preview subida por un usuario, el default es 5.0 pero se debe indicar que no existe review para analizar y por eso el default. En caso de que si exista siempre comparar con una review fantasma de base de 5.0, es decir si un usuario hace una review de 1.0 debes sacar la media de 1 y 5, no de 1 solamente. Por otro lado aplica correciones a los terminos y servicios de cada website por esto y finalmente. Recuerda que esta opcion es por cada website. Por ultimo, todas las paginas de review, debajo del todo debe tener una seccion de trustpilot y otras marcas de confianza que verifiquen el contenido. Actualmente usa el truspilot de ciszunetworrk + widgets.

### Cambios por Website

**Ciszu Network Website:**

- [ ] Terminar idiomas en ingles (UK y USA) por separado.
- [ ] Terminar bien el tema claro (Todos los docks, modals o cards con fondo oscuro paran a claro, los textos oscuros o negros e iconos negros o oscuros.)

**Ciszubot Website:**

- [ ] Terminar idiomas en ingles (UK y USA) por separado.

**Ciszuko Antony Website:**

- [ ] Terminar idiomas en ingles (UK y USA) por separado.
- [ ] Terminar bien el tema claro (Todos los docks, modals o cards con fondo oscuro paran a claro, los textos oscuros o negros e iconos negros o oscuros.)
- [ ] Los botones de "view" de cada archivo de la pagina de certificados esta usando un icono erroneo generado por ia o bugeado visualmente, debes ser un ojo correctamente.
- [ ] #1 Mejorar sistema de certificados de ciszukoantony, TODOS los documentos deben estar respaldados por mi nombre FRANCISCO ANTONIO GARCIA MENOLASCINA en cada certificado como un tag de posesion. Modificar el icono dal fair use debido que actualmente el icono fue generado la i del icono de informacion esta mal hecho. Actualmente los iconos y logos de los external links y las empresas/instituciones NO son correctas, debes indexarlo oficialmente descargandolo de forma segura, no usar emojis siempre svg, subir a CDN. El fitlrado actual esta muy feo y no personalizado (ordenamiento) mejoralo. Actualmente los previews y thumbnails estan mas o menos bien pero no correctos, algunas previrews NO muestran textos de los certificados dando por hecho que los previews se hicieron mal. Y aun peor eisten cerficados que no cargan correctamente. Dando problema de supabase, y otros detalles el error dentro de un thumbail sin carga el icono No es correcto, debe ser un error claro la 2i" dentro esta mal generada usa iconos svg reales confiables lo mismo pasa con el icono del fair use.

**MuzicMania Website:**

- [ ] Terminar idiomas en ingles (UK y USA) por separado.
- [ ] Terminar bien el tema claro (Todos los docks, modals o cards con fondo oscuro paran a claro, los textos oscuros o negros e iconos negros o oscuros)
