# Changelog

## [1.1.0](https://github.com/Ciszu-Network/CiszuNetwork/compare/utils-v1.0.0...utils-v1.1.0) (2026-10-24)


### Features

* **emails:** deteccion del limite diario de Gmail SMTP (550 5.4.5) con mensaje accionable y flag dailyLimit; doc actualizada ([1188e66](https://github.com/Ciszu-Network/CiszuNetwork/commit/1188e667f7a8abe5148505a7e4016d438a439bcb))
* **emails:** usuario recibe 'Email en mantenimiento' generico (sin detalle tecnico) + aviso global automatico via advisor kind=error (dedupe 24h) al detectar el cupo diario ([2c57a7f](https://github.com/Ciszu-Network/CiszuNetwork/commit/2c57a7f509c697b12e0232a20240d7636e402ba9))


### Bug Fixes

* **analytics:** CSP con googletagmanager en img-src (aviso de seguridad de GTM) + UPD con el formato oficial de Measurement Protocol (user_data en raiz como array) - payload validado; conversiones GA4 +1 (generate_lead) ([2712edb](https://github.com/Ciszu-Network/CiszuNetwork/commit/2712edbd6a8a571b799e32e804d52e2fae323c40))
* **csp:** origenes de la guia oficial GTM+CSP - modo vista previa (tagmanager.google.com en script-src-elem y style-src, fonts.googleapis.com, ssl.gstatic.com, fonts.gstatic.com), GA con Ads (*.g.doubleclick.net y *.google.com en img/connect) y extras Ads/Floodlight (ade.googlesyndication.com, adservice.google.com) - paridad en las 4 webs ([0912d9c](https://github.com/Ciszu-Network/CiszuNetwork/commit/0912d9c7ee345cc98c32c496e5b942214db6e359))
* **csp:** permite el conversion tracking de Google Ads - googleads.g.doubleclick.net + www.googleadservices.com en script-src, ad.doubleclick.net (ccm/s/collect) en connect-src e img-src ([cfa2eff](https://github.com/Ciszu-Network/CiszuNetwork/commit/cfa2effe10249a038a71561ecf2fbf33851c4d56))
* **csp:** script-src-elem explicito espejando script-src para la auditoria de seguridad de GTM/Google Ads (recursos de etiqueta de conversion googleads.g.doubleclick.net + connect ad.doubleclick.net) - paridad en las 4 webs ([8b7aefc](https://github.com/Ciszu-Network/CiszuNetwork/commit/8b7aefc23f4296bdd8361d54292d4963ce709340))
* **deps:** cierra vulnerabilidades SCA en zod, undici, body-parser y happy-dom ([fcb59bc](https://github.com/Ciszu-Network/CiszuNetwork/commit/fcb59bcc1c8ecefca9c135f43e9fb1d5e0dc7548))
* **emails+ciszubot:** SMTP de Gmail (App Password) como transporte, plantilla Supabase con iconos y CZ-, logo antony sin estirar, gate Cloudflare off en ciszubot (cubria el FAB) + watchdog ([72f466c](https://github.com/Ciszu-Network/CiszuNetwork/commit/72f466c7299ff35426d3c8c307e5fd36160875be))
* **emails:** assets PNG a URLs https del CDN (Gmail bloquea data URIs y no renderiza SVG) ([c5fa0ab](https://github.com/Ciszu-Network/CiszuNetwork/commit/c5fa0ab2e3dbcf7ca09714fa0776409fbc8d48fb))
* **emails:** fondo solido en cabecera/boton (Gmail quita gradientes), codigo Token y redes en plantilla Supabase ([61ea561](https://github.com/Ciszu-Network/CiszuNetwork/commit/61ea5619391c088610f187d6f20be62139f5620c))
* **otp+ciszubot:** clave CZ-XXXXXX copiable sin boton roto, intentos que no consumen la clave, FAB de feedback y copy multi-idioma ([8252736](https://github.com/Ciszu-Network/CiszuNetwork/commit/8252736584e0bee4b3b375bebf76db94e1bcb8cd))
