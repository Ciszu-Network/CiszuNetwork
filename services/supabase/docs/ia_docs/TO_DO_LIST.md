# To Do List — Ciszu Network DataBase

> Este archivo solo puede ser editado por Ciszuko Antony.

## Prioridad Alta — CDN Multimedia

- [ ] **Subir assets multimedia a Supabase Storage** (bucket: ciszu-cdn)
    - [ ] Hacer inventario de assets por proyecto (GIFs, videos, imágenes grandes, música)
    - [ ] Ejecutar `pnpm cdn:upload` con SUPABASE_SERVICE_ROLE_KEY
    - [ ] Verificar subida de assets
- [ ] **Migrar referencias locales a CDN** en cada webpage (fase 2 — assets arbitrarios)
    - [ ] Identificar todas las rutas a assets locales en el código (`/content/`, `/public/images/`, etc.)
    - [ ] Reemplazar con llamadas a `assetResolver.resolve(path)` desde `@ciszunetwork/cdn`
    - [ ] Probar que cada webpage carga assets desde CDN correctamente
- [ ] **Limpiar assets locales del repositorio** después de migración exitosa
    - [ ] Actualizar `.gitignore` para excluir assets migrados
    - [ ] Verificar que el repo pesa menos después de la limpieza

## Prioridad Alta — Agent IA

- [x] Cuando el estado de la base de datos este sano, sin advisors, con el cdn correctamente configurado, linkeado y probado ya en el proyecto. Haremos el deploy a vercel y la subida a github.
- [ ] Solucionar bugs, errores y mas luego de la nuevas pruebas hasta pulir todo.
- [x] El estado optimo es que las paginas webs principalmente funcionen con el sistema hibrido del cdn y local necesariamente. Luego las apps compilables como desktops, launchers o apks. Deben literalmente usar el sistema hibrido. Y por ultimo ostros proyectos socialesArranca c o proyectos sin interfaz de react aun (no necesita assets) como el codigo fuente del bot ciszubot que no necesitan aun este sistema de assets.
- [ ] En el futuro, la idea es seguir desarrollando los proyectos, en especial las apps, en donde pueda usar el cdn o local de manera libre. Y si necesito subir un asset o creo un asset por ejemplo un icono nuevo en shared icons, se debe actualizar el CDN siempre y opcionalmente el programador puede usar el CDN (link dinamico) o local si es compilado para offline. De esa manera tengo suficiente control para usar el sistema de CDN y programar mis apliaciones de manera profesional, sin necesidad de problemas como subir todos los assets manualmente o malfuncionamiento del cdn al linkearlo con el codigo.

## Completado

- [x] CDN integration: @ciszunetwork/cdn completado + integrado en los 4 websites (resolveIcon, icons.ts, useIcon.tsx)
- [x] 27 Security Advisor warnings corregidos (migraciones 08-10)
- [x] XSS + SQL injection protección implementada
- [x] upload-cdn.js con diff-check (solo archivos nuevos/modificados)
- [x] backup-db.js con Management API + pg_dump + pnpm script
- [x] PROJECT_HISTORY.md y changelogs actualizados
- [x] Bucket unificado: ciszu-assets → ciszu-cdn

