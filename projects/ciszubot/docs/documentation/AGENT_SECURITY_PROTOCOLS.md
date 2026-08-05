# 🛡️ Protocolos de Seguridad para Agentes IA — CiszuBot

## 1. Protección del Token del Bot
- El token de Discord del bot NUNCA debe imprimirse en logs, chats o artefactos.
- El token se almacena en `.env` (en `.gitignore`).
- Referirse como "el token del bot" sin revelar su valor.

## 2. Seguridad de Comandos
- Los comandos del bot deben validar permisos antes de ejecutarse.
- Usar sistema de roles de Discord para restringir comandos administrativos.
- NUNCA ejecutar comandos que requieran privilegios sin verificar permisos.

## 3. Protección de Datos de Usuarios
- No almacenar información sensible de usuarios sin su consentimiento.
- Los datos de usuarios en Discord (IDs, mensajes) solo deben usarse para funcionalidad del bot.

## 4. Rate Limiting
- Respetar los rate limits de la API de Discord.
- Implementar colas para comandos que puedan exceder límites.