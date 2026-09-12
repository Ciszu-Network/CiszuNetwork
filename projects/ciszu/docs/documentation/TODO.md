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
- [ ] Al registrarse o logearse debe haber cumplido la seguridad de recaptcha. Siempre luego debe haber una pantalla para verificar el correo en momento de registrarse, pero si el usuario tiene 2FA siempre debe haber una pantalla pidiendole una clave que empieze po C- y seguido de 6 digitos y en la mitad un espacio (C-123 434) clave oficial de ciszunetwork, temporal, expirable en 3 horas e indicar, unico por website, indicar si ya expiro y posibilidad de reenviar otro codigo con limites, al tercer limite se suspende temporalmente y localmente por que no logro iniciar sesion.
- [ ] Los emails actualmente que se envian no estan customizados, los envia "supabase" lo cual puede confundir siempre debe ser ciszunetwork | (pagina en cuestion) ademas de un diseño interno diferente con botones y diseño. Terminos y condiciones y aclaracion de que este email no es de patrocinamiento o anuncio. Los que si son siempre se debe recalcar.
- [ ] Cuando un usuario se registre luego se tiene que logear denuevo.
- [ ] Actualmente el sistema OTP de las cuentas cuando le das a olvide la contraseña esa bien al inicio pero requiere muchas puliciones, actualmente cuando se entra a un link con token valido simplemente entra y ya, sin pantalla de recuperacion de contraseña cambiando la contraseña, con una pantalla exclusiva donde coloca su contraseña nueva y lo repite. No puede ser la antigua, luego se deslogea automaticamente para que se requiera logearse. Es decir es una sesion temporal, ademas de captar rate limits. En la pantalla de olvide contraseña si el usuario ya pidio varias veces en poco tiempo debe esperar 12 horas.
- [ ] Cuando un usuario entra a un link invalido expirado, es cierto que no se logea. Pero no existe ninguna indicacion, debes crear un modal o advertencia de que ese link estuvo invalido por X tiempo, por la razon. Ademas de recordarle al usuario en la pantalla de login de olvide contraseña que el link es 1 solo uso.

    Actualmente al intentar entrar a un enlace valido si me salto un panel para camibar mi contraseña PERO de un momento a otra lo cambio a invalido por alguna razon, ademas. El icono de error de enlace invalida esta mal, debe ser una advertencia.

