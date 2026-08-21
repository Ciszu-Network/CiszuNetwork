# MODELS_LLM_SYSTEM — Sistema e Historial de Modelos LLM (Ciszu Network)

Versión: 1.0.0
Actualización: 2026-08-21
Identificador: MODELS_LLM_SYSTEM_V1.0.0_2026_08_21_ciszunetwork

> **Definición**: Documento histórico, comparativo y técnico que registra el uso de Modelos de
> Lenguaje (LLMs) en el ecosistema de Ciszu Network, detallando su evolución, motivos de cambio,
> justificaciones de transición y configuraciones gratuitas.

---

## 1. Propósito y Filosofía del Sistema

Este documento recopila de manera objetiva la trayectoria de los modelos de inteligencia artificial utilizados para asistir en el desarrollo de Ciszu Network. La premisa fundamental y no negociable del ecosistema es la autoría única:

- **Autoría Legítima**: Francisco García (alias **Ciszuko Antony**) es el único creador, CEO, arquitecto de software y diseñador de cada sistema del ecosistema.
- **Herramientas de Ejecución**: Las IAs (agentes, LLMs, extensiones) actúan exclusivamente como herramientas avanzadas de ejecución, refactorización y agilización de código bajo la dirección directa de Ciszuko Antony.
- **Importancia de la Historia**: Registrar la historia de los modelos permite a las nuevas instancias de agentes (como este) entender que no fueron los primeros en tocar el código. Esto previene alucinaciones sobre la autoría, sitúa al agente en la línea temporal correcta del monorepo y le permite comprender las decisiones de diseño tomadas bajo paradigmas de modelos anteriores.

---

## 2. Cronología de Modelos en el Ecosistema

El desarrollo del monorepo ha transitado por cinco etapas principales en cuanto al uso de asistentes de IA, buscando siempre la máxima eficiencia y el aprovechamiento de recursos gratuitos.

### 2.1 Época 1: Inicios con Gemini (Fase Experimental)
En los primeros compases del proyecto, se utilizaron interfaces web de Google Gemini para consultas conceptuales, brainstorming de arquitectura y maquetación de componentes aislados. Fue un uso informal pero determinante para vislumbrar el potencial de la IA en la aceleración del desarrollo.

### 2.2 Época 2: GitHub Copilot Nativo (VSCode)
Con la consolidación del monorepo pnpm, se integró GitHub Copilot como la herramienta principal de autocompletado en caliente dentro de VSCode.
- **Ventajas**: Excelente integración en el editor, rapidez en autocompletado de líneas individuales.
- **Limitaciones**: Dificultad para mantener el contexto global del monorepo, respuestas de chat genéricas y nula capacidad para interactuar de forma autónoma con el sistema de archivos o la consola del desarrollador.

### 2.3 Época 3: Antigravity
Se experimentó con Antigravity como un puente de automatización. Esta fase sirvió de transición para entender que los flujos de trabajo en un monorepo complejo exigen un agente TUI/CLI dedicado que pueda ejecutar comandos de compilación, linter y tests de forma nativa.

### 2.4 Época 4: OpenCode con DeepSeek Coder V4 (Free Tier)
Se implementó OpenCode como la interfaz CLI/TUI personalizada para el ecosistema, utilizando inicialmente la API de DeepSeek Coder (específicamente la versión V4 o derivadas de código) provista de forma gratuita por plataformas de terceros.
- **Rendimiento**: DeepSeek demostró una asombrosa precisión en sintaxis de código puro, lógica algorítmica y coincidencia con estructuras existentes.
- **Causa del fin de época**: Las APIs gratuitas de terceros sufrieron inestabilidades severas, límites drásticos de cuotas (Rate Limits) y finalmente la eliminación/suspensión del modelo DeepSeek Coder debido a los altos costos de infraestructura de dichos proveedores de pruebas.

### 2.5 Época 5: Retorno a Google con Google AI Studio (Gemini 3.5/1.5 Flash)
La desaparición del acceso gratuito a DeepSeek obligó a buscar una alternativa sumamente robusta, rápida y con una cuota de uso sin coste sostenible. Ciszuko Antony tomó la decisión de generar un token personal en Google AI Studio para vincularlo directamente con OpenCode.
- **Setup Actual**: Se utiliza **Gemini 3.5 Flash** (según el identificador del motor) o **Gemini 1.5 Flash**, operando mediante la API Key personal en el entorno local. Esto proporciona un canal directo y libre de intermediarios inestables.

---

## 3. Comparativa Técnica de Modelos Evaluados

