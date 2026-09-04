# MODELS_LLM_SYSTEM — Sistema e Historial de Modelos LLM (Ciszu Network)

Versión: 1.3.0
Actualización: 2026-09-04
Identificador: MODELS_LLM_SYSTEM_V1.3.0_2026_09_04_ciszunetwork

> **Definición**: Documento histórico, comparativo y técnico que registra el uso de Modelos de
> Lenguaje (LLMs) en el ecosistema de Ciszu Network, detallando su evolución, motivos de cambio,
> justificaciones de transición y configuraciones de acceso (gratuitas y de suscripción).

---

## 1. Propósito y Filosofía del Sistema

Este documento recopila de manera objetiva la trayectoria de los modelos de inteligencia artificial utilizados para asistir en el desarrollo de Ciszu Network. La premisa fundamental y no negociable del ecosistema es la autoría única:

- **Autoría Legítima**: Francisco García (alias **Ciszuko Antony**) es el único creador, CEO, arquitecto de software y diseñador de cada sistema del ecosistema.
- **Herramientas de Ejecución**: Las IAs (agentes, LLMs, extensiones) actúan exclusivamente como herramientas avanzadas de ejecución, refactorización y agilización de código bajo la dirección directa de Ciszuko Antony.
- **Importancia de la Historia**: Registrar la historia de los modelos permite a las nuevas instancias de agentes (como este) entender que no fueron los primeros en tocar el código. Esto previene alucinaciones sobre la autoría, sitúa al agente en la línea temporal correcta del monorepo y le permite comprender las decisiones de diseño tomadas bajo paradigmas de modelos anteriores.

---

## 2. Cronología de Modelos en el Ecosistema

El desarrollo del monorepo ha transitado por siete etapas principales en cuanto al uso de asistentes de IA, buscando siempre la máxima eficiencia y el aprovechamiento de recursos gratuitos o de suscripción accesible.

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

### 2.6 Época 6: Retorno a DeepSeek V4 Flash mediante OpenCode Go (Suscripción)
El 23 de agosto de 2026, Ciszuko Antony retomó el uso de DeepSeek (familia V4) a través de la suscripción de pago **OpenCode Go**, sustituyendo a Gemini como motor principal del agente.
- **Acceso**: Suscripción mensual gestionada por OpenCode Zen — sin APIs de terceros inestables ni cuotas gratuitas eliminadas por costos de infraestructura.
- **Modelo principal**: **DeepSeek V4 Flash** (`opencode-go/deepseek-v4-flash`), optimizado para coding agents y con excelente Tool Calling.
- **Motivo del retorno**: La fase gratuita de Google AI Studio funcionaba pero dejó de ofrecer al modelo en el plan Zen Free; OpenCode Go da acceso estable, global y de bajo coste, conservando el rendimiento de código que hizo grande a DeepSeek en la Época 4.
- **Gemini permanece** como motor de normalización de voz (`tools/tts-stt-ai/`) y para tareas de imagen; ya no es el LLM principal de desarrollo.

### 2.7 Época 7: Freebuff (Buffy) con DeepSeek V4 Flash — Agente Secundario de Prueba (Gratuito)

El 3 de septiembre de 2026, Ciszuko Antony incorporó **Freebuff** como agente secundario en fase de prueba, operando **por debajo de OpenCode**, que sigue siendo el agente principal y fuente de verdad operativa del monorepo. Freebuff (CLI v0.0.167, construido sobre el framework Codebuff) se ejecuta sobre el mismo repositorio **sin alterar ni eliminar nada de la configuración de OpenCode** (`.opencode/`, `opencode.json`, comandos y skills quedan intactos).

- **Acceso**: Gratuito, sin API key ni suscripción, financiado con anuncios de texto dentro de la TUI; cuotas por sesiones/día según región y capacidad.
- **Modelo principal**: **DeepSeek V4 Flash 07/31** (modelo por defecto de Freebuff; misma familia V4 Flash que OpenCode Go de la Época 6, por lo que el rendimiento de código y Tool Calling son equivalentes).
- **Knowledge files**: Lee `AGENTS.md` / `CLAUDE.md` / `*.knowledge.md` al inicio de cada sesión (reutiliza el mismo AGENTS.md del monorepo; no requiere archivo de reglas propio).
- **Skills**: 34 skills copiadas localmente desde `.opencode/skills/` a `~/.agents/skills/` (mismo formato `SKILL.md`; el origen de opencode no se modifica).
- **MCP**: Config opcional vía `.agents/mcp.json` (formato estándar `mcpServers`, stdio/http/sse, refs `$VAR`). Activados localmente (2026-09-03): `sequential-thinking`, `memory`, `playwright` (headless) y `filesystem` (restringido a `E:\Ciszu Network`). opencode mantiene su decisión de MCP ausente.
- **Entorno**: Freebuff no posee servidor headless/SSH propio (a diferencia de `opencode serve` en `127.0.0.1:4096`); para uso remoto desde el móvil se ejecuta la TUI dentro de la sesión SSH (Termius → Tailscale) o directamente en local.
- **Motivo de la época**: Evaluar un agente gratuito de nivel secundario para tareas de prueba y apoyo, sin comprometer la estabilidad de OpenCode ni su configuración.

