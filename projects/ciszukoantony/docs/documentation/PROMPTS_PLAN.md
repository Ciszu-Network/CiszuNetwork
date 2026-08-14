# PROMPTS_PLAN — Plan de Prompts de IA para la Marca (Ciszuko Antony)

Versión: 1.0.0
Actualización: 2026-08-14
Identificador: PROMPTS_PLAN_V1.0.0_2026_08_14_ciszunetwork

> **Definición**: guía práctica de prompts de IA para gestionar la marca personal de Ciszuko
> Antony: redes sociales, streaming (OBS), música y contenido en general, con plantillas,
> buenas prácticas y FAQ.

---

## 1. Propósito y alcance

Este documento recopila **prompts listos para usar** que un agente de IA puede recibir para
realizar tareas de la marca Ciszuko Antony. Incluye los prompts originales del portfolio
(redes, OBS, música) ampliados con plantillas, criterios de calidad y contexto de uso. La
guía sirve para:

- Ejecutar tareas repetitivas de forma consistente.
- No olvidar datos clave de la marca (handles, rutas, formatos).
- Mantener un estándar de calidad en redes, streaming y música.

## 2. Estructura de un prompt eficaz

| Componente | Pregunta que responde | Ejemplo |
|---|---|---|
| Rol | ¿Quién actúa? | "Actúa como gestor de marca" |
| Contexto | ¿De qué trata? | "Marca personal Ciszuko Antony, ecosistema Ciszu Network" |
| Tarea | ¿Qué debe hacer? | "Actualizar los perfiles de redes" |
| Datos | ¿Qué datos usar? | Handles, rutas, URLs (ver `BRAND_PLAN.md`) |
| Formato | ¿Cómo debe entregarse? | "Tabla", "texto plano", "paso a paso" |
| Cierre | ¿Qué falta validar? | "Confirmar con fuentes reales antes de publicar" |

### 2.1 Buenas prácticas al escribir prompts

- **Ser específico**: indicar plataforma, contenido y destinatario.
- **Incluir datos reales**: usar los handles y rutas de `BRAND_PLAN.md` y
  `ARCHITECTURE.md`.
- **Definir el formato de salida**: el agente debe saber si la respuesta es código, texto o
  tabla.
- **Pedir verificación**: no publicar sin comprobar la información contra el repo.
- **Una tarea a la vez**: prompts atómicos producen resultados más fiables.

## 3. Prompts para redes sociales

### 3.1 Actualizar perfiles

```
Actualizar perfiles de Ciszuko Antony:
- Instagram/Facebook: @itz.ciszukoant0nyz
- TikTok: @ciszukoantony
- YouTube: Cisco Antony Play
- Twitch: itz.ciszukoant0nyz
- Web: ciszukoantony.vercel.app
```

### 3.2 Escribir una descripción de video

```
Escribe la descripción de un video de [juego/tema] siguiendo el formato de
`docs/md/videos_info.md`: saludo, llamada a la acción (suscripción, like,
comentario, compartir), sección "SOBRE ESTE VIDEO", redes sociales, herramientas
utilizadas y preguntas frecuentes de la marca. Usa los emojis del formato.
```

### 3.3 Redactar un post para Instagram

```
Redacta un post en español para Instagram de Ciszuko Antony sobre [tema].
Tono cercano y directo. Incluye hashtags relevantes de gaming y la comunidad
latina. No uses URLs largas: referencia las redes de la marca.
```

## 4. Prompts para streaming (OBS)

### 4.1 Configurar OBS Studio

```
Configurar OBS Studio para Ciszuko Antony:
- Escena de juego (Minecraft, LabyMod)
- Escena de música (ciszukoantony-music)
- Overlay con redes sociales y donaciones
```

### 4.2 Crear escena de juego

```
Crea una escena de OBS para jugar Minecraft con LabyMod:
1. Captura de juego (Game Capture) con resolución nativa.
2. Overlay con webcam (posición inferior-derecha).
3. Capa de redes sociales (Instagram, TikTok, Twitch) y alertas de donaciones.
4. Configuración guardada en `docs/obs/`.
```

### 4.3 Crear escena de música

```
Crea una escena de OBS para streaming de música (ciszukoantony-music):
1. Fuente de música (ventana o dispositivo de audio).
2. Visualizador/ecualizador como fuente visual.
3. Overlay con redes y solicitudes de temas.
4. Nombre de escena: "Escena de música".
```

## 5. Prompts para música

### 5.1 Documentar un álbum

