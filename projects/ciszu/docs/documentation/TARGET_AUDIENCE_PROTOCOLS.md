# TARGET_AUDIENCE_PROTOCOLS — Público objetivo

Versión: 2.0.0
Actualización: 2026-08-13
Identificador: TARGET_AUDIENCE_PROTOCOLS_V2.0.0_2026_08_13_ciszunetwork

> **Definición**: público objetivo del ecosistema por producto (ago 2026): perfil general,
> audiencias por producto, perfiles de usuario, datos de uso y reglas de segmentación.

Definición del público al que apunta Ciszu Network por producto (ago 2026). Base para `BUSINESS_SYSTEM.md` y marketing en redes.

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
- **Niches** adicionales considerados: creadores de música (producción con IA), diseño gráfico (plantillas), desarrollo indie (tutoriales/Discord Lounge). Validar con datos antes de expandir (ver `BUSINESS_SYSTEM.md`).

## CTA por producto (guía de marketing)

| Producto | Audiencia principal | CTA principal |
|---|---|---|
| MuzicMania | Jugadores de ritmo | "Jugar gratis" (web/.exe) |
| CiszuBot | Admins de Discord | "Invitar a Discord" |
| CiszukoAntony | Clientes/colaboradores | "Colaborar / Contactar" |
| CiszuNetwork | Público general | "Explorar el ecosistema" |

## Reglas de tono y mensaje

1. **Idioma**: español primero (audiencia VE/Latam), webs bilingües para internacional.
2. **Sin costo percibido**: reforzar que el producto es free (evitar fricción de pago).
3. **Estética neon consistente** (cian/rosa) para reconocimiento de marca.
4. **Adaptar el CTA por canal**: TikTok/IG = gameplay; X/LinkedIn = marca/negocio.

## Cómo validar segmentación

1. Ver datos en PostHog (eventos, retención) y Web Analytics (páginas visitadas).
2. Revisar leaderboard/scores de MuzicMania (tracks más jugados).
3. Consultar votos top.gg/DBL (`ciszu.counters`).
4. Ajustar esta sección con hallazgos reales; no inventar perfiles.

## Personas detalladas (buyer personas)

### El jugador casual (edad 13–19)
- **Contexto**: smartphones + PC gamer de gama media; usa Discord y TikTok.
- **Objetivos**: jugar gratis, subir en el leaderboard, presumir logros.
- **Dolores**: falta de tarjeta para pagar, juegos que exigen descargas pesadas.
- **Mensaje clave**: "Jugar gratis, competir y compartir" (web y .exe de Tauri).

### El admin de servidor (edad 16–25)
- **Contexto**: administra uno o más servidores de Discord de habla hispana.
- **Objetivos**: automatizar moderación, dar economía/música/niveles a su comunidad.
- **Dolores**: bots que caen, configs complejas, comandos con permisos confusos.
- **Mensaje clave**: "Invita a Discord y dale vida a tu servidor" (72 comandos).

### El creador de contenido (edad 18–25)
- **Contexto**: hace música/arte/gameplay; activo en TikTok, IG y Discord.
- **Objetivos**: conseguir colaboraciones, validar su trabajo, monetizar.
- **Dolores**: poco reconocimiento, herramientas caras, falta de audiencia.
- **Mensaje clave**: "Portfolio, música y arte con identidad propia" (bilingüe).

### El fan de la marca (edad 13–25)
- **Contexto**: sigue el ecosistema completo (webs, redes, Discord).
- **Objetivos**: estar al día de novedades, consumir contenido, sentirse parte.
- **Dolores**: falta de consistencia visual o de novedades frecuentes.
- **Mensaje clave**: "Explora el ecosistema Ciszu" con estética neón consistente.

## Puntos de dolor y motivaciones por segmento

| Segmento | Motivación principal | Fricción a evitar |
|---|---|---|
| Jugador casual | Diversión y competencia | Pagos, descargas pesadas |
| Admin de servidor | Comunidad viva y automática | Configuración compleja, downtime |
| Creador de contenido | Reconocimiento y colaboración | Cerrarse al portfolio, poca presencia |
| Fan de la marca | Pertenencia y novedades | Contenido poco frecuente |

## Canales de contacto por audiencia

| Audiencia | Canales principales | Formato |
|---|---|---|
| Jugadores | TikTok, Instagram, Discord | Gameplay, clips, retos |
| Admins | Discord (foros), YouTube, X | Tutoriales, comparativas |
| Creadores | TikTok, IG, LinkedIn, X | Proceso creativo, portfolio |
| Fans | Todas las redes + web | Novedades, detrás de cámaras |

## Mensajes por canal (ampliación)

- **TikTok/IG**: clips cortos de gameplay de MuzicMania, fragmentos de música y
  arte del portfolio; gancho visual neon.
- **X**: anuncios de producto, lanzamientos, estado del ecosistema; tono directo.
- **YouTube**: tutoriales del bot, gameplay extendido, proceso de creación.
- **LinkedIn**: para colaboradores y reclutadores del portfolio; tono profesional.
- **Discord**: comunidad, soporte, novedades; el bot como herramienta de
  participación.

## Segmentación geográfica y etaria (resumen)