### 2.8 Época 8: Kilo CLI — Interfaz Actual (OpenCode + StepFun)

El 4 de septiembre de 2026, Ciszuko Antony adopta **Kilo** como la interfaz CLI/TUI oficial para el desarrollo del ecosistema. Kilo es una distribución/capa sobre OpenCode que ejecuta el motor de OpenCode con el modelo **StepFun Step-3.7 Flash** (`stepfun/step-3.7-flash:free`) como proveedor subyacente.

- **Acceso**: Se ejecuta localmente como reemplazo directo de la TUI de OpenCode; sin costo adicional por sí mismo (el modelo base es free tier de StepFun).
- **Modelo principal**: **StepFun Step-3.7 Flash** (`stepfun/step-3.7-flash:free`), servido a través del stack de OpenCode con la misma interfaz de herramientas (`bash`, `read`, `edit`, `grep`, etc.) y skills.
- **Compatibilidad**: Reutiliza completamente el `AGENTS.md`, skills, skills path (`~/.agents/skills/`) y convenciones del monorepo; no requiere archivo de reglas propio.
- **Diferencias frente a OpenCode Go**: Kilo mantiene el mismo flujo de agente, pero cambia el proveedor del LLM de `opencode-go` (DeepSeek V4 Flash de pago) a StepFun (free tier). El costo pasa a ser $0, sujeto a la disponibilidad del modelo free de StepFun.
- **Motivo de la época**: Evaluar una alternativa gratuita estable para reducir el gasto en suscripciones sin renunciar a tool calling, ventana de contexto ni la integración con el ecosistema OpenCode.

---

## 3. Comparativa Técnica de Modelos Evaluados

| Parámetro | DeepSeek Coder (Free API) | GitHub Copilot Nativo | Gemini Flash (AI Studio) | Nemotron (NVIDIA) | DeepSeek V4 Flash (OpenCode Go) |
|---|---|---|---|---|---|
| **Proveedor de API** | Plataformas de terceros (inestables) | Suscripción / GitHub Free | Google AI Studio Directo | NVIDIA Research | OpenCode Go (opencode.ai/zen) |
| **Estabilidad** | Baja (caídas frecuentes, saturación) | Alta | Muy Alta (canal oficial de Google) | Media-Alta (depende de host/local) | Alta (infraestructura gestionada de OpenCode) |
| **Ventana de Contexto** | 8k - 128k (truncado en gratis) | Limitado por interfaz de chat | **1 Millón de Tokens** (oficial) | Variable (normalmente 4k-32k) | Amplia (soporta contexto extendido de agente) |
| **Velocidad de Respuesta** | Media-Baja (bajo colas públicas) | Alta | **Extremadamente Alta** | Rápida (optimizada para inferencia) | Muy Alta (inferencia optimizada) |
| **Tool Calling (Agente)** | Limitado o emulado | No expuesto al CLI | Excelente (nativo y preciso) | Bueno (soporte creciente) | **Excelente (optimizado para coding agents)** |
| **Costo para Ciszuko** | Gratis (inestable) | Suscripción opcional | **Completamente Gratis** (dentro de cuota) | Gratis (local) / API Pay-per-use | **$5 primer mes / $10 mes (suscripción Go)** |
| **Límites de Cuota** | Variable / Suspendido | Restringido por chat | 15 RPM / 1 millón de tokens por min | Sin límites locales; API tiene cuotas | $12/5h · $30/semana · $60/mes (≈37.800 peticiones/mes) |

---

## 4. Justificación de la Decisión Actual

La transición decidida por Ciszuko Antony de contratar **OpenCode Go** con **DeepSeek V4 Flash** como motor principal del agente es la **mejor decisión estratégica** para la continuidad del ecosistema. Las secciones 4.1-4.3 documentan las ventajas que en su momento justificaron Gemini Flash (contexto, estabilidad y Tool Calling); la sección 4.4 explica por qué el retorno a DeepSeek vía suscripción conserva esas ventajas y añade acceso garantizado a bajo coste.

