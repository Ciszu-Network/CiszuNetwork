# CiszuBot — Slash Commands (JSON para listas de bots)

Formato: Discord API standard (application command payloads).
Válido para:
- **Top.gg** → "Import from Discord" (acepta slash command payloads)
- **Discord Bot List** → `POST https://discordbotlist.com/api/v1/bots/1395532235872141312/commands` con header `Authorization: <tu-token-discordbotlist>` y este JSON en el body.

Archivo canónico: `apps/ciszubot/discord-bot/commands.json` (mismo contenido).

```json
[
  {
    "name": "8ball",
    "description": "Responde a tus preguntas con la sabiduría de la bola 8",
    "type": 1,
    "options": [
      {
        "name": "pregunta",
        "description": "La pregunta que quieres hacerle a la bola 8",
        "type": 3,
        "required": true
      }
    ]
  },
  {
    "name": "bump",
    "description": "Bumpea y promociona el servidor en las listas de Discord",
    "type": 1
  },
  {
    "name": "bye",
    "description": "Se despide del usuario con un mensaje amigable",
    "type": 1,
    "options": [
      {
        "name": "usuario",
        "description": "El usuario al que quieres despedir (opcional)",
        "type": 6,
        "required": false
      }
    ]
  },
  {
    "name": "confess",
    "description": "Envía un mensaje anónimo y borra tu mensaje original",
    "type": 1,
    "options": [
      {
        "name": "mensaje",
        "description": "El mensaje que quieres confesar anónimamente",
        "type": 3,
        "required": true
      }
    ]
  },
  {
    "name": "directsay",
    "description": "Hace que el bot repita tu mensaje directamente sin embed",
    "type": 1,
    "options": [
      {
        "name": "mensaje",
        "description": "El mensaje que quieres que repita el bot",
        "type": 3,
        "required": true
      }
    ]
  },
  {
    "name": "donate",
    "description": "Apoya el desarrollo del bot con una donación",
    "type": 1
  },
  {
    "name": "help",
    "description": "Muestra información del bot y lista de comandos disponibles",
    "type": 1,
    "options": [
      {
        "name": "comando",
        "description": "Nombre del comando para obtener información detallada",
        "type": 3,
        "required": false
      }
    ]
  },
  {
    "name": "hi",
    "description": "Saluda al usuario con un mensaje amigable",
    "type": 1,
    "options": [
      {
        "name": "usuario",
        "description": "El usuario al que quieres saludar (opcional)",
        "type": 6,
        "required": false
      }
    ]
  },
  {
    "name": "invite",
    "description": "Obtén el enlace de invitación del bot",
    "type": 1
  },
  {
    "name": "links",
    "description": "Muestra todos los enlaces oficiales del ecosistema",
    "type": 1
  },
  {
    "name": "ping",
    "description": "Muestra el ping del bot con \"pong\"",
    "type": 1
  },
  {
    "name": "pong",
    "description": "Muestra el ping del bot con \"ping\"",
    "type": 1
  },
  {
    "name": "profile",
    "description": "Muestra información detallada del usuario",
    "type": 1,
    "options": [
      {
        "name": "usuario",
        "description": "El usuario del que quieres obtener información (opcional)",
        "type": 6,
        "required": false
      }
    ]
  },
  {
    "name": "promo",
    "description": "Promociona las webs del ecosistema Ciszu Network",
    "type": 1
  },
  {
    "name": "say",
    "description": "Hace que el bot repita tu mensaje en un embed",
    "type": 1,
    "options": [
      {
        "name": "mensaje",
        "description": "El mensaje que quieres que repita el bot",
        "type": 3,
        "required": true
      }
    ]
  },
  {
    "name": "serverinfo",
    "description": "Muestra información detallada del servidor",
    "type": 1
  },
  {
    "name": "status",
    "description": "Muestra el estado en vivo del bot y su web",
    "type": 1
  },
  {
    "name": "test",
    "description": "Comando de prueba para verificar el funcionamiento del bot",
    "type": 1
  },
  {
    "name": "vote",
    "description": "Vota por CiszuBot en las listas de bots",
    "type": 1
  }
]
```
