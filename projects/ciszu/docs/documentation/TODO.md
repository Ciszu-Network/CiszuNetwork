# To Do List — Ciszu Network

> Este archivo solo puede ser editado por Ciszuko Antony.

### Cambios de Generales:

- [ ] Finalizar el cambio de los VISUAL_BUILDERS e conciderar las demas herramientras como Onlook u otras pendientes o posibles. Instalar, implementar, documentar y commitear.
- [ ] Agregar en todas las websites un discleimer que se pueda quitar con una X, posicionado de extremo a extremo en la header de cada website, sobre que esta website/app seta siendo construida en version BETA.
- [ ] Terminar por lo menos el tema oscuro y claro en TODAS LAS WEBSITES.
- [ ] Terminar por lo menos 2 ramas de idiomas (español e ingles (latam, españa, usa, uk)) en TODAS LAS WEBSITES, las que no estan disponiblse seguir dando error por version beta.
- [ ] Investigar herramientas de SEO e crear documentacion de SEO_PLAN.md e implementarla.

### Cambios a todas las Websites:

- [ ] TODAS las cuentas deben ser oficialmente "CISZU ID", y debajo un subtitlo como, crea tu cuenta en (proyecto) con CISZU ID.

    Por otro lado los iconos de google y microsoft cambian entre apps, usa el de ciszunetwork website. Son lso correctos por sus colores.

    El sistemas de errores de ciszuko antony website es bastante diferente a los de los demas (centrado), para mejorar el estilo guiate de los demas.

    Google y microsoft no son opciones adicionales, cuando se registre o logee debe ser una opcion como "CONTINUAR CON:"

    Finalmente las preferencias locales estan bien pero no es coo o pensaba. Quiero que esten dentro de un modal aparte, en el boton de auth, quiero que al darle click en un boton sobre preferencias locales, salga el menu en el medio.

    Parecido al menu de configuracion de muzicmania, dentro estara silenciar pestaña, zoom, idioma, lenguaje y acceso rapido de ayuda. Ten en cuenta que actualmente existen 2 errores de consistencia, los botones de tema y de lenguaje deben ser iguales a los del menu hamburguesa/footer. Actualmente la mayoria usa un ssitema de lenguajes diferente e erroneo. Debes adaptar el sistema de lenguaje que no solo salga como en el menu de hamburguesa slidebar, si no tambien independientemente, de hecho en muzicmania ya existe dentro de play, un menu de lenguajes parecido a lo que necesito.

    Digamos que el sistema de zoom debe ser independientemente de cualquier otra pagina (por pagina) y ademas el de silenciar pagina tambien, las preferencias se guardan localmente.

    Como diseño el de idioma y tema obviamenta ya sabes como lo quiero. Pero para los otros, Sobre el zoom prefiero mucho el estilo de zoom de ciszubot, y para el silenciar pestaña cualquiera menos ciszubot.

    Sobre la ayuda directa depende de cada pagina, aunque en un futuro tendremos todas las paginas con muchas paginas parecidas, pro ahora adaptalo por pagina.

    Y bueno, como siempre a la hora de auth siempre debe haber discleimer o opciones secundarios de acceso rapido preguntandole al usuario, como ¿has olvido tu contraseña? RECUPERALA , ¿sin registro? REGISTRATE, ¿acceder ahora? ACCEDER, ¿Necesitas ayuda? SOPORTE. Y asi, estos deben estar en TODOS los auth en todos los websites, exceptuando el de REGISTRATE o ACCEDER, depende de que auth estas haciendo.

    Finalmente, los campos de texto de auth debe tener un placeholder interno de ayuda visual, mostrar cuales son los requeridos, dar error si uno campo de dato no se relleno y es requerido, indicar cuando es opcional, y si da error o antes de probar los datos siempre debe haber un boton por cada titulo de campo de texto o un icono para que despliegue cuales son los requerimientos.

    Para la contraseña, siempre al registrarse repetir contraseña, ademas de una barra de seguridad, ciszu ID requiere un nivel alto de seguridad, almenos 1 mayuscula, 1 minuscula, 1 numero, 1 especial. Por cada acertado la barra de seguridad sube, el minimo es seguridad normal, cambia de color por nivel de seguridad. Recuerda que el repetir contraseña debe ser igual a la contraseña. Ese es otro tipo de error.

    Tanto en login como em registro, el icono que debes usar siempre es el de CISZU como isotipo, luego una "X" en svg para mostrar que es una colaboracion o coneccion, y luego el isotipo de la website. De manera que se entienda que CISZU ID es de ciszunetwork y se coencta entre varias apps.

    Ademas al darle click en el isotipo de ciszunetwork lo llevara a la pagina, asi como opciones secundarios, puedes recomendarle al usuario crearse una cuenta en ciszunetwork.

    Finalmente recuerda que al registrarse o logearse debe ahber cumplido la seguridad de cloudflare antes, y en ese instante un recaptcha, actualmente muzicmania tiene recaptcha. Siempre luego debe haber una pantalla para verificar el correo en momento de reggistrarse (pero es opcional, luego en sus configuraciones de cuenta puede terminar la verificacion) pero si el usuario tiene 2FA siempre debe haber una pantalla pidiendole una clave que empieze po C- y seguido de 6 digitos y en la mitad un espacio (C-123 434) clave oficial de ciszunetwork, temporal, expirable en 3 horas e indicar, unico por website, indicar si ya expiro y posibilidad de reenviar otro codigo con limites, al tercer limite se suspende temporalmente y localmente por que no logro iniciar sesion.

    Basicamente un auth pulido y seguro de toda la vida.

    Cuando un usuario se registre luego se tiene que logear denuevo, si un usuario pierde su contra debe darle a olvide la contraseña y debe enviar una peticion, SOLAMENTE ESO, ya en su email se le enviare un link temporal de un oslo uso para recuperar su contra, con una pantalla exclusiva donde coloca su contraseña nueva y lo repite. No puede ser la antigua, luego requiere logearse.

    TODO esto debes documentarlo en AUTH_SYSTEM o LOGIN_REGISTER_PROTOCOLS. Oficiales de CISZU.

    Tambien se debe detecar el intento de inicio o registro de sesion, su IP, para sancionarlo luego si es spam o intento de hackeo, logs. Permitir que los usuarios copien y pegen exepto en la contraseña, pero si puede autocompletar con seguradores de contraseñas. Las sesiones de cuentas se guardan con cookie pero intenta que no sea tan dificil de hacker las cuentas.

    Tambien debes de por si detectar las ips o el pais de quien entra para configurarla su idioma, si su idioma no esta disponible automaticamente llevarla al ingles.

    Planificar, analiza investiga y documenta primero. Luego resuleve y implementa, ten en cuneta que muchas de las cosas a estan, en especial muzicmania que esta mas avanzada. Pero muchas cosas no estan hechas.

    Obviamnete el menu de opciones debe tener su X, para quitar.

    Si se elimina los datos locales se pierden las preferencias locales y el Invitado generado.

### Cambios por Website

**Ciszu Network Website:**

- [ ] Nada.

**Ciszubot Website:**

- [ ] Nada.

**Ciszuko Antony Website:**

- [ ] Nada.

**MuzicMania Website:**

- [ ] Nada.