### 4.1 La Ventana de Contexto Gigante
Los modelos como DeepSeek Coder en servicios gratuitos suelen sufrir de truncado de contexto severo (a menudo limitado a 4,000 u 8,000 tokens). En un monorepo con 4 webs Next.js, múltiples paquetes compartidos y un sistema de documentación masivo (62 documentos de más de 200 líneas cada uno), un contexto limitado ciega al agente.
Gemini Flash posee una ventana nativa de **1 millón de tokens**. Esto permite cargar de golpe el `AGENTS.md`, múltiples archivos `.tsx`, el esquema de base de datos y la documentación del área de trabajo sin perder memoria de las instrucciones ni alucinar.

### 4.2 Estabilidad y Control de la API Key
Al usar un token personal directamente de Google AI Studio, Ciszuko elimina intermediarios. No depende de que una plataforma de terceros mantenga sus servidores encendidos o limite el modelo de desarrollo. Google AI Studio ofrece un nivel de servicio industrial de forma gratuita para desarrolladores, con un límite generoso de 15 solicitudes por minuto (RPM), lo cual es más que suficiente para una sesión de desarrollo humano-agente interactiva.

### 4.3 Razonamiento de Agente (Tool Calling)
Los modelos de Google de la serie Flash han sido optimizados específicamente para el uso de herramientas (Function Calling). Para un entorno como OpenCode, que depende de ejecutar búsquedas de archivos (`glob`), búsquedas de texto (`grep`), lecturas, ediciones de precisión e invocaciones de consola (`bash`), un modelo con excelente Tool Calling es infinitamente superior a un modelo que solo sabe completar texto pero falla al formatear los argumentos de las herramientas.

### 4.4 El Retorno Estratégico a DeepSeek Vía Suscripción (OpenCode Go)
La decisión de pagar una suscripción de **OpenCode Go** (en lugar de continuar con Gemini gratuito) se fundamenta en:
- **Acceso garantizado**: se elimina la incertidumbre de cuotas gratuitas, restricciones regionales o la eliminación de modelos por costos de infraestructura de proveedores de pruebas. OpenCode ya hizo el trabajo de probar, servir y mantener el modelo.
- **Modelo abierto a bajo coste**: DeepSeek V4 Flash es un modelo abierto servido por OpenCode con descuentos por volumen (multiplicador de ~6x de uso sobre lo pagado), ideal para sesiones largas de desarrollo.
- **Optimizado para agentes**: Tool Calling excelente y altas velocidades, recuperando la ventaja que hizo grande a DeepSeek en la Época 4, pero con la fiabilidad de una infraestructura gestionada.

---

## 5. Integración en la Configuración de OpenCode

Para asegurar la correcta operación bajo este nuevo esquema de suscripción, el sistema usa las siguientes configuraciones:

### 5.1 Autenticación en OpenCode Go
La suscripción a OpenCode Go se gestiona en la consola de OpenCode Zen (`opencode.ai/auth`). La API Key generada se conecta al agente con el comando `/connect` seleccionando el provider `opencode-go`. El acceso se mantiene vía sesión autenticada; no es una clave de API de terceros.

### 5.2 Configuración del Cliente LLM (modelo principal)
El motor del agente usa el provider **OpenCode Go** con el modelo **DeepSeek V4 Flash**:
```json
{
  "provider": "opencode-go",
  "model": "deepseek-v4-flash",
  "endpoint": "https://opencode.ai/zen/go/v1/chat/completions"
}
```
*(En la config de OpenCode el modelo se referencia como `opencode-go/deepseek-v4-flash`. Los IDs completos del catálogo Go están en `https://opencode.ai/zen/go/v1/models`.)*

### 5.3 Variables de Entorno Restantes
- `GEMINI_API_KEY`: permanece únicamente para el sistema de voz de OpenCode (`tools/tts-stt-ai/`, normalización de comandos de voz) y tareas de imagen. Ya no alimenta el LLM principal de desarrollo.

---

## 6. Directivas de Ahorro de Tokens (No Gastar de Más)

Con la suscripción **OpenCode Go** cada token tiene costo real. Los límites son en dólares de uso, no en peticiones. Directivas obligatorias para minimizar el gasto sin perder eficacia:

