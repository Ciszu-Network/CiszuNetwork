# To Do List — Ciszu Network

> Este archivo solo puede ser editado por Ciszuko Antony.

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
- [ ] Al registrarse o logearse debe haber cumplido la seguridad de recaptcha. Siempre luego debe haber una pantalla para verificar el correo en momento de registrarse, pero si el usuario tiene 2FA siempre debe haber una pantalla pidiendole una clave que empieze po C- y seguido de 6 digitos y en la mitad un espacio (C-123 434) clave oficial de ciszunetwork, temporal, expirable en 3 horas e indicar, unico por website, indicar si ya expiro y posibilidad de reenviar otro codigo con limites, al tercer limite se suspende temporalmente y localmente por que no logro iniciar sesion.
- [ ] Los emails actualmente que se envian no estan customizados, los envia "supabase" lo cual puede confundir siempre debe ser ciszunetwork | (pagina en cuestion) ademas de un diseño interno diferente con botones y diseño. Terminos y condiciones y aclaracion de que este email no es de patrocinamiento o anuncio. Los que si son siempre se debe recalcar.
- [ ] Cuando un usuario se registre luego se tiene que logear denuevo.
- [ ] Actualmente el sistema OTP de las cuentas cuando le das a olvide la contraseña esa bien al inicio pero requiere muchas puliciones, actualmente cuando se entra a un link con token valido simplemente entra y ya, sin pantalla de recuperacion de contraseña cambiando la contraseña, con una pantalla exclusiva donde coloca su contraseña nueva y lo repite. No puede ser la antigua, luego se deslogea automaticamente para que se requiera logearse. Es decir es una sesion temporal, ademas de captar rate limits. En la pantalla de olvide contraseña si el usuario ya pidio varias veces en poco tiempo debe esperar 12 horas.
- [ ] Cuando un usuario entra a un link invalido expirado, es cierto que no se logea. Pero no existe ninguna indicacion, debes crear un modal o advertencia de que ese link estuvo invalido por X tiempo, por la razon. Ademas de recordarle al usuario en la pantalla de login de olvide contraseña que el link es 1 solo uso.

  Actualmente al intentar entrar a un enlace valido si me salto un panel para camibar mi contraseña PERO de un momento a otra lo cambio a invalido por alguna razon, ademas. El icono de error de enlace invalida esta mal, debe ser una advertencia.
- [ ] Al cerrar sesion manual o automaticamente SIEMPRE redirigir a /index o home de la webpage.
- [ ] Si el usuario entra a un enlace expirado o no invalido nunca se debe iniciarse sesion, es decir, primero evalua el enlace y verificalo en caso de que este bien si inicia sesion temporalmente hasta que cambie su contraseña pero si sale da error.
- [ ] TODAS las paginas de registro deben tener el recaptacha al final del formulario antes del boton de registrarse. Actualmente el sistema de recaptchas de los sitiowebs estaban rotos por que no habia creado los proyectos y sus ids / tokens eran inexistentes. Implementa las veresiones 2 y 3 de cada catpcha de cada website. Debemos implementar esto aun, no aparecen en los register. (Solucionar problemas de recaptcha)
- [ ] Arreglar errores de console y vulnerabilidades en todas las websites.

### Cambios por Website

**Ciszu Network Website:**

- [ ] Terminar idiomas en ingles UK.
- [ ] Terminar idiomas en ingles USA.
- [ ] Terminar bien el tema claro (Todos los docks, modals o cards con fondo oscuro paran a claro, los textos oscuros o negros e iconos negros o oscuros.) Actualmente esta corregido un 80% pero aun existen muchos problemas visuales, algunos textos no se persiven bien al fondo. El slidebar, fondos flotantes de menus o botones flotantes, headers bugeados con iconos ilegibles.
- [ ] Terminar paginas de information estilo muzicmania para todas las demas websites, crearlos si hace falta e indexarlos.
- [ ] Terminar paginas de team estilo muzicmania para todas las demas websites, crearlos si hace falta e indexarlos.
- [ ] Terminar paginas de help estilo muzicmania para todas las demas websites, crearlos si hace falta e indexarlos.
- [ ] Terminar paginas de faq estilo muzicmania para todas las demas websites, crearlos si hace falta e indexarlos.
- [ ] Terminar paginas de credits estilo muzicmania para todas las demas websites, crearlos si hace falta e indexarlos.
- [ ] Terminar paginas de guidelines estilo muzicmania para todas las demas websites, crearlos si hace falta e indexarlos.
- [ ] Terminar paginas de policy estilo muzicmania para todas las demas websites, crearlos si hace falta e indexarlos.
- [ ] Terminar paginas de rules estilo muzicmania para todas las demas websites, crearlos si hace falta e indexarlos.
- [ ] Terminar paginas de license estilo muzicmania para todas las demas websites, crearlos si hace falta e indexarlos.
- [ ] Terminar idiomas en español LATAM.
- [ ] Terminar idiomas en español España.