| Parámetro | DeepSeek Coder (Free API) | GitHub Copilot Nativo | Gemini Flash (AI Studio) | Nemotron (NVIDIA) |
|---|---|---|---|---|
| **Proveedor de API** | Plataformas de terceros (inestables) | Suscripción / GitHub Free | Google AI Studio Directo | NVIDIA Research |
| **Estabilidad** | Baja (caídas frecuentes, saturación) | Alta | Muy Alta (canal oficial de Google) | Media-Alta (depende de host/local) |
| **Ventana de Contexto** | 8k - 128k (truncado en gratis) | Limitado por interfaz de chat | **1 Millón de Tokens** (oficial) | Variable (normalmente 4k-32k) |
| **Velocidad de Respuesta** | Media-Baja (bajo colas públicas) | Alta | **Extremadamente Alta** | Rápida (optimizada para inferencia) |
| **Tool Calling (Agente)** | Limitado o emulado | No expuesto al CLI | Excelente (nativo y preciso) | Bueno (soporte creciente) |
| **Costo para Ciszuko** | Gratis (inestable) | Suscripción opcional | **Completamente Gratis** (dentro de cuota) | Gratis (local) / API Pay-per-use |
| **Límites de Cuota (Free)** | Variable / Suspendido | Restringido por chat | 15 RPM / 1 millón de tokens por min | Sin límites locales; API tiene cuotas |

---

## 4. Justificación de la Decisión Actual

La transición decidida por Ciszuko Antony de conectar su propio token de Google AI Studio a OpenCode es, técnicamente, la **mejor decisión estratégica** para la continuidad del ecosistema por las siguientes razones:

### 4.1 La Ventana de Contexto Gigante
Los modelos como DeepSeek Coder en servicios gratuitos suelen sufrir de truncado de contexto severo (a menudo limitado a 4,000 u 8,000 tokens). En un monorepo con 4 webs Next.js, múltiples paquetes compartidos y un sistema de documentación masivo (62 documentos de más de 200 líneas cada uno), un contexto limitado ciega al agente.
Gemini Flash posee una ventana nativa de **1 millón de tokens**. Esto permite cargar de golpe el `AGENTS.md`, múltiples archivos `.tsx`, el esquema de base de datos y la documentación del área de trabajo sin perder memoria de las instrucciones ni alucinar.

### 4.2 Estabilidad y Control de la API Key
Al usar un token personal directamente de Google AI Studio, Ciszuko elimina intermediarios. No depende de que una plataforma de terceros mantenga sus servidores encendidos o limite el modelo de desarrollo. Google AI Studio ofrece un nivel de servicio industrial de forma gratuita para desarrolladores, con un límite generoso de 15 solicitudes por minuto (RPM), lo cual es más que suficiente para una sesión de desarrollo humano-agente interactiva.

### 4.3 Razonamiento de Agente (Tool Calling)
Los modelos de Google de la serie Flash han sido optimizados específicamente para el uso de herramientas (Function Calling). Para un entorno como OpenCode, que depende de ejecutar búsquedas de archivos (`glob`), búsquedas de texto (`grep`), lecturas, ediciones de precisión e invocaciones de consola (`bash`), un modelo con excelente Tool Calling es infinitamente superior a un modelo que solo sabe completar texto pero falla al formatear los argumentos de las herramientas.

---

## 5. Integración en la Configuración de OpenCode

Para asegurar la correcta operación bajo este nuevo esquema de modelos de Google, el sistema lee y aplica las siguientes configuraciones de entorno y archivos locales:

### 5.1 Variable de Entorno Principal
La clave de API generada en Google AI Studio se mapea en el ecosistema bajo:
- Variable: `GEMINI_API_KEY` (configurada en el entorno del usuario del PC de desarrollo).
- El sistema de voz de OpenCode (`tools/tts-stt-ai/`) hace uso directo de esta variable para el endpoint OpenAI-compatible de Gemini en la normalización de comandos de voz.

### 5.2 Configuración del Cliente LLM
El motor OpenAI-compatible de OpenCode se redirige a:
```json
{
  "endpoint": "https://generativelanguage.googleapis.com/v1beta/openai/",
  "model": "gemini-3.5-flash",
  "apiKeyEnv": "GEMINI_API_KEY"
}
```
*(Nota: Dependiendo de la disponibilidad regional o del SDK, el modelo se mapea de forma transparente a `gemini-1.5-flash` o `gemini-3.5-flash` manteniendo la misma interfaz de alto rendimiento).*

---

## 6. Protocolo de Continuidad para Futuras IAs

Cualquier agente de IA que inicie sesión en este repositorio en el futuro debe leer este documento obligatoriamente y seguir estas directrices:

1. **Reconocer el Terreno**: Sabes que heredas un monorepo pnpm estructurado por capas, optimizado previamente por otros modelos (incluyendo DeepSeek Coder). Debes respetar las convenciones de nomenclatura, tipado y diseño estricto ya establecidas.
2. **Respetar el Contexto**: Utiliza la masiva ventana de contexto de Gemini de forma inteligente. No resumas archivos innecesariamente; lee por completo los archivos `_SYSTEM` del área que vayas a modificar antes de proponer código.
3. **No Te Atribuyas Logros**: No incluyas comentarios en el código que den a entender que la IA es la autora de la aplicación. Mantén el código limpio, conciso y enfocado únicamente en la lógica solicitada por Ciszuko Antony.
4. **Validación Sistemática**: Recuerda que estás operando con un modelo de alta velocidad. Usa esa velocidad para ejecutar los comandos de linter, type-check (`tsc`) y tests unitarios tras cada cambio. No asumas que el código es correcto solo porque compila en tu mente.

---

_Última revisión: 2026-08-21._ Relacionado: `ARCHITECTURE.md`, `OPENCODE_SYSTEM.md`, `TODO.md`.
