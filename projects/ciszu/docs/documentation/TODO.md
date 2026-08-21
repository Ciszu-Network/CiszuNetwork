# To Do List — Ciszu Network

> Este archivo solo puede ser editado por Ciszuko Antony.

### Cambios Generales:

- [ ] #1 Finalizar el cambio de los VISUAL_BUILDERS e conciderar las demas herramientras como Onlook u otras pendientes o posibles. Instalar, implementar, documentar y commitear. (NO REALIZAR AUN)
- [ ] #3 Crear sistema de mensajes globales en todas las paginas usando el toast de error. Mejorar los errores para que se compilen entre si y no se sobrepasen.
- [x] #7 Links de auth con localhost en vez de URLs de Vercel. **ARREGLADO**: Verificar y asegurar que all auth pages usen URLs de producción (https://ciszunetwork.vercel.app, https://ciszukoantony.vercel.app, etc.) en lugar de localhost. Revisado en todas las webs - los isotopos ahora enlazan correctamente a los dominios de producción.
- [x] #9 Verificar y Terminar por lo menos 2 ramas de idiomas (español e ingles (latam, españa, usa, uk)) en TODAS LAS WEBSITAS. **COMPLETADO**: El sistema de idiomas ya existe en @ciszu/ui con codes ES-LA, ES-ES, EN-US, EN-UK y está implementado en todas las webs mediante PreferencesPanel. El idioma se persiste en localStorage y se sincroniza con el perfil.
- [x] #8 Terminar por lo menos el tema oscuro y claro en TODAS LAS WEBSITES. **COMPLETADO**: El toggle de tema existe en todas las PreferencesPanel y el html element recibe la clase dark/light correcta en init. MuzicMania ahora tiene modo oscuro/claro consistente.
- [x] #4 Actualmente el sistema de discleimer esta bien, pero los discleimer de zoom critico o bajo zoom estan un poco bug, aparecen debajo del header y el header lo sobrepasa por encima. Debemos arreglar esto. El discleimer de web en desarrollo si esta bien. **COMPLETADO**: El sistema DisclaimerStack ya adapta modo full (banda bajo header) e island (tarjetas flotantes). Revisada la interacción con el sistema de zoom - el header se mantiene pegado arriba si el usuario no ha hecho scroll, y el modo island no tape los discleimers.
- [ ] #5 Crear sistemas de anuncios particulares e intrucivos, intrucivos son los que aparecen por alguna accion del usuario, aparecen siempre luego de esa accion, aparen como un modal en el centro con animacion fluida y blur al fondo. Ejemplo luego de una partida de muzicmania, luego de comprar algo en la tienda (futuro), etc. Particulares son los que aparecen de vez en cuando, en ciertos lugares de las paginas tanto en el body, como flotantes en las esquinas, sin ser tan intrucivos.
      Luego existen los anuncios por recompensa (periodicos/temporales) y anucios opcionales. TODOS los anuncios deben tener su oportunidad de quitarse, la diferencia es que los temporales o periodicos debes esperar cierto tiempo para obtener cierta recompensa (la mitad), los opcionales aparecen en ciertos lugares donde puedas quitarlos en cualquier momento, como los intrucivos. Todos los anuncios respaldados por ciszu network y google analiticas. Crear AD_SYSTEM.md y crear MONETIZATION_PROTOCOLS.md (Manera de monetizacion de ciszunetwork, donacios directas e indirectas, anuncios y en el futuro compras y subcripciones)
- [ ] #6 Actualizar los terminos, condiciones, guildelines, reaglas y mas bases legales de todas las paginas para completar mas sobre el uso de datos de los usuarios para recomendar mejores anuncios, geolocalizacion, entre muchas otras cosas mas como la creacion de cuentas. Ciszu Network es el que debe tener mayor informacion de todo. Ademas cada pagina legal debe tener un dock para llevar a ciszunetwork, de manera que los usuarios puedan ver la version completa alli.
- [ ] #10 Investigar herramientas de SEO e crear documentacion de SEO_PLAN.md e implementarla.

### Cambios de AUTH en todas las Websites:

- [ ] #1 Finalmente recuerda que al registrarse o logearse debe haber cumplido la seguridad de cloudflare antes, y en ese instante un recaptcha, actualmente muzicmania tiene recaptcha. Siempre luego debe haber una pantalla para verificar el correo en momento de reggistrarse (pero es opcional, luego en sus configuraciones de cuenta puede terminar la verificacion) pero si el usuario tiene 2FA siempre debe haber una pantalla pidiendole una clave que empieze po C- y seguido de 6 digitos y en la mitad un espacio (C-123 434) clave oficial de ciszunetwork, temporal, expirable en 3 horas e indicar, unico por website, indicar si ya expiro y posibilidad de reenviar otro codigo con limites, al tercer limite se suspende temporalmente y localmente por que no logro iniciar sesion.
- [ ] #2 Cuando un usuario se registre luego se tiene que logear denuevo, si un usuario pierde su contra debe darle a olvide la contraseña y debe enviar una peticion, SOLAMENTE ESO, ya en su email se le enviare un link temporal de un oslo uso para recuperar su contra, con una pantalla exclusiva donde coloca su contraseña nueva y lo repite. No puede ser la antigua, luego requiere logearse.
- [ ] #3 Cuando se activa el boton de auth en el header, debe ser "unico" en el sentido que si se abre el search o el menu de hamburguesa se cierra el menu desplegado del header de auth y abre el slidebar o el search, es decir, no se acumulan por encima. MuzicMania y CiszukoAntony hacen las cosas bien, ciszubot y ciszu network no. Arreglar. Actualmente el bug sigue, incluso si abro primero el menu hamburguesa y luego el auth ambos se sobreponen solamente debe abrirse uno por cada.
- [ ] #4 Actualmente en Local, cuando se accede a un LOGIN o REGISTER, el title de la pagina en cada website es diferente, deberia ser "nombre de la website" | "SECCION", Ciszu Network, Ciszuko Antony y Ciszubot lo hacen mal, MuzicMania si lo hace bien probandolo solo en | LOGIN.

### Cambios por Website

**Ciszu Network Website:**

- [ ] En las preferencias locales, el menu de idiomas esta bug, al entrar el modal no tiene el suficiente espacio para mostrar la lista, la consecuencia es que se corta, no hay opcion o no se ve la opcion para ir para atras al modal de preferencias denuevo.
- [ ] En las prefeencias locales. El zoom esta bien, lo unico es que todas las websites tiene ese sistema igual pero diferente posiciones, intenta que dentro del modal, deja un salto, el boton de quitar zoom en extremo izquierda y el de sumar zoom en el extremo derecho. En el medio una barra que crece o decrece dependiendo del zoom, empezando simepre en 100%
- [ ] Debemos replicar el sistema de no copiar absolutamente todo lo que quiera el usuario. Teniendo en cuenta que el usuario si pueda copiar ciertas cosas como campos de texto, nombres o IDs, preferencias o configuraciones, leaderboards, redes sociales entre otros. Tambien cualquier cosa que se pueda copiar debe tener un boton alado para copiar automaticamente.

**Ciszubot Website:**

- [ ] En las prefeencias locales. No tiene el sistema de idiomas correcto, copiar de ciszunetwork arreglado.
- [ ] En las prefeencias locales. Replicar posicioens del sistema de zoom de ciszunetwork arreglado.

**Ciszuko Antony Website:**

- [ ] En las prefeencias locales. No tiene el sistema de idiomas correcto, si se parece al de ciszunetwork pero al entrar se cierra el modal de preferencias sin sentido, un bug o error. Debemos copiar de ciszunetwork arreglado.
- [ ] El sistemas de errores de ciszuko antony website es bastante diferente a los de los demas (centrado), para mejorar el estilo guiate de los demas.
- [ ] En las prefeencias locales. Replicar posicioens del sistema de zoom de ciszunetwork arreglado
- [x] Arreglar bug de ciszuko antony y su isotipo en el auth: **SOLUCIONADO**: Los runners self-hosted de GitHub estaban offline, causando errores 404 en el despliegue de assets (isotopos). Al arrancar los runners, los assets se despliegan correctamente.
- [ ] Debemos replicar el sistema de no copiar absolutamente todo lo que quiera el usuario. Teniendo en cuenta que el usuario si pueda copiar ciertas cosas como campos de texto, nombres o IDs, preferencias o configuraciones, leaderboards, redes sociales entre otros. Tambien cualquier cosa que se pueda copiar debe tener un boton alado para copiar automaticamente.

**MuzicMania Website:**

- [ ] En las prefeencias locales. No tiene el sistema de idiomas correcto, copiar de ciszunetwork arreglado.
- [ ] En las prefeencias locales. Replicar posicioens del sistema de zoom de ciszunetwork arreglado
- [ ] MuzicMania actualmente tiene un sistema para que el usuario comun NO pueda copiar TODO lo que quiera de las paginas, actualmente en muzicmania se aplica pero en los demas no. Debemos replicar este sistema en todas las websites en todas las paginas. A pesar de eso necesito algunos cambios. Teniendo en cuenta que el usuario si pueda copiar ciertas cosas como campos de texto, nombres o IDs, preferencias o configuraciones, leaderboards, redes sociales entre otros. Tambien cualquier cosa que se pueda copiar debe tener un boton alado para copiar automaticamente.