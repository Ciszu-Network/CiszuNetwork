# INFORME TÉCNICO OFICIAL: BIBLIA ARTÍSTICA DEFINITIVA - PROYECTO MUZICMANIA

**Estándar Técnico y Estándar de Pipeline: Estilo Artista G (Ghelber Edition)**

---

## 1. Fundamentos de la Estética y Filosofía Visual "Cute"

La estética de Ghelber no se limita a un dibujo de anime convencional; opera como un sistema de diseño estructurado donde el carisma emocional prevalece estrictamente sobre la fidelidad anatómica.

- **Identidad Base:** Interpretación moderna, estilizada y de claridad excepcional del anime contemporáneo, centrada en el concepto de "cute stuff" y en generar personajes altamente atractivos y expresivos.
- **Abstracción de la Realidad:** Se prohíbe el fotorrealismo o el realismo estricto. La iconicidad se logra sintetizando las formas mediante referencias a la suavidad de Mei, la elegancia simplificada de Yor Forger y la claridad de formas de Pandemonica.
- **Universalidad:** La técnica es aplicable a cualquier diseño y temática, manteniendo siempre la funcionalidad narrativa para novelas visuales, cómics e interacciones complejas.

### Rasgos Faciales y Proporciones Clave

- **Geometría Ocular:** Ojos magnificados que ocupan aproximadamente un tercio del rostro, dotados de gradientes suaves y reflejos de luz prominentes que denotan "chispa vital".
- **Estructura Craneal:** Rostros redondeados rematados con barbillas sutilmente puntiagudas. La nariz se reduce al mínimo expresivo (un punto o una línea fina).
- **Dinamismo Gestual:** Expresiones extremas y claras (alegría radiante, sorpresa absoluta) apoyadas por cejas simplificadas que modulan la emoción de forma instantánea.

---

## 2. Anatomía del Lineart Impecable

El lineart constituye el esqueleto estructural del estilo. No se tolera bajo ningún concepto el trazo dubitativo o "peludo".

- **Configuración de Pincel:** Empleo de pinceles de borde duro (_Hard Round_) con una sensibilidad de presión del 90% para permitir variaciones de grosor firmes y controladas.
- **Geometría del Capilar (Cabello):** Tratamiento del cabello en bloques sólidos y definidos (_chunky_), terminados en puntas extremadamente afiladas y limpias.
- **Dinámica de Grosor de Línea (_Line Weight_):**
- **Intersecciones (_T-Junctions_):** El grosor de la línea aumenta sutilmente en los puntos de contacto o cruce (ej. unión del cuello con la mandíbula o cruce de mechones).
- **Silueta Exterior:** Un peso dominante y grueso para separar de forma nítida al personaje del fondo.
- **Detalles Internos:** Trazos finos y limpios dedicados exclusivamente a pliegues de ropa y rasgos faciales mínimos.

---

## 3. El Proceso de Producción: Validation Gates

Para optimizar el pipeline de desarrollo y evitar cuellos de botella creativos, la producción de cada activo se divide en tres fases obligatorias que actúan como puntos de control (_Gates_):

1. **Fase 1: Sketch Dinámico (Gate de Composición)**

- Construcción de figuras mediante gestos de alta energía.
- Validación rigurosa de la silueta y la pose antes de proceder al pulido. Permite integrar bases temáticas complejas (Mecha, Furry o Gore) manteniendo proporciones tiernas.

2. **Fase 2: Entintado (Gate de Fidelidad)**

- Aplicación del lineart definitivo sobre el boceto aprobado.
- El trazado debe ser continuo y limpio (estándar DeviantArt/Patreon de Ghelber); si no cumple esta premisa, no se avanza al color.

3. **Fase 3: Coloreado Vibrante (Gate Final)**

- Aplicación de paletas saturadas y sombreado tipo _cel-shading_.
- El volumen se genera mediante sombras de bordes duros, descartando degradados suaves innecesarios y garantizando compatibilidad con resoluciones altas (_Full Body_ y _Pin-Up_).

