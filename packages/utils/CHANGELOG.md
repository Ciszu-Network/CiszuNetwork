# Changelog

## [1.1.0](https://github.com/Ciszu-Network/CiszuNetwork/compare/utils-v1.0.0...utils-v1.1.0) (2026-10-31)


### Features

* **ciszubot:** rss de noticias, estilos de encuestas e i18n ([6f7c770](https://github.com/Ciszu-Network/CiszuNetwork/commit/6f7c770372a752d12b9dc70b3faee572d85b7d09))
* **contacto:** unificar formularios y tickets de soporte en las cuatro webs ([16fe117](https://github.com/Ciszu-Network/CiszuNetwork/commit/16fe1171400f8a7acb514c77c104057e62ecf651))
* **emails:** deteccion del limite diario de Gmail SMTP (550 5.4.5) con mensaje accionable y flag dailyLimit; doc actualizada ([1188e66](https://github.com/Ciszu-Network/CiszuNetwork/commit/1188e667f7a8abe5148505a7e4016d438a439bcb))
* **emails:** usuario recibe 'Email en mantenimiento' generico (sin detalle tecnico) + aviso global automatico via advisor kind=error (dedupe 24h) al detectar el cupo diario ([2c57a7f](https://github.com/Ciszu-Network/CiszuNetwork/commit/2c57a7f509c697b12e0232a20240d7636e402ba9))
* **premium:** planes, facturacion, terminos y fixes de seguridad ([7eb83ce](https://github.com/Ciszu-Network/CiszuNetwork/commit/7eb83ce5c78115eccb04b6b0204f3a95e3623c5f))


### Bug Fixes

* **analytics:** CSP con googletagmanager en img-src (aviso de seguridad de GTM) + UPD con el formato oficial de Measurement Protocol (user_data en raiz como array) - payload validado; conversiones GA4 +1 (generate_lead) ([2712edb](https://github.com/Ciszu-Network/CiszuNetwork/commit/2712edbd6a8a571b799e32e804d52e2fae323c40))
* **csp:** origenes de la guia oficial GTM+CSP - modo vista previa (tagmanager.google.com en script-src-elem y style-src, fonts.googleapis.com, ssl.gstatic.com, fonts.gstatic.com), GA con Ads (*.g.doubleclick.net y *.google.com en img/connect) y extras Ads/Floodlight (ade.googlesyndication.com, adservice.google.com) - paridad en las 4 webs ([0912d9c](https://github.com/Ciszu-Network/CiszuNetwork/commit/0912d9c7ee345cc98c32c496e5b942214db6e359))
* **csp:** permite el conversion tracking de Google Ads - googleads.g.doubleclick.net + www.googleadservices.com en script-src, ad.doubleclick.net (ccm/s/collect) en connect-src e img-src ([cfa2eff](https://github.com/Ciszu-Network/CiszuNetwork/commit/cfa2effe10249a038a71561ecf2fbf33851c4d56))
* **csp:** script-src-elem explicito espejando script-src para la auditoria de seguridad de GTM/Google Ads (recursos de etiqueta de conversion googleads.g.doubleclick.net + connect ad.doubleclick.net) - paridad en las 4 webs ([8b7aefc](https://github.com/Ciszu-Network/CiszuNetwork/commit/8b7aefc23f4296bdd8361d54292d4963ce709340))
* **deps:** cierra vulnerabilidades SCA en zod, undici, body-parser y happy-dom ([fcb59bc](https://github.com/Ciszu-Network/CiszuNetwork/commit/fcb59bcc1c8ecefca9c135f43e9fb1d5e0dc7548))
