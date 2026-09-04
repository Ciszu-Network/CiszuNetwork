# To Do List — Ciszu Network

> Este archivo solo puede ser editado por Ciszuko Antony.

### Cambios Generales:

1. [ ] #3 Plantear utilizar otro respaldador de archivos diferentes a github:
       Para no codigo y no cdn. Es decir un storage cloud privado, que pueda usarse con CLi o automatizacion con API. Como google drive, onedrive, terabox, dropbox entre otros para poder reguardar seguramente todo mi codigos exepto credenciales, mas centrado al contenido y docuemntacion que mi codigo.
2. [x] #4 Mejorar sistema de certificados de ciszukoantony, thumbnails y sincronizacion automatica desde shared/docs/certificados. Completado: script sync:certificates + PdfThumbnail runtime + modal Preview/Files.
3. [ ] #5 Crear sistema de anuncios: Google Adsense, GA4, GTM, Tag y Analytics pack completo.
    - [ ] AdSense dice “Preparando el sitio”: revisar cuenta/sitio aprobado y crear unidades de anuncio tras aprobación.
    - [ ] GA4: confirmar Realtime page_views (requiere acceso a analytics.google.com).
    - [ ] GTM: publicar/verificar contenedores (requiere acceso a tagmanager.google.com).
    - [ ] Looker Studio: conectar fuentes GA4 y crear dashboard (requiere acceso manual).

4. [ ] El sistema de los discleimers y ads no llegan en local ni en global. Actualmente no funciona el sistema de agregar discleimer ni ads desde la devcon, simplemente no agrega nada visualmente a pesar que desde la devcon parece que si, siempre sale el banner de esta website esta en beta, recuerda que el discleimer de devcon debe indicar que fue enviado por la devcon, ademas que independientemente de la cantidad actual almacenada el usuario siempre le debe salir. Por otro lado la opcion de ads de la devcon ni si quiera me deja crear un ad, directamente no hace nada.

    Luego de que el sistema funcione debugear con ads para arreglar el error de el logo actual de ciszugamens no es correcto, usa los colores incorrectos, debe ser el de C morado, y Z azul. Con degradados. Outline. Actualmente se usa una version azul de la C y Z blanca.

### Cambios de AUTH en todas las Websites:

- [x] #1 Al registrarse o logearse debe haber cumplido la seguridad de cloudflare antes, y en ese instante un recaptcha, actualmente muzicmania tiene recaptcha. Siempre luego debe haber una pantalla para verificar el correo en momento de reggistrarse (pero es opcional, luego en sus configuraciones de cuenta puede terminar la verificacion) pero si el usuario tiene 2FA siempre debe haber una pantalla pidiendole una clave que empieze po C- y seguido de 6 digitos y en la mitad un espacio (C-123 434) clave oficial de ciszunetwork, temporal, expirable en 3 horas e indicar, unico por website, indicar si ya expiro y posibilidad de reenviar otro codigo con limites, al tercer limite se suspende temporalmente y localmente por que no logro iniciar sesion. (Primero arreglar todo lo de abajo)
- [x] #2 Cuando un usuario se registre luego se tiene que logear denuevo, si un usuario pierde su contra debe darle a olvide la contraseña y debe enviar una peticion, SOLAMENTE ESO, ya en su email se le enviare un link temporal de un oslo uso para recuperar su contra, con una pantalla exclusiva donde coloca su contraseña nueva y lo repite. No puede ser la antigua, luego requiere logearse. (Primero arreglar todo lo de abajo)

### Cambios por Website

**Ciszu Network Website:**

- [ ] En las preferencias locales, el menu de idiomas esta muy bug, al entrar no me deja usar el scrollbar ni bajar, los botones se ven muy estaticos como si fuera una imagen todo, no medeja seleccionar los primers idiomas, el boton de retroceder quita todo el modal de preferencias lo cual es un error ,debemos corregir esto para que las demas websites usen esta estructura correctamente. Tambien note que al presionar dentro del modal de preferencias o dentro del minimodal de lenguaje dentro de preferencias, al hacer click tambien interactua con lo que esta atras, provocando que active opciones del propio modal de prefernecias en caso de que esta dentro del minimodal o minimenu de lenguajes o aun peor, presionar botones detras de preferencias como de la propia pagina redireccion al usuario a otras cosas. Necesito que corrigas el menu de preferencias correctamente.
- [ ] Terminar idiomas en español (latam y español) por separado.
- [ ] Terminar idiomas en ingles (UK y USA) por separado.
- [ ] Terminar bien el tema claro (Todos los docks, modals o cards con fondo oscuro paran a claro, los textos oscuros o negros e iconos negros o oscuros.)
- [ ] Si un idioma no esta agregado o terminado (todos menos español LATAM Y ESPAÑA e ingles USA Y UK actualmente) debe estar bloqueado, puedes porjeemplo fundirlo mas oscuro, y al dar click debe mostrar un error diciendo que no esta disponible usando el sistema de notif en rojo como error. Este bloqueo debe estar tanto en los navbars (menu de idiomas de sliderbar) como cualquier otro menu de idioma, como el de preferencias. En caso de muzicmania tambien dentro de play.
- [ ] Al cambiar de idioma siempre actualizar la pagina y avisarle al usuario con un toast usando el sistema de notif en azul.
- [ ] Recuerda que los idiomas de español (2) y los de ingles (2) son individuales entre si, es decir son 4 idiomas aparte. No puedes juntarlos.
- [ ] Al cambiar de temas siempre actualizar la pagina y avisarle al usuario con un toast usando el sistema de notif en azul.

