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
- [ ] Actualmente los workflows y deploy dieron error. Pero descuida, terminaremos esto mañana. Por ahora nos detendremos aqui.
- [ ] Aun falta arreglar las conexiones del cdn con las builds reales.
- [ ] Optimizar el jeugo de muzicmania.
- [ ] Arreglar los errores de consola.
- [ ] Agregar AI APIS para diseños artisticos en los proyectos.
    - [ ] [app.leonardo.ai](https://app.leonardo.ai/)
    - [ ] [www.recraft.ai](https://www.recraft.ai/project/da269349-6552-4a93-ac10-3cb0f9961fbb)
    - [ ] [cloud.siliconflow.co](https://cloud.siliconflow.com/me/models)m
    - [ ] [www.creen.ai](https://www.creen.ai/es)
