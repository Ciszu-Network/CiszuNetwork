# To Do List — Ciszu Network

> Este archivo solo puede ser editado por Ciszuko Antony.

### Cambios Generales:

#5 Crear sistema de anuncios: Google Adsense, GA4, GTM, Tag y Analytics pack completo.

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

#4 Actualmente el sistema de ads tiene algunos errores no criticos pero que debemos arreglar:

- [ ] Al enviar un ad y darle enter para volver a enviar un ad se va directamente al menu de devcon, creo que es un error.

#6 Actualmente el sistema de discleimers tiene algunos errores no criticos pero que debemos arreglar:

1. [ ] Debe existir una seccion para que el discleimer soporte botones con acciones simples (abrir una pagina por ejemplo), es decir, un boton default, donde al darle click redireccione a algun lado o que cierre el propio discleimer estilo, "Estamos trabajando..." y el boton diga (OK) y que al darle click simplemente cierre el discleimer como si fuera un cierre de X, de esta manera podemos combinar con X, sin X, sin botones o con botones y botones de diferentes textos con diferentes acciones.

- [ ] Al registrarse o logearse debe haber cumplido la seguridad de recaptcha. Siempre luego debe haber una pantalla para verificar el correo en momento de registrarse, pero si el usuario tiene 2FA siempre debe haber una pantalla pidiendole una clave que empieze po C- y seguido de 6 digitos y en la mitad un espacio (C-123 434) clave oficial de ciszunetwork, temporal, expirable en 3 horas e indicar, unico por website, indicar si ya expiro y posibilidad de reenviar otro codigo con limites, al tercer limite se suspende temporalmente y localmente por que no logro iniciar sesion.
- [ ] Los emails actualmente que se envian no estan customizados, los envia "supabase" lo cual puede confundir siempre debe ser ciszunetwork | (pagina en cuestion) ademas de un diseño interno diferente con botones y diseño. Terminos y condiciones y aclaracion de que este email no es de patrocinamiento o anuncio. Los que si son siempre se debe recalcar.
- [ ] Cuando un usuario se registre luego se tiene que logear denuevo.
- [ ] Actualmente el sistema OTP de las cuentas cuando le das a olvide la contraseña esa bien al inicio pero requiere muchas puliciones, actualmente cuando se entra a un link con token valido simplemente entra y ya, sin pantalla de recuperacion de contraseña cambiando la contraseña, con una pantalla exclusiva donde coloca su contraseña nueva y lo repite. No puede ser la antigua, luego se deslogea automaticamente para que se requiera logearse. Es decir es una sesion temporal, ademas de captar rate limits. En la pantalla de olvide contraseña si el usuario ya pidio varias veces en poco tiempo debe esperar 12 horas.
- [ ] Cuando un usuario entra a un link invalido expirado, es cierto que no se logea. Pero no existe ninguna indicacion, debes crear un modal o advertencia de que ese link estuvo invalido por X tiempo, por la razon. Ademas de recordarle al usuario en la pantalla de login de olvide contraseña que el link es 1 solo uso.

    Actualmente al intentar entrar a un enlace valido si me salto un panel para camibar mi contraseña PERO de un momento a otra lo cambio a invalido por alguna razon, ademas. El icono de error de enlace invalida esta mal, debe ser una advertencia.

- [ ] Al cerrar sesion manual o automaticamente SIEMPRE redirigir a /index o home de la webpage.
- [ ] Si el usuario entra a un enlace expirado o no invalido nunca se debe iniciarse sesion, es decir, primero evalua el enlace y verificalo en caso de que este bien si inicia sesion temporalmente hasta que cambie su contraseña pero si sale da error.
- [ ] TODAS las paginas de registro deben tener el recaptacha al final del formulario antes del boton de registrarse. Actualmente el sistema de recaptchas de los sitiowebs estaban rotos por que no habia creado los proyectos y sus ids / tokens eran inexistentes. Implementa las veresiones 2 y 3 de cada catpcha de cada website. Debemos implementar esto aun, no aparecen en los register.
- [ ] En el sistema de review por cada website debemos corregir algunas cosas, en ciszukoantony por alguna razon esta en 4.9 deberia ser 5 como baseline cuando NO existe ninguna review. Recuerda NO inventarte ninguna review, cuando un usuario quiera enviar una review debe logearse, es una accion de necesidad de logeo, en muzicmania aparece como un modal global de acciones de necesidad de logearse, replica esto para las demas paginas con su estilo. y usalo para el sistema de review, ademas has la seccion de confianza y trustpilor mas diferencial y llamativa. No te inventes reviews, si no existe simplemente dice que ninguna review fue subida aun... Se el primero (y un boton rapido para reseñar aparte del principal) recuerda que en la pagina de reviews debe ver 10 reviews por cada lista, debajo del todo (no arriba) debe aparecer unos botones o circulos con flehas a cada extremo para mostrar las paginas de la lista de reviews, esto inteligentemente. Estilo indice, maximo 10 bolitas por el estado actual de la lista es decir si estas en el indice 10 se mostraran los 5 anteriores y los 5 de despues. Tambien debe estar 1 bolita por cada extremo paarte de las flechas para acceso rapido del primer indice y para el ultimo indice. Basicamente cuando buscas en google, la cantidad de paginas que se busque. Cada reviews debe tener un boton para dar like, al dar like es otra accion de logeo necesario. Y REPITO NO INVENTARSE REVIEWS.
- [ ] Se debe crear la seccion de stats exepto muzicmaniade la pagian stats de cada website, no te lo inventes que sean reales. Debes replicar el estilo y diseño, los botones y formas como tiene muzicmania, da igual si no existe data debes mostrar almenos el hud de las cosas, las opciones de muzicmania replicadas en cada website.
- [ ] La seccion de informacion en el header debe estar al final de la fila de paginas mostrables en el navbar. Ademas ciszubot No tiene seccion de information lo cual es un error grave debes agregarlo. Y traer las paginas de information dentro de esa seccion.
- [ ] Actualmente la seccion de ciszunetwork de cada website es bastante feo, en ciszubot no aparece el logo ni siquiera, ademas de que no comparten una estructura bien defnidia, necesito que se vea mejor.
- [ ] Replicar sistema de documentacion de muzicmania correctamente a las demas paginas, debemos regenerar la docuemntacion de cada pagina en cada formato, subirlo al cdn, crear los paquetes comprimibles. Y finalmente crear la estructura visual de muzicmania documentation a las demas paginas. Sin contar la carpeta documentation. Opciones de descarga, versiones, preview, descarga individual, info, bibloteca de documentacion etc.
- [ ] Replicar nuevo navbar de ciszubot a las demas paginas pero corregido.
- [ ] Se debe crear y replicar el sistema de soporte de muzicmania para las demas websites. Con su necesidad de logeo, tickets o peticiones, etc. Replica de muzicmania. No inventarse correos, el unico correo es ciszunetwork@gmail.com, ademas los titulos heros deben tener concitencia con las demas webpages de la misma website.
- [ ] Se debe crear el estilo o sistema de contacto para las demas paginas exepto muzicmania. Se debe agregar la disponibilidad, la estructura tecnica, el apartado del ceo y la red social unificada en cada website, cn su estilo pero mismo orden y estructura. Actualmente la pagina de contacto de ciszubot y su hero title estan bug, tienen lineas que se ven mal arregla esto. Cambia de titulo o tipografia.
- [ ] Agregar pagina de donacion a los que no tienen.
- [ ] Se debe crear el sistema de changelog de muzicmania, con su tag, barprogress, roadmap, status, cada changelog con su seccion interna a pagina diferente, likes, filtros, orden, search. Entre otas cosas por cada website. Se debe agregar estado actual con la barra, proximos nodos, filstros realmente funcionales y boton de detalles realmente funciona que abre otra pagina (cada changelog es una pagina aparte, con su info enlazada pero mas larga parecido a muzicmania), interrogativa para ver protocolos de docuemntacion antes de los quickdocks y antes de eso el glosario y hoja de ruta.

### Cambios por Website

**Ciszu Network Website:**

- [ ] Terminar idiomas en ingles UK.
- [ ] Terminar idiomas en ingles USA.
- [ ] Terminar bien el tema claro (Todos los docks, modals o cards con fondo oscuro paran a claro, los textos oscuros o negros e iconos negros o oscuros.) Actualmente esta corregido un 80% pero aun existen muchos problemas visuales, algunos textos no se persiven bien al fondo. El slidebar, fondos flotantes de menus o botones flotantes, headers bugeados con iconos ilegibles.
- [ ] Terminar idiomas en español LATAM.
- [ ] Terminar idiomas en español España.

**Ciszubot Website:**

- [ ] Terminar idiomas en ingles UK.
- [ ] Terminar idiomas en ingles USA.
- [ ] Terminar idiomas en español LATAM.
- [ ] Terminar idiomas en español España.

**Ciszuko Antony Website:**

- [ ] Terminar bien el tema claro (Todos los docks, modals o cards con fondo oscuro paran a claro, los textos oscuros o negros e iconos negros o oscuros.) Actualmente esta corregido un 80% pero aun existen muchos problemas visuales, algunos textos no se persiven bien al fondo. El slidebar, fondos flotantes de menus o botones flotantes, headers bugeados con iconos ilegibles.
- [ ] Aun la pagina de downloads no funciona.
- [ ] #1 Mejorar sistema de certificados de ciszukoantony, TODOS los documentos deben estar respaldados por mi nombre FRANCISCO ANTONIO GARCIA MENOLASCINA en cada certificado como un tag de posesion. Modificar el icono dal fair use debido que actualmente el icono fue generado la i del icono de informacion esta mal hecho. Actualmente los iconos y logos de los external links y las empresas/instituciones NO son correctas, debes indexarlo oficialmente descargandolo de forma segura, no usar emojis siempre svg, subir a CDN. El fitlrado actual esta muy feo y no personalizado (ordenamiento) mejoralo. Actualmente los previews y thumbnails estan mas o menos bien pero no correctos, algunas previrews NO muestran textos de los certificados dando por hecho que los previews se hicieron mal. Y aun peor existen cerficados que no cargan correctamente. Dando problema de supabase, y otros detalles el error dentro de un thumbail sin carga el icono No es correcto, debe ser un error claro la "i" dentro esta mal generada usa iconos svg reales confiables lo mismo pasa con el icono del fair use. A dia de ho sigue viendo muchos problemas, varios certificados n ocargan o directamente cargan pero su contenido en texto adentro no se carga bien solo el fondo, es raro.
- [ ] Terminar idiomas en ingles UK.
- [ ] Terminar idiomas en ingles USA.
- [ ] Terminar idiomas en español LATAM.
- [ ] Terminar idiomas en español España.

**MuzicMania Website:**

- [ ] Terminar bien el tema claro (Todos los docks, modals o cards con fondo oscuro paran a claro, los textos oscuros o negros e iconos negros o oscuros.) Actualmente esta corregido un 80% pero aun existen muchos problemas visuales, algunos textos no se persiven bien al fondo. El slidebar, fondos flotantes de menus o botones flotantes, headers bugeados con iconos ilegibles.
- [ ] Eliminar mapa de googlemaps de contact.
- [ ] Terminar idiomas en ingles UK.
- [ ] Terminar idiomas en ingles USA.
- [ ] Terminar idiomas en español LATAM.
- [ ] Terminar idiomas en español España.
