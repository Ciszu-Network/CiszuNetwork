# Slash Commands — CiszuBot v3.2.0

Total: **72 comandos** (9 categorías)

## Configuración

### /setlang
- Cambia el idioma del bot en este servidor (es/en)
- Uso: `cz!setlang <es|en>`
- Aliases: `idioma`, `language`, `lang`
- Slash: `/setlang`

### /setprefix
- Cambia el prefijo del bot en este servidor
- Uso: `cz!setprefix <prefijo>`
- Aliases: `prefix`, `prefijo`
- Slash: `/setprefix`

### /setupautorole
- Asigna roles automáticos a nuevos miembros
- Uso: `cz!setupautorole <@rol|off>`
- Aliases: `autorole`
- Slash: `/setupautorole`

### /setupcounters
- Crea canales contador (members, online, bots, channels)
- Uso: `cz!setupcounters <members|online|bots|humans|channels|roles> <nombre-con-{n}>  |  off para limpiar`
- Aliases: `contadores`, `counters`
- Slash: `/setupcounters`

### /setupgoodbye
- Configura el canal y mensaje de despedidas
- Uso: `cz!setupgoodbye <#canal> [mensaje]`
- Aliases: `goodbye`, `despedidas`
- Slash: `/setupgoodbye`

### /setupleveling
- Activa/desactiva el sistema de niveles (on/off [canal])
- Uso: `cz!setupleveling <on|off> [#canal]`
- Aliases: `leveling`, `niveles`
- Slash: `/setupleveling`

### /setuplogs
- Configura el canal de logs del servidor
- Uso: `cz!setuplogs <#canal|off>`
- Aliases: `logs`, `logschannel`
- Slash: `/setuplogs`

### /setupprivate
- Activa canales privados por botón (on/off [categoría])
- Uso: `cz!setupprivate <on|off> [#canal-panel] [categoría]`
- Aliases: `privatechannels`, `canalesprivados`
- Slash: `/setupprivate`

### /setuptickets
- Configura el sistema de tickets (canal de soporte + categoría + rol)
- Uso: `cz!setuptickets <#canal> [categoría] [@rol]  |  off para desactivar`
- Aliases: `tickets`
- Slash: `/setuptickets`

### /setupwelcome
- Configura el canal y mensaje de bienvenidas
- Uso: `cz!setupwelcome <#canal> [mensaje]  |  variables: {user} {guild} {members}`
- Aliases: `welcome`, `bienvenidas`
- Slash: `/setupwelcome`

## Diversión

### /8ball
- Responde a tus preguntas con la sabiduría de la bola 8
- Uso: `cz!8ball <pregunta>`
- Aliases: `bola8`, `pregunta`, `oraculo`, `8b`, `magicball`
- Slash: `/8ball`

### /animal
- Muestra una foto aleatoria de un animal (cat, dog, fox, duck)
- Uso: `cz!animal <cat|dog|fox|duck>`
- Aliases: `gato`, `perro`, `zorro`, `pato`, `mascota`
- Slash: `/animal`

### /avatar
- Muestra el avatar de un usuario
- Uso: `cz!avatar [@usuario]`
- Aliases: `foto`, `pic`, `imagen`
- Slash: `/avatar`

### /confess
- Envía un mensaje anónimo y borra tu mensaje original
- Uso: `cz!confess <mensaje>`
- Aliases: `confesar`, `anonimo`, `secreto`, `c`, `confession`
- Slash: `/confess`

### /dice
- Lanza un dado (1-6)
- Uso: `cz!dice`
- Aliases: `dado`, `roll`
- Slash: `/dice`

### /directsay
- Hace que el bot repita tu mensaje directamente sin embed
- Uso: `cz!directsay <mensaje>`
- Aliases: `decirdirecto`, `deds`, `dsay`, `ds`, `repeatdirect`
- Slash: `/directsay`

### /rate
- Cuánto te quiere el bot (0-100%)
- Uso: `cz!rate [categoria]`
- Aliases: `cuan`
- Slash: `/rate`

### /rps
- Piedra, papel o tijeras contra el bot
- Uso: `cz!rps <piedra|papel|tijeras>`
- Aliases: `ppt`, `piedrapapelotijeras`
- Slash: `/rps`

### /say
- Hace que el bot repita tu mensaje en un embed
- Uso: `cz!say <mensaje>`
- Aliases: `decir`, `di`, `pronunciar`, `repetir`, `s`, `repeat`
- Slash: `/say`

### /snipe
- Recupera el último mensaje borrado del canal
- Uso: `cz!snipe`
- Aliases: `snipear`
- Slash: `/snipe`

### /text
- Convierte texto con estilos (reverse, uwu, clap, bubble)
- Uso: `cz!text <estilo> <texto>  |  estilos: reverse, uwu, clap, bubble`
- Aliases: `convertir`, `estilo`, `textoconvert`
- Slash: `/text`