**Ciszubot Website:**

- [ ] En las preferencias locales. No tiene el sistema de idiomas correcto, copiar de ciszunetwork arreglado.
- [ ] El boton de togle theme de preferencias no usa el boton de las demas websites, arregla esto.
- [ ] Terminar idiomas en español (latam y español) por separado.
- [ ] Terminar idiomas en ingles (UK y USA) por separado.
- [ ] Terminar bien el tema claro (Todos los docks, modals o cards con fondo oscuro paran a claro, los textos oscuros o negros e iconos negros o oscuros.)
- [ ] Si un idioma no esta agregado o terminado (todos menos español LATAM Y ESPAÑA e ingles USA Y UK actualmente) debe estar bloqueado, puedes porjeemplo fundirlo mas oscuro, y al dar click debe mostrar un error diciendo que no esta disponible usando el sistema de notif en rojo como error. Este bloqueo debe estar tanto en los navbars (menu de idiomas de sliderbar) como cualquier otro menu de idioma, como el de preferencias. En caso de muzicmania tambien dentro de play.
- [ ] Al cambiar de idioma siempre actualizar la pagina y avisarle al usuario con un toast usando el sistema de notif en azul.
- [ ] Recuerda que los idiomas de español (2) y los de ingles (2) son individuales entre si, es decir son 4 idiomas aparte. No puedes juntarlos.
- [ ] Al cambiar de tema siempre actualizar la pagina y avisarle al usuario con un toast usando el sistema de notif en azul.

**Ciszuko Antony Website:**

- [ ] En las preferencias locales. No tiene el sistema de idiomas correcto, copiar de ciszunetwork arreglado.
- [ ] Terminar idiomas en español (latam y español) por separado.
- [ ] Terminar idiomas en ingles (UK y USA) por separado.
- [ ] Terminar bien el tema claro (Todos los docks, modals o cards con fondo oscuro paran a claro, los textos oscuros o negros e iconos negros o oscuros.)
- [ ] Si un idioma no esta agregado o terminado (todos menos español LATAM Y ESPAÑA e ingles USA Y UK actualmente) debe estar bloqueado, puedes porjeemplo fundirlo mas oscuro, y al dar click debe mostrar un error diciendo que no esta disponible usando el sistema de notif en rojo como error. Este bloqueo debe estar tanto en los navbars (menu de idiomas de sliderbar) como cualquier otro menu de idioma, como el de preferencias. En caso de muzicmania tambien dentro de play.
- [ ] Al cambiar de idioma siempre actualizar la pagina y avisarle al usuario con un toast usando el sistema de notif en azul.
- [ ] Recuerda que los idiomas de español (2) y los de ingles (2) son individuales entre si, es decir son 4 idiomas aparte. No puedes juntarlos.
- [ ] Al cambiar de tema siempre actualizar la pagina y avisarle al usuario con un toast usando el sistema de notif en azul.

**MuzicMania Website:**

- [ ] En las preferencias locales. No tiene el sistema de idiomas correcto, copiar de ciszu network arreglado.
- [ ] Terminar idiomas en español (latam y español) por separado.
- [ ] Terminar idiomas en ingles (UK y USA) por separado.
- [ ] Terminar bien el tema claro (Todos los docks, modals o cards con fondo oscuro paran a claro, los textos oscuros o negros e iconos negros o oscuros.)
- [ ] Si un idioma no esta agregado o terminado (todos menos español LATAM Y ESPAÑA e ingles USA Y UK actualmente) debe estar bloqueado, puedes porjeemplo fundirlo mas oscuro, y al dar click debe mostrar un error diciendo que no esta disponible usando el sistema de notif en rojo como error. Este bloqueo debe estar tanto en los navbars (menu de idiomas de sliderbar) como cualquier otro menu de idioma, como el de preferencias. En caso de muzicmania tambien dentro de play.
- [ ] Al cambiar de idioma siempre actualizar la pagina y avisarle al usuario con un toast usando el sistema de notif en azul.
- [ ] Recuerda que los idiomas de español (2) y los de ingles (2) son individuales entre si, es decir son 4 idiomas aparte. No puedes juntarlos.
- [ ] Al cambiar de tema siempre actualizar la pagina y avisarle al usuario con un toast usando el sistema de notif en azul.
