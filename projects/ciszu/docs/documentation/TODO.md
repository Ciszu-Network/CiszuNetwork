# To Do List — Ciszu Network

> Este archivo solo puede ser editado por Ciszuko Antony.

### Cambios Generales:

- [ ] #1 Finalizar el cambio de los VISUAL_BUILDERS e conciderar las demas herramientras como Onlook u otras pendientes o posibles. Instalar, implementar, documentar y commitear. (NO REALIZAR AUN)
- [ ] #2 Arregla los errores de los workflows sobre Vitest, Chromatic y Storybook.

* **Chromatic / Chromatic (Storybook @ciszu/ui) (push)** **Failing after 33m**

19:25:00.690 ℹ Uploading 7 metadata files to https://6a7f722e2641a24bc6249782-svmdzfljbl.chromatic.com/.chromatic/ - build-storybook.log - chromatic-diagnostics.json - chromatic.log - main.ts - preview-stats.trimmed.json - preview.ts - index.html
Error: non-zero exit code

- **CI / Tests de componente Storybook (Vitest + Playwright) (push)** **Failing after 33m**

**⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯**

[](https://github.com/Ciszu-Network/CiszuNetwork/actions/runs/32533816590/job/96931817066#step:7:91)

[](https://github.com/Ciszu-Network/CiszuNetwork/actions/runs/32533816590/job/96931817066#step:7:92)E:\actions-runners\CISZU-PC-3_work\CiszuNetwork\CiszuNetwork\packages\ui:

[](https://github.com/Ciszu-Network/CiszuNetwork/actions/runs/32533816590/job/96931817066#step:7:93) ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @ciszu/ui@1.0.0 test:storybook: `vitest run --config vitest.config.mts`

[](https://github.com/Ciszu-Network/CiszuNetwork/actions/runs/32533816590/job/96931817066#step:7:94)Exit status 1

[](https://github.com/Ciszu-Network/CiszuNetwork/actions/runs/32533816590/job/96931817066#step:7:95)Error: Process completed with exit code 1.

- **CI / Tests unitarios (Vitest) (push)** **Failing after 26m**

❯ projects/ciszubot/discord-bot/tests/statsServer.test.ts (6 tests | 6 skipped) 37551ms
↓ GET /api/stats devuelve el estado inicial
↓ POST /api/update-stats actualiza campos y el GET los refleja
↓ updateStats(client) vuelca el estado del cliente
↓ POST /api/votes/dbl exige autenticación (401)
↓ POST /api/votes/dbl con secreto responde 200
↓ incrementCommands / getTotalCommands

⎯⎯⎯⎯⎯⎯ Failed Suites 1 ⎯⎯⎯⎯⎯⎯⎯

FAIL projects/ciszubot/discord-bot/tests/statsServer.test.ts [ projects/ciszubot/discord-bot/tests/statsServer.test.ts ]
Error: Hook timed out in 30000ms.
If this is a long-running hook, pass a timeout value as the last argument or configure it globally with "hookTimeout".
❯ projects/ciszubot/discord-bot/tests/statsServer.test.ts:20:1
18| let base = '';
19|
20| beforeAll(async () => {
| ^
21| process.env.PORT = '0'; // puerto efímero para no chocar con el bot …
22| process.env.DBL_WEBHOOK_SECRET = 'test-secret';

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯

⎯⎯⎯⎯⎯⎯ Unhandled Errors ⎯⎯⎯⎯⎯⎯

Vitest caught 5 unhandled errors during the test run.
This might cause false positive tests. Resolve unhandled errors to make sure your tests are not affected.

⎯⎯⎯⎯⎯⎯ Unhandled Error ⎯⎯⎯⎯⎯⎯⎯
Error: [vitest-pool]: Failed to start forks worker for test files E:/actions-runners/CISZU-PC-3/_work/CiszuNetwork/CiszuNetwork/packages/ui/tests/CloudflareGuard.test.tsx.
❯ node_modules/.pnpm/vitest@4.1.10_@opentelemetr*2eb0fe4a0d1afe5f2bbf369c900f9db2/node_modules/vitest/dist/chunks/cli-api.BK8pd4xc.js:3465:94
❯ Pool.schedule node_modules/.pnpm/vitest@4.1.10*@opentelemetr_2eb0fe4a0d1afe5f2bbf369c900f9db2/node_modules/vitest/dist/chunks/cli-api.BK8pd4xc.js:3465:5

Test Files 1 failed | 15 passed (16)
Caused by: Error: [vitest-pool-runner]: Timeout waiting for worker to respond
Tests 128 passed | 6 skipped (134)
❯ Timeout.<anonymous></anonymous> node*modules/.pnpm/vitest@4.1.10*@opentelemetr_2eb0fe4a0d1afe5f2bbf369c900f9db2/node_modules/vitest/dist/chunks/cli-api.BK8pd4xc.js:3041:58
Errors 5 errors
❯ listOnTimeout node:internal/timers:605:17
Start at 19:44:19
❯ processTimers node:internal/timers:541:7
Duration 543.51s (transform 27.95s, setup 98.27s, import 921.58s, tests 38.42s, environment 3ms)

⎯⎯⎯⎯⎯⎯ Unhandled Error ⎯⎯⎯⎯⎯⎯⎯
Error: Error: Hook timed out in 30000ms.
If this is a long-running hook, pass a timeout value as the last argument or configure it globally with "hookTimeout".
❯ projects/ciszubot/discord-bot/tests/statsServer.test.ts:20:1

Error: [vitest-pool]: Failed to start forks worker for test files E:/actions-runners/CISZU-PC-3/_work/CiszuNetwork/CiszuNetwork/packages/ui/tests/FabStack.test.tsx.
❯ node_modules/.pnpm/vitest@4.1.10_@opentelemetr*2eb0fe4a0d1afe5f2bbf369c900f9db2/node_modules/vitest/dist/chunks/cli-api.BK8pd4xc.js:3465:94
❯ Pool.schedule node_modules/.pnpm/vitest@4.1.10*@opentelemetr_2eb0fe4a0d1afe5f2bbf369c900f9db2/node_modules/vitest/dist/chunks/cli-api.BK8pd4xc.js:3465:5

Caused by: Error: [vitest-pool-runner]: Timeout waiting for worker to respond
❯ Timeout.<anonymous></anonymous> node*modules/.pnpm/vitest@4.1.10*@opentelemetr_2eb0fe4a0d1afe5f2bbf369c900f9db2/node_modules/vitest/dist/chunks/cli-api.BK8pd4xc.js:3041:58
❯ listOnTimeout node:internal/timers:605:17
❯ processTimers node:internal/timers:541:7

⎯⎯⎯⎯⎯⎯ Unhandled Error ⎯⎯⎯⎯⎯⎯⎯
Error: [vitest-pool]: Failed to start forks worker for test files E:/actions-runners/CISZU-PC-3/_work/CiszuNetwork/CiszuNetwork/packages/ui/tests/InstallPdwaButton.test.tsx.
❯ node_modules/.pnpm/vitest@4.1.10_@opentelemetr*2eb0fe4a0d1afe5f2bbf369c900f9db2/node_modules/vitest/dist/chunks/cli-api.BK8pd4xc.js:3465:94
❯ Pool.schedule node_modules/.pnpm/vitest@4.1.10*@opentelemetr_2eb0fe4a0d1afe5f2bbf369c900f9db2/node_modules/vitest/dist/chunks/cli-api.BK8pd4xc.js:3465:5

Caused by: Error: [vitest-pool-runner]: Timeout waiting for worker to respond
❯ Timeout.<anonymous></anonymous> node*modules/.pnpm/vitest@4.1.10*@opentelemetr_2eb0fe4a0d1afe5f2bbf369c900f9db2/node_modules/vitest/dist/chunks/cli-api.BK8pd4xc.js:3041:58
❯ listOnTimeout node:internal/timers:605:17
❯ processTimers node:internal/timers:541:7

⎯⎯⎯⎯⎯⎯ Unhandled Error ⎯⎯⎯⎯⎯⎯⎯
Error: [vitest-pool]: Failed to start forks worker for test files E:/actions-runners/CISZU-PC-3/_work/CiszuNetwork/CiszuNetwork/packages/ui/tests/Icon.test.tsx.
❯ node_modules/.pnpm/vitest@4.1.10_@opentelemetr*2eb0fe4a0d1afe5f2bbf369c900f9db2/node_modules/vitest/dist/chunks/cli-api.BK8pd4xc.js:3465:94
❯ Pool.schedule node_modules/.pnpm/vitest@4.1.10*@opentelemetr_2eb0fe4a0d1afe5f2bbf369c900f9db2/node_modules/vitest/dist/chunks/cli-api.BK8pd4xc.js:3465:5

Caused by: Error: [vitest-pool-runner]: Timeout waiting for worker to respond
❯ Timeout.<anonymous></anonymous> node*modules/.pnpm/vitest@4.1.10*@opentelemetr_2eb0fe4a0d1afe5f2bbf369c900f9db2/node_modules/vitest/dist/chunks/cli-api.BK8pd4xc.js:3041:58
❯ listOnTimeout node:internal/timers:605:17
❯ processTimers node:internal/timers:541:7

⎯⎯⎯⎯⎯⎯ Unhandled Error ⎯⎯⎯⎯⎯⎯⎯
Error: [vitest-pool]: Failed to start forks worker for test files E:/actions-runners/CISZU-PC-3/_work/CiszuNetwork/CiszuNetwork/packages/ui/tests/PostHogAnalytics.test.tsx.
❯ node_modules/.pnpm/vitest@4.1.10_@opentelemetr*2eb0fe4a0d1afe5f2bbf369c900f9db2/node_modules/vitest/dist/chunks/cli-api.BK8pd4xc.js:3465:94
❯ Pool.schedule node_modules/.pnpm/vitest@4.1.10*@opentelemetr_2eb0fe4a0d1afe5f2bbf369c900f9db2/node_modules/vitest/dist/chunks/cli-api.BK8pd4xc.js:3465:5

Caused by: Error: [vitest-pool-runner]: Timeout waiting for worker to respond
❯ Timeout.<anonymous></anonymous> node*modules/.pnpm/vitest@4.1.10*@opentelemetr_2eb0fe4a0d1afe5f2bbf369c900f9db2/node_modules/vitest/dist/chunks/cli-api.BK8pd4xc.js:3041:58
❯ listOnTimeout node:internal/timers:605:17
❯ processTimers node:internal/timers:541:7

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯

 ELIFECYCLE  Test failed. See above for more details.
Error: Process completed with exit code 1.

- **UI Tests** - 1 test failed to render

* [ ] #3 Crear sistema de mensajes globales en todas las paginas usando el toast de error. Mejorar los errores para que se compilen entre si y no se sobrepasen.
* [ ] #5 Crear sistemas de anuncios particulares e intrucivos, intrucivos son los que aparecen por alguna accion del usuario, aparecen siempre luego de esa accion, aparen como un modal en el centro con animacion fluida y blur al fondo. Ejemplo luego de una partida de muzicmania, luego de comprar algo en la tienda (futuro), etc. Particulares son los que aparecen de vez en cuando, en ciertos lugares de las paginas tanto en el body, como flotantes en las esquinas, sin ser tan intrucivos.
      Luego existen los anuncios por recompensa (periodicos/temporales) y anucios opcionales. TODOS los anuncios deben tener su oportunidad de quitarse, la diferencia es que los temporales o periodicos debes esperar cierto tiempo para obtener cierta recompensa (la mitad), los opcionales aparecen en ciertos lugares donde puedas quitarlos en cualquier momento, como los intrucivos. Todos los anuncios respaldados por ciszu network y google analiticas. Crear AD_SYSTEM.md y crear MONETIZATION_PROTOCOLS.md (Manera de monetizacion de ciszunetwork, donacios directas e indirectas, anuncios y en el futuro compras y subcripciones)
* [ ] #6 Actualizar los terminos, condiciones, guildelines, reaglas y mas bases legales de todas las paginas para completar mas sobre el uso de datos de los usuarios para recomendar mejores anuncios, geolocalizacion, entre muchas otras cosas mas como la creacion de cuentas. Ciszu Network es el que debe tener mayor informacion de todo. Ademas cada pagina legal debe tener un dock para llevar a ciszunetwork, de manera que los usuarios puedan ver la version completa alli.
* [ ] #10 Implementar herramientas de SEO_PLAN.md y añadir mas informacion como metodos o protocolos para mejorar el SEO.

### Cambios de AUTH en todas las Websites:

- [ ] #1 Al registrarse o logearse debe haber cumplido la seguridad de cloudflare antes, y en ese instante un recaptcha, actualmente muzicmania tiene recaptcha. Siempre luego debe haber una pantalla para verificar el correo en momento de reggistrarse (pero es opcional, luego en sus configuraciones de cuenta puede terminar la verificacion) pero si el usuario tiene 2FA siempre debe haber una pantalla pidiendole una clave que empieze po C- y seguido de 6 digitos y en la mitad un espacio (C-123 434) clave oficial de ciszunetwork, temporal, expirable en 3 horas e indicar, unico por website, indicar si ya expiro y posibilidad de reenviar otro codigo con limites, al tercer limite se suspende temporalmente y localmente por que no logro iniciar sesion.
- [ ] #2 Cuando un usuario se registre luego se tiene que logear denuevo, si un usuario pierde su contra debe darle a olvide la contraseña y debe enviar una peticion, SOLAMENTE ESO, ya en su email se le enviare un link temporal de un oslo uso para recuperar su contra, con una pantalla exclusiva donde coloca su contraseña nueva y lo repite. No puede ser la antigua, luego requiere logearse.
- [ ] #3 Cuando se activa el boton de auth en el header, debe ser "unico" en el sentido que si se abre el search o el menu de hamburguesa se cierra el menu desplegado del header de auth y abre el slidebar o el search, es decir, no se acumulan por encima. MuzicMania y CiszukoAntony hacen las cosas bien, ciszubot y ciszu network no. Arreglar. Actualmente el bug sigue, incluso si abro primero el menu hamburguesa y luego el auth ambos se sobreponen solamente debe abrirse uno por cada.

### Cambios por Website

**Ciszu Network Website:**

- [ ] En las preferencias locales, el menu de idiomas esta bug, al entrar el modal no tiene el suficiente espacio para mostrar la lista, la consecuencia es que se corta, no hay opcion o no se ve la opcion para ir para atras al modal de preferencias denuevo.
- [ ] En las prefeencias locales. El zoom esta bien, lo unico es que todas las websites tiene ese sistema igual pero diferente posiciones, intenta que dentro del modal, deja un salto, el boton de quitar zoom en extremo izquierda y el de sumar zoom en el extremo derecho. En el medio una barra que crece o decrece dependiendo del zoom, empezando simepre en 100%
- [ ] Terminar idiomas en español (latam y español)
- [ ] Terminar idiomas en ingles (UK y USA)
- [ ] Terminar bien el tema claro (Todos los docks, modals o cards con fondo oscuro paran a claro, los textos oscuros o negros e iconos negros o oscuros.)
- [ ] Actualmente el sistema de discleimer esta bien, pero los discleimer de zoom critico o bajo zoom estan un poco bug, aparecen debajo del header y el header lo sobrepasa por encima. Debemos arreglar esto. El discleimer de web en desarrollo si esta bien. Sigue bugeado, actualmente funcionaba al principio, entre mas zoom o menos zoom aparece debajo, el problema actual es que no stackea. Basicamente, el discleimer de pagina en construccion se pone por detras del discleimer de zoom, luego en normal. Cuando quito la "X" del discleimer de pagina en construccion, y empiezo a testar con mucho o poco zoom, el discleimer vuelva a bugearse y ponerse hacia atras del header. Debes analizar el sistema actual de manera que los discleimer se stackeen y no se sobrepongan, como una lista. q ue se agregen y quiten con animacion fluida, da igual la posicion. Y Finalmente la posicion relativa de todo siempre debajo del header, no por detras, y que al aparecer mas discleiemr de van coloando hacia abajo no arriba.
- [ ] Actualmente cuando se accede a un LOGIN o REGISTER, el title de la pagina en cada website es diferente, deberia ser "nombre de la website" | "SECCION", Ciszu Network, Ciszuko Antony y Ciszubot lo hacen mal, MuzicMania si lo hace bien probandolo solo en | LOGIN.

**Ciszubot Website:**

- [ ] En las prefeencias locales. No tiene el sistema de idiomas correcto, copiar de ciszunetwork arreglado.
- [ ] En las prefeencias locales. Replicar posiciones del sistema de zoom de ciszunetwork arreglado.
- [ ] Terminar idiomas en español (latam y español)
- [ ] Actualmente cuando se accede a un LOGIN o REGISTER, el title de la pagina en cada website es diferente, deberia ser "nombre de la website" | "SECCION", Ciszu Network, Ciszuko Antony y Ciszubot lo hacen mal, MuzicMania si lo hace bien probandolo solo en | LOGIN.
- [ ] Terminar idiomas en ingles (UK y USA)
- [ ] Terminar bien el tema claro (Todos los docks, modals o cards con fondo oscuro paran a claro, los textos oscuros o negros e iconos negros o oscuros.)
- [ ] Actualmente el sistema de discleimer esta bien, pero los discleimer de zoom critico o bajo zoom estan un poco bug, aparecen debajo del header y el header lo sobrepasa por encima. Debemos arreglar esto. El discleimer de web en desarrollo si esta bien. Sigue bugeado, actualmente funcionaba al principio, entre mas zoom o menos zoom aparece debajo, el problema actual es que no stackea. Basicamente, el discleimer de pagina en construccion se pone por detras del discleimer de zoom, luego en normal. Cuando quito la "X" del discleimer de pagina en construccion, y empiezo a testar con mucho o poco zoom, el discleimer vuelva a bugearse y ponerse hacia atras del header. Debes analizar el sistema actual de manera que los discleimer se stackeen y no se sobrepongan, como una lista. q ue se agregen y quiten con animacion fluida, da igual la posicion. Y Finalmente la posicion relativa de todo siempre debajo del header, no por detras, y que al aparecer mas discleiemr de van coloando hacia abajo no arriba.
- [ ] Al cambiar de idioma, por alguna razon los assets que usan CDN como los logos, dejan de cargar correctamente, puede ser provocado por el turnstile aunque no estoy seguro, solo es una suposicion debido a que cuando el guard de cloudflare esta cargando no cargan los CDN, luego si, pero al cambiar de tema, como se actualiza la pagina es posible que sea eso. No lo se investiga e arregla.

**Ciszuko Antony Website:**

- [ ] En las prefeencias locales. No tiene el sistema de idiomas correcto, si se parece al de ciszunetwork pero al entrar se cierra el modal de preferencias sin sentido, un bug o error. Debemos copiar de ciszunetwork arreglado.
- [ ] El sistemas de errores de ciszuko antony website es bastante diferente a los de los demas (centrado), para mejorar el estilo guiate de los demas.
- [ ] En las prefeencias locales. Replicar posicioens del sistema de zoom de ciszunetwork arreglado
- [ ] Arreglar bug de ciszuko antony y su isotipo en el auth.
      63Unchecked runtime.lastError: Could not establish connection. Receiving end does not exist.
      ciszuko_logo_isotipo_outline_zwhite_ccolor.svg:1 Failed to load resource: the server responded with a status of 404 (Not Found)
- [ ] Terminar idiomas en español (latam y español)
- [ ] Terminar idiomas en ingles (UK y USA)
- [ ] Terminar bien el tema claro (Todos los docks, modals o cards con fondo oscuro paran a claro, los textos oscuros o negros e iconos negros o oscuros.)
- [ ] Actualmente el sistema de discleimer esta bien, pero los discleimer de zoom critico o bajo zoom estan un poco bug, aparecen debajo del header y el header lo sobrepasa por encima. Debemos arreglar esto. El discleimer de web en desarrollo si esta bien. Sigue bugeado, actualmente funcionaba al principio, entre mas zoom o menos zoom aparece debajo, el problema actual es que no stackea. Basicamente, el discleimer de pagina en construccion se pone por detras del discleimer de zoom, luego en normal. Cuando quito la "X" del discleimer de pagina en construccion, y empiezo a testar con mucho o poco zoom, el discleimer vuelva a bugearse y ponerse hacia atras del header. Debes analizar el sistema actual de manera que los discleimer se stackeen y no se sobrepongan, como una lista. q ue se agregen y quiten con animacion fluida, da igual la posicion. Y Finalmente la posicion relativa de todo siempre debajo del header, no por detras, y que al aparecer mas discleiemr de van coloando hacia abajo no arriba.
- [ ] Al cambiar de idioma, por alguna razon los assets que usan CDN como los logos, dejan de cargar correctamente, puede ser provocado por el turnstile aunque no estoy seguro, solo es una suposicion debido a que cuando el guard de cloudflare esta cargando no cargan los CDN, luego si, pero al cambiar de tema, como se actualiza la pagina es posible que sea eso. No lo se investiga e arregla.

**MuzicMania Website:**

- [ ] En las prefeencias locales. No tiene el sistema de idiomas correcto, copiar de ciszunetwork arreglado.
- [ ] Terminar idiomas en español (latam y español)
- [ ] Terminar idiomas en ingles (UK y USA)
- [ ] Terminar bien el tema claro (Todos los docks, modals o cards con fondo oscuro paran a claro, los textos oscuros o negros e iconos negros o oscuros.)
- [ ] Actualmente en Local, cuando se accede a un LOGIN o REGISTER, el title de la pagina en cada website es diferente, deberia ser "nombre de la website" | "SECCION", Ciszu Network, Ciszuko Antony y Ciszubot lo hacen mal, MuzicMania si lo hace bien probandolo solo en | LOGIN.
- [ ] En las prefeencias locales. Replicar posicioens del sistema de zoom de ciszunetwork arreglado
- [ ] Al cambiar de idioma, por alguna razon los assets que usan CDN como los logos, dejan de cargar correctamente, puede ser provocado por el turnstile aunque no estoy seguro, solo es una suposicion debido a que cuando el guard de cloudflare esta cargando no cargan los CDN, luego si, pero al cambiar de tema, como se actualiza la pagina es posible que sea eso. No lo se investiga e arregla.
- [ ] Actualmente el sistema de discleimer esta bien, pero los discleimer de zoom critico o bajo zoom estan un poco bug, aparecen debajo del header y el header lo sobrepasa por encima. Debemos arreglar esto. El discleimer de web en desarrollo si esta bien. Sigue bugeado, actualmente funcionaba al principio, entre mas zoom o menos zoom aparece debajo, el problema actual es que no stackea. Basicamente, el discleimer de pagina en construccion se pone por detras del discleimer de zoom, luego en normal. Cuando quito la "X" del discleimer de pagina en construccion, y empiezo a testar con mucho o poco zoom, el discleimer vuelva a bugearse y ponerse hacia atras del header. Debes analizar el sistema actual de manera que los discleimer se stackeen y no se sobrepongan, como una lista. q ue se agregen y quiten con animacion fluida, da igual la posicion. Y Finalmente la posicion relativa de todo siempre debajo del header, no por detras, y que al aparecer mas discleiemr de van coloando hacia abajo no arriba.
