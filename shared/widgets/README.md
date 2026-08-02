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

## Notas

- Los widgets de Top.gg se sirven vía `https://top.gg/api/...` — no requieren token.
- Ko-fi requiere los scripts oficiales de `storage.ko-fi.com`.
- Cualquier widget nuevo del ecosistema debe guardarse aquí para reutilizarlo.
