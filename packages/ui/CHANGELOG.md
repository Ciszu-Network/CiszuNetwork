# Changelog

## [1.1.0](https://github.com/Ciszu-Network/CiszuNetwork/compare/ui-v1.0.0...ui-v1.1.0) (2026-10-17)


### Features

* **ciszubot:** pulido del dashboard (save dock, JSON por seccion, guard de salida, bot real, sidebar, disclaimers y modal de login) ([e2ec6d1](https://github.com/Ciszu-Network/CiszuNetwork/commit/e2ec6d145a32aaa9a2cf1a7002ec0ee1aa4cfe7d))
* **ui/ciszubot:** disclaimer critico rojo imponente para bot offline + razon por defecto mantenimiento; tags OFFLINE en rojo con punto live; guests en minuscula siempre y mini-aviso de modo invitado en ciszu/antony/muzicmania; quitar Enlaces utiles del resumen ([92811ee](https://github.com/Ciszu-Network/CiszuNetwork/commit/92811ee9e7cb1a518d664b0a329781bd82d51a7b))
* **webs:** recaptcha visible con refresh, preferencias del bot (plan/autosave/json), leaderboard privado y ajustes de dashboard ([07a5d47](https://github.com/Ciszu-Network/CiszuNetwork/commit/07a5d473bf6b9dae50d9b6d37cca0de8af3d1d6c))


### Bug Fixes

* **deps:** next 15.5.27 tambien en packages/ui (el caret ^15.5.25 mantenia 15.5.25 vulnerable en el lock) y eslint-config-next ^15.5.27 en las 4 webs - resuelve GHSA cache poisoning SSG/ISR (alerts 111/112) ([384d3d2](https://github.com/Ciszu-Network/CiszuNetwork/commit/384d3d2656553cd2e25718c7bf996d3997a9f179))
* **emails+ciszubot:** SMTP de Gmail (App Password) como transporte, plantilla Supabase con iconos y CZ-, logo antony sin estirar, gate Cloudflare off en ciszubot (cubria el FAB) + watchdog ([72f466c](https://github.com/Ciszu-Network/CiszuNetwork/commit/72f466c7299ff35426d3c8c307e5fd36160875be))
* **ui:** portal a body en modales de recordar-sesion y sanciones (el transform del navbar anclaba el fixed arriba); fix(ciszubot): icono GitHub real en hero (antes estrella) y links internos con Link en login (lint CI) ([19b39a8](https://github.com/Ciszu-Network/CiszuNetwork/commit/19b39a893987625f6f3a240b601330168d93f63a))
