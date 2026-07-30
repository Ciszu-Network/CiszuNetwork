# 🛡️ Protocolos de Seguridad para Agentes IA (Ciszu Network)

Este documento establece las reglas estrictas que **cualquier agente de IA** debe seguir al desarrollar en el monorepo de Ciszu Network.

## 1. Prevención de Alucinaciones de Dependencias (Supply Chain)
- NUNCA ejecutar `npm install`, `pnpm install` o `yarn add` con librerías no confirmadas.
- Proponer la librería y **esperar aprobación humana** antes de instalar.
- El proyecto usa **pnpm** con `ignore-scripts=true` para evitar ejecución de malware.

## 2. Protección de Secretos y `.env`
- NUNCA imprimir el contenido completo de `.env` o `.env.local` en logs, resúmenes o artefactos.
- Referirse a variables de entorno genéricamente (ej. "Añade tu SUPABASE_SERVICE_ROLE_KEY al .env").
- `.env` siempre en `.gitignore`.
- Llaves públicas (`NEXT_PUBLIC_`) solo contienen claves anónimas, nunca tokens de administrador.

## 3. Prevención de Inyección de Código (XSS)
- Prohibido usar `dangerouslySetInnerHTML` para renderizar datos dinámicos.
- Prohibido manipular el DOM con `.innerHTML`, `.outerHTML`, `eval()`.
- Usar renderizado nativo de React (escapa y sanitiza automáticamente).

## 4. Seguridad de Base de Datos (Supabase RLS & RPC)
- El Frontend NUNCA debe modificar tablas sensibles directamente desde el cliente.
- Usar **Supabase RPC (Postgres Functions)** para operaciones críticas.
- Todas las tablas deben tener **RLS (Row Level Security)** habilitado.

## 5. Archivos Sensibles
- `PRIVATE_DOCS.md` contiene credenciales — NO ELIMINAR de `.gitignore`.
- `*.env`, `*service-role-key*`, `*secret*` no deben trackearse en git.