---

## 4. Adaptación Temática: Ingeniería Inversa del Estilo

Dado que el creador de referencia restringe ciertos temas en encargos públicos, este pipeline deconstruye y adapta los rasgos característicos para integrarlos sin fricción en Muzicmania:

- **Horror y Gore Estilizado (Candy Gore):**
- _Técnica:_ Transformación de la visceralidad en elementos de diseño "cute". Las entrañas y fluidos se representan con formas redondeadas, suaves y brillos especulares idénticos a los del cabello.
- _Paleta:_ Uso exclusivo de colores neón (rosa chicle, azul cian, verde lima) con goteos de formas perfectas y geométricas, eliminando cualquier crudeza realista.
- **Mecha Orgánico:**
- _Técnica:_ Inspirado en la limpieza geométrica de las astas de Pandemonica. La maquinaria prioriza curvas aerodinámicas y acabados de plástico pulido tipo juguete de diseño, sustituyendo tornillos y cables industriales por superficies lisas y juntas redondeadas.
- **NSFW Cohesivo:**
- _Técnica:_ Alineado al estándar de calidad de plataformas de mecenazgo. La anatomía conserva rigurosamente las proporciones estilizadas, enfocando la calidad técnica en la suavidad de las líneas y el tratamiento de la piel como una superficie limpia y vibrante por encima de la representación explícita.

---

## 5. La Matriz de Fusión: Muzicmania Design Matrix

Para consolidar la identidad visual del videojuego y su jugabilidad rítmica, se aplica la siguiente tabla de síntesis metodológica:

| Pilar Artístico              | Influencia    | Aplicación en el Juego                                                                                                                                                           |
| ---------------------------- | ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Núcleo Visual**            | Artista G     | Personajes con lineart impecable, ojos expresivos de gran formato y estética "cute".                                                                                             |
| **Estructura y Acción**      | Scott Pilgrim | Poses de combate dinámicas, tramas de sombreado (_halftones_) y efectos de velocidad estilo cómic.                                                                               |
| **Proporciones y Contraste** | NecroDancer   | Estructura*chibi* compacta (manos y pies ligeramente sobredimensionados para legibilidad) combinada con fondos oscuros y personajes de colores vibrantes para asegurar el ritmo. |

---

## 6. Gestión de Activos y Flujo OpenCode CLI

Para asegurar la total compatibilidad con los scripts automatizados del monorepo y el motor del juego, la estructura se fundamenta en el estándar de oro del archivo PSD de referencia ("Nicole Demara PSD").

### Jerarquía Obligatoria de Capas (PSD)

1. `[EFFECTS]` (Modo de fusión: Normal/Add/Overlay para post-procesado de brillos y partículas).
2. `[LINEART]` (Modo de fusión: Normal, 100% de opacidad, sin transparencias intermedias).
3. `[SHADOWS]` (Modo de fusión: Multiply, opacidad del 40% al 60% con sombreado de bordes duros).
4. `[COLOR]` (Capas de colores base totalmente planas y aisladas).
5. `[BACKGROUND]` (Activos de escenario o capas de transparencia base).

### Automatización y Empaquetado

Cada activo exportado debe seguir la nomenclatura estructurada: `CARÁCTER_ACCIÓN_CAPA.png`. El comando de ejecución agéntica mediante OpenCode CLI para empaquetar y trasladar los recursos al motor es el siguiente:

```bash
opencode-cli asset-pack --input ./PROYECTO_PSD/NICOLE_DEMARA/ --target ./Muzicmania/Sprites/ --format png --scale 1.0
```

_Nota de Comercialización:_ Se contemplan los costos o consideraciones de licencias adicionales para asegurar los derechos de propiedad intelectual ante usos comerciales extensivos o impresiones masivas.

---

## 7. Checklist de Control de Calidad (QA)

Antes de dar por validado cualquier activo visual dentro del pipeline de producción, este debe superar de forma exhaustiva los siguientes puntos de control:

