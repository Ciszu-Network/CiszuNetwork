<<<<<<< HEAD
# CiszuBot v2.5.5 - Bot de Discord en Español

## Descripción General

CiszuBot es un bot de Discord en español, desarrollado con Node.js y Discord.js v14+. Ofrece comandos por prefijo (`cz!`), por mención, alias, respuestas enriquecidas con embeds, manejo avanzado de errores y un panel web privado con estadísticas en tiempo real.

## Características Principales

- Prefijo: `cz!` y mención directa al bot
- Comandos con alias y estructura modular
- Respuestas en embeds con colores azul y morado (aleatorio en hi/bye)
- Panel web Express con estadísticas del bot y comandos
- Manejo de errores con mensajes claros y visuales
- Logging avanzado en archivos y consola
- Sistema de plantillas para crear nuevos comandos fácilmente
- Actualización automática de estadísticas y uptime
- Comandos con colores personalizables

## Cambios Recientes (21 de agosto de 2025)

- Actualización a Discord.js v14.11.0
- Actualización de dependencias y configuración del proyecto
- Creación de package.json para gestión de dependencias
- Embeds de comandos principales ahora usan azul o morado
- Comandos hi y bye mantienen color aleatorio
- Eliminación de archivos y código duplicado
- Mejoras en el manejo de errores y mensajes
- Integración total de bot y servidor web
- Panel web con diseño moderno y estadísticas en vivo
- Traducción y comentarios en español en todo el código
- Eliminación de app.js (solo index.js y server.js como principales)
- Mejor documentación y estructura de carpetas

## Cambios en la versión 2.5.5 (21 de agosto de 2025)

- Creación del comando `hi` para saludar a los usuarios con mensajes variados y color aleatorio
- Creación del comando `directsay` para repetir mensajes sin embed
- Creación del comando `bye` para despedirse de los usuarios con mensajes variados y color aleatorio
- Modificación del archivo `.env` para añadir tokens, IDs e información importante del bot
- Modificación del archivo `bot-config.json` para añadir más configuraciones del bot
- Verificación de que todos los comandos tienen el color del embed en azul o morado, excepto los que tienen color random
- Añadido más aliases a todos los comandos para facilitar su uso
- Añadidas más respuestas variadas para comandos como `8ball`, `hi` y `bye`
- Integración de los nuevos comandos con el sistema de slash commands

## Arquitectura y Componentes

- **index.js**: Punto de entrada principal, inicializa el bot, carga comandos, gestiona eventos y conecta con Express
- **server.js**: Servidor Express, panel web y API para estadísticas
- **Commands/**: Carpeta modular con todos los comandos del bot
- **bot-config.json**: Configuración centralizada del bot
- **logger.js**: Sistema de logging multinivel en archivos y consola
- **.env**: Variables sensibles como el token del bot

## Flujo de Uso

1. El usuario envía un mensaje con `cz!comando` o menciona al bot
2. El bot detecta el comando y busca en la colección
3. Si el comando existe, ejecuta y responde con embed
4. Si el comando no existe, responde con embed de error
5. Todas las acciones se registran en logs
6. El panel web muestra estadísticas y comandos en tiempo real

## Dependencias

- **discord.js**: ^14.11.0
- **dotenv**: ^16.3.1
- **express**: ^4.18.2

## Despliegue y Configuración

- Variables de entorno en `.env` (ejemplo: BOT_TOKEN)
- Logs automáticos en carpeta `/logs`
- Configuración editable en `bot-config.json`
- Panel web accesible en `http://localhost:5000`

## Escalabilidad y Mantenimiento

- Arquitectura modular para agregar comandos fácilmente
- Configuración centralizada y editable
- Manejo de errores robusto y mensajes amigables
- Logging completo para monitoreo y depuración

## Créditos y Autoría

Desarrollado por Ciszuko
Documentación y soporte en español
=======
a
>>>>>>> ab66951638b53765424ec27750dc849a19ea7333