- [ ] Al cerrar sesion manual o automaticamente SIEMPRE redirigir a /index o home de la webpage.
- [ ] Si el usuario entra a un enlace expirado o no invalido nunca se debe iniciarse sesion, es decir, primero evalua el enlace y verificalo en caso de que este bien si inicia sesion temporalmente hasta que cambie su contraseña pero si sale da error.
- [ ] TODAS las paginas de registro deben tener el recaptacha al final del formulario antes del boton de registrarse. Actualmente el sistema de recaptchas de los sitiowebs estaban rotos por que no habia creado los proyectos y sus ids / tokens eran inexistentes. Implementa las veresiones 2 y 3 de cada catpcha de cada website. Debemos implementar esto aun, no aparecen en los register.
- [ ] En las paginas de reviews, La seccion de confianza y trustpilor mas diferencial y llamativa, los botones de truspilot deben ser funcionales, ademas de usar el widget. Muzicmania actualmente posee una barra de busqueda, filtros y entre otras cosas muy interesantes que las demas websites deberian etner, los unicos problemas de muzicmania es que cuando no existe una review el mensaje del centro no lo muestra, replicalo como los demas. Y ademas, las seccion de la navegacion, con los circulos por pagina etc, en muzicmania por alguna razon siempre muestre 3 paginas como si existieran pero no existen. Es decir no es ingeligente, si no hay reviews deberia salir 1 solo pagina accesible desde la navegacion. Recuerda que en la pagina de reviews debe ver 10 reviews por cada lista, debajo del todo (no arriba, ciszunetwork lo tiene arriba por error) debe aparecer unos botones o circulos con flehas a cada extremo para mostrar las paginas de la lista de reviews, esto inteligentemente. Estilo indice, maximo 10 bolitas por el estado actual de la lista es decir si estas en el indice 10 se mostraran los 5 anteriores y los 5 de despues. Tambien debe estar 1 bolita por cada extremo paarte de las flechas para acceso rapido del primer indice y para el ultimo indice. Basicamente cuando buscas en google, la cantidad de paginas que se busque. Cada reviews debe tener un boton para dar like, al dar like es otra accion de logeo necesario. Y REPITO NO INVENTARSE REVIEWS. En las listas, cada reviews del usuario debe la fecha, icono del usuario, displayname y @username, el comentario de la review y las 5 estrellas, recuerda que el sistema permite de 0.0 a 5.0 estrellas incluyendo mitades como 2.5, visualmente las estrellas suben de brillo o cambian de color entre mas puntuacion. Tambein se debe mostrar la puntuacion en numeros decimales. Finalmente un boton de like con auth requerido. Tambien se debe detectar un sistema de tags, tag de verificado es cuando una review lleva tiempo en linea y parece confiable, luego estan los tags de positivos y negativos que se filtran segun la cantidad de estrellas. Finalmente los filtros que filtran segun relevancia, tiempo, estrellas, likes, popularidad etc. Y ordenamiento de ascendente a descendente. Tambien debe ser estilo leaderboard con sus diferentes paginas y navegacion por paginas inteligente, con atajos y flechas a cada extremos para navegar. Al darle click a un perfil deberia llevarlo a la pagina de su perfil publico si la pagina permite, tambien estas reviews se pueden borrar si el usuario desea, el usuario solo puede subir 1 review, los admins tambien podran borrarlo. Tambien debe aparecer el icono de verificado alado del nombre en caso de que la persona esta verificada.
- [ ] La seccion de informacion en el header debe estar al final de la fila de paginas mostrables en el navbar. Ademas ciszubot No tiene seccion de information lo cual es un error grave debes agregarlo. Y traer las paginas de information dentro de esa seccion.
- [ ] Actualmente la seccion de ciszunetwork de cada website es bastante feo, en ciszubot no aparece el logo ni siquiera, ademas de que no comparten una estructura bien defnidia, necesito que se vea mejor.
- [ ] Replicar sistema de documentacion de muzicmania correctamente a las demas paginas, debemos regenerar la docuemntacion de cada pagina en cada formato, subirlo al cdn, crear los paquetes comprimibles. Y finalmente crear la estructura visual de muzicmania documentation a las demas paginas. Sin contar la carpeta documentation. Opciones de descarga, versiones, preview, descarga individual, info, bibloteca de documentacion etc.
- [ ] Replicar nuevo navbar de ciszubot a las demas paginas pero corregido.
- [ ] Se debe crear y replicar el sistema de soporte de muzicmania para las demas websites. Con su necesidad de logeo, tickets o peticiones, etc. Replica de muzicmania. No inventarse correos, el unico correo es ciszunetwork@gmail.com, ademas los titulos heros deben tener concitencia con las demas webpages de la misma website. Se deben agregar el apartado de redes social debajo, el sistema de soporte debe ser funcional en todas las websites, en ciszuko antony el correo sera fplayersoffcial@gmail.com. Corrige algunas pills o modals que no corresponden al tamaño del texto. Ademas veo que estas usando diferentes iconso por cada website de soporte, el icono correcto es una boya salvavidas circular.
- [ ] Se debe actualizar las paginas de los quickdocks de cada websites para añadir mas nuevas.
- [ ] Se debe crear el estilo o sistema de contacto para las demas paginas exepto muzicmania. Se debe agregar la disponibilidad, la estructura tecnica, el apartado del ceo y la red social unificada en cada website, cn su estilo pero mismo orden y estructura. Actualmente hay ciertas cosas que debemos arreglar, ciszukoantony no tiene todo lo que pedi, ciszubot y sus sistema de redes sociales es excasa, y ciszunetwork parcialmente. Debes usar todo el sistema y redes de redes unificada de muzicmania. En ciszubot el dock de disponibilidad al hacer hover el icono desaparece por el fondo, es decir no esta cuidado el UI. Pule todo los UIs y mejora el contact en todas las websites.
- [ ] Agregar pagina de donacion a los que no tienen. Se deben utilizar iconos REALES no generados por IA, se desben descargar oficialmente el svg y agregarlo a los icons del CDN. CiszukoAntony no tiene donate.
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
- [ ] El icono de leaderboard es incorrecto, deberia usar una copa.
- [ ] Los hero titles en general de ciszubo se ven mal por que la tipografia muestra las lineas vectorizadas o completas.
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
- [ ] Terminar idiomas en ingles UK.
- [ ] Terminar idiomas en ingles USA.
- [ ] Terminar idiomas en español LATAM.
- [ ] Terminar idiomas en español España.