**Ciszubot Website:**

- [ ] Terminar idiomas en ingles UK.
- [ ] Terminar idiomas en ingles USA.
- [ ] Terminar paginas de information estilo muzicmania para todas las demas websites, crearlos si hace falta e indexarlos.
- [ ] Terminar paginas de team estilo muzicmania para todas las demas websites, crearlos si hace falta e indexarlos.
- [ ] Terminar paginas de help estilo muzicmania para todas las demas websites, crearlos si hace falta e indexarlos.
- [ ] Terminar paginas de faq estilo muzicmania para todas las demas websites, crearlos si hace falta e indexarlos.
- [ ] Terminar paginas de credits estilo muzicmania para todas las demas websites, crearlos si hace falta e indexarlos.
- [ ] Terminar paginas de guidelines estilo muzicmania para todas las demas websites, crearlos si hace falta e indexarlos.
- [ ] Terminar paginas de policy estilo muzicmania para todas las demas websites, crearlos si hace falta e indexarlos.
- [ ] Terminar paginas de rules estilo muzicmania para todas las demas websites, crearlos si hace falta e indexarlos.
- [ ] Terminar paginas de license estilo muzicmania para todas las demas websites, crearlos si hace falta e indexarlos.
- [ ] Terminar idiomas en español LATAM.
- [ ] Terminar idiomas en español España.

**Ciszuko Antony Website:**

- [ ] Terminar bien el tema claro (Todos los docks, modals o cards con fondo oscuro paran a claro, los textos oscuros o negros e iconos negros o oscuros.) Actualmente esta corregido un 80% pero aun existen muchos problemas visuales, algunos textos no se persiven bien al fondo. El slidebar, fondos flotantes de menus o botones flotantes, headers bugeados con iconos ilegibles.
- [ ] Terminar paginas de information estilo muzicmania para todas las demas websites, crearlos si hace falta e indexarlos.
- [ ] Terminar paginas de team estilo muzicmania para todas las demas websites, crearlos si hace falta e indexarlos.
- [ ] Terminar paginas de help estilo muzicmania para todas las demas websites, crearlos si hace falta e indexarlos.
- [ ] Terminar paginas de faq estilo muzicmania para todas las demas websites, crearlos si hace falta e indexarlos.
- [ ] Terminar paginas de credits estilo muzicmania para todas las demas websites, crearlos si hace falta e indexarlos.
- [ ] Terminar paginas de guidelines estilo muzicmania para todas las demas websites, crearlos si hace falta e indexarlos.
- [ ] Terminar paginas de policy estilo muzicmania para todas las demas websites, crearlos si hace falta e indexarlos.
- [ ] Terminar paginas de rules estilo muzicmania para todas las demas websites, crearlos si hace falta e indexarlos.
- [ ] Terminar paginas de license estilo muzicmania para todas las demas websites, crearlos si hace falta e indexarlos.
- [ ] Terminar idiomas en ingles UK.
- [ ] Terminar idiomas en ingles USA.
- [ ] Terminar idiomas en español LATAM.
- [ ] Terminar idiomas en español España.
- [ ] Al borrar todos los datos de cache de las paginas para que detecte desde un inicio el guard de antiadblock en ciszukoantony no aparece el guard. Ni con recargas manuales o activando el adblock. Debes arreglar esto.

**MuzicMania Website:**

- [ ] Terminar bien el tema claro (Todos los docks, modals o cards con fondo oscuro paran a claro, los textos oscuros o negros e iconos negros o oscuros.) Actualmente esta corregido un 80% pero aun existen muchos problemas visuales, algunos textos no se persiven bien al fondo. El slidebar, fondos flotantes de menus o botones flotantes, headers bugeados con iconos ilegibles.
- [ ] Terminar idiomas en ingles UK.
- [ ] Terminar idiomas en ingles USA.
- [ ] Terminar idiomas en español LATAM.
- [ ] Terminar idiomas en español España.