## Economía

### /balance
- Muestra tu saldo (monedas y banco)
- Uso: `cz!balance [@usuario]`
- Aliases: `bal`, `saldo`, `coins`
- Slash: `/balance`

### /buy
- Compra un ítem de la tienda
- Uso: `cz!buy <nombre del ítem>`
- Aliases: `comprar`
- Slash: `/buy`

### /daily
- Reclama tu recompensa diaria
- Uso: `cz!daily`
- Aliases: `recompensa`, `día`
- Slash: `/daily`

### /deposit
- Guarda monedas en el banco
- Uso: `cz!deposit <cantidad|all>`
- Aliases: `depositar`, `bank`, `banco`
- Slash: `/deposit`

### /gamble
- Aposta monedas a cara o cruz
- Uso: `cz!gamble <cantidad>`
- Aliases: `apostar`, `coinflip`, `caraocruz`, `flip`
- Slash: `/gamble`

### /give
- Transfiere monedas a otro usuario
- Uso: `cz!give @usuario <cantidad>`
- Aliases: `pay`, `transfer`, `enviar`, `dar`
- Slash: `/give`

### /leaderboard
- Top 10 de monedas del servidor
- Uso: `cz!leaderboard`
- Aliases: `top`, `ranking`, `tabla`
- Slash: `/leaderboard`

### /shop
- Tienda del servidor con ítems por rol
- Uso: `cz!shop`
- Aliases: `tienda`, `store`
- Slash: `/shop`

### /slot
- Máquina tragaperras
- Uso: `cz!slot <cantidad>`
- Aliases: `slots`, `tragaperras`
- Slash: `/slot`

### /withdraw
- Retira monedas del banco
- Uso: `cz!withdraw <cantidad|all>`
- Aliases: `retirar`, `withdrawall`, `retiro`
- Slash: `/withdraw`

## Información

### /help
- Muestra información del bot y lista de comandos disponibles
- Uso: `cz!help [comando]`
- Aliases: `ayuda`, `comandos`, `botinfo`, `comando`, `commands`, `botayuda`, `botcomandos`, `bothelp`, `h`, `cmds`, `cmd`
- Slash: `/help`

### /links
- Muestra todos los enlaces oficiales del ecosistema
- Uso: `cz!links`
- Aliases: `enlaces`, `link`, `links`, `social`, `sociales`, `redes`
- Slash: `/links`

### /profile
- Muestra información detallada del usuario
- Uso: `cz!profile [@usuario]`
- Aliases: `perfil`, `usuario`, `info-usuario`, `userinfo`, `u`, `perfil-usuario`
- Slash: `/profile`

### /serverinfo
- Muestra información detallada del servidor
- Uso: `cz!serverinfo`
- Aliases: `servidor`, `infoserver`, `guild`, `server`, `guildinfo`
- Slash: `/serverinfo`

### /status
- Muestra el estado en vivo del bot y su web
- Uso: `cz!status`
- Aliases: `stats`, `estado`, `info`, `botinfo`, `uptime`
- Slash: `/status`

## Moderación

### /ban
- Banea a un miembro del servidor
- Uso: `cz!ban @usuario [razón]`
- Aliases: `banear`
- Slash: `/ban`

### /close
- Cierra el canal actual (tickets y canales gestionados)
- Uso: `cz!close`
- Aliases: `cerrarcanal`
- Slash: `/close`

### /kick
- Expulsa a un miembro del servidor
- Uso: `cz!kick @usuario [razón]`
- Aliases: `expulsar`
- Slash: `/kick`

### /mute
- Silencia a un miembro (por defecto 10 min)
- Uso: `cz!mute @usuario [minutos] [razón]`
- Aliases: `silenciar`, `timeout`
- Slash: `/mute`

### /purge
- Borra mensajes en masa (máx. 100)
- Uso: `cz!purge <cantidad>`
- Aliases: `clear`, `limpiar`, `prune`
- Slash: `/purge`

### /unban
- Desbanea a un usuario (ID)
- Uso: `cz!unban <id>`
- Aliases: `desbanear`
- Slash: `/unban`

### /unmute
- Quita el silencio a un miembro
- Uso: `cz!unmute @usuario`
- Aliases: `desmutear`, `untimeout`
- Slash: `/unmute`

### /warn
- Avisa (warn) a un miembro
- Uso: `cz!warn @usuario [razón]`
- Aliases: `advertir`
- Slash: `/warn`

### /warns
- Muestra los avisos de un miembro
- Uso: `cz!warns @usuario`
- Aliases: `avisos`
- Slash: `/warns`

## Música

### /loop
- Activa/desactiva el bucle de la cola
- Uso: `cz!loop`
- Aliases: `bucle`, `repeat`
- Slash: `/loop`

