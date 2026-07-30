# 🤖 Instrucciones y Protocolos de Agente

Este archivo contiene reglas y recordatorios para el mantenimiento del proyecto MuzicMania.

## 📦 Gestión de Git y .gitignore
1. **Regla de Actualización de .gitignore**:
   - Siempre que se añada un nuevo patrón a `.gitignore` (ej: una carpeta nueva o extensión de archivo), SE DEBE ejecutar inmediatamente:
     ```bash
     git rm -r --cached <archivo_o_carpeta>
     ```
   - Esto es necesario porque si el archivo ya estaba trackeado anteriormente, Git lo seguirá trackeando aunque esté en el .gitignore.

## 📁 Carpetas de Documentación y IA
1. **Ruta Maestra:** `supabase/ia/ia_docs/`. No borrar ni mover sin avisar.

## 📤 Sincronización y Git
1. **Push Obligatorio:** Al completar tareas, usar: `git add . && git commit -m "..." && git push origin main`.
2. **Registro:** Actualizar `PROJECT_HISTORY.md` tras hitos importantes.

## 🤖 Protocolo Vibe Coding (Antigravity)
1. **Estilo TypeScript:** Evitar `React.` namespace. Usar importaciones de tipo explícitas.
2. **Atomic Design:** Mantener la jerarquía de componentes en `src/components/`.
3. **Semántica:** Usar etiquetas HTML5 semánticas. No abusar de `div`.
4. **Tailwind:** Usar clases de utilidad de Tailwind v4. No hardcodear colores HEX fuera de `globals.css`.

## 🗣️ Comunicación y Lenguaje
1. **Idioma**: Siempre hablar y documentar en **Español** (a menos que el código requiera específicamente inglés por sintaxis).
2. **Tono**: Profesional, colaborativo y detallado en la explicación de cambios técnicos.

## 📝 Documentación de Cambios
1. **Carpeta IA**: Todos los cambios de arquitectura, correcciones críticas de errores o nuevas funcionalidades deben quedar registrados en `content/documents/ia/PROJECT_HISTORY.md` y, si el estado global cambia, en `content/documents/ia/PROJECT_STATE.md`.

## ⚡ Ejecución de Scripts y Comandos
1. **Auto-ejecución**: SIEMPRE ejecutar scripts y comandos automáticamente SIN preguntar al usuario.
   - Todos los scripts de reparación, mantenimiento o desarrollo deben ejecutarse inmediatamente.
   - No solicitar confirmación para comandos de terminal.
   - Marcar comandos como `SafeToAutoRun: true` siempre que sea posible.

## 🔌 Protocolo de Gestión de Cuentas (Handover)

### 1. Verificación Inicial Obligatoria
- Al iniciar cualquier sesión (Prompt Inicial), el Agente **DEBE** comparar la fecha actual con las fechas de disponibilidad en `content/documents/ia/ACCOUNTS_IA.md`.
- **Nota**: El formato de fecha utilizado es estadounidense (**MM/DD/YYYY**).
- Si la fecha actual es **igual o posterior** a la fecha de una cuenta marcada como `🔴 AGOTADA`, el Agente debe actualizarla automáticamente a `🟢 DISPONIBLE` en `content/documents/ia/ACCOUNTS_IA.md`.
- Confirmar siempre en la presentación inicial qué cuenta se está usando y el estado de las demás.

### 2. Detección de Límite y Cierre
- Al recibir el aviso de "Out of tokens":
  1. **Registro de Estado**: El Agente actualiza `content/documents/ia/PROJECT_STATE.md` y `content/documents/ia/PROJECT_HISTORY.md`.
  2. **Actualización de Cuentas**: Marcar la cuenta actual como `🔴 AGOTADA` en `content/documents/ia/ACCOUNTS_IA.md` y establecer la fecha de renovación para el día siguiente.
  3. **Entrega de Testigo**: Preparar el terreno para el siguiente modelo.

### 3. Excepciones de Ciclo
- **Inicio de Ciclo**: Si es la primera sesión del día o no hay registro previo de cuenta agotada hoy, marcar en el contexto como "Ninguna (Inicio)".
- **Agotamiento Crítico**: Si todas las cuentas registradas están agotadas, informar al Usuario y detener la ejecución hasta el reset diario.

### 4. Gestión de Tokens y Modelos
- **Responsabilidad del Usuario**: El cambio entre modelos (Gemini Pro, Flash, Claude) dentro de una misma cuenta y el control de sus tokens específicos es gestionado **manualmente** por Ciszuko Antony.
- El Agente no intenta predecir tokens individuales por modelo, solo el estado general de "disponibilidad" de la cuenta de Google.

## 📁 Carpetas de Scripts Internos (ocultas de GitHub):
   - `debug/debug_scripts/` - Scripts de reparación y mantenimiento.
   - Estas carpetas NO deben aparecer en el repositorio público.

## 🎨 Gestión de Activos e Iconos (Sistema de Sprites)
1. **Protocolo de Iconos SVG**:
   - Todo nuevo icono descargado de fuentes externas (Remix, Tabler, etc.) DEBE guardarse en `content/icons/svg-src/[tipo]/[nombre].svg`.
   - Después de añadir un icono, SIEMPRE ejecutar: `npm run generate-icons`.
   - Se deben usar los sprites generados en `content/icons/sprites/` mediante la etiqueta `<use>`.
   - Consulte `content/documents/ia/ICON_SYSTEM.md` para más detalles técnicos.

## 🛡️ Identidad y Propiedad
1. **Atribución de Desarrollo**:
   > [!IMPORTANT]
   > NUNCA atribuir el desarrollo del proyecto a IAs (Antigravity, Gemini, etc.) en las páginas públicas ni en el código.
   - El único y legítimo creador es **Ciszuko Antony** (Francisco Garcia).
   - Cualquier cambio, mejora o arquitectura debe presentarse como obra de Ciszuko Antony.

2. **Datos Personales**: Siempre usar los datos reales proporcionados por el usuario para contacto:
   - **Ubicación**: Caracas, Venezuela.
   - **Email**: fplayersoffcial@gmail.com
   - **Teléfono**: 04126858111