| Dimensión | Perfil principal | Perfil secundario |
|---|---|---|
| Edad | 15–22 | 23–25 / 13–14 |
| Región | Venezuela + Latam | España / internacional |
| Idioma | Español | Inglés (webs bilingües) |
| Dispositivo | Smartphone + PC gamer medio | PC medio/bajo, móvil |

## Ciclo de vida del usuario

1. **Descubrimiento**: llega por redes, amigos o voto top.gg/DBL.
2. **Primera experiencia**: juega MuzicMania o instala el bot en su servidor.
3. **Engagement**: sube en el leaderboard, configura el bot, consume contenido.
4. **Retención**: vuelve por novedades, música nueva y comunidad (Discord).
5. **Defensa**: recomienda, vota, dona (NOWPayments) o colabora.

El objetivo del marketing es empujar de forma natural hacia los pasos 3–5 (ver
`BUSINESS_SYSTEM.md` y `PAYMENTS_SYSTEM.md`).

## Métodos de investigación de audiencia

1. **Analítica**: PostHog (eventos, retención) y Cloudflare Web Analytics para
   ver qué se consume y desde dónde (ver `ANALYTICS_SYSTEM.md`).
2. **Comunidad**: preguntar en Discord; el feedback de usuarios reales vale más
   que las suposiciones.
3. **Datos del producto**: leaderboard/scores de MuzicMania (tracks más jugados),
   uso de comandos del bot (`ciszu.counters`, `ciszubot.bot_status`).
4. **Encuestas breves**: 3–5 preguntas tras una acción (fin de partida, invitación
   del bot) con incentivo de recompensas del bot.
5. **Entrevistas**: 5–10 usuarios de cada perfil para profundizar dolores y
   motivaciones antes de expandir a nichos nuevos.

## Objeciones y manejo de fricción

- **"¿Es gratis?"** → reforzar que sí y que no requiere tarjeta (pago crypto/P2P
  solo si aplica, ver `PAYMENTS_SYSTEM.md`).
- **"Mi servidor es pequeño"** → el bot funciona bien en servidores de cualquier
  tamaño; enfatizar facilidad de configuración.
- **"No sé jugar juegos de ritmo"** → onboarding simple: empezar en dificultad
  baja y aprender jugando.
- **"No confío en bots"** → mostrar transparencia (estado en vivo, política de
  datos) y comunidad activa.

## Oportunidades futuras (pendientes de validar)

Nichos que requieren datos antes de expandir (ver "Reglas de segmentación" y
`BUSINESS_SYSTEM.md`): creadores de música con IA, diseñadores gráficos buscando
plantillas y desarrolladores indie (tutoriales/Lounge). Para cada uno, validar
con métricas reales y feedback antes de invertir tiempo de marketing.

## Métricas clave por audiencia

| Audiencia | Métrica de éxito | Canal de medición |
|---|---|---|
| Jugador casual | Partidas jugadas, retención, leaderboard | PostHog + tabla `scores` |
| Admin de servidor | Invitaciones/dl del bot, comandos usados | `ciszu.counters`, `ciszubot.bot_status` |
| Creador de contenido | Contactos/colaboraciones, vistas del portfolio | Web Analytics + correo |
| Fan de la marca | Seguidores, visitas a la web principal, donaciones | Redes + `PAYMENTS_SYSTEM.md` |

Revisar mensualmente con `ANALYTICS_SYSTEM.md`: si una métrica no se mueve, ajustar
mensaje o canal antes de invertir más tiempo.

## Glosario de términos de audiencia

- **Audiencia objetivo**: grupo al que se dirige un producto/CTA.
- **Persona**: perfil ficticio basado en datos que resume un segmento.
- **Segmentación**: división de la audiencia por edad, geografía, idioma, etc.
- **Ciclo de vida / funnel**: etapas de descubrimiento a defensa mencionadas arriba.
- **CTA**: llamado a la acción (jugar, invitar, colaborar, explorar).
- **Nicho**: subconjunto más específico (creadores de música IA, diseñadores, devs
  indie) a validar antes de expandir (ver `BUSINESS_SYSTEM.md`).

## Preguntas frecuentes (FAQ)

**¿Cómo priorizo audiencias si el equipo es una persona?**
Por alcance y coste: jugadores y admins de Discord son el núcleo hoy; creadores y
fans se trabajan con contenido reutilizable desde el mismo portfolio y las webs.

**¿Qué hago si los datos contradicen los perfiles?**
Los perfiles son hipótesis: la regla es "no inventar perfiles". Ajustar las
personas con datos reales (PostHog, Web Analytics, feedback de la comunidad) y
registrar los cambios en este doc.

**¿Cómo llego a audiencias internacionales sin presupuesto?**
Con contenido bilingüe y orgánico (TikTok/IG reutilizan el mismo material) y las
webs en inglés; el alcance internacional crece de la comunidad de habla hispana
hacia el mercado global.

**¿Debo crear audiencias para cada nicho nuevo?**
Solo si hay datos que lo justifiquen (ver "Reglas de segmentación" y
`BUSINESS_SYSTEM.md`). Validar antes de invertir tiempo de marketing.

_Última revisión: 13 ago 2026._ Relacionado: `BUSINESS_SYSTEM.md`, `ANALYTICS_SYSTEM.md`,
`ONLINE_SERVICES_SYSTEM.md`, `CONTACTS_PROTOCOLS.md`.