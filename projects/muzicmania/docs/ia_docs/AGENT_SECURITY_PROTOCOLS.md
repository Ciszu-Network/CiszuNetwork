# 🛡️ Protocolos de Seguridad para Agentes IA (Vibe Coding)

Este documento establece las reglas estrictas que **cualquier agente de IA** (Antigravity, Claude, Gemini, etc.) debe seguir al desarrollar en MuzicMania, con el fin de evitar vulnerabilidades críticas derivadas de la generación de código autónoma.

## 1. Prevención de Alucinaciones de Dependencias (Supply Chain)
- **Regla Estricta**: El Agente NUNCA debe ejecutar `npm install`, `pnpm install` o `yarn add` con librerías que no estén confirmadas como oficiales y seguras por el ecosistema.
- Si el usuario solicita una funcionalidad nueva (ej. "añade una librería para confeti"), el Agente debe proponer la librería (ej. `canvas-confetti`), verificar su existencia y **esperar la aprobación del humano (Human-in-the-loop)** antes de instalarla.
- El proyecto utiliza **pnpm** con `ignore-scripts=true` (bloqueado) por defecto para evitar ejecución de malware en `postinstall`.

## 2. Protección de Secretos y `.env`
- **Regla Estricta**: El Agente NUNCA debe imprimir el contenido completo del archivo `.env` o `.env.local` en los logs del chat, en los resúmenes, o en los artefactos de la memoria.
- Al modificar variables de entorno, referirse a ellas genéricamente (ej. "Añade tu SUPABASE_SERVICE_ROLE_KEY al .env").
- El archivo `.env` siempre debe estar en `.gitignore` (actualmente verificado como seguro).
- Las llaves públicas (`NEXT_PUBLIC_`) solo deben contener claves anónimas, nunca tokens de administrador (ej. `service_role`).

## 3. Prevención de Inyección de Código Frontend (XSS)
El Frontend de MuzicMania está construido para ser compilado en un ejecutable de escritorio (Tauri) y como webapp. Cualquier vulnerabilidad web expone el sistema del usuario. Para prevenir los 3 tipos de XSS (Almacenado, Reflejado, y Basado en DOM):
- **Regla Estricta (XSS Almacenado/Reflejado)**: Prohibido usar `dangerouslySetInnerHTML` en cualquier componente para renderizar datos dinámicos (Nombres, Bios, Parámetros de URL, Búsquedas).
- **Regla Estricta (XSS Basado en DOM)**: Prohibido manipular el DOM directamente usando APIs como `.innerHTML`, `.outerHTML` o asignar rutas/parámetros directamente a `eval()` o `setTimeout`.
- Confiar *exclusivamente* en el renderizado nativo de React (`<div>{user.bio}</div>` o `<div>{searchParams.query}</div>`), el cual escapa y sanitiza los scripts maliciosos convirtiéndolos en texto plano automáticamente.
- **Resultado del Audit Actual**: Se ha escaneado la base de código (`dangerouslySetInnerHTML` e `innerHTML`) y se certifica que MuzicMania está **100% libre** de estas vulnerabilidades estructurales en el Frontend actual.

## 4. Seguridad de Base de Datos (Supabase RLS & RPC)
- **Regla Estricta**: El Frontend NUNCA debe realizar modificaciones directas (`.insert()`, `.update()`, `.delete()`) a tablas sensibles como `scores` o `profiles` (ej. incrementar puntaje, dar experiencia, actualizar nivel) directamente desde el cliente usando la clave anónima.
- Todo cálculo crítico de puntaje, niveles o monedas de juego debe procesarse en el Backend a través de **Supabase RPC (Postgres Functions)**, permitiendo que la base de datos valide lógicamente la petición y calcule los resultados en un entorno cerrado.
- Todas las tablas deben tener **RLS (Row Level Security)** habilitado y políticas estrictas de `auth.uid() = user_id`.

---
*Documento generado por Antigravity para salvaguardar el entorno de trabajo.*