(index):1 Error parsing shader source at: chrome-extension://mobgbhhnbchcipdigbfakjddhofjbmob/shader/Glitch.txt
error: 50: unknown identifier 'iResolution'
vec2 uv = fragCoord.xy / iResolution.xy;
^^^^^^^^^^^
error: 51: unknown identifier 'uv'
uv.y = uv.y;
^^
error: 51: unknown identifier 'uv'
uv.y = uv.y;
^^
error: 53: unknown identifier 'iTime'
float time = mod(iTime*100.0, 32.0)/110.0; // + modelmat[0].x + modelmat[0].z;
^^^^^
error: 55: unknown identifier 'iMouse'
float GLITCH = 0.1 + iMouse.x / iResolution.x;
^^^^^^
error: 55: unknown identifier 'iResolution'
float GLITCH = 0.1 + iMouse.x / iResolution.x;
^^^^^^^^^^^
error: 57: unknown identifier 'GLITCH'
float gnm = sat( GLITCH );
^^^^^^
error: 58: unknown identifier 'time'
float rnd0 = rand( mytrunc( vec2(time, time), 6.0 ) );
^^^^
error: 58: unknown identifier 'time'
float rnd0 = rand( mytrunc( vec2(time, time), 6.0 ) );
^^^^
error: 59: unknown identifier 'gnm'
float r0 = sat((1.0-gnm)*0.7 + rnd0);
^^^
error: 59: unknown identifier 'rnd0'
float r0 = sat((1.0-gnm)*0.7 + rnd0);
^^^^
error: 60: unknown identifier 'uv'
float rnd1 = rand( vec2(mytrunc( uv.x, 10.0*r0 ), time) ); //horz
^^
error: 60: unknown identifier 'r0'
float rnd1 = rand( vec2(mytrunc( uv.x, 10.0*r0 ), time) ); //horz
^^
error: 60: unknown identifier 'time'
float rnd1 = rand( vec2(mytrunc( uv.x, 10.0*r0 ), time) ); //horz
^^^^
error: 62: unknown identifier 'gnm'
float r1 = 0.5 - 0.5 _ gnm + rnd1;
^^^
error: 62: unknown identifier 'rnd1'
float r1 = 0.5 - 0.5 _ gnm + rnd1;
^^^^
error: 63: unknown identifier 'r1'
r1 = 1.0 - max( 0.0, ((r1<1.0) ? r1 : 0.9999999) ); //note: weird ass bug on old drivers
^^
error: 63: unknown identifier 'r1'
r1 = 1.0 - max( 0.0, ((r1<1.0) ? r1 : 0.9999999) ); //note: weird ass bug on old drivers
^^
error: 63: unknown identifier 'r1'
r1 = 1.0 - max( 0.0, ((r1<1.0) ? r1 : 0.9999999) ); //note: weird ass bug on old drivers
^^
error: 64: unknown identifier 'uv'
float rnd2 = rand( vec2(mytrunc( uv.y, 40.0*r1 ), time) ); //vert
^^
error: 64: unknown identifier 'r1'
float rnd2 = rand( vec2(mytrunc( uv.y, 40.0*r1 ), time) ); //vert
^^
error: 64: unknown identifier 'time'
float rnd2 = rand( vec2(mytrunc( uv.y, 40.0*r1 ), time) ); //vert
^^^^
error: 65: unknown identifier 'rnd2'
float r2 = sat( rnd2 );
^^^^
error: 67: unknown identifier 'uv'
float rnd3 = rand( vec2(mytrunc( uv.y, 10.0*r0 ), time) );
^^
error: 67: unknown identifier 'r0'
float rnd3 = rand( vec2(mytrunc( uv.y, 10.0*r0 ), time) );
^^
error: 67: unknown identifier 'time'
float rnd3 = rand( vec2(mytrunc( uv.y, 10.0*r0 ), time) );
^^^^
error: 68: unknown identifier 'rnd3'
float r3 = (1.0-sat(rnd3+0.8)) - 0.1;
^^^^
error: 70: unknown identifier 'uv'
float pxrnd = rand( uv + time );
^^
error: 70: unknown identifier 'time'
float pxrnd = rand( uv + time );
^^^^
error: 72: unknown identifier 'r2'
float ofs = 0.05 _ r2 _ GLITCH _ ( rnd0 > 0.5 ? 1.0 : -1.0 );
^^
error: 72: unknown identifier 'GLITCH'
float ofs = 0.05 _ r2 _ GLITCH _ ( rnd0 > 0.5 ? 1.0 : -1.0 );
^^^^^^
error: 72: unknown identifier 'rnd0'
float ofs = 0.05 _ r2 _ GLITCH _ ( rnd0 > 0.5 ? 1.0 : -1.0 );
^^^^
error: 73: unknown identifier 'ofs'
ofs += 0.5 _ pxrnd _ ofs;
^^^
error: 73: unknown identifier 'pxrnd'
ofs += 0.5 _ pxrnd _ ofs;
^^^^^
error: 73: unknown identifier 'ofs'
ofs += 0.5 _ pxrnd _ ofs;
^^^
error: 75: unknown identifier 'uv'
uv.y += 0.1 _ r3 _ GLITCH;
^^
error: 75: unknown identifier 'r3'
uv.y += 0.1 _ r3 _ GLITCH;
^^
error: 75: unknown identifier 'GLITCH'
uv.y += 0.1 _ r3 _ GLITCH;
^^^^^^
error: 85: unknown identifier 'uv'
uv.x = sat( uv.x + ofs _ t );
^^
error: 85: unknown identifier 'uv'
uv.x = sat( uv.x + ofs _ t );
^^
error: 85: unknown identifier 'ofs'
uv.x = sat( uv.x + ofs _ t );
^^^
error: 86: unknown identifier 'texture'
vec4 samplecol = texture( iChannel0, uv, -10.0 );
^^^^^^^
error: 86: unknown identifier 'iChannel0'
vec4 samplecol = texture( iChannel0, uv, -10.0 );
^^^^^^^^^
error: 86: unknown identifier 'uv'
vec4 samplecol = texture( iChannel0, uv, -10.0 );
^^
error: 88: unknown identifier 'samplecol'
samplecol.rgb = samplecol.rgb _ s;
^^^^^^^^^
error: 88: unknown identifier 'samplecol'
samplecol.rgb = samplecol.rgb _ s;
^^^^^^^^^
error: 89: unknown identifier 'samplecol'
sum += samplecol;
^^^^^^^^^
47 errors

tab.js:325 browser: opera-chromium
9465-051815a09deb7257.js:1 [Violation] 'message' handler took 234ms
[Violation] Forced reflow while executing JavaScript took 146ms
8651-f3bb44b843c6883d.js:37 HEAD https://obwzzmbvkrcscqwptlqo.supabase.co/rest/v1/profiles?select=_ 404 (Not Found)
(anonymous) @ 8651-f3bb44b843c6883d.js:37
(anonymous) @ 8651-f3bb44b843c6883d.js:37
await in (anonymous)
(anonymous) @ 8651-f3bb44b843c6883d.js:14
then @ 8651-f3bb44b843c6883d.js:14
postMessage
l @ 9465-051815a09deb7257.js:1
w @ 9465-051815a09deb7257.js:1
postMessage
l @ 9465-051815a09deb7257.js:1
w @ 9465-051815a09deb7257.js:1
postMessage
l @ 9465-051815a09deb7257.js:1
(anonymous) @ 9465-051815a09deb7257.js:1
iY @ da65c703-ee371921bbd473db.js:1
iK @ da65c703-ee371921bbd473db.js:1
(anonymous) @ da65c703-ee371921bbd473db.js:1
8651-f3bb44b843c6883d.js:37 GET https://obwzzmbvkrcscqwptlqo.supabase.co/rest/v1/track_stats?select=track_id%2Cplay_count%2Clike_count 404 (Not Found)
(anonymous) @ 8651-f3bb44b843c6883d.js:37
(anonymous) @ 8651-f3bb44b843c6883d.js:37
await in (anonymous)
(anonymous) @ 8651-f3bb44b843c6883d.js:14
then @ 8651-f3bb44b843c6883d.js:14
postMessage
l @ 9465-051815a09deb7257.js:1
w @ 9465-051815a09deb7257.js:1
postMessage
l @ 9465-051815a09deb7257.js:1
w @ 9465-051815a09deb7257.js:1
postMessage
l @ 9465-051815a09deb7257.js:1
(anonymous) @ 9465-051815a09deb7257.js:1
iY @ da65c703-ee371921bbd473db.js:1
iK @ da65c703-ee371921bbd473db.js:1
(anonymous) @ da65c703-ee371921bbd473db.js:1
8651-f3bb44b843c6883d.js:37 HEAD https://obwzzmbvkrcscqwptlqo.supabase.co/rest/v1/scores?select=_&created_at=gte.2026-07-30T04%3A00%3A00.000Z 404 (Not Found)
(anonymous) @ 8651-f3bb44b843c6883d.js:37
(anonymous) @ 8651-f3bb44b843c6883d.js:37
await in (anonymous)
(anonymous) @ 8651-f3bb44b843c6883d.js:14
then @ 8651-f3bb44b843c6883d.js:14
8651-f3bb44b843c6883d.js:37 GET https://obwzzmbvkrcscqwptlqo.supabase.co/rest/v1/scores?select=score&order=score.desc&limit=1 404 (Not Found)
(anonymous) @ 8651-f3bb44b843c6883d.js:37
(anonymous) @ 8651-f3bb44b843c6883d.js:37
await in (anonymous)
(anonymous) @ 8651-f3bb44b843c6883d.js:14
then @ 8651-f3bb44b843c6883d.js:14
8651-f3bb44b843c6883d.js:37 HEAD https://obwzzmbvkrcscqwptlqo.supabase.co/rest/v1/profiles?select=*&created_at=gte.2026-07-29T04%3A08%3A58.144Z 404 (Not Found)
(anonymous) @ 8651-f3bb44b843c6883d.js:37
(anonymous) @ 8651-f3bb44b843c6883d.js:37
await in (anonymous)
(anonymous) @ 8651-f3bb44b843c6883d.js:14
then @ 8651-f3bb44b843c6883d.js:14
