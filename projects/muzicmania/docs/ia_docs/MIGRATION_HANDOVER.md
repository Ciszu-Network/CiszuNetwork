# 🚀 Guía de Handover y Migración para el Siguiente Agente IA

Este documento ha sido redactado por el agente Antigravity para asegurar una transición impecable hacia cualquier otro entorno de desarrollo (como Cline, Roo Code, Windsurf, Cursor, etc.) y su respectivo agente de Inteligencia Artificial.

---

## 📌 Datos Generales del Proyecto

* **Nombre del Proyecto:** MuzicMania 2.0 (Next.js Edition)
* **Creador y Propietario:** Ciszuko Antony (Francisco Garcia)
* **Directorio de Trabajo Local:** `E:\Ciszu Network\ciszu_proyects\muzic mania`
* **Stack Tecnológico:**
  * **Frontend:** Next.js 15.5.18 (App Router), TypeScript, Tailwind CSS v4
  * **Base de Datos & Backend:** Supabase (CLI instalada localmente)
  * **Distribución de Escritorio:** Tauri 2.0 (Rust backend + WebView2 en Windows)
  * **Gestor de Paquetes:** `pnpm` (obligatorio para evitar exploits/vulnerabilidades de scripts npm)

---

## ⚙️ Estado de Entrega (Junio 2026)

El agente Antigravity deja el proyecto en un estado **estable, compilando y con integración nativa funcional**:

1. **Despliegue de GitHub Actions en Verde (CI/CD Pasado):**
   * Se solucionaron los fallos de TypeScript de la compilación de GitHub Actions.
   * Se eliminó el uso de `lucide-react` en `download/page.tsx` para evitar que el caché de npm de GitHub Actions fallara por versiones viejas. Se reemplazaron por SVGs inline puros.
   * Se solucionó el error de tipado del objeto `window` con la variable inyectada de Tauri en `src/lib/isTauri.ts` utilizando el operador `'__TAURI_INTERNALS__' in window`.
2. **Compilación de Ejecutables Tauri Exitosa:**
   * La compilación en local de la app de escritorio funciona al 100% mediante `pnpm tauri build`.
   * Los instaladores oficiales de Windows están listos en:
     * **Instalador Completo (.exe):** `E:\Ciszu Network\ciszu_proyects\muzic mania\src-tauri\target\release\bundle\nsis\MuzicMania_2.0.0_x64-setup.exe`
     * **Instalador MSI:** `E:\Ciszu Network\ciszu_proyects\muzic mania\src-tauri\target\release\bundle\msi\MuzicMania_2.0.0_x64_en-US.msi`
3. **UX Condicional Integrada (Web vs Escritorio):**
   * **CookiesBanner:** En el ejecutable de Tauri, las cookies se aceptan automáticamente sin mostrar el banner molesto.
   * **Navbar & Landing Page:** Se oculta el botón y apartado de descargas si el usuario ya está usando la app de escritorio (Tauri).
   * **Pantalla Completa:** Configurado `"fullscreen": true` en `tauri.conf.json` por defecto.

---

## 📂 Directorio de Documentación IA

Todos los lineamientos del creador, notas de arquitectura y registros históricos se encuentran en:
📂 `supabase/ia/ia_docs/`

Documentos clave en esa carpeta:
* [ACCOUNTS_IA.md](file:///E:/Ciszu%20Network/ciszu_proyects/muzic%20mania/supabase/ia/ia_docs/ACCOUNTS_IA.md) — Gestión de cuentas, tokens y modelos activos.
* [TO_DOO.md](file:///E:/Ciszu%20Network/ciszu_proyects/muzic%20mania/supabase/ia/ia_docs/TO_DOO.md) — La lista de tareas pendientes priorizadas por el desarrollador.
* [PROJECT_STATE.md](file:///E:/Ciszu%20Network/ciszu_proyects/muzic%20mania/supabase/ia/ia_docs/PROJECT_STATE.md) — Registro minucioso del estado del código y sus componentes.
* [AGENT_INSTRUCTIONS.md](file:///E:/Ciszu%20Network/ciszu_proyects/muzic%20mania/supabase/ia/ia_docs/AGENT_INSTRUCTIONS.md) — Reglas críticas de seguridad, estilo de código y atribución de derechos intelectuales de Ciszuko Antony.

---

## 🎯 Próximas Tareas Inmediatas (para el Nuevo Agente)

Para continuar con el desarrollo, el nuevo agente debe priorizar la siguiente tarea de [TO_DOO.md](file:///E:/Ciszu%20Network/ciszu_proyects/muzic%20mania/supabase/ia/ia_docs/TO_DOO.md):

1. **Terminar el sistema de Registro y Login con Supabase:**
   * Sincronizar perfiles con nombre a mostrar (display name) y nombre de usuario único (username).
   * Asegurar que no se creen cuentas sin procedimiento de registro o con fallos de verificación de email.
   * Resolver cuentas de prueba bugeadas.
2. **Expandir la página de Perfil:**
   * Añadir banner, biografía, fotos de perfil, país de origen e idioma.
3. **Optimización del Gameplay:**
   * Pulir el rendimiento del Canvas en `/play` y compatibilidad con pantallas táctiles (móviles).

---

## ⚡ Comandos Útiles de Mantenimiento

* **Verificar Compilación y TS en Local (Esencial antes de hacer Push):**
  ```bash
  pnpm run verify
  ```
* **Lanzar Entorno de Desarrollo Web:**
  ```bash
  pnpm run dev
  ```
* **Lanzar Entorno de Desarrollo Tauri (Escritorio):**
  ```bash
  pnpm tauri dev
  ```
* **Compilar Ejecutables de Windows:**
  ```bash
  pnpm tauri build
  ```

---

*Nota para el nuevo agente:* Por favor lee y respeta el archivo [AGENT_INSTRUCTIONS.md](file:///E:/Ciszu%20Network/ciszu_proyects/muzic%20mania/supabase/ia/ia_docs/AGENT_INSTRUCTIONS.md). El único autor legítimo de todo el código de este proyecto es **Ciszuko Antony**. ¡Mucho éxito en el desarrollo!
