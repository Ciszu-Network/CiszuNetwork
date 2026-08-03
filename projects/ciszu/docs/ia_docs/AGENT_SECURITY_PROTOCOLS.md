# 🛡️ Protocolos de Seguridad para Agentes IA (Ciszu Network)

Este documento establece las reglas estrictas que **cualquier agente de IA** debe seguir al desarrollar en el monorepo de Ciszu Network.

## 0. Filosofía DevSecOps y Shift-Left
- La seguridad se integra **desde el inicio** de cada tarea, no al final (DevSecOps).
- Toda vulnerabilidad se detecta lo antes posible (Shift-Left): en el editor, en el pre-commit, en el CI — nunca descubrirla en producción.
- Marco de referencia global: OWASP Top 10, NIST SP 800-218 (SSDF), ISO/IEC 27001, CVE/CWE.
- Documento maestro: `docs/ia_docs/DEVSECOPS.md` (herramientas SAST/DAST, auditorías, métricas).

## 1. Prevención de Alucinaciones de Dependencias (Supply Chain)
- NUNCA ejecutar `npm install`, `pnpm install` o `yarn add` con librerías no confirmadas.
- Proponer la librería y **esperar aprobación humana** antes de instalar.
- El proyecto usa **pnpm** con `ignore-scripts=true` para evitar ejecución de malware.
- Verificar auditorías: `pnpm audit --prod`, `cargo audit`, `trivy` antes de introducir dependencias nuevas.

## 2. Protección de Secretos y `.env`
- NUNCA imprimir el contenido completo de `.env` o `.env.local` en logs, resúmenes o artefactos.
- Referirse a variables de entorno genéricamente (ej. "Añade tu SUPABASE_SERVICE_ROLE_KEY al .env").
- `.env` siempre en `.gitignore`.
- Llaves públicas (`NEXT_PUBLIC_`) solo contienen claves anónimas, nunca tokens de administrador.

## 3. Prevención de Inyección de Código (XSS)
- Prohibido usar `dangerouslySetInnerHTML` para renderizar datos dinámicos.
- Prohibido manipular el DOM con `.innerHTML`, `.outerHTML`, `eval()`.
- Usar renderizado nativo de React (escapa y sanitiza automáticamente).
- Si `dangerouslySetInnerHTML` es estrictamente necesario (ej. `packages/ui/src/Icon.tsx`), sanitizar SIEMPRE con `DOMPurify.sanitize()`.
- Verificar con semgrep (`p/security-audit`) tras cualquier cambio de renderizado.

## 4. Seguridad de Base de Datos (Supabase RLS & RPC)
- El Frontend NUNCA debe modificar tablas sensibles directamente desde el cliente.
- Usar **Supabase RPC (Postgres Functions)** para operaciones críticas.
- Todas las tablas deben tener **RLS (Row Level Security)** habilitado.
- Policies separadas por comando (SELECT/INSERT/UPDATE/DELETE), nunca `FOR ALL`.
- `auth.uid()`/`auth.role()`/`auth.jwt()` SIEMPRE envueltas en `(SELECT auth.X())` (evita advisor `auth_rls_initplan`).
- Preferir funciones SECURITY INVOKER sobre SECURITY DEFINER; usar `search_path` explícito.
- Tras cambios en policies/funciones, verificar Security + Performance Advisors en Dashboard.

## 5. Archivos Sensibles
- `PRIVATE_DOCS.md` contiene credenciales — NO ELIMINAR de `.gitignore`.
- `*.env`, `*service-role-key*`, `*secret*` no deben trackearse en git.
- NUNCA imprimir valores de `.env` o tokens en logs, resúmenes o artefactos; referirse genéricamente.
- Si un secreto se filtra: rotarlo inmediatamente y registrarlo en `Temp\opencode\tokens_a_rotar.md`.

## 6. Pruebas Dinámicas (DAST)
- Antes de declarar "sin vulnerabilidades", correr **OWASP ZAP** (spider + active scan) sobre las webs desplegadas.
- Procedimiento documentado en `DEVSECOPS.md` (daemon + API REST).