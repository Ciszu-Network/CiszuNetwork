# TARGET_AUDIENCE — Público objetivo

Definición del público al que apunta Ciszu Network por producto (ago 2026). Base para `BUSINESS_STRATEGY.md` y marketing en redes.

## Perfil general

- **Edad**: 13–25 años (tendencia joven), con pico en 15–22 (jugadores y creadores).
- **Idioma**: español mayoritario (VE, Latam) + inglés (internacional, webs bilingües).
- **Geografía**: Venezuela/Latinoamérica; Comunidades de habla hispana en Discord/Telegram.
- **Postura**: usuarios de smartphones + PC gamer de gama media, acostumbrados a servicios free con layout moderno; sensibles al costo (sin tarjetas internacionales → pago crypto/P2P o gratis).

## Por producto

| Producto | Audiencia |
| -------- | --------- |
| **MuzicMania** | Gamers/jugadores de ritmo; fans de música propia; usuarios Windows (instalador .exe Tauri) + web. |
| **CiszuBot** | Admins y miembros de servidores de Discord (comunidades de habla hispana); 72 comandos (diversión, economía, música, niveles, moderación). |
| **CiszukoAntony** (portfolio) | Clientes/colaboradores potenciales (diseño, arte, música), fans de la marca, reclutadores; contenido bilingüe. |
| **CiszuNetwork** (web principal) | Marca/ecosistema: público general interesado en el universo Ciszu; enlace central a todos los productos. |

## Perfiles de usuario típicos

1. **El jugador casual** — juega MuzicMania en web o .exe, compite en leaderboard, vota en top.gg/DBL por recompensas del bot.
2. **El admin de servidor** — usa CiszuBot en su Discord: config (prefix, idioma, autoroles), tickets, economía, música.
3. **El creador/contenido** — sigue el portfolio de Ciszuko, consume el arte/música, interactúa por TikTok/IG/Discord.
4. **El fan de la marca** — sigue todas las redes del ecosistema; expectativa de estética neón consistente.

## Datos de uso actuales (para refinar)

- Analítica: PostHog 1M eventos/mes free (comenzó ago 2026); Cloudflare Web Analytics en todas las webs (sin números históricos aún — ver `STATISTICS.md`).
- Monitor UptimeRobot: 5 endpoints UP.
- Leaderboard de MuzicMania: tabla `scores` con récord global (scores por `track_id`).

## Reglas de segmentación

- El contenido y los CTA deben adaptarse por producto (juego → "jugar gratis"; bot → "invitar a Discord"; portfolio → "colaborar").
- **Niches** adicionales considerados: creadores de música (producción con IA), diseño gráfico (plantillas), desarrollo indie (tutoriales/Discord Lounge). Validar con datos antes de expandir (ver `BUSINESS_STRATEGY.md`).

_Última revisión: 11 ago 2026._