# Changelog

## [1.1.0](https://github.com/Ciszu-Network/CiszuNetwork/compare/ui-v1.0.0...ui-v1.1.0) (2026-10-03)


### Features

* **analytics:** usar GTM de verdad (GA4+AdSense via contenedor) + User-ID en las 4 webs ([961cb07](https://github.com/Ciszu-Network/CiszuNetwork/commit/961cb07e9f869ff8097352f69875366c8f3a9ffd))
* **auth:** configuracion de cuenta compartida en las 4 webs (paridad) ([5119509](https://github.com/Ciszu-Network/CiszuNetwork/commit/5119509954a0e27e37ebf05db4276f361f6b1109))
* **auth:** Danger Zone (eliminacion 15 dias) - APIs en las 4 webs + piloto ciszubot ([c421f3f](https://github.com/Ciszu-Network/CiszuNetwork/commit/c421f3f5dfbc9ec0ce85e153877043344e780a04))
* **auth:** migrar reCAPTCHA a Enterprise (assessments) en las 4 webs ([90c7fb4](https://github.com/Ciszu-Network/CiszuNetwork/commit/90c7fb42ce5b192decfbf36dd22c3c832c708419))
* **auth:** modal "recordar sesion" + persistencia por website ([d36b813](https://github.com/Ciszu-Network/CiszuNetwork/commit/d36b813f72b1d9406ac0b9ad80d7c0cb608a2c33))
* **auth:** verificacion obligatoria C-XXX XXX en el registro de ciszubot ([58bcd59](https://github.com/Ciszu-Network/CiszuNetwork/commit/58bcd5975e1729671ed0d70e92d3b58148e7e6c2))
* **home:** rediseno con perfil real (chips, datos personales, roles, skills con logos, aspiraciones, intereses, herramientas) + nuevos iconos ([f718b4c](https://github.com/Ciszu-Network/CiszuNetwork/commit/f718b4c1d7bb8da3a7c0d9d8d335b4c04941e94e))
* **moderacion:** vista de staff en la web (ban/mute/reviews/bio) en las 4 webs ([bd6f08e](https://github.com/Ciszu-Network/CiszuNetwork/commit/bd6f08e7f0a35ffda237619c9be06b8b90bed00f))
* **paginas:** unifica paginas institucionales estilo MuzicMania en 3 webs ([64599a8](https://github.com/Ciszu-Network/CiszuNetwork/commit/64599a84f9d2083c88a6d70b536e9d12145be16e))
* **perfiles:** tags de rol/STAFF, estado (eliminada/baneada) y anonimizacion visible ([726186a](https://github.com/Ciszu-Network/CiszuNetwork/commit/726186a79552210555f2d78ae63b9cac00077670))
* **portfolio:** datos reales y search/filtros en ciszukoantony + boton CTA en banners + changelogs + fix Supabase ([e6f39b8](https://github.com/Ciszu-Network/CiszuNetwork/commit/e6f39b8c6ab440c64015b883bd00fe9ee6ac2ab9))
* **privacidad+seguridad:** visibility de perfil (public/friends/private) y ban por IP ([7eaef88](https://github.com/Ciszu-Network/CiszuNetwork/commit/7eaef882bb1fcd300ca7ebdb1e87c23ba7e47454))
* **projects:** paginas de proyectos completas en ciszu y ciszukoantony (buscador, filtros, sliders, cards con isotipos, svg portfolio) ([33afb8c](https://github.com/Ciszu-Network/CiszuNetwork/commit/33afb8ca63abb95b9a4b973d9db53053cbbcf309))
* **seguridad+docs:** fastify 5.12.5, badge reCAPTCHA visible y reporte Google Cloud ([34d52e8](https://github.com/Ciszu-Network/CiszuNetwork/commit/34d52e8bd06492c585138a05c29a3970ed72476a))
* **seguridad:** cierre remoto de sesiones + modal de sanciones (ban/mute) ([0fac938](https://github.com/Ciszu-Network/CiszuNetwork/commit/0fac9383f6bae7ea739bbc4caf3df1b37b4befb6))
* **seguridad:** step-up real, deteccion de anomalias y alertas (reporte aplicado) ([58813ff](https://github.com/Ciszu-Network/CiszuNetwork/commit/58813ffef989edd6756c5eb350bdcb927ef6a9f7))
* **webs:** curriculum de Antony, landing de invite y comandos con color en Ciszubot ([eda4909](https://github.com/Ciszu-Network/CiszuNetwork/commit/eda490921746d440111bf59d5b920117f3c87cb5))
* **webs:** license 404, information nivel MuzicMania, help/faq con buscador, 404 glitch, team y docs ([f83cef6](https://github.com/Ciszu-Network/CiszuNetwork/commit/f83cef6687abdec71e560e2829013d8e5a8e5f28))


### Bug Fixes

* **antiadblock:** detecta bloqueadores de red y filtros cosméticos tardíos ([9538de4](https://github.com/Ciszu-Network/CiszuNetwork/commit/9538de45722ed7a421f4dcc4ba5d026a1e0d1db9))
* **consola+donaciones:** 401 disclaimer, 404 leaderboard, CSP ads y Ko-fi real ([cdd8e0b](https://github.com/Ciszu-Network/CiszuNetwork/commit/cdd8e0b51b38528313536b0da8b0ae9ebd458d47))
* **consola:** limpia errores de consola en las 4 webs ([242c274](https://github.com/Ciszu-Network/CiszuNetwork/commit/242c274554da4208a5463502074a82a5f0349228))
* **recaptcha:** revierte la pildora + salvavidas de 5s en v3 (diagnostico ciszunetwork) ([061dcbb](https://github.com/Ciszu-Network/CiszuNetwork/commit/061dcbb4a60e171854fc19e56f10e76475f01999))
* **ui:** salvavidas de 10s en RecaptchaGate Enterprise (margen a challenge interactivo) ([6e71e01](https://github.com/Ciszu-Network/CiszuNetwork/commit/6e71e0159d06f693f56ae48f74dcdfd1820ddd53))
* **ui:** stacking del RecaptchaGate bajo el layout y etiqueta sin capturar clicks ([50f77a6](https://github.com/Ciszu-Network/CiszuNetwork/commit/50f77a604922be65a6b9017b6f0cc17f4429a796))
* **webs:** license 404 real, easter eggs 404, fondo muzicmania, icono FAQ y recordatorio legal ([505227b](https://github.com/Ciszu-Network/CiszuNetwork/commit/505227be24e5d376857ec1c52ca2a22d789fa516))


### Performance Improvements

* **fase1:** quick wins de consumo Vercel (sin cambios visuales) ([5dce96e](https://github.com/Ciszu-Network/CiszuNetwork/commit/5dce96e82a3a0cc3c8d6e64fd5d470e89d6d9774))