```
Documentar álbum musical de Ciszuko Antony:
- Carpeta: ciszukoantony/ciszukoantony-music/albums/
- Formato: metadata del álbum, tracks, arte
- Distribución: redes sociales, plataformas streaming
```

### 5.2 Crear metadata de un track

```
Genera la metadata de un track de [álbum]:
- Título, duración, artista (Ciszuko Antony).
- Género, productor, año.
- Arte de portada y créditos (respetar derechos de autores).
```

### 5.3 Plan de distribución

```
Propón un plan de distribución del álbum [nombre] de Ciszuko Antony:
1. Plataformas streaming (Spotify, YouTube Music, etc.).
2. Redes sociales para promoción.
3. Calendario de publicación (pre-save, release, after).
4. Material gráfico necesario (portada, banners).
```

## 6. Prompts para contenido y gestión general

### 6.1 Actualizar documentación del portfolio

```
Actualiza la documentación de `docs/documentation/` siguiendo el estándar de
Ciszu Network (cabecera, ≥200 líneas, español). Aplica a: [doc].
Ver `DOCUMENTATION_SYSTEM.md` (ciszu) para las reglas.
```

### 6.2 Resumir el estado del proyecto

```
Resume el estado del portfolio ciszukoantony: lee PROJECT_STATE.md,
TODO.md y PROJECT_HISTORY.md, y devuelve un resumen ejecutivo en español con las
tareas pendientes y el siguiente paso.
```

### 6.3 Revisar un cambio antes de commitear

```
Revisa el diff de [archivos] y verifica: lint + build sin errores, sin secretos,
sin archivos grandes, mensaje de commit en español en una línea.
```

## 7. Plantillas genéricas

### 7.1 Plantilla de video

```
Título: (según patrones de videos_info.md)
Descripción: (formato estándar con redes y herramientas)
Tags: [lista de tags de gaming/SEO]
Thumbnail: [concepto]
Meta: buscar 1000 suscriptores en YouTube
```

### 7.2 Plantilla de stream

```
Título del stream: [juego/tema] | Parte. Ep #.
Categoría: [juego]
Escenas: juego / música / intermedio
Overlay: redes + donaciones
Horario: [fecha y hora]
```

## 8. Errores comunes al usar prompts

| Error | Corrección |
|---|---|
| Prompts vagos ("mejora mi marca") | Definir tarea, datos y formato |
| Handles incorrectos | Usar siempre la tabla de `BRAND_PLAN.md` |
| Inventar rutas | Verificar contra `ARCHITECTURE.md` y el repo |
| Publicar sin revisar | Confirmar con fuentes externas (deploy, plataforma) |
| Mezclar varias tareas | Dividir en prompts atómicos |
| Atribuir a IAs | Mantener la autoría en Ciszuko Antony |

## 9. FAQ

**¿Estos prompts modifican archivos?** Algunos sí (documentación, metadata); deben ejecutarse
con los permisos y reglas del proyecto y de ciszu.

**¿Dónde está el formato de títulos de video?** En `docs/md/videos_info.md` y `vods_info.md`
(también resumido en `BRAND_PLAN.md` §8).

**¿Qué hago si el prompt produce datos incorrectos?** Volver a pedir verificación contra el
repo; nunca publicar datos sin comprobar.

**¿Los prompts aplican a música?** Sí, sección §5; los álbumes viven en
`ciszukoantony/ciszukoantony-music/albums/`.

**¿Puedo crear mis propios prompts?** Sí, siguiendo la estructura de la §2 y las buenas
prácticas.

## 10. Checklist antes de ejecutar un prompt

- [ ] La tarea está claramente definida (qué, dónde, formato).
- [ ] Los datos usados (handles, rutas) son correctos.
- [ ] El resultado no expone datos personales reales.
- [ ] Si toca código/documentación, se verifica con lint/build o el pipeline de docs.
- [ ] La autoría de la marca se mantiene en Ciszuko Antony.

## 11. Resumen ejecutivo

- Guía de prompts para redes, OBS, música y contenido de la marca Ciszuko Antony.
- Estructura de prompt eficaz: rol, contexto, tarea, datos, formato y cierre.
- Plantillas listas para videos, streams y álbumes.
- Reglas: datos verificables, handles de `BRAND_PLAN.md`, rutas de
  `ARCHITECTURE.md`, autoría humana.

_Última revisión: 13 ago 2026._ Relacionado: `BRAND_PLAN.md`, `ARCHITECTURE.md`,
`WORKFLOW_SYSTEM.md`, `README.md`.