### /pause
- Pausa la reproducción
- Uso: `cz!pause`
- Aliases: `pausar`
- Slash: `/pause`

### /play
- Reproduce música de YouTube en un canal de voz
- Uso: `cz!play <canción o URL>`
- Aliases: `p`, `reproducir`, `music`
- Slash: `/play`

### /queue
- Muestra la cola de reproducción
- Uso: `cz!queue`
- Aliases: `cola`, `q`
- Slash: `/queue`

### /resume
- Reanuda la reproducción
- Uso: `cz!resume`
- Aliases: `reanudar`
- Slash: `/resume`

### /skip
- Salta la canción actual
- Uso: `cz!skip`
- Aliases: `next`, `siguiente`
- Slash: `/skip`

### /stop
- Detiene la música y sale del canal de voz
- Uso: `cz!stop`
- Aliases: `parar`, `leave`, `salir`
- Slash: `/stop`

## Niveles

### /rank
- Muestra tu nivel y XP
- Uso: `cz!rank [@usuario]`
- Aliases: `nivel`, `level`, `xp`
- Slash: `/rank`

### /topxp
- Top 10 de niveles del servidor
- Uso: `cz!topxp`
- Aliases: `toppniveles`, `rankingxp`
- Slash: `/topxp`

## Social

### /afk
- Márquese como AFK con una razón
- Uso: `cz!afk <razón>`
- Aliases: `ausente`
- Slash: `/afk`

### /alliance
- Forma una alianza con otro servidor
- Uso: `cz!alliance <invite del servidor>`
- Aliases: `alianza`
- Slash: `/alliance`

### /allies
- Muestra las alianzas del servidor
- Uso: `cz!allies`
- Aliases: `alianzas`
- Slash: `/allies`

### /bye
- Se despide del usuario con un mensaje amigable
- Uso: `cz!bye [@usuario]`
- Aliases: `adios`, `despedir`, `despedida`, `chao`, `hasta-luego`, `byebye`, `b`
- Slash: `/bye`

### /closeprivate
- Cierra tu canal privado
- Uso: `cz!closeprivate`
- Aliases: `cerrarprivado`
- Slash: `/closeprivate`

### /hi
- Saluda al usuario con un mensaje amigable
- Uso: `cz!hi [@usuario]`
- Aliases: `hola`, `saludar`, `saludo`, `hello`, `hey`, `hihi`, `h`
- Slash: `/hi`

## Utilidad

### /bump
- Bumpea y promociona el servidor en las listas de Discord
- Uso: `cz!bump`
- Aliases: `bumpear`, `promocionar`, `boost`, `topgg`
- Slash: `/bump`

### /donate
- Apoya el desarrollo del bot con una donación
- Uso: `cz!donate`
- Aliases: `donar`, `donación`, `donacion`, `apoyo`, `support`, `patreon`, `kofi`, `ko-fi`
- Slash: `/donate`

### /embed
- Crea un embed personalizado
- Uso: `cz!embed <título> | <descripción> | <color>`
- Aliases: `createembed`
- Slash: `/embed`

### /gend
- Fuerza el fin de un sorteo activo
- Uso: `cz!gend`
- Aliases: `gfinish`
- Slash: `/gend`

### /giveaway
- Crea un sorteo (recompensa: 🎉)
- Uso: `cz!giveaway <premio> | <ganadores> | <duración-min>`
- Aliases: `sorteo`, `gstart`
- Slash: `/giveaway`

### /invite
- Obtén el enlace de invitación del bot
- Uso: `cz!invite`
- Aliases: `invitar`, `añadir`, `add`, `agregar`, `invitacion`
- Slash: `/invite`

### /ping
- Muestra el ping del bot con "pong"
- Uso: `cz!ping`
- Aliases: `latencia`, `ms`, `pingpong`, `p`
- Slash: `/ping`

### /pong
- Muestra el ping del bot con "ping"
- Uso: `cz!pong`
- Aliases: `latencia2`, `ms2`, `pongping`, `p2`
- Slash: `/pong`

### /promo
- Promociona las webs del ecosistema Ciszu Network
- Uso: `cz!promo`
- Aliases: `promocionar`, `webs`, `sitio`, `web`, `promote`
- Slash: `/promo`

### /search
- Busca resultados en Google
- Uso: `cz!search <consulta>`
- Aliases: `google`, `buscar`, `g`
- Slash: `/search`

### /test
- Comando de prueba para verificar el funcionamiento del bot
- Uso: `cz!test`
- Aliases: `prueba`, `testear`, `verificar`, `t`, `check`
- Slash: `/test`

### /vote
- Vota por CiszuBot en las listas de bots
- Uso: `cz!vote`
- Aliases: `votar`, `voto`, `votación`, `votacion`, `vote`
- Slash: `/vote`

