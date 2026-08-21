# To Do List — Ciszu Network

> Este archivo solo puede ser editado por Ciszuko Antony.

### Cambios Generales:

- [ ] Finalizar el cambio de los VISUAL_BUILDERS e conciderar las demas herramientras como Onlook u otras pendientes o posibles. Instalar, implementar, documentar y commitear. (NO REALIZAR AUN)
- [ ] Crear sistema de mensajes globales en todas las paginas usando el toast de error. Mejorar los errores para que se compilen entre si y no se sobrepasen.
- [ ] Arreglar o investigar porque **CI / Security E2E (DAST interactivo) (push) fue skipeado, debemos relanzarlo.**
- [ ] Arreglar bug de ciszuko antony y su isotipo en el auth:
      Failed to load resource: the server responded with a status of 404 (Not Found)
- [ ] Arreglar bug de test unitarios en worflows de vitest, No pushear al probar solo lanzar esta tarea debido a que todas las demas si funcionan:

    Run pnpm test

    > ciszunetwork-monorepo@1.0.0 test E:\actions-runners\CISZU-PC-2_work\CiszuNetwork\CiszuNetwork
    > vitest run

    RUN v4.1.10 E:/actions-runners/CISZU-PC-2/\_work/CiszuNetwork/CiszuNetwork

    ✓ packages/payments/tests/payments.test.ts (9 tests) 125ms
    ✓ packages/utils/tests/cache.test.ts (18 tests) 208ms
    ✓ packages/cdn/tests/cdn-local.test.ts (18 tests) 13ms
    ✓ packages/utils/tests/iast.test.ts (11 tests) 19ms
    ✓ packages/email/tests/email.test.ts (7 tests) 17ms
    ✓ projects/ciszubot/discord-bot/tests/economy.test.ts (10 tests) 209ms
    ✓ projects/ciszubot/discord-bot/tests/configService.test.ts (8 tests) 87ms
    ✓ packages/ui/tests/Icon.test.tsx (8 tests) 289ms
    ✓ projects/ciszubot/discord-bot/tests/levels.test.ts (11 tests) 40ms
    DOMException [NotSupportedError]: Failed to load script "https://us.i.posthog.com/static/array.js". JavaScript file loading is disabled.
    at HTMLScriptElement.#loadScript (file:///E:/actions-runners/CISZU-PC-2/\_work/CiszuNetwork/CiszuNetwork/node_modules/.pnpm/happy-dom@20.11.2/node_modules/happy-dom/lib/nodes/html-script-element/HTMLScriptElement.js:549:31)
    at HTMLScriptElement.[connectedToDocument] (file:///E:/actions-runners/CISZU-PC-2/\_work/CiszuNetwork/CiszuNetwork/node_modules/.pnpm/happy-dom@20.11.2/node_modules/happy-dom/lib/nodes/html-script-element/HTMLScriptElement.js:315:33)
    at HTMLScriptElement.[connectedToNode] (file:///E:/actions-runners/CISZU-PC-2/\_work/CiszuNetwork/CiszuNetwork/node_modules/.pnpm/happy-dom@20.11.2/node_modules/happy-dom/lib/nodes/node/Node.js:794:53)
    at HTMLHeadElement.[appendChild] (file:///E:/actions-runners/CISZU-PC-2/\_work/CiszuNetwork/CiszuNetwork/node_modules/.pnpm/happy-dom@20.11.2/node_modules/happy-dom/lib/nodes/node/Node.js:413:45)
    at HTMLHeadElement.[appendChild] (file:///E:/actions-runners/CISZU-PC-2/\_work/CiszuNetwork/CiszuNetwork/node_modules/.pnpm/happy-dom@20.11.2/node_modules/happy-dom/lib/nodes/element/Element.js:1072:62)
    at HTMLHeadElement.appendChild (file:///E:/actions-runners/CISZU-PC-2/\_work/CiszuNetwork/CiszuNetwork/node_modules/.pnpm/happy-dom@20.11.2/node_modules/happy-dom/lib/nodes/node/Node.js:306:48)
    at E:/actions-runners/CISZU-PC-2/\_work/CiszuNetwork/CiszuNetwork/packages/ui/src/PostHogAnalytics.tsx:79:21
    at Object.react_stack_bottom_frame (E:\actions-runners\CISZU-PC-2_work\CiszuNetwork\CiszuNetwork\node_modules\.pnpm\react-dom@19.2.7_react@19.2.7\node_modules\react-dom\cjs\react-dom-client.development.js:25989:20)
    at runWithFiberInDEV (E:\actions-runners\CISZU-PC-2_work\CiszuNetwork\CiszuNetwork\node_modules\.pnpm\react-dom@19.2.7_react@19.2.7\node_modules\react-dom\cjs\react-dom-client.development.js:874:13)
    at commitHookEffectListMount (E:\actions-runners\CISZU-PC-2_work\CiszuNetwork\CiszuNetwork\node_modules\.pnpm\react-dom@19.2.7_react@19.2.7\node_modules\react-dom\cjs\react-dom-client.development.js:13249:29)
    DOMException [NotSupportedError]: Failed to load script "https://eu.i.posthog.com/static/array.js". JavaScript file loading is disabled.
    at HTMLScriptElement.#loadScript (file:///E:/actions-runners/CISZU-PC-2/\_work/CiszuNetwork/CiszuNetwork/node_modules/.pnpm/happy-dom@20.11.2/node_modules/happy-dom/lib/nodes/html-script-element/HTMLScriptElement.js:549:31)
    at HTMLScriptElement.[connectedToDocument] (file:///E:/actions-runners/CISZU-PC-2/\_work/CiszuNetwork/CiszuNetwork/node_modules/.pnpm/happy-dom@20.11.2/node_modules/happy-dom/lib/nodes/html-script-element/HTMLScriptElement.js:315:33)
    at HTMLScriptElement.[connectedToNode] (file:///E:/actions-runners/CISZU-PC-2/\_work/CiszuNetwork/CiszuNetwork/node_modules/.pnpm/happy-dom@20.11.2/node_modules/happy-dom/lib/nodes/node/Node.js:794:53)
    at HTMLHeadElement.[appendChild] (file:///E:/actions-runners/CISZU-PC-2/\_work/CiszuNetwork/CiszuNetwork/node_modules/.pnpm/happy-dom@20.11.2/node_modules/happy-dom/lib/nodes/node/Node.js:413:45)
    at HTMLHeadElement.[appendChild] (file:///E:/actions-runners/CISZU-PC-2/\_work/CiszuNetwork/CiszuNetwork/node_modules/.pnpm/happy-dom@20.11.2/node_modules/happy-dom/lib/nodes/element/Element.js:1072:62)
    at HTMLHeadElement.appendChild (file:///E:/actions-runners/CISZU-PC-2/\_work/CiszuNetwork/CiszuNetwork/node_modules/.pnpm/happy-dom@20.11.2/node_modules/happy-dom/lib/nodes/node/Node.js:306:48)
    at E:/actions-runners/CISZU-PC-2/\_work/CiszuNetwork/CiszuNetwork/packages/ui/src/PostHogAnalytics.tsx:79:21
    at Object.react_stack_bottom_frame (E:\actions-runners\CISZU-PC-2_work\CiszuNetwork\CiszuNetwork\node_modules\.pnpm\react-dom@19.2.7_react@19.2.7\node_modules\react-dom\cjs\react-dom-client.development.js:25989:20)
    at runWithFiberInDEV (E:\actions-runners\CISZU-PC-2_work\CiszuNetwork\CiszuNetwork\node_modules\.pnpm\react-dom@19.2.7_react@19.2.7\node_modules\react-dom\cjs\react-dom-client.development.js:874:13)
    at commitHookEffectListMount (E:\actions-runners\CISZU-PC-2_work\CiszuNetwork\CiszuNetwork\node_modules\.pnpm\react-dom@19.2.7_react@19.2.7\node_modules\react-dom\cjs\react-dom-client.development.js:13249:29)
    DOMException [NotSupportedError]: Failed to load script "https://us.i.posthog.com/static/array.js". JavaScript file loading is disabled.
    at HTMLScriptElement.#loadScript (file:///E:/actions-runners/CISZU-PC-2/\_work/CiszuNetwork/CiszuNetwork/node_modules/.pnpm/happy-dom@20.11.2/node_modules/happy-dom/lib/nodes/html-script-element/HTMLScriptElement.js:549:31)
    at HTMLScriptElement.[connectedToDocument] (file:///E:/actions-runners/CISZU-PC-2/\_work/CiszuNetwork/CiszuNetwork/node_modules/.pnpm/happy-dom@20.11.2/node_modules/happy-dom/lib/nodes/html-script-element/HTMLScriptElement.js:315:33)
    at HTMLScriptElement.[connectedToNode] (file:///E:/actions-runners/CISZU-PC-2/\_work/CiszuNetwork/CiszuNetwork/node_modules/.pnpm/happy-dom@20.11.2/node_modules/happy-dom/lib/nodes/node/Node.js:794:53)
    at HTMLHeadElement.[appendChild] (file:///E:/actions-runners/CISZU-PC-2/\_work/CiszuNetwork/CiszuNetwork/node_modules/.pnpm/happy-dom@20.11.2/node_modules/happy-dom/lib/nodes/node/Node.js:413:45)
    at HTMLHeadElement.[appendChild] (file:///E:/actions-runners/CISZU-PC-2/\_work/CiszuNetwork/CiszuNetwork/node_modules/.pnpm/happy-dom@20.11.2/node_modules/happy-dom/lib/nodes/element/Element.js:1072:62)
    at HTMLHeadElement.appendChild (file:///E:/actions-runners/CISZU-PC-2/\_work/CiszuNetwork/CiszuNetwork/node_modules/.pnpm/happy-dom@20.11.2/node_modules/happy-dom/lib/nodes/node/Node.js:306:48)
    at E:/actions-runners/CISZU-PC-2/\_work/CiszuNetwork/CiszuNetwork/packages/ui/src/PostHogAnalytics.tsx:79:21
    at Object.react_stack_bottom_frame (E:\actions-runners\CISZU-PC-2_work\CiszuNetwork\CiszuNetwork\node_modules\.pnpm\react-dom@19.2.7_react@19.2.7\node_modules\react-dom\cjs\react-dom-client.development.js:25989:20)
    at runWithFiberInDEV (E:\actions-runners\CISZU-PC-2_work\CiszuNetwork\CiszuNetwork\node_modules\.pnpm\react-dom@19.2.7_react@19.2.7\node_modules\react-dom\cjs\react-dom-client.development.js:874:13)
    at commitHookEffectListMount (E:\actions-runners\CISZU-PC-2_work\CiszuNetwork\CiszuNetwork\node_modules\.pnpm\react-dom@19.2.7_react@19.2.7\node_modules\react-dom\cjs\react-dom-client.development.js:13249:29)
    DOMException [NotSupportedError]: Failed to load script "https://us.i.posthog.com/static/array.js". JavaScript file loading is disabled.
    at HTMLScriptElement.#loadScript (file:///E:/actions-runners/CISZU-PC-2/\_work/CiszuNetwork/CiszuNetwork/node_modules/.pnpm/happy-dom@20.11.2/node_modules/happy-dom/lib/nodes/html-script-element/HTMLScriptElement.js:549:31)
    at HTMLScriptElement.[connectedToDocument] (file:///E:/actions-runners/CISZU-PC-2/\_work/CiszuNetwork/CiszuNetwork/node_modules/.pnpm/happy-dom@20.11.2/node_modules/happy-dom/lib/nodes/html-script-element/HTMLScriptElement.js:315:33)
    at HTMLScriptElement.[connectedToNode] (file:///E:/actions-runners/CISZU-PC-2/\_work/CiszuNetwork/CiszuNetwork/node_modules/.pnpm/happy-dom@20.11.2/node_modules/happy-dom/lib/nodes/node/Node.js:794:53)
    at HTMLHeadElement.[appendChild] (file:///E:/actions-runners/CISZU-PC-2/\_work/CiszuNetwork/CiszuNetwork/node_modules/.pnpm/happy-dom@20.11.2/node_modules/happy-dom/lib/nodes/node/Node.js:413:45)
    at HTMLHeadElement.[appendChild] (file:///E:/actions-runners/CISZU-PC-2/\_work/CiszuNetwork/CiszuNetwork/node_modules/.pnpm/happy-dom@20.11.2/node_modules/happy-dom/lib/nodes/element/Element.js:1072:62)
    at HTMLHeadElement.appendChild (file:///E:/actions-runners/CISZU-PC-2/\_work/CiszuNetwork/CiszuNetwork/node_modules/.pnpm/happy-dom@20.11.2/node_modules/happy-dom/lib/nodes/node/Node.js:306:48)
    at E:/actions-runners/CISZU-PC-2/\_work/CiszuNetwork/CiszuNetwork/packages/ui/src/PostHogAnalytics.tsx:79:21
    at Object.react_stack_bottom_frame (E:\actions-runners\CISZU-PC-2_work\CiszuNetwork\CiszuNetwork\node_modules\.pnpm\react-dom@19.2.7_react@19.2.7\node_modules\react-dom\cjs\react-dom-client.development.js:25989:20)
    at runWithFiberInDEV (E:\actions-runners\CISZU-PC-2_work\CiszuNetwork\CiszuNetwork\node_modules\.pnpm\react-dom@19.2.7_react@19.2.7\node_modules\react-dom\cjs\react-dom-client.development.js:874:13)
    ✓ packages/ui/tests/PostHogAnalytics.test.tsx (7 tests) 84ms
    at commitHookEffectListMount (E:\actions-runners\CISZU-PC-2_work\CiszuNetwork\CiszuNetwork\node_modules\.pnpm\react-dom@19.2.7_react@19.2.7\node_modules\react-dom\cjs\react-dom-client.development.js:13249:29)
    ✓ packages/cdn/tests/cdn-remote.test.ts (10 tests) 10ms
    ✓ packages/utils/tests/csp.test.ts (6 tests) 24ms
    ✓ packages/cdn/tests/cdn-delivery.test.ts (5 tests) 8ms
    ✓ packages/ui/tests/icon-registry.test.ts (5 tests) 79ms
    ✓ projects/ciszubot/discord-bot/tests/giveaways.test.ts (5 tests) 31ms
    ✓ packages/utils/tests/schema.test.ts (3 tests) 11ms
    ✓ packages/utils/tests/effect.test.ts (2 tests) 171ms
    [Nest] 12796 - 20/08/2026, 3:52:49 p. m. LOG [NestFactory] Starting Nest application...
    [Nest] 12796 - 20/08/2026, 3:52:49 p. m. LOG [InstanceLoader] StatsModule dependencies initialized +18ms
    [Nest] 12796 - 20/08/2026, 3:52:49 p. m. LOG [RoutesResolver] StatsController {/api}: +243ms
    [Nest] 12796 - 20/08/2026, 3:52:49 p. m. LOG [RouterExplorer] Mapped {/api/stats, GET} route +12ms
    [Nest] 12796 - 20/08/2026, 3:52:49 p. m. LOG [RouterExplorer] Mapped {/api/update-stats, POST} route +5ms
    [Nest] 12796 - 20/08/2026, 3:52:49 p. m. LOG [RouterExplorer] Mapped {/api/votes, POST} route +1ms
    [Nest] 12796 - 20/08/2026, 3:52:49 p. m. LOG [RouterExplorer] Mapped {/api/votes/dbl, POST} route +5ms
    [Nest] 12796 - 20/08/2026, 3:52:49 p. m. LOG [NestApplication] Nest application successfully started +3ms
    ❯ projects/ciszubot/discord-bot/tests/statsServer.test.ts (6 tests | 6 skipped) 28513ms

    ⎯⎯⎯⎯⎯⎯ Failed Suites 1 ⎯⎯⎯⎯⎯⎯⎯
    ↓ GET /api/stats devuelve el estado inicial

    ↓ POST /api/update-stats actualiza campos y el GET los refleja
    FAIL projects/ciszubot/discord-bot/tests/statsServer.test.ts [ projects/ciszubot/discord-bot/tests/statsServer.test.ts ]
    ↓ updateStats(client) vuelca el estado del cliente
    ↓ POST /api/votes/dbl exige autenticación (401)
    Error: Hook timed out in 10000ms.
    ↓ POST /api/votes/dbl con secreto responde 200
    If this is a long-running hook, pass a timeout value as the last argument or configure it globally with "hookTimeout".
    ↓ incrementCommands / getTotalCommands
    ❯ projects/ciszubot/discord-bot/tests/statsServer.test.ts:20:1
    18| let base = '';

    19|
    Test Files 1 failed | 17 passed (18)
    20| beforeAll(async () => {
    Tests 143 passed | 6 skipped (149)
    | ^
    Errors 3 errors
    21| process.env.PORT = '0'; // puerto efímero para no chocar con el bot …
    Start at 15:45:22
    22| process.env.DBL_WEBHOOK_SECRET = 'test-secret';
    Duration 447.48s (transform 25.63s, setup 94.05s, import 765.54s, tests 29.94s, environment 49.16s)

    ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯

    Error: Error: Hook timed out in 10000ms.
    If this is a long-running hook, pass a timeout value as the last argument or configure it globally with "hookTimeout".
    ❯ projects/ciszubot/discord-bot/tests/statsServer.test.ts:20:1

    ⎯⎯⎯⎯⎯⎯ Unhandled Errors ⎯⎯⎯⎯⎯⎯

    Vitest caught 3 unhandled errors during the test run.
    This might cause false positive tests. Resolve unhandled errors to make sure your tests are not affected.

    ⎯⎯⎯⎯⎯⎯ Unhandled Error ⎯⎯⎯⎯⎯⎯⎯
    Error: [vitest-pool]: Failed to start forks worker for test files E:/actions-runners/CISZU-PC-2/_work/CiszuNetwork/CiszuNetwork/packages/ui/tests/CloudflareGuard.test.tsx.
    ❯ node_modules/.pnpm/vitest@4.1.10_@opentelemetr*2eb0fe4a0d1afe5f2bbf369c900f9db2/node_modules/vitest/dist/chunks/cli-api.BK8pd4xc.js:3465:94
    ❯ Pool.schedule node_modules/.pnpm/vitest@4.1.10*@opentelemetr_2eb0fe4a0d1afe5f2bbf369c900f9db2/node_modules/vitest/dist/chunks/cli-api.BK8pd4xc.js:3465:5

    Caused by: Error: [vitest-pool-runner]: Timeout waiting for worker to respond
    ❯ Timeout.<anonymous></anonymous> node*modules/.pnpm/vitest@4.1.10*@opentelemetr_2eb0fe4a0d1afe5f2bbf369c900f9db2/node_modules/vitest/dist/chunks/cli-api.BK8pd4xc.js:3041:58
    ❯ listOnTimeout node:internal/timers:605:17
    ❯ processTimers node:internal/timers:541:7

    ⎯⎯⎯⎯⎯⎯ Unhandled Error ⎯⎯⎯⎯⎯⎯⎯
    Error: [vitest-pool]: Failed to start forks worker for test files E:/actions-runners/CISZU-PC-2/_work/CiszuNetwork/CiszuNetwork/packages/ui/tests/FabStack.test.tsx.
    ❯ node_modules/.pnpm/vitest@4.1.10_@opentelemetr*2eb0fe4a0d1afe5f2bbf369c900f9db2/node_modules/vitest/dist/chunks/cli-api.BK8pd4xc.js:3465:94
    ❯ Pool.schedule node_modules/.pnpm/vitest@4.1.10*@opentelemetr_2eb0fe4a0d1afe5f2bbf369c900f9db2/node_modules/vitest/dist/chunks/cli-api.BK8pd4xc.js:3465:5

    Caused by: Error: [vitest-pool-runner]: Timeout waiting for worker to respond
    ❯ Timeout.<anonymous></anonymous> node*modules/.pnpm/vitest@4.1.10*@opentelemetr_2eb0fe4a0d1afe5f2bbf369c900f9db2/node_modules/vitest/dist/chunks/cli-api.BK8pd4xc.js:3041:58
    ❯ listOnTimeout node:internal/timers:605:17
    ❯ processTimers node:internal/timers:541:7

    ⎯⎯⎯⎯⎯⎯ Unhandled Error ⎯⎯⎯⎯⎯⎯⎯
    Error: [vitest-pool]: Failed to start forks worker for test files E:/actions-runners/CISZU-PC-2/_work/CiszuNetwork/CiszuNetwork/packages/ui/tests/InstallPdwaButton.test.tsx.
    ❯ node_modules/.pnpm/vitest@4.1.10_@opentelemetr*2eb0fe4a0d1afe5f2bbf369c900f9db2/node_modules/vitest/dist/chunks/cli-api.BK8pd4xc.js:3465:94
    ❯ Pool.schedule node_modules/.pnpm/vitest@4.1.10*@opentelemetr_2eb0fe4a0d1afe5f2bbf369c900f9db2/node_modules/vitest/dist/chunks/cli-api.BK8pd4xc.js:3465:5

    Caused by: Error: [vitest-pool-runner]: Timeout waiting for worker to respond
    ❯ Timeout.<anonymous></anonymous> node*modules/.pnpm/vitest@4.1.10*@opentelemetr_2eb0fe4a0d1afe5f2bbf369c900f9db2/node_modules/vitest/dist/chunks/cli-api.BK8pd4xc.js:3041:58
    ❯ listOnTimeout node:internal/timers:605:17
    ❯ processTimers node:internal/timers:541:7

    ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯

     ELIFECYCLE  Test failed. See above for more details.
    Error: Process completed with exit code 1.

- [ ] Crear sistemas de anuncios particulares e intrucivos, intrucivos son los que aparecen por alguna accion del usuario, aparecen siempre luego de esa accion, aparen como un modal en el centro con animacion fluida y blur al fondo. Ejemplo luego de una partida de muzicmania, luego de comprar algo en la tienda (futuro), etc. Particulares son los que aparecen de vez en cuando, en ciertos lugares de las paginas tanto en el body, como flotantes en las esquinas, sin ser tan intrucivos.
      Luego existen los anuncios por recompensa (periodicos/temporales) y anucios opcionales. TODOS los anuncios deben tener su oportunidad de quitarse, la diferencia es que los temporales o periodicos debes esperar cierto tiempo para obtener cierta recompensa (la mitad), los opcionales aparecen en ciertos lugares donde puedas quitarlos en cualquier momento, como los intrucivos. Todos los anuncios respaldados por ciszu network y google analiticas. Crear AD_SYSTEM.md y crear MONETIZATION_PROTOCOLS.md (Manera de monetizacion de ciszunetwork, donacios directas e indirectas, anuncios y en el futuro compras y subcripciones)
- [ ] Actualizar los terminos, condiciones, guildelines, reaglas y mas bases legales de todas las paginas para completar mas sobre el uso de datos de los usuarios para recomendar mejores anuncios, geolocalizacion, entre muchas otras cosas mas como la creacion de cuentas. Ciszu Network es el que debe tener mayor informacion de todo. Ademas cada pagina legal debe tener un dock para llevar a ciszunetwork, de manera que los usuarios puedan ver la version completa alli.
- [ ] En ciszunetwork no tiene sentido que sea ciszunetwork x ciszunetwork, en el auth de ciszunetwork solamente debe haber 1 icono isotipo mas grande de ciszunetwork.
- [ ] En muzicmania desactiva los quickdocks cuando se hace un auth.
- [ ] Me he dado cuenta que los links de los auth de los isotipos algunos estan con localhost como hipervinculo en vez de la pagina en vercel, no se si esto es un error, pero a la hora de produccion no se puede hacer hipervinculos a local host siempre a vercel app.
- [ ] Los asteriscos para indicar que obligatorio siempre debe ser en rojo. Y en caso de error remarcar el contorno en rojo, si deja eso sin modificar. Algunas paginas si lo tienen.
- [ ] En el auth de ciszubot, los iconos azules cyan son demasiados grandes. Parece que existe fallas de los estilos.
- [ ] MuzicMania actualmente tiene un sistema para que el usuario comun NO pueda copiar TODO lo que quiera de las paginas, actualmente en muzicmania se aplica pero en los demas no. Debemos replicar este sistema en todas las websites en todas las paginas. Teniendo en cuenta que el usuario si pueda copiar ciertas cosas como campos de texto, nombres o IDs, preferencias o configuraciones, leaderboards, redes sociales entre otros. Tambien cualquier cosa que se pueda copiar debe tener un boton alado para copiar automaticamente.
- [x] Agregar en todas las websites un discleimer que se pueda quitar con una X, posicionado de extremo a extremo en la header de cada website, sobre que esta website/app seta siendo construida en version BETA. Implementado en @ciszu/ui con DisclaimerStack que se adapta modo full (banda bajo header) e island (tarjetas flotantes).
- [ ] Terminar por lo menos el tema oscuro y claro en TODAS LAS WEBSITES.
- [ ] Las preferencias en ciszukoantony tiene un error, el fondo es full transparante y no se distingue nada.
- [ ] Aun se sigue usando los botones de idiomas incorrectos en las preferencias, debe ser igual al de los navbars.
- [ ] Terminar por lo menos 2 ramas de idiomas (español e ingles (latam, españa, usa, uk)) en TODAS LAS WEBSITES, las que no estan disponiblse seguir dando error por version beta.
- [ ] Investigar herramientas de SEO e crear documentacion de SEO_PLAN.md e implementarla.
- [ ] Los invitados su usser debe estar en ingles siempre sin cambio de idioma.

### Cambios a todas las Websites:

- [ ] El sistemas de errores de ciszuko antony website es bastante diferente a los de los demas (centrado), para mejorar el estilo guiate de los demas.
- [ ] Los botones de tema y de lenguaje deben ser iguales a los del menu hamburguesa/footer. Actualmente la mayoria usa un sistema de lenguajes diferente e erroneo. Debes adaptar el sistema de lenguaje que no solo salga como en el menu de hamburguesa slidebar, si no tambien independientemente, de hecho en muzicmania ya existe dentro de play, un menu de lenguajes parecido a lo que necesito. Digamos que el sistema de zoom debe ser independientemente de cualquier otra pagina (por pagina) y ademas el de silenciar pagina tambien, las preferencias se guardan localmente. Como diseño el de idioma y tema obviamenta ya sabes como lo quiero. Pero para los otros, Sobre el zoom prefiero mucho el estilo de zoom de ciszubot, y para el silenciar pestaña cualquiera menos ciszubot.
- [ ] Finalmente recuerda que al registrarse o logearse debe haber cumplido la seguridad de cloudflare antes, y en ese instante un recaptcha, actualmente muzicmania tiene recaptcha. Siempre luego debe haber una pantalla para verificar el correo en momento de reggistrarse (pero es opcional, luego en sus configuraciones de cuenta puede terminar la verificacion) pero si el usuario tiene 2FA siempre debe haber una pantalla pidiendole una clave que empieze po C- y seguido de 6 digitos y en la mitad un espacio (C-123 434) clave oficial de ciszunetwork, temporal, expirable en 3 horas e indicar, unico por website, indicar si ya expiro y posibilidad de reenviar otro codigo con limites, al tercer limite se suspende temporalmente y localmente por que no logro iniciar sesion.
- [ ] Cuando un usuario se registre luego se tiene que logear denuevo, si un usuario pierde su contra debe darle a olvide la contraseña y debe enviar una peticion, SOLAMENTE ESO, ya en su email se le enviare un link temporal de un oslo uso para recuperar su contra, con una pantalla exclusiva donde coloca su contraseña nueva y lo repite. No puede ser la antigua, luego requiere logearse.
- [ ] Cuando se activa el boton de auth en el header, debe ser "unico" en el sentido que si se abre el search o el menu de hamburguesa se cierra el menu desplegado del header de auth y abre el slidebar o el search, es decir, no se acumulan por encima. MuzicMania y CiszukoAntony hacen las cosas bien, ciszubot y ciszu network no. Arreglar. Actualmente el bug sigue, incluso si abro primero el menu hamburguesa y luego el auth ambos se sobreponen solamente debe abrirse uno por cada.

### Cambios por Website

**Ciszu Network Website:**

- [ ] Nada.

**Ciszubot Website:**

- [ ] Nada.

**Ciszuko Antony Website:**

- [ ] Nada.

**MuzicMania Website:**

- [ ] Nada.