- [ ] **Arquetipo de Referencia:** ¿La jerarquía de capas y el nombramiento coinciden milimétricamente con el estándar "Nicole Demara PSD"?
- [ ] **T-Junctions y Tapering:** ¿El lineart presenta mayor peso en las intersecciones y finaliza en puntas afiladas empleando el pincel _Hard Round_?
- [ ] **Geometría del Cabello:** ¿Los mechones están resueltos como bloques sólidos y simplificados en lugar de trazos de pelo individuales?
- [ ] **Pureza "Candy":** En variantes de Gore o Mecha, ¿se han erradicado por completo las texturas realistas en favor de formas redondeadas y colores vibrantes?
- [ ] **Validación de Sombreado:** ¿Las capas de sombras operan estrictamente en modo _Multiply_ (40%-60%) con cortes limpios de _cel-shading_?
- [ ] **Fusión Rítmica:** ¿El activo conserva el dinamismo característico de Scott Pilgrim sin sacrificar la limpieza facial y gestual de Ghelber?

## 8. Plantillas de Prompts y Placeholders para Generación con IA (SiliconFlow / FLUX)

Para unificar la teoría de la biblia artística con la automatización en el monorepo (mediante scripts de Node.js y OpenCode CLI), se establece la estructura oficial de prompts parametrizados mediante _placeholders_.

### 8.1. Plantilla Maestra de Prompt con Placeholders

Utiliza esta estructura base en tus scripts para inyectar dinámicamente los componentes del personaje sin alterar la directriz estética del Artista G:

```text
[SUBJECT], [OUTFIT_AND_ACCESSORIES], [EXPRESSION_AND_POSE], style of clean anime illustration, Ghelber aesthetic, bold clean lineart with varied line weight, T-junction emphasis, flat cel-shading with hard shadow edges, vibrant solid color blocks, expressive oversized anime eyes with vivid highlights, chunky hair style with sharp ends, professional character concept art, solid color horizontal background stripe --ar 16:9
```

### 8.2. Glosario de Placeholders y Variables

- **`[SUBJECT]`**: Define el sujeto u objeto principal (ej. _a cute cybernetic female android_, _a young red-haired female adventurer_).
- **`[OUTFIT_AND_ACCESSORIES]`**: Descripción de la indumentaria respetando la ingeniería inversa o adaptación temática (ej. _wearing a sleek dark school uniform with white lace details_, _mecha armor with smooth polished plastic finish_).
- **`[EXPRESSION_AND_POSE]`**: Gesto y dinamismo inspirados en Scott Pilgrim y Ghelber (ej. _dynamic action pose, extreme joyful expression, confident smirk_).

### 8.3. Prompt Negativo Oficial Estándar

Para evitar desviaciones hacia el fotorrealismo o estilos pictóricos no deseados, utiliza siempre este string de exclusión en los payloads:

```text
photograph, 3d render, painterly, textured brushstrokes, soft shading, gradients, lowres, blurry, bad anatomy, deformed, extra limbs, watermark, sketchy lines, soft edges, realistic skin texture
```

### 8.4. Payload JSON Oficial para el Script de SiliconFlow

Este es el formato de datos exacto que tu agente OpenCode CLI debe integrar en la petición HTTP hacia la API de SiliconFlow para generar los activos dentro del monorepo:

```json
{
    "model": "black-forest-labs/FLUX.1-schnell",
    "prompt": "a cute cyberpunk female hacker, wearing a fitted high-collar techwear jacket, dynamic standing pose with confident smirk, style of clean anime illustration, Ghelber aesthetic, bold clean lineart with varied line weight, T-junction emphasis, flat cel-shading with hard shadow edges, vibrant solid color blocks, expressive oversized anime eyes with vivid highlights, chunky hair style with sharp ends, professional character concept art, solid color horizontal background stripe",
    "negative_prompt": "photograph, 3d render, painterly, textured brushstrokes, soft shading, gradients, lowres, blurry, bad anatomy, deformed, extra limbs, watermark, sketchy lines, soft edges, realistic skin texture",
    "image_size": "1024x576"
}
```
