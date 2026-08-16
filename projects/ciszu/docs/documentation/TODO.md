# To Do List — Ciszu Network

> Este archivo solo puede ser editado por Ciszuko Antony.

## Frontend General — estructura y diseño de páginas

**PDWA (Descargas) + Feedback botones flotantes.**

- Arreglar las advertencias al cerrar con X. Actualmente al cerrar las advertencias esta fuera de la pantalla por debajo, no se pueden leer, debe aparecer mas arriba o la derecha. Como no se ve no puedo verificar la siguiente informacion: Debe indicar que puede reactivar el boton cierta pagina. Solamente eso. Ademas debe tener un contador para indicar que se quitara en 3 segundos. Visualmente.

**Footers de todas las websites**

- Centrar copyrights de footers y dejar espacio debajo. Actualmente muzicmania, ciszukoantony y ciszunetwork websites siguen sin tener centrado. Ciszubot es el unico que si respeta el copyright centrado + botones centrados + espacio debajo.

# Cambios por cada website para pulir errores de frontend (adema de las generales)

Ciszu Network Website:

- [ ] Actualmente el tagline en todas las paginas internas del website no carga.

"781b197b-64bfbf97694f0c4e.js:2 Creating a worker from 'blob:https://ciszunetwork.vercel.app/bc0cb572-9c7f-4795-b5de-a8e9d0dd4335' violates the following Content Security Policy directive: "script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com https://static.cloudflareinsights.com https://us.i.posthog.com https://us-assets.i.posthog.com https://widget.trustpilot.com https://www.trustpilot.com". Note that 'worker-src' was not explicitly set, so 'script-src' is used as a fallback. The action has been blocked.
(anonymous) @ 781b197b-64bfbf97694f0c4e.js:2
eventBuffer.useCompression @ 781b197b-64bfbf97694f0c4e.js:2
\_initializeRecording @ 781b197b-64bfbf97694f0c4e.js:2
initializeSampling @ 781b197b-64bfbf97694f0c4e.js:2
\_initialize @ 781b197b-64bfbf97694f0c4e.js:2
afterAllSetup @ 781b197b-64bfbf97694f0c4e.js:2
u @ 610-0a2abd754b2af95b.js:1
\_setupIntegrations @ 610-0a2abd754b2af95b.js:487
init @ 610-0a2abd754b2af95b.js:487
(anonymous) @ 610-0a2abd754b2af95b.js:488
(anonymous) @ 610-0a2abd754b2af95b.js:488
tK @ 610-0a2abd754b2af95b.js:488
2053 @ main-app-1e48d9fe2f7c2240.js:1
r @ webpack-9f24e3949841785a.js:1
t @ main-app-1e48d9fe2f7c2240.js:1
(anonymous) @ main-app-1e48d9fe2f7c2240.js:1
r.O @ webpack-9f24e3949841785a.js:1
t @ webpack-9f24e3949841785a.js:1
(anonymous) @ 610-0a2abd754b2af95b.js:1
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
about:7 GET https://obwzzmbvkrcscqwptlqo.supabase.co/storage/v1/object/public/ciszu-cdn/projects/ciszu/content/logos/images/outline/tagline/tagline_white.svg 400 (Bad Request)
tagline_white.svg:1 GET https://obwzzmbvkrcscqwptlqo.supabase.co/storage/v1/object/public/ciszu-cdn/projects/ciszu/content/logos/images/outline/tagline/tagline_white.svg 400 (Bad Request)
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
at inpage.js:4:42708"

Ciszuko Antony Website:

- [ ] Las paginas de feedback y descargas no la veo en el header, colocalas.

Ciszubot Website:

- [ ] El tema de oscuridad debe ser el por defecto al inicio.
- [ ] Ciszubot es la unica web con un diseño un poco mas diferente en especial la gui y botones, deben ser mas parecidos al estilo de las demas 3 paginas o usar el mismo. Como el boton de seach y auth.
- [ ] En general el boton de idioma es incorrecto, debe usar el sistema que usa las demas 3 websites.
- [ ] Debes agregar el icono isotipo circular de ciszubot tambien el footer parecido a como esta en el header.
