# To Do List — Ciszu Network

> Este archivo solo puede ser editado por Ciszuko Antony.

## Frontend General — estructura y diseño de páginas

**PDWA (Descargas) + Feedback botones flotantes.**

- [ ] Ahora existen 2 problemas. El primero es simple, basicamente cuando se se cierra varios botones flotantes al mismo tiempo las advertencias se sobre ponen, no es un error critico, pero para que sea visualmente mejor, las advertencias tambien se deberian "stackear" o guardar como pilas uno encima de otra, con el fin de que no se sobrepongan entre si, parecido a los botones flotantes. Pero ojo, siempre las advertencias no deben tampoco sobreponerse ne botones flotantes.
- [ ] Actualmente el contador esta bien visualmente, pero a la hora de probar y debuggear, existe un problema claro, el contador aveces se congela o no termina de llegar a 0. Se queda trabado entre el 1 o 3 por segundos, no es fluido. Al final si llega a su cometido de autocerrarse pero se ve trabado o cargado lento.

# Cambios por cada website para pulir errores de frontend (adema de las generales)

Ciszu Network Website:

- [ ] El menu de idiomas deben tener todos los idiomas que muzicmania tambien tiene (pero ojo no como implementacion, al seleccionar un idioma que no este terminado debe salir un error estilo muzicmania)
- [ ] En reviews debes agregar este link de opiniones de google: [g.page/r/CTGLyn7UrVHPEAE/review](https://g.page/r/CTGLyn7UrVHPEAE/review) tambien guardalo en el vault.
- [ ] Tambien guarda este ID sobre el negocio de google: 12451554180623658502 y el codigo de tienda 15916715880116624592 | Conexión con Ciszu (om-4449155801906919160) y link del negocio [share.google/i2XMvOrh6y3ap0sBq](https://share.google/i2XMvOrh6y3ap0sBq) | 98J5+WQ Coro, Falcón | TODO esto debe estar presente guardado en vault, documentado en GOOGLE_SYSTEM.md y en la pagina web.
- [ ] En el footer y en general en las redes sociales le falta la red social de tiktok. Aqui el link oficial y guardalo: [www.tiktok.com/@ciszunetwork](https://www.tiktok.com/@ciszunetwork)
- [ ] El menu de idiomas del footer debe ser igual al que esta adentro del hamburguer menu, no otro diferente. Parecido al footer de muzicmania.
- [ ] Quitar el efecto de oscuridad o fundido negro a la hora de estar dentro del menu de hamburguesa, es decir igual a muzicmania, sin ningun efecto.
- [ ] El menu de idiomas del footer debe ser como el footer de muzicmania, es decir, decir LANG. Y al darle entrar al menu de idiomas desde el menu de hamburguesa.

## Ciszubot Website:

- [ ] Quitar el efecto de oscuridad o fundido negro a la hora de estar dentro del menu de hamburguesa, es decir igual a muzicmania, sin ningun efecto.
- [ ] En el header quita los botones del theme y lenguaje en el navbar, debido a que este estare en el menu hamburguesa ya.
- [ ] Actualmente al abrir el menu hamburguesa cubre todo el lateral de la pagina. Eso esta mal. Deberia ser como ciszunetwork o muzicmania, aparecer debajo del header en el sentido que no lo sobreponga por arriba. Recuerda que el boton de meu hamburguesa es un togle, al darle lo abbre y al darle de nuevo se convierte en una X y si le das denuevo se quita. Fijate en la pagina de ciszunetwork y muzicmania. Eso significa que actualmente la x que esta incrustada adentro del menu hamburguesa quitala, es redundante.
- [ ] Ciszubot es la unica web con un diseño un poco mas diferente en especial la gui y botones, deben ser mas parecidos al estilo de las demas 3 paginas o usar el mismo. Aun siguen siendo diferentes, el icono de autentificacion (icion de humano) es diferente (con una linea debajo), el de menu hamburguesa las lineas son menos gruesas, deberian ser mas gruesas, el icono de lupa es diferente, basicamente existen muchas inconsistencias de iconos con respecto a las demas websites.
- [ ] El menu de idiomas deben tener todos los idiomas que muzicmania tambien tiene (pero ojo no como implementacion, al seleccionar un idioma que no este terminado debe salir un error estilo muzicmania)
- [ ] El menu de idiomas del footer debe ser como el footer de muzicmania, es decir, decir LANG. Y al darle entrar al menu de idiomas desde el menu de hamburguesa.
- [ ] El boton de invitar del header debe verse igual o ser igual al del footer, el del footer no tiene el degradado y el contenido interno es muy pequeño. Debemos aocmodar eso.
- [ ] El copyright aunque si esta centrado es muy diferente a los de los demas y no siguen el mismo estilo , nomenclatura ordenada. Arregla esto. Ejemplo: "

**©** 2024-2026 [CISZU NETWORK](https://ciszunetwork.vercel.app/) (CISZUBOT EN ESTE CASO) & TODOS LOS DERECHOS RESERVADOS.

Hecho con amor por [CISZUKO ANTONY](https://ciszukoantony.vercel.app/) · respaldado por [CISZU NETWORK](https://ciszunetwork.vercel.app/)" con hipervinculos

Ademas el copyright siempre va de ultimo, incluso despues de los botones de accion de footer.

Ciszuko Antony Website:

- [ ] Quitar el efecto de oscuridad o fundido negro a la hora de estar dentro del menu de hamburguesa, es decir igual a muzicmania, sin ningun efecto.
- [ ] Hay un boton de whatsapp como icono redondo duplicado 2 veces sin sentido en el footer, cambia este boton por la red social faltante pinterest: [pinterest.com/ciszukoantony](https://es.pinterest.com/ciszukoantony/)
- [ ] El menu de idiomas deben tener todos los idiomas que muzicmania tambien tiene (pero ojo no como implementacion, al seleccionar un idioma que no este terminado debe salir un error estilo muzicmania)
- [ ] El menu de idiomas del footer debe ser como el footer de muzicmania, es decir, decir LANG. Y al darle entrar al menu de idiomas desde el menu de hamburguesa.
- [ ] En el footer al hacer hover en el logo, si aparece el glow o destello azul pero el isotipo canal de youtube de ciszukoantony se enmarca con un borde azul ahora. NO deberia haber ningun borde. Fijate en el header. No tiene ningun contorno, simplemente es un glow o destello.

MuzicMania Website:

- [ ] Un error pequeño pero no se a que se debe. En general, existe 2 iconos de muzicmania que no cargan, en especial en la seccion de informacion se ve mas claramente. Los iconos son los de next.js y typescript.

"781b197b-9beb12d1de5e9445.js:2**Creating a worker from 'blob:**https://muzicmania.vercel.app/b1de7028-5bc1-439c-b061-727d2b62174d**' violates the following Content Security Policy directive: "script-src 'self' 'unsafe-inline' **https://challenges.cloudflare.comhttps://static.cloudflareinsights.comhttps://us.i.posthog.comhttps://us-assets.i.posthog.com**". Note that 'worker-src' was not explicitly set, so 'script-src' is used as a fallback. The action has been blocked.\*\*

|     | (anonymous)                | @   | 781b197b-9beb12d1de5e9445.js:2 |
| --- | -------------------------- | --- | ------------------------------ |
|     | eventBuffer.useCompression | @   | 781b197b-9beb12d1de5e9445.js:2 |
|     | \_initializeRecording      | @   | 781b197b-9beb12d1de5e9445.js:2 |
|     | initializeSampling         | @   | 781b197b-9beb12d1de5e9445.js:2 |
|     | \_initialize               | @   | 781b197b-9beb12d1de5e9445.js:2 |
|     | afterAllSetup              | @   | 781b197b-9beb12d1de5e9445.js:2 |
|     | u                          | @   | 4318-ffcc1e71ee9dbe29.js:485   |
|     | \_setupIntegrations        | @   | 4318-ffcc1e71ee9dbe29.js:2     |
|     | init                       | @   | 4318-ffcc1e71ee9dbe29.js:2     |
|     | i                          | @   | 4318-ffcc1e71ee9dbe29.js:485   |
|     | C                          | @   | 4318-ffcc1e71ee9dbe29.js:488   |
|     | (anonymous)                | @   | 4318-ffcc1e71ee9dbe29.js:2     |
|     | k                          | @   | 4318-ffcc1e71ee9dbe29.js:2     |
|     | 62053                      | @   | main-app-d4b096bdab756bf3.js:1 |
|     | r                          | @   | webpack-c302941f59bc1131.js:1  |
|     | t                          | @   | main-app-d4b096bdab756bf3.js:1 |
|     | (anonymous)                | @   | main-app-d4b096bdab756bf3.js:1 |
|     | r.O                        | @   | webpack-c302941f59bc1131.js:1  |
|     | (anonymous)                | @   | main-app-d4b096bdab756bf3.js:1 |
|     | t                          | @   | webpack-c302941f59bc1131.js:1  |
|     | (anonymous)                | @   | main-app-d4b096bdab756bf3.js:1 |

fcc9b256-b7a311d3ac8e8759.js:1\*\* \*\* **GET **https://muzicmania.vercel.app/icons/sprites/sprite.svg** net::ERR_ABORTED 404 (Not Found)**

|     | sc                          | @   | fcc9b256-b7a311d3ac8e8759.js:1 |
| --- | --------------------------- | --- | ------------------------------ |
|     | sd                          | @   | fcc9b256-b7a311d3ac8e8759.js:1 |
|     | (anonymous)                 | @   | fcc9b256-b7a311d3ac8e8759.js:1 |
|     | ix                          | @   | fcc9b256-b7a311d3ac8e8759.js:1 |
|     | ik                          | @   | fcc9b256-b7a311d3ac8e8759.js:1 |
|     | (anonymous)                 | @   | fcc9b256-b7a311d3ac8e8759.js:1 |
|     | ib                          | @   | fcc9b256-b7a311d3ac8e8759.js:1 |
|     | iu                          | @   | fcc9b256-b7a311d3ac8e8759.js:1 |
|     | iG                          | @   | fcc9b256-b7a311d3ac8e8759.js:1 |
|     | iW                          | @   | fcc9b256-b7a311d3ac8e8759.js:1 |
|     | i\_                         | @   | fcc9b256-b7a311d3ac8e8759.js:1 |
|     | (anonymous)                 | @   | fcc9b256-b7a311d3ac8e8759.js:1 |
|     | j                           | @   | 4318-ffcc1e71ee9dbe29.js:15    |
|     | run                         | @   | inpage.js:1                    |
|     | runIfPresent                | @   | inpage.js:1                    |
|     | onGlobalMessage             | @   | inpage.js:1                    |
|     | postMessage                 |     |                                |
| -   | -                           | -   | -                              |
|     | se                          | @   | inpage.js:1                    |
|     | setImmediate                | @   | inpage.js:1                    |
|     | i                           | @   | 4318-ffcc1e71ee9dbe29.js:15    |
|     | j                           | @   | 4318-ffcc1e71ee9dbe29.js:15    |
|     | run                         | @   | inpage.js:1                    |
|     | runIfPresent                | @   | inpage.js:1                    |
|     | onGlobalMessage             | @   | inpage.js:1                    |
|     | postMessage                 |     |                                |
| -   | -                           | -   | -                              |
|     | se                          | @   | inpage.js:1                    |
|     | setImmediate                | @   | inpage.js:1                    |
|     | i                           | @   | 4318-ffcc1e71ee9dbe29.js:15    |
|     | j                           | @   | 4318-ffcc1e71ee9dbe29.js:15    |
|     | run                         | @   | inpage.js:1                    |
|     | runIfPresent                | @   | inpage.js:1                    |
|     | onGlobalMessage             | @   | inpage.js:1                    |
|     | postMessage                 |     |                                |
| -   | -                           | -   | -                              |
|     | se                          | @   | inpage.js:1                    |
|     | setImmediate                | @   | inpage.js:1                    |
|     | i                           | @   | 4318-ffcc1e71ee9dbe29.js:15    |
|     | j                           | @   | 4318-ffcc1e71ee9dbe29.js:15    |
|     | run                         | @   | inpage.js:1                    |
|     | runIfPresent                | @   | inpage.js:1                    |
|     | onGlobalMessage             | @   | inpage.js:1                    |
|     | postMessage                 |     |                                |
| -   | -                           | -   | -                              |
|     | se                          | @   | inpage.js:1                    |
|     | setImmediate                | @   | inpage.js:1                    |
|     | i                           | @   | 4318-ffcc1e71ee9dbe29.js:15    |
|     | j                           | @   | 4318-ffcc1e71ee9dbe29.js:15    |
|     | run                         | @   | inpage.js:1                    |
|     | runIfPresent                | @   | inpage.js:1                    |
|     | onGlobalMessage             | @   | inpage.js:1                    |
|     | postMessage                 |     |                                |
| -   | -                           | -   | -                              |
|     | se                          | @   | inpage.js:1                    |
|     | setImmediate                | @   | inpage.js:1                    |
|     | i                           | @   | 4318-ffcc1e71ee9dbe29.js:15    |
|     | j                           | @   | 4318-ffcc1e71ee9dbe29.js:15    |
|     | run                         | @   | inpage.js:1                    |
|     | runIfPresent                | @   | inpage.js:1                    |
|     | onGlobalMessage             | @   | inpage.js:1                    |
|     | postMessage                 |     |                                |
| -   | -                           | -   | -                              |
|     | se                          | @   | inpage.js:1                    |
|     | setImmediate                | @   | inpage.js:1                    |
|     | i                           | @   | 4318-ffcc1e71ee9dbe29.js:15    |
|     | t.unstable_scheduleCallback | @   | 4318-ffcc1e71ee9dbe29.js:15    |
|     | iY                          | @   | fcc9b256-b7a311d3ac8e8759.js:1 |
|     | iK                          | @   | fcc9b256-b7a311d3ac8e8759.js:1 |
|     | (anonymous)                 | @   | fcc9b256-b7a311d3ac8e8759.js:1 |

inpage.js:7**Uncaught (in promise) **i: Failed to connect to MetaMask
** at Object.connect (**inpage.js:7:84292**)**Caused by: Error: MetaMask extension not found
** at **inpage.js:4:42708

|     | connect          | @   | inpage.js:7  |
| --- | ---------------- | --- | ------------ |
|     | await in connect |     |              |
| -   | -                | -   | -            |
|     | a                | @   | inpage.js:1  |
|     | e                | @   | inpage.js:1  |
|     | (anonymous)      | @   | inpage.js:20 |
|     | (anonymous)      | @   | inpage.js:20 |
|     | (anonymous)      | @   | inpage.js:20 |

inpage.js:7**Uncaught (in promise) **i: Failed to connect to MetaMask
** at Object.connect (**inpage.js:7:84292**)**Caused by: Error: MetaMask extension not found
** at **inpage.js:4:42708"

|     | connect          | @   | inpage.js:7  |
| --- | ---------------- | --- | ------------ |
|     | await in connect |     |              |
| -   | -                | -   | -            |
|     | a                | @   | inpage.js:1  |
|     | e                | @   | inpage.js:1  |
|     | (anonymous)      | @   | inpage.js:20 |
|     | (anonymous)      | @   | inpage.js:20 |
|     | (anonymous)      | @   | inpage.js:20 |

De hecho he encontrado varios errores alrededor de varias paginas, por ejemplo este es ciszukoantony:

781b197b-64bfbf97694f0c4e.js:2 Creating a worker from 'blob:https://ciszukoantony.vercel.app/08858983-4d74-4519-868b-f4d39c3cac3d' violates the following Content Security Policy directive: "script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com https://static.cloudflareinsights.com https://us.i.posthog.com https://us-assets.i.posthog.com". Note that 'worker-src' was not explicitly set, so 'script-src' is used as a fallback. The action has been blocked.
(anonymous) @ 781b197b-64bfbf97694f0c4e.js:2
eventBuffer.useCompression @ 781b197b-64bfbf97694f0c4e.js:2
\_initializeRecording @ 781b197b-64bfbf97694f0c4e.js:2
initializeSampling @ 781b197b-64bfbf97694f0c4e.js:2
\_initialize @ 781b197b-64bfbf97694f0c4e.js:2
afterAllSetup @ 781b197b-64bfbf97694f0c4e.js:2
u @ 610-15c14935cc7cf266.js:1
\_setupIntegrations @ 610-15c14935cc7cf266.js:487
init @ 610-15c14935cc7cf266.js:487
(anonymous) @ 610-15c14935cc7cf266.js:488
(anonymous) @ 610-15c14935cc7cf266.js:488
tK @ 610-15c14935cc7cf266.js:488
2053 @ main-app-141a21440222c61c.js:1
r @ webpack-0b2aa226e777e5a2.js:1
t @ main-app-141a21440222c61c.js:1
(anonymous) @ main-app-141a21440222c61c.js:1
r.O @ webpack-0b2aa226e777e5a2.js:1
(anonymous) @ main-app-141a21440222c61c.js:1
t @ webpack-0b2aa226e777e5a2.js:1
(anonymous) @ webpack-0b2aa226e777e5a2.js:1
(anonymous) @ webpack-0b2aa226e777e5a2.js:1
(anonymous) @ webpack-0b2aa226e777e5a2.js:1
(index):1 GET https://obwzzmbvkrcscqwptlqo.supabase.co/storage/v1/object/public/ciszu-cdn/projects/ciszukoantony/content/assets/youtube_canal.avif 400 (Bad Request)
(index):1 GET https://obwzzmbvkrcscqwptlqo.supabase.co/storage/v1/object/public/ciszu-cdn/projects/ciszukoantony/content/logos/images/outline/logotype/gradient/color/ciszuko_logotipo_outline_degradado_color_full.avif 400 (Bad Request)
(index):11 GET https://obwzzmbvkrcscqwptlqo.supabase.co/storage/v1/object/public/ciszu-cdn/projects/ciszukoantony/content/logos/images/outline/isotype/gradient/color/ciszuko_logo_isotipo_outline_degradado_zwhite_ccolor.avif 400 (Bad Request)
28Unchecked runtime.lastError: Could not establish connection. Receiving end does not exist.
provider.js:2 Uncaught TypeError: Cannot redefine property: ethereum
at Object.defineProperty (<anonymous></anonymous>)
at provider.js:2:663867
at provider.js:2:663912
at provider.js:2:666327
at provider.js:2:692461
at provider.js:2:692481
at provider.js:2:692485
(anonymous) @ provider.js:2
(anonymous) @ provider.js:2
(anonymous) @ provider.js:2
(anonymous) @ provider.js:2
(anonymous) @ provider.js:2
(anonymous) @ provider.js:2
PendingScript
(anonymous) @ dispatcher.js:1
(anonymous) @ dispatcher.js:1
(anonymous) @ dispatcher.js:1
9Unchecked runtime.lastError: Could not establish connection. Receiving end does not exist.
challenges.cloudflare.com/cdn-cgi/challenge-platform/h/g/turnstile/f/av0/rch/lk3lz/0x4AAAAAADm0pqu349Um-eH8/dark/fbE/new/normal?lang=es:1 Blocked script execution in 'about:blank' because the document's frame is sandboxed and the 'allow-scripts' permission is not set.
vc @ challenges.cloudflare.com/cdn-cgi/challenge-platform/h/g/turnstile/f/av0/rch/lk3lz/0x4AAAAAADm0pqu349Um-eH8/dark/fbE/new/normal?lang=es:1
vA.<computed></computed>.<computed></computed> @ challenges.cloudflare.com/cdn-cgi/challenge-platform/h/g/turnstile/f/av0/rch/lk3lz/0x4AAAAAADm0pqu349Um-eH8/dark/fbE/new/normal?lang=es:1
vS @ challenges.cloudflare.com/cdn-cgi/challenge-platform/h/g/turnstile/f/av0/rch/lk3lz/0x4AAAAAADm0pqu349Um-eH8/dark/fbE/new/normal?lang=es:1
UfAQM @ challenges.cloudflare.com/cdn-cgi/challenge-platform/h/g/turnstile/f/av0/rch/lk3lz/0x4AAAAAADm0pqu349Um-eH8/dark/fbE/new/normal?lang=es:1
vO @ challenges.cloudflare.com/cdn-cgi/challenge-platform/h/g/turnstile/f/av0/rch/lk3lz/0x4AAAAAADm0pqu349Um-eH8/dark/fbE/new/normal?lang=es:1
vA.<computed></computed>.<computed></computed> @ challenges.cloudflare.com/cdn-cgi/challenge-platform/h/g/turnstile/f/av0/rch/lk3lz/0x4AAAAAADm0pqu349Um-eH8/dark/fbE/new/normal?lang=es:1
vS @ challenges.cloudflare.com/cdn-cgi/challenge-platform/h/g/turnstile/f/av0/rch/lk3lz/0x4AAAAAADm0pqu349Um-eH8/dark/fbE/new/normal?lang=es:1
c @ challenges.cloudflare.com/cdn-cgi/challenge-platform/h/g/turnstile/f/av0/rch/lk3lz/0x4AAAAAADm0pqu349Um-eH8/dark/fbE/new/normal?lang=es:1
QDciX @ challenges.cloudflare.com/cdn-cgi/challenge-platform/h/g/turnstile/f/av0/rch/lk3lz/0x4AAAAAADm0pqu349Um-eH8/dark/fbE/new/normal?lang=es:1
kF @ challenges.cloudflare.com/cdn-cgi/challenge-platform/h/g/turnstile/f/av0/rch/lk3lz/0x4AAAAAADm0pqu349Um-eH8/dark/fbE/new/normal?lang=es:1
kK @ challenges.cloudflare.com/cdn-cgi/challenge-platform/h/g/turnstile/f/av0/rch/lk3lz/0x4AAAAAADm0pqu349Um-eH8/dark/fbE/new/normal?lang=es:1
challenges.cloudflare.com/cdn-cgi/challenge-platform/h/g/turnstile/f/av0/rch/lk3lz/0x4AAAAAADm0pqu349Um-eH8/dark/fbE/new/normal?lang=es:1 Blocked script execution in 'about:blank' because the document's frame is sandboxed and the 'allow-scripts' permission is not set.
vc @ challenges.cloudflare.com/cdn-cgi/challenge-platform/h/g/turnstile/f/av0/rch/lk3lz/0x4AAAAAADm0pqu349Um-eH8/dark/fbE/new/normal?lang=es:1
vA.<computed></computed>.<computed></computed> @ challenges.cloudflare.com/cdn-cgi/challenge-platform/h/g/turnstile/f/av0/rch/lk3lz/0x4AAAAAADm0pqu349Um-eH8/dark/fbE/new/normal?lang=es:1
vS @ challenges.cloudflare.com/cdn-cgi/challenge-platform/h/g/turnstile/f/av0/rch/lk3lz/0x4AAAAAADm0pqu349Um-eH8/dark/fbE/new/normal?lang=es:1
UfAQM @ challenges.cloudflare.com/cdn-cgi/challenge-platform/h/g/turnstile/f/av0/rch/lk3lz/0x4AAAAAADm0pqu349Um-eH8/dark/fbE/new/normal?lang=es:1
vO @ challenges.cloudflare.com/cdn-cgi/challenge-platform/h/g/turnstile/f/av0/rch/lk3lz/0x4AAAAAADm0pqu349Um-eH8/dark/fbE/new/normal?lang=es:1
vA.<computed></computed>.<computed></computed> @ challenges.cloudflare.com/cdn-cgi/challenge-platform/h/g/turnstile/f/av0/rch/lk3lz/0x4AAAAAADm0pqu349Um-eH8/dark/fbE/new/normal?lang=es:1
vS @ challenges.cloudflare.com/cdn-cgi/challenge-platform/h/g/turnstile/f/av0/rch/lk3lz/0x4AAAAAADm0pqu349Um-eH8/dark/fbE/new/normal?lang=es:1
c @ challenges.cloudflare.com/cdn-cgi/challenge-platform/h/g/turnstile/f/av0/rch/lk3lz/0x4AAAAAADm0pqu349Um-eH8/dark/fbE/new/normal?lang=es:1
QDciX @ challenges.cloudflare.com/cdn-cgi/challenge-platform/h/g/turnstile/f/av0/rch/lk3lz/0x4AAAAAADm0pqu349Um-eH8/dark/fbE/new/normal?lang=es:1
kF @ challenges.cloudflare.com/cdn-cgi/challenge-platform/h/g/turnstile/f/av0/rch/lk3lz/0x4AAAAAADm0pqu349Um-eH8/dark/fbE/new/normal?lang=es:1
kK @ challenges.cloudflare.com/cdn-cgi/challenge-platform/h/g/turnstile/f/av0/rch/lk3lz/0x4AAAAAADm0pqu349Um-eH8/dark/fbE/new/normal?lang=es:1
inpage.js:7 Uncaught (in promise) i: Failed to connect to MetaMask
at Object.connect (inpage.js:7:84292)Caused by: Error: MetaMask extension not found
at inpage.js:4:42708
connect @ inpage.js:7
await in connect
a @ inpage.js:1
e @ inpage.js:1
(anonymous) @ inpage.js:20
(anonymous) @ inpage.js:20
(anonymous) @ inpage.js:20
inpage.js:7 Uncaught (in promise) i: Failed to connect to MetaMask
at Object.connect (inpage.js:7:84292)Caused by: Error: MetaMask extension not found
at inpage.js:4:42708
connect @ inpage.js:7
await in connect
a @ inpage.js:1
e @ inpage.js:1
(anonymous) @ inpage.js:20
(anonymous) @ inpage.js:20
(anonymous) @ inpage.js:20
challenges.cloudflare.com/cdn-cgi/challenge-platform/h/g/turnstile/f/av0/rch/lk3lz/0x4AAAAAADm0pqu349Um-eH8/dark/fbE/new/normal?lang=es:1
4challenges.cloudflare.com/cdn-cgi/challenge-platform/h/g/turnstile/f/av0/rch/lk3lz/0x4AAAAAADm0pqu349Um-eH8/dark/fbE/new/normal?lang=es:1 [Cloudflare Turnstile] Unhandled promise rejection: i: Failed to connect to MetaMask
at Object.connect (inpage.js:7:84292) , with debug info: rX2DVQMSnrKI4HJUvg9rZF8sVrYJLWXxSgcRf/PX7+E=$j+EKuF4AeyTXCR+u5K2kLg==>CCAsudxlVHXj9nRQ7Lyu/BfPANOUAVpLw8C7EjRhD/4HS6hbP7LEHWe0TqkS2UZA$8/NGblzibbV+rdHR3YQ7MA==>SW96m8boTs1HW+QPHwPUiw==$9Vh8BbLvQolcTIb/KcIIww==>sKc4mvvng7A6OcZoMdDxqIBrHdhdNs26+5v/6DRmpYY=$QJUw42Cpz+kMrO9AIDPkdQ==>7T/HMNRuoHcqTnJuPB057e6MKTrba2ZU5XYeozFlY9A=$8XwtN135JwRhkrn0qe0EYw==>MQ+ho7X8r7bBdit1CjXIag==$Lb/wfCAU8ViRDL2z44tAwg==>DqN7DkBXOvPmUbxjJHWC7SSk/75Bwz1DDk+BUroxHsE=$e4ROtXda0nHjxoAr/brkuw==>tVd4hQLqwOTRkLVUzzJBewXm8IEbNvhY0j94j01IxEU=$5xMTPUdlMJECCB40gVqP3A==>r9RtXZ1jy1dLjSfD4CPfMjSqJBEteszfgvJ3mPpXtKo=$uYR85FPyd6vOJFYnvHwmww==>N/vgFXZylQJXZM8qvwUyO4mlT1Fu9J3ik8/MeVLBGhs=$y+wrT2yZdcisT7HhNv7FMQ==>sVKiABJa+IwcRiEma6jg0dvB0buHLwqiaaKPWb7bJEs=$1nxctkWkmTZA6gQ10fi0rg==>fCCPiXMy1xrF3ECijLsqXi4kAnn81DArtcnjUuaqgjQ=$wJ00N9r/K8UT7wEbY1x8sA==>8hqStyldGb+qpTfZFXcKVh4qcm+SlY+qa7GAi6ngBFs=$cxsGHzWyk0EXCp/k7eDPZg==>Z67tQ9tFARIpNWAub5q9i9qN3qpAhE4NumMnfKG1Km0=$8hXlDRuMHG6WFAUkp9XewQ==>0EumNWxEUWHT/1auwpguryiMlD38Ls0eimLwGrEfZqI=$bCPSdBZpX+TNwDSHbIeAVA==>yzqY2UEG5FoUKiEhxfMsczmqpcLWJzHgaYuJl1WJins=$bvOKl3nUetcQtXmd6dVp8w==>v64Ef6lYF4oMZ5/J7KlDQc/aYz4Q+SEb3inwljHcjXk=$XAgUEHQhxcNQ2M3Ue1R/TQ==>to9hGZEOx62EFaMZtcN8jVitq9yrAVvm7A9LM6rK0dE=$P0eTvW058fdyHhCrWyzRoA==>HCBpYqWt66X/VugWk8PUAiocqW7Wo4mKJdmBpjUKnjE=$0ruDjPturxbUliO+0eVT5Q==>lswSNmsq570kPHLq1s/ScS+yTuntY890YlMPuGMcoFo=$AqScNzZAXsqJS1vK4GYNsA==>6NheTYQdDcgnJVm3GO2uZg==$tAnKxR33TD9ZIQHpRew+qQ==>00/3D9E0r5YdOKeO7dgNb8mQxhnDRKEu5nAE4+T0xN4=$i1qQRjvBz48iyAwfJtjyDQ==>OogNJFE21MnRMwmqlTQZdH7jS+Bw73xN1YKjv6eRAeQ=$nIOK3digPnjD87TO2leUUg==>MEE8HTIvnmlBCORoyaxtbeJGtIf3xV8mN6fe26GNWPY=$xcxatR0ep7g6FF0plTnDWg==>9wiEhK1fZPZqy7cRecDESkxWy0WANtiCxYMzzxk1Ues=$bdD+ufPfRXhBcFrBwlT/+w==>uudEHhO3iwkNm6bhMjNZfQ==$Z0qzqd50JJ4lDsgmKlzMmA==>mx6MjI2U2iRmiiWldyIATn3YwZtOlLAJn6BPSripOgs=$jmFUVbmh+ccIUH8rFly1GQ==>t8JUiqbhqw/1bacypzCNZ5PzclAEYITrE3/f5CX/Gi8=$khlFlA4qfHct1C6abbHbNw==
vc @ challenges.cloudflare.com/cdn-cgi/challenge-platform/h/g/turnstile/f/av0/rch/lk3lz/0x4AAAAAADm0pqu349Um-eH8/dark/fbE/new/normal?lang=es:1
vA.<computed></computed>.<computed></computed> @ challenges.cloudflare.com/cdn-cgi/challenge-platform/h/g/turnstile/f/av0/rch/lk3lz/0x4AAAAAADm0pqu349Um-eH8/dark/fbE/new/normal?lang=es:1
vS @ challenges.cloudflare.com/cdn-cgi/challenge-platform/h/g/turnstile/f/av0/rch/lk3lz/0x4AAAAAADm0pqu349Um-eH8/dark/fbE/new/normal?lang=es:1
610-15c14935cc7cf266.js:1 POST https://ciszukoantony.vercel.app/cdn-cgi/challenge-platform/h/g/c/a2c5db95196127c8 404 (Not Found)
(anonymous) @ 610-15c14935cc7cf266.js:1
(anonymous) @ api.js:1
f @ api.js:1
(anonymous) @ api.js:1
mn @ api.js:1
d @ api.js:1
(anonymous) @ api.js:1
(anonymous) @ api.js:1
n @ api.js:1
ye @ api.js:1
Ve @ api.js:1
l @ 610-15c14935cc7cf266.js:10
ciszuko_logo_isotipo_outline_degradado_zwhite_ccolor.avif:1 GET https://obwzzmbvkrcscqwptlqo.supabase.co/storage/v1/object/public/ciszu-cdn/projects/ciszukoantony/content/logos/images/outline/isotype/gradient/color/ciszuko_logo_isotipo_outline_degradado_zwhite_ccolor.avif 400 (Bad Request)
Image
o5 @ fcc9b256-557ca3fb289ca038.js:1
ui @ fcc9b256-557ca3fb289ca038.js:1
uk @ fcc9b256-557ca3fb289ca038.js:1
ui @ fcc9b256-557ca3fb289ca038.js:1
uk @ fcc9b256-557ca3fb289ca038.js:1
ui @ fcc9b256-557ca3fb289ca038.js:1
uk @ fcc9b256-557ca3fb289ca038.js:1
ui @ fcc9b256-557ca3fb289ca038.js:1
uk @ fcc9b256-557ca3fb289ca038.js:1
ui @ fcc9b256-557ca3fb289ca038.js:1
uk @ fcc9b256-557ca3fb289ca038.js:1
ui @ fcc9b256-557ca3fb289ca038.js:1
uk @ fcc9b256-557ca3fb289ca038.js:1
ui @ fcc9b256-557ca3fb289ca038.js:1
uk @ fcc9b256-557ca3fb289ca038.js:1
ui @ fcc9b256-557ca3fb289ca038.js:1
uk @ fcc9b256-557ca3fb289ca038.js:1
ui @ fcc9b256-557ca3fb289ca038.js:1
uk @ fcc9b256-557ca3fb289ca038.js:1
ui @ fcc9b256-557ca3fb289ca038.js:1
uk @ fcc9b256-557ca3fb289ca038.js:1
ui @ fcc9b256-557ca3fb289ca038.js:1
uk @ fcc9b256-557ca3fb289ca038.js:1
ui @ fcc9b256-557ca3fb289ca038.js:1
uk @ fcc9b256-557ca3fb289ca038.js:1
ui @ fcc9b256-557ca3fb289ca038.js:1
uk @ fcc9b256-557ca3fb289ca038.js:1
ui @ fcc9b256-557ca3fb289ca038.js:1
uk @ fcc9b256-557ca3fb289ca038.js:1
ui @ fcc9b256-557ca3fb289ca038.js:1
uk @ fcc9b256-557ca3fb289ca038.js:1
ui @ fcc9b256-557ca3fb289ca038.js:1
uk @ fcc9b256-557ca3fb289ca038.js:1
ui @ fcc9b256-557ca3fb289ca038.js:1
uk @ fcc9b256-557ca3fb289ca038.js:1
ui @ fcc9b256-557ca3fb289ca038.js:1
uk @ fcc9b256-557ca3fb289ca038.js:1
ui @ fcc9b256-557ca3fb289ca038.js:1
uk @ fcc9b256-557ca3fb289ca038.js:1
ui @ fcc9b256-557ca3fb289ca038.js:1
uk @ fcc9b256-557ca3fb289ca038.js:1
ui @ fcc9b256-557ca3fb289ca038.js:1
uk @ fcc9b256-557ca3fb289ca038.js:1
ui @ fcc9b256-557ca3fb289ca038.js:1
uk @ fcc9b256-557ca3fb289ca038.js:1
ui @ fcc9b256-557ca3fb289ca038.js:1
uk @ fcc9b256-557ca3fb289ca038.js:1
ui @ fcc9b256-557ca3fb289ca038.js:1
uk @ fcc9b256-557ca3fb289ca038.js:1
ui @ fcc9b256-557ca3fb289ca038.js:1
uk @ fcc9b256-557ca3fb289ca038.js:1
ui @ fcc9b256-557ca3fb289ca038.js:1
uk @ fcc9b256-557ca3fb289ca038.js:1
ui @ fcc9b256-557ca3fb289ca038.js:1
uk @ fcc9b256-557ca3fb289ca038.js:1
ui @ fcc9b256-557ca3fb289ca038.js:1
uk @ fcc9b256-557ca3fb289ca038.js:1
ui @ fcc9b256-557ca3fb289ca038.js:1
uk @ fcc9b256-557ca3fb289ca038.js:1
ui @ fcc9b256-557ca3fb289ca038.js:1
uk @ fcc9b256-557ca3fb289ca038.js:1
ui @ fcc9b256-557ca3fb289ca038.js:1
uk @ fcc9b256-557ca3fb289ca038.js:1
ui @ fcc9b256-557ca3fb289ca038.js:1
uk @ fcc9b256-557ca3fb289ca038.js:1
ui @ fcc9b256-557ca3fb289ca038.js:1
uk @ fcc9b256-557ca3fb289ca038.js:1
ui @ fcc9b256-557ca3fb289ca038.js:1
uk @ fcc9b256-557ca3fb289ca038.js:1
ui @ fcc9b256-557ca3fb289ca038.js:1
iP @ fcc9b256-557ca3fb289ca038.js:1
iz @ fcc9b256-557ca3fb289ca038.js:1
ii @ fcc9b256-557ca3fb289ca038.js:1
iu @ fcc9b256-557ca3fb289ca038.js:1
iX @ fcc9b256-557ca3fb289ca038.js:1
j @ 610-15c14935cc7cf266.js:4
run @ inpage.js:1
runIfPresent @ inpage.js:1
onGlobalMessage @ inpage.js:1
postMessage
se @ inpage.js:1
setImmediate @ inpage.js:1
i @ 610-15c14935cc7cf266.js:4
t.unstable_scheduleCallback @ 610-15c14935cc7cf266.js:4
iY @ fcc9b256-557ca3fb289ca038.js:1
iK @ fcc9b256-557ca3fb289ca038.js:1
(anonymous) @ fcc9b256-557ca3fb289ca038.js:1
setTimeout
(anonymous) @ 610-15c14935cc7cf266.js:488
(anonymous) @ 298-3c638178aaea893f.js:1
await in (anonymous)
callback @ 298-3c638178aaea893f.js:1
c @ api.js:1
y @ api.js:1
(anonymous) @ api.js:1
f @ api.js:1
(anonymous) @ api.js:1
mn @ api.js:1
d @ api.js:1
Promise.then
mn @ api.js:1
d @ api.js:1
(anonymous) @ api.js:1
(anonymous) @ api.js:1
n @ api.js:1
ye @ api.js:1
Ve @ api.js:1
l @ 610-15c14935cc7cf266.js:10
youtube_canal.avif:1 GET https://obwzzmbvkrcscqwptlqo.supabase.co/storage/v1/object/public/ciszu-cdn/projects/ciszukoantony/content/assets/youtube_canal.avif 400 (Bad Request)
Image
o5 @ fcc9b256-557ca3fb289ca038.js:1
ui @ fcc9b256-557ca3fb289ca038.js:1
uk @ fcc9b256-557ca3fb289ca038.js:1
ui @ fcc9b256-557ca3fb289ca038.js:1
uk @ fcc9b256-557ca3fb289ca038.js:1
ui @ fcc9b256-557ca3fb289ca038.js:1
uk @ fcc9b256-557ca3fb289ca038.js:1
ui @ fcc9b256-557ca3fb289ca038.js:1
uk @ fcc9b256-557ca3fb289ca038.js:1
ui @ fcc9b256-557ca3fb289ca038.js:1
uk @ fcc9b256-557ca3fb289ca038.js:1
ui @ fcc9b256-557ca3fb289ca038.js:1
uk @ fcc9b256-557ca3fb289ca038.js:1
ui @ fcc9b256-557ca3fb289ca038.js:1
uk @ fcc9b256-557ca3fb289ca038.js:1
ui @ fcc9b256-557ca3fb289ca038.js:1
uk @ fcc9b256-557ca3fb289ca038.js:1
ui @ fcc9b256-557ca3fb289ca038.js:1
uk @ fcc9b256-557ca3fb289ca038.js:1
ui @ fcc9b256-557ca3fb289ca038.js:1
uk @ fcc9b256-557ca3fb289ca038.js:1
ui @ fcc9b256-557ca3fb289ca038.js:1
uk @ fcc9b256-557ca3fb289ca038.js:1
ui @ fcc9b256-557ca3fb289ca038.js:1
uk @ fcc9b256-557ca3fb289ca038.js:1
ui @ fcc9b256-557ca3fb289ca038.js:1
uk @ fcc9b256-557ca3fb289ca038.js:1
ui @ fcc9b256-557ca3fb289ca038.js:1
uk @ fcc9b256-557ca3fb289ca038.js:1
ui @ fcc9b256-557ca3fb289ca038.js:1
uk @ fcc9b256-557ca3fb289ca038.js:1
ui @ fcc9b256-557ca3fb289ca038.js:1
uk @ fcc9b256-557ca3fb289ca038.js:1
ui @ fcc9b256-557ca3fb289ca038.js:1
uk @ fcc9b256-557ca3fb289ca038.js:1
ui @ fcc9b256-557ca3fb289ca038.js:1
uk @ fcc9b256-557ca3fb289ca038.js:1
ui @ fcc9b256-557ca3fb289ca038.js:1
uk @ fcc9b256-557ca3fb289ca038.js:1
ui @ fcc9b256-557ca3fb289ca038.js:1
uk @ fcc9b256-557ca3fb289ca038.js:1
ui @ fcc9b256-557ca3fb289ca038.js:1
uk @ fcc9b256-557ca3fb289ca038.js:1
ui @ fcc9b256-557ca3fb289ca038.js:1
uk @ fcc9b256-557ca3fb289ca038.js:1
ui @ fcc9b256-557ca3fb289ca038.js:1
uk @ fcc9b256-557ca3fb289ca038.js:1
ui @ fcc9b256-557ca3fb289ca038.js:1
uk @ fcc9b256-557ca3fb289ca038.js:1
ui @ fcc9b256-557ca3fb289ca038.js:1
uk @ fcc9b256-557ca3fb289ca038.js:1
ui @ fcc9b256-557ca3fb289ca038.js:1
uk @ fcc9b256-557ca3fb289ca038.js:1
ui @ fcc9b256-557ca3fb289ca038.js:1
uk @ fcc9b256-557ca3fb289ca038.js:1
ui @ fcc9b256-557ca3fb289ca038.js:1
uk @ fcc9b256-557ca3fb289ca038.js:1
ui @ fcc9b256-557ca3fb289ca038.js:1
uk @ fcc9b256-557ca3fb289ca038.js:1
ui @ fcc9b256-557ca3fb289ca038.js:1
uk @ fcc9b256-557ca3fb289ca038.js:1
ui @ fcc9b256-557ca3fb289ca038.js:1
uk @ fcc9b256-557ca3fb289ca038.js:1
ui @ fcc9b256-557ca3fb289ca038.js:1
uk @ fcc9b256-557ca3fb289ca038.js:1
ui @ fcc9b256-557ca3fb289ca038.js:1
uk @ fcc9b256-557ca3fb289ca038.js:1
ui @ fcc9b256-557ca3fb289ca038.js:1
uk @ fcc9b256-557ca3fb289ca038.js:1
ui @ fcc9b256-557ca3fb289ca038.js:1
iP @ fcc9b256-557ca3fb289ca038.js:1
iz @ fcc9b256-557ca3fb289ca038.js:1
ii @ fcc9b256-557ca3fb289ca038.js:1
iu @ fcc9b256-557ca3fb289ca038.js:1
iX @ fcc9b256-557ca3fb289ca038.js:1
j @ 610-15c14935cc7cf266.js:4
run @ inpage.js:1
runIfPresent @ inpage.js:1
onGlobalMessage @ inpage.js:1
postMessage
se @ inpage.js:1
setImmediate @ inpage.js:1
i @ 610-15c14935cc7cf266.js:4
t.unstable_scheduleCallback @ 610-15c14935cc7cf266.js:4
iY @ fcc9b256-557ca3fb289ca038.js:1
iK @ fcc9b256-557ca3fb289ca038.js:1
(anonymous) @ fcc9b256-557ca3fb289ca038.js:1
setTimeout
(anonymous) @ 610-15c14935cc7cf266.js:488
(anonymous) @ 298-3c638178aaea893f.js:1
await in (anonymous)
callback @ 298-3c638178aaea893f.js:1
c @ api.js:1
y @ api.js:1
(anonymous) @ api.js:1
f @ api.js:1
(anonymous) @ api.js:1
mn @ api.js:1
d @ api.js:1
Promise.then
mn @ api.js:1
d @ api.js:1
(anonymous) @ api.js:1
(anonymous) @ api.js:1
n @ api.js:1
ye @ api.js:1
Ve @ api.js:1
l @ 610-15c14935cc7cf266.js:10
ciszuko_logotipo_outline_degradado_color_full.avif:1 GET https://obwzzmbvkrcscqwptlqo.supabase.co/storage/v1/object/public/ciszu-cdn/projects/ciszukoantony/content/logos/images/outline/logotype/gradient/color/ciszuko_logotipo_outline_degradado_color_full.avif 400 (Bad Request)
Image
o5 @ fcc9b256-557ca3fb289ca038.js:1
ui @ fcc9b256-557ca3fb289ca038.js:1
uk @ fcc9b256-557ca3fb289ca038.js:1
ui @ fcc9b256-557ca3fb289ca038.js:1
uk @ fcc9b256-557ca3fb289ca038.js:1
ui @ fcc9b256-557ca3fb289ca038.js:1
uk @ fcc9b256-557ca3fb289ca038.js:1
ui @ fcc9b256-557ca3fb289ca038.js:1
uk @ fcc9b256-557ca3fb289ca038.js:1
ui @ fcc9b256-557ca3fb289ca038.js:1
uk @ fcc9b256-557ca3fb289ca038.js:1
ui @ fcc9b256-557ca3fb289ca038.js:1
uk @ fcc9b256-557ca3fb289ca038.js:1
ui @ fcc9b256-557ca3fb289ca038.js:1
uk @ fcc9b256-557ca3fb289ca038.js:1
ui @ fcc9b256-557ca3fb289ca038.js:1
uk @ fcc9b256-557ca3fb289ca038.js:1
ui @ fcc9b256-557ca3fb289ca038.js:1
uk @ fcc9b256-557ca3fb289ca038.js:1
ui @ fcc9b256-557ca3fb289ca038.js:1
uk @ fcc9b256-557ca3fb289ca038.js:1
ui @ fcc9b256-557ca3fb289ca038.js:1
uk @ fcc9b256-557ca3fb289ca038.js:1
ui @ fcc9b256-557ca3fb289ca038.js:1
uk @ fcc9b256-557ca3fb289ca038.js:1
ui @ fcc9b256-557ca3fb289ca038.js:1
uk @ fcc9b256-557ca3fb289ca038.js:1
ui @ fcc9b256-557ca3fb289ca038.js:1
uk @ fcc9b256-557ca3fb289ca038.js:1
ui @ fcc9b256-557ca3fb289ca038.js:1
uk @ fcc9b256-557ca3fb289ca038.js:1
ui @ fcc9b256-557ca3fb289ca038.js:1
uk @ fcc9b256-557ca3fb289ca038.js:1
ui @ fcc9b256-557ca3fb289ca038.js:1
uk @ fcc9b256-557ca3fb289ca038.js:1
ui @ fcc9b256-557ca3fb289ca038.js:1
uk @ fcc9b256-557ca3fb289ca038.js:1
ui @ fcc9b256-557ca3fb289ca038.js:1
uk @ fcc9b256-557ca3fb289ca038.js:1
ui @ fcc9b256-557ca3fb289ca038.js:1
uk @ fcc9b256-557ca3fb289ca038.js:1
ui @ fcc9b256-557ca3fb289ca038.js:1
uk @ fcc9b256-557ca3fb289ca038.js:1
ui @ fcc9b256-557ca3fb289ca038.js:1
uk @ fcc9b256-557ca3fb289ca038.js:1
ui @ fcc9b256-557ca3fb289ca038.js:1
uk @ fcc9b256-557ca3fb289ca038.js:1
ui @ fcc9b256-557ca3fb289ca038.js:1
uk @ fcc9b256-557ca3fb289ca038.js:1
ui @ fcc9b256-557ca3fb289ca038.js:1
uk @ fcc9b256-557ca3fb289ca038.js:1
ui @ fcc9b256-557ca3fb289ca038.js:1
uk @ fcc9b256-557ca3fb289ca038.js:1
ui @ fcc9b256-557ca3fb289ca038.js:1
uk @ fcc9b256-557ca3fb289ca038.js:1
ui @ fcc9b256-557ca3fb289ca038.js:1
uk @ fcc9b256-557ca3fb289ca038.js:1
ui @ fcc9b256-557ca3fb289ca038.js:1
uk @ fcc9b256-557ca3fb289ca038.js:1
ui @ fcc9b256-557ca3fb289ca038.js:1
uk @ fcc9b256-557ca3fb289ca038.js:1
ui @ fcc9b256-557ca3fb289ca038.js:1
uk @ fcc9b256-557ca3fb289ca038.js:1
ui @ fcc9b256-557ca3fb289ca038.js:1
uk @ fcc9b256-557ca3fb289ca038.js:1
ui @ fcc9b256-557ca3fb289ca038.js:1
uk @ fcc9b256-557ca3fb289ca038.js:1
ui @ fcc9b256-557ca3fb289ca038.js:1
uk @ fcc9b256-557ca3fb289ca038.js:1
ui @ fcc9b256-557ca3fb289ca038.js:1
iP @ fcc9b256-557ca3fb289ca038.js:1
iz @ fcc9b256-557ca3fb289ca038.js:1
ii @ fcc9b256-557ca3fb289ca038.js:1
iu @ fcc9b256-557ca3fb289ca038.js:1
iX @ fcc9b256-557ca3fb289ca038.js:1
j @ 610-15c14935cc7cf266.js:4
run @ inpage.js:1
runIfPresent @ inpage.js:1
onGlobalMessage @ inpage.js:1
postMessage
se @ inpage.js:1
setImmediate @ inpage.js:1
i @ 610-15c14935cc7cf266.js:4
t.unstable_scheduleCallback @ 610-15c14935cc7cf266.js:4
iY @ fcc9b256-557ca3fb289ca038.js:1
iK @ fcc9b256-557ca3fb289ca038.js:1
(anonymous) @ fcc9b256-557ca3fb289ca038.js:1
setTimeout
(anonymous) @ 610-15c14935cc7cf266.js:488
(anonymous) @ 298-3c638178aaea893f.js:1
await in (anonymous)
callback @ 298-3c638178aaea893f.js:1
c @ api.js:1
y @ api.js:1
(anonymous) @ api.js:1
f @ api.js:1
(anonymous) @ api.js:1
mn @ api.js:1
d @ api.js:1
Promise.then
mn @ api.js:1
d @ api.js:1
(anonymous) @ api.js:1
(anonymous) @ api.js:1
n @ api.js:1
ye @ api.js:1
Ve @ api.js:1
l @ 610-15c14935cc7cf266.js:10
youtube_canal.webp:1 GET https://obwzzmbvkrcscqwptlqo.supabase.co/storage/v1/object/public/ciszu-cdn/projects/ciszukoantony/content/assets/youtube_canal.webp 400 (Bad Request)
