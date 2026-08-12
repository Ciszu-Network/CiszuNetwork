# Widgets compartidos de Ciszu Network

Carpeta central para todos los widgets HTML/embeds usados en las webs del ecosistema
(ciszubot, ciszunetwork, ciszukoantony) y en el bot de Discord.

## Widgets disponibles

| Archivo | Descripción | Uso |
|---|---|---|
| `topgg-bot.html` | Widget de CiszuBot en Top.gg (`/api/widget/<id>.svg`) | `<img>` o HTML |
| `topgg-server.html` | Widget grande del servidor Ciszu Gamens (`/api/v1/widgets/large/<id>`) | `<img>` o HTML |
| `kofi-floating.html` | Overlay flotante de Ko-fi (ciszukoantony) | script en `<body>` |
| `kofi-iframe.html` | Iframe de Ko-fi embebido (alto 712px) | `<iframe>` |
| `kofi-button.html` | Botón clásico de Ko-fi (widget B0B81NQ9M4) | script en `<body>` |
| `links.md` | URLs canónicas de bot lists, servidores y donaciones | documentación |
| `trustpilot-review-collector.html` | TrustBox Review Collector de ciszunetwork (Business Unit `6a7be8be...`) | script + `<div>` TrustBox |
| `nowpayments-donation-button.html` | Botón de donación cripto NOWPayments (cuenta ciszunetwork) | `<a>` + `<img>` oficial |
| `nowpayments-donation-widget.html` | Widget iframe de donación NOWPayments (346×623) | `<iframe>` |
| `nowpayments-donation-page.html` | Enlaces a página de donación + POS Terminal NOWPayments | `<a>` |

## URLs canónicas (para copiar/pegar)

### CiszuBot (1395532235872141312)
- Top.gg bot: https://top.gg/bot/1395532235872141312
- Top.gg bot (votar): https://top.gg/bot/1395532235872141312/vote
- Discord Bot List: https://discordbotlist.com/bots/ciszubot

### Servidores
- Top.gg server (Ciszu Gamens): https://top.gg/es/discord/servers/871620279188504576
- Discord Bot List server (Ciszu Gamens): https://discordbotlist.com/servers/ciszugamens
- Disboard (Ciszu Gamens): https://disboard.org/es/server/1215544133142450187

### Donaciones (ciszukoantony)
- Buy Me a Coffee: https://buymeacoffee.com/ciszukoantony
- Patreon: https://www.patreon.com/cw/ciszukoantony
- Ko-fi: https://ko-fi.com/ciszukoantony

### Reseñas / reputación (ciszunetwork)
- Trustpilot (perfil): https://www.trustpilot.com/review/ciszunetwork.vercel.app
- Business Unit ID: `6a7be8beb27b048803166c8f` (TrustBox)

### Donaciones / pagos crypto (NOWPayments — ciszunetwork)
- Página de donación: https://nowpayments.io/donation/ciszunetwork
- POS Terminal: https://nowpayments.io/pos-terminal/ciszunetwork
- Botón/widget embeds: usan la API pública `739f2096-6c64-40d6-a2a1-635784185dfb` (ver archivos `nowpayments-*.html`)
- API key + IPN secret (server-side): en vault `services/supabase/.env` (`NOWPAYMENTS_*`)

## Notas

- Los widgets de Top.gg se sirven vía `https://top.gg/api/...` — no requieren token.
- Ko-fi requiere los scripts oficiales de `storage.ko-fi.com`.
- Trustpilot (TrustBox) requiere el script bootstrap v5 (`widget.trustpilot.com/bootstrap/v5/tp.widget.bootstrap.min.js`) cargado **una sola vez por página** antes del `<div class="trustpilot-widget">`. El widget muestra reseñas del Business Unit `6a7be8beb27b048803166c8f`.
- NOWPayments: el botón/widget embeds usan la **clave pública** (`739f2096-...`). La `NOWPAYMENTS_API_KEY` e IPN secret son server-side (vault) y NUNCA van en embeds del cliente.
- ⚠️ **CSP**: al integrar TrustBox o el widget iframe de NOWPayments en una web hay que ampliar `buildCsp()` (packages/utils/src/csp.ts): `script-src` + `widget.trustpilot.com` para TrustBox, y `frame-src` + `https://nowpayments.io` + `img-src` para los embeds de NOWPayments. Los enlaces `<a>` externos no necesitan CSP.
- Cualquier widget nuevo del ecosistema debe guardarse aquí para reutilizarlo.
