# 🤖 Instrucciones y Protocolos de Agente — Ciszu Network

Este archivo contiene reglas y recordatorios para el mantenimiento del monorepo Ciszu Network.

## 📦 Gestión de Git y .gitignore
1. **Regla de Actualización de .gitignore**: Siempre que se añada un nuevo patrón a `.gitignore`, ejecutar inmediatamente:
   ```bash
   git rm -r --cached <archivo_o_carpeta>
   ```
2. **Push**: `git add . && git commit -m "..." && git push origin main`
3. No commitear sin solicitud explícita del usuario.

## 📁 Estructura de Documentación
- **ia_docs**: Documentación para IA en `docs/ia_docs/` de cada proyecto.
- **txt → md → docx → pdf**: Pipeline de formatos de documentación.
- **AGENTS.md**: Reglas globales en la raíz del monorepo.

## 🗣️ Comunicación y Lenguaje
1. **Idioma**: Hablar y documentar en **Español**.
2. **Tono**: Profesional, directo, sin introducciones ni cortesías.
3. **No preguntes** — solo informa si necesitas algo o hay un bloqueo.

## 🛡️ Identidad y Propiedad
1. **Atribución**: NUNCA atribuir el desarrollo del proyecto a IAs en páginas públicas ni en código.
2. **Único creador legítimo**: **Ciszuko Antony** (Francisco Garcia).
3. **Datos de contacto**: Caracas, Venezuela. ciszunetwork@outlook.com

## 📝 Documentación de Cambios
1. Todos los cambios de arquitectura, correcciones críticas o nuevas funcionalidades deben registrarse en `PROJECT_HISTORY.md`.
2. Si el estado global cambia, actualizar `STATUS.md` y `PROJECT_STATE.md`.

## ⚡ Ejecución de Scripts y Comandos
1. **Auto-ejecución**: Ejecutar scripts y comandos automáticamente SIN preguntar.
2. Marcar comandos como seguros siempre que sea posible.

## 🔄 Protocolo de Handover
1. Al iniciar sesión, leer `INITIAL_PROMPT.md`, `STATUS.md`, `TO_DO_LIST.md`.
2. Al cerrar sesión: actualizar `PROJECT_HISTORY.md`, `PROJECT_STATE.md`, `STATUS.md`.
3. Dejar instrucciones claras para el siguiente agente en `MIGRATION_HANDOVER.md`.

## 🎨 Estilo de Código
1. **TypeScript estricto** en todos los proyectos.
2. **Tailwind CSS** — Usar clases de utilidad. No hardcodear colores HEX fuera de `globals.css`.
3. **Semántica HTML5** — No abusar de `div`.
4. **Atomic Design** en componentes React.

## 📁 Carpetas Ignoradas en Git
- `scripts/` de cada proyecto (scripts internos de build/reparación)
- Archivos `.env`, `.env.local`
- `node_modules/`, `.next/`