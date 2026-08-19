# To Do List — Ciszu Network

> Este archivo solo puede ser editado por Ciszuko Antony.

### Cambios de Generales:

- [ ] Finalizar el cambio de los VISUAL_BUILDESR e conciderar las demas herramientras como Onlook u otras pendientes o posibles. Instalar, implementar, documentar y commitear.
- [ ] Arreglar vulnerabilidad:

* [uuid: Missing buffer bounds check in v3/v5/v6 when buf is provided](https://github.com/Ciszu-Network/CiszuNetwork/security/dependabot/50) [Moderate](https://github.com/Ciszu-Network/CiszuNetwork/security/dependabot?q=is%3Aopen+severity%3Amoderate 'Severity: moderate')

    #50 opened 2 hours ago • Detected in uuid (npm) • pnpm-lock.yaml

### Cambios a todas las Websites:

- [ ] Sincronizar AUTH. De manera que implementemos la primera fase del auth, segun su documentacion cada webapp debe tener un AUTH oficial, finalmente el unico que tendra un oAUTH aparte sera ciszubot con discord, los auth no puedes ser tan diferentes. Todos deben decir iniciarse sesion o registarse. Muy parecido a MuzicMania. Pero al entrar a registrase o logearse, en su pantalla. Debe salir la seccion de logear/registrase con CISZU ID (normal, default o por defecto con correo contraseña etc, el auth que tiene el mejor diseño y es el de muzicmania, debemos crear la base de datos de cada pagina dentro de ciszunetwork con respecto al auth no centralizada, pero en un futuro si), y opciones adicionales como google, microsoft entre otros. PERO estas opciones por ahora funcionaran como placeholder, al darle click saldra un error de beta. Pero el unico que funcionara sera el de discord de ciszubot. De hecho, es obligatorio usar el registro y login de discord en ciszubot indiferentemente si tiene CISZU ID)
- [ ] IMPLEMENTAR SISTEMA DE INVITADOS, actualmente implemente en muzicmania un sistema de invitados, un ID unico local con nomenclatura especial. Para crear un nametag de "invitado", el problema es que actualmente solo esta en /play de muzicmania. Ni si quiera esta afuera de play en muzicmania. ¿Que debmemos hacer? simple, en una web misma, el invitado sera el auth sin registro o login, al entrar al boton de auth saldra un icono de invitado generico + el nombre de invitado. Este invitado usara preferencias locales pero nunca tendra presencia en base de datos, seguira siendo un usuario no logeado o no registrado aun. Esto con el fin de incentivar a los usuarios a registrarse y personalizar su foto y nombre. Existe exepciones como en muzicmania que los invitados pueden jugar y guardar sus leaderboard. Pero no hay que darles prioridad. Este sistema solo esta en muzicmania, pero debemos llevarlo a ciszubot, ciszunetwork y ciszukoantony de manera mas simplificada. No importa si el ID generado del invitado cambia al actualizar o cambia por website, es solo frotend y no importa. Lo importante es mantener un diseño coherente, replicar si hace falta y guiarnos por muzicmania que lo tiene implementado parcialmente (solo en play), ojo, en muzicmania si debe ser siempre el mismo ID, tanto el del header como en la seccion dentro de play, para no crear confusion.
- [ ] IMPLEMENTAR PREFERENCIAS LOCALES, a diferencias de configuraciones o opciones de perfil. Las preferencias simpre estaran disponibles para todos los usuarios. De esta manera, para acceder siempre sera dando el boton de AUTH (Logeado o no, debe salir) estas preferencias se guardan siempre localmente, pero si logeado si debe guardarlo. Las opciones de preferencias seran el idioma, el tema, una pequeña seccion de ayuda, hacer zoom o disminuir el zoom, y otras opciones de interaccion directa con el navageador, como silenciar la pestaña entre otras. Y que los usuarios no se quejen por que esten obligados a registrarse, estas opciones siempre se guardan localmente, es basicamente un menu rapido de opciones y preferencias para todos invitados o usuarios registrados. Se debe usar los mismos botones de theme y lenguaje que en los navbars.
- [ ] Verificar si todas las paginas tienen pagina 404 personalizada.

### Cambios por Website

**Ciszu Network Website:**

- [ ] Nada.

**Ciszubot Website:**

- [ ] El 404 de ciszubot tiene un error visual en el VOLVER A HOME. Arreglar error de diseño y estilo css, actualmente el boton se divide en dos en vez de ser un completo.

**Ciszuko Antony Website:**

- [ ] Nada.

**MuzicMania Website:**

- [ ] Nada.