1. **Pensar por tarea, no "saberlo todo"**: lee solo el doc `_SYSTEM` del área que tocas. No cargues el contexto con documentación de sistemas ajenos a la tarea (AGENTS.md §6.3).
2. **Batch de herramientas**: agrupa búsquedas, lecturas y comandos independientes en una sola llamada paralela. No invoques herramientas una a una.
3. **Lee por rangos, no archivos enteros**: usa `grep`/`glob` primero y `offset`/`limit` en `read` para archivos grandes. Evita re-leer lo ya leído.
4. **Respuestas concisas**: máximo 4 líneas de texto salvo que se pida detalle. No repitas el contenido de los archivos editados; resume los cambios.
5. **No verificar de más**: no lances `tsc`/`eslint`/`build` repetidamente; ejecuta la verificación mínima que demuestre que el cambio funciona y después la batería completa una sola vez.
6. **Sesiones cortas**: al acercarse al umbral de contexto (~110-120k tokens), avisar por push (`pnpm notify`) y proponer cambiar de sesión en vez de seguir escribiendo código lento (AGENTS.md §9).
7. **Caché de prompts**: mantén AGENTS.md y los docs leídos reutilizables; las lecturas cacheadas son mucho más baratas que el input nuevo (cached read ≈ $0.007/M frente a $0.22/M).

## 7. Plan de Facturación y Costos Reales (OpenCode Go)

Datos oficiales de OpenCode Go (consulta en `opencode.ai/docs/go`, vigente al 2026-08-23):

### 7.1 Coste de Suscripción
- **$5 USD el primer mes**, luego **$10 USD/mes**.
- Acceso a modelos abiertos populares servidos y testeados por OpenCode (benchmarked para uso de agente).

### 7.2 Límites de Uso Incluidos (medidos en dólares)
| Ventana | Límite |
|---|---|
| 5 horas | $12 de uso |
| Semana | $30 de uso |
| Mes | $60 de uso |

Si se alcanza el límite: se bloquean peticiones, salvo que se habilite la opción **"Use balance"** (cae al saldo de Zen) o se sigan usando los modelos gratuitos.

### 7.3 Precio por millón de tokens — DeepSeek V4 Flash (Go)
| Parámetro | Off-Peak | Peak |
|---|---|---|
| **Input** | $0.22 | $0.44 |
| **Output** | $0.66 | $1.32 |
| **Cached Read** | $0.007 | $0.014 |

- **Peak**: 01:00-04:00 y 06:00-10:00 UTC (≈21:00-00:00 y 02:00-06:00 en Caracas). El resto es Off-Peak (más barato).
- **Petición típica del modelo**: ~410 tokens input + ~71.300 cached + ~310 output.
- **Rendimiento estimado con Go**: ~7.600 peticiones/5h · ~18.900/semana · ~37.800/mes.

### 7.4 Recomendaciones de Costo
1. **Trabajar en horas Off-Peak** siempre que sea posible (tareas pesadas, builds, relecturas).
2. **Maximizar caché**: releer archivos ya leídos en sesión es casi gratis (cached read) frente a leer input nuevo.
3. **No escalar a DeepSeek V4 Pro** salvo tareas críticas: Pro cuesta 3x (input $0.66/$1.32) y su límite mensual de uso es $15 frente a $30 de Flash.
4. **Monitorizar el uso** en la consola de Zen (`opencode.ai/auth`); una sesión normal rinde ~60-90k tokens.

---

## 8. Protocolo de Continuidad para Futuras IAs

Cualquier agente de IA que inicie sesión en este repositorio en el futuro debe leer este documento obligatoriamente y seguir estas directrices:

1. **Reconocer el Terreno**: Sabes que heredas un monorepo pnpm estructurado por capas, optimizado previamente por otros modelos (incluyendo DeepSeek Coder). Debes respetar las convenciones de nomenclatura, tipado y diseño estricto ya establecidas.
2. **Respetar el Contexto**: Utiliza la ventana de contexto de DeepSeek V4 Flash de forma inteligente. No resumas archivos innecesariamente; lee por completo los archivos `_SYSTEM` del área que vayas a modificar antes de proponer código.
3. **No Te Atribuyas Logros**: No incluyas comentarios en el código que den a entender que la IA es la autora de la aplicación. Mantén el código limpio, conciso y enfocado únicamente en la lógica solicitada por Ciszuko Antony.
4. **Validación Sistemática**: Recuerda que estás operando con un modelo de alta velocidad. Usa esa velocidad para ejecutar los comandos de linter, type-check (`tsc`) y tests unitarios tras cada cambio. No asumas que el código es correcto solo porque compila en tu mente.

---

_Última revisión: 2026-09-04._ Relacionado: `ARCHITECTURE.md`, `OPENCODE_SYSTEM.md`, `MODELS_SKILLS_SYSTEM.md`, `TODO.md`, `VAULT_SYSTEM.md`.
