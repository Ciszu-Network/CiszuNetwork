# INFORME TÉCNICO OFICIAL: BIBLIA ARTÍSTICA DEFINITIVA CISZU NETWORK

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
[SUBJECT], [OUTFIT_AND_ACCESSORIES], [EXPRESSION_AND_POSE], full body shot, whole character visible from head to toe, not cropped, style of clean anime illustration, Ghelber aesthetic, bold clean lineart with varied line weight, T-junction emphasis, flat cel-shading with hard shadow edges, vibrant solid color blocks, expressive oversized anime eyes with vivid highlights, chunky hair style with sharp ends, professional character concept art, solid color horizontal background stripe --ar 16:9
```

> **Nota (5 ago 2026):** la directriz `full body shot, whole character visible from head to toe, not cropped` se añadió para evitar el recorte a la cintura que FLUX.1-schnell hace por defecto. Ver banco de cámaras §9.5.

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

---

## 9. BIBLIA DE PROMPTS — Librería Maestra para Generación (5 ago 2026)

> Sistema **modular**: cada bloque se combina libremente (`[SUJETO] + [ROPA] + [EXPRESIÓN] + [POSE] + [CÁMARA] + [FONDO]`) y se cierra con la plantilla de estilo. Cada banco lista variantes probadas con FLUX.1-schnell. **Si no se indica [CÁMARA], el modelo tiende a recortar a la cintura** — para personaje completo SIEMPRE incluir la palabra clave `full body` del banco 9.5.

### 9.0. Cómo usar esta biblia (regla de oro)

1. Elige **1 elemento de cada banco** (sujeto, ropa, expresión, pose, cámara, fondo).
2. Monta el prompt en este orden: `[SUJETO], [ROPA], [EXPRESIÓN], [POSE], [CÁMARA], [FONDO], ` + plantilla de estilo §9.7.
3. Añade la **frase anti-recorte** si quieres cuerpo completo (banco 9.5).
4. Negativo: usar el oficial §8.3, ampliable con el banco 9.8.
5. Parámetros: `image_size` 1024x1024 (personaje) o 1024x576 (escena 16:9); `num_images` ≥ 2 para elegir la mejor.

### 9.1. Banco de SUJETOS (personajes)

**Femeninos:**
- a cute young female adventurer with bright red hair and emerald green eyes
- a calm mysterious mage girl with long silver hair and violet eyes
- a stoic futuristic android girl with short cyan hair and glowing blue circuit patterns
- a cheerful idol singer girl with twin pink drills and sparkling amber eyes
- a tough tomboy knight girl with short messy blonde hair and a scar on her cheek
- a gentle shrine maiden girl with black hime-cut hair and soft brown eyes
- a mischievous thief girl with wavy orange hair and a sly grin
- a regal elven princess girl with long flowing white hair and pointed ears
- a ghostly pale gothic girl with black bobbed hair and crimson eyes
- a bubbly alchemist girl with mint green hair and round glasses

**Masculinos:**
- a heroic young swordsman with spiky dark hair and determined blue eyes
- a cool reserved archer with long black ponytail and golden eyes
- a burly warmhearted blacksmith with fiery red beard and kind smile
- a mysterious masked ninja with silver hair and glowing teal eyes
- a princely noble boy with elegant ash-blond hair and sapphire eyes
- a grumpy prodigy mage boy with messy brown hair and tired gray eyes
- a laid-back surfer boy with sun-bleached blonde hair and easy grin
- a stern knight commander with short gray hair and sharp steel eyes
- a cheerful inventor boy with curly auburn hair and freckles
- a cold vampire boy with raven black hair and dark red eyes

**No-humanos (fantasía/animales/mecha):**
- a cute anthropomorphic white fox girl with fluffy ears and a bushy tail
- a chubby round baby dragon with mint scales and tiny wings
- a sleek cybernetic mecha with white and cyan armor panels
- a fluffy giant wolf with pale fur and ice blue eyes
- a cute slime girl with translucent blue body and a cheerful face
- an elegant cat girl with black ears and a long tail
- a small floating robot companion with one big round eye
- a majestic griffin with white feathers and golden talons
- a cheerful mushroom spirit with a red cap and stubby legs
- a shy ghost with a round white body and big teary eyes

### 9.2. Banco de ROPA y ACCESORIOS

- wearing a worn leather tunic with a small satchel and a short sword at her hip
- wearing an elegant dark blue robe with golden trims and a floating crystal orb
- wearing a sleek white and black high-tech bodysuit with a visor headset
- wearing a frilly pastel idol dress with a glowing microphone
- wearing battered steel armor with a heavy shield
- wearing a traditional red and white shrine maiden outfit
- wearing a dark hooded cloak with hidden daggers
- wearing an ornate white and gold royal gown with a jeweled tiara
- wearing a black gothic lace dress with a ribbon choker
- wearing a lab coat with goggles and vials of glowing liquid
- wearing a simple green tunic with a leather belt and boots
- wearing a fitted dark uniform with a long scarf
- wearing a fluffy winter coat with a knitted scarf
- wearing loose desert robes with a turban and scimitar
- wearing a school uniform with a red bow tie and knee socks

### 9.3. Banco de EXPRESIONES

- extreme joyful smile with closed sparkling eyes
- confident smirk with one eyebrow raised
- calm gentle smile with soft relaxed eyes
- surprised wide-eyed look with open mouth
- determined fierce glare with set jaw
- shy blushing look with eyes looking away
- playful wink with a finger to the lips
- sleepy half-lidded eyes with a small yawn
- mischievous grin showing a hint of teeth
- crying happy tears with a bright smile
- neutral cool expression with blank stare
- thoughtful look with a hand on the chin

### 9.4. Banco de POSES

- both hands firmly planted on her hips, dynamic victory pose
- arms crossed over the chest, confident stance
- one hand raised waving hello, cheerful greeting pose
- crouching low with one knee on the ground, ready to leap
- mid-stride walking forward with flowing clothes
- leaning against a wall with one leg crossed
- kneeling down offering a hand to the viewer
- spinning dance pose with skirt and hair flowing
- holding a weapon raised overhead, action stance
- sitting cross-legged on the ground with relaxed posture
- jumping in the air with limbs spread in celebration
- pointing forward dramatically with the other hand on the hip

### 9.5. Banco de CÁMARA y ENCUADRE (clave para full body)

> ⚠️ **Siempre que se quiera el personaje entero**, añadir al final del prompt: `full body shot, whole character visible from head to toe, not cropped, standing with feet visible in frame`. Sin esto, FLUX recorta a la cintura con frecuencia.

- `full body shot, whole character visible from head to toe, not cropped` — cuerpo completo (imagen para recortar/transparencia)
- `half body shot, character visible from the waist up` — medio cuerpo (busto/cintura)
- `bust shot, close-up of head and shoulders` — retrato de busto
- `portrait shot, close-up of the face` — retrato facial (avatar/icono)
- `three-quarter view` — vista 3/4 (default recomendado)
- `front view, facing the viewer` — vista frontal
- `side profile view, facing left` — perfil mirando a la izquierda (para dúos, que miren al centro)
- `side profile view, facing right` — perfil mirando a la derecha (compañero del anterior)
- `from behind view` — vista de espaldas
- `dynamic low angle shot` — contra-picado heroico
- `top-down bird eye view` — cenital

### 9.6. Banco de FONDOS (con/sin fondo)

**Sin fondo / para recorte (→ flag `--transparent` del script):**
- `solid color horizontal background stripe` (estándar ART_GUIDE; franja plana, fácil chroma, mejor con BiRefNet)
- `plain solid white background, no details`
- `plain solid gradient background, soft colors`
- `solid dark navy background, no details`

**Con fondo de escena (→ NO usar `--transparent`):**
- `standing in front of a massive erupting volcano, anime background with glowing orange lava rivers, ash clouds and dramatic red sky`
- `in a neon-lit cyberpunk city street at night, rain and glowing holographic signs`
- `in a lush enchanted forest with floating fireflies and giant glowing mushrooms`
- `in a cozy village market with warm lanterns and wooden stalls`
- `on a snowy mountain peak with a clear starry sky`
- `in a grand royal throne room with golden pillars and red banners`
- `on a sunny beach with blue waves and white clouds`
- `in a dark gothic castle courtyard under a full moon`
- `in a futuristic laboratory with holographic screens and cyan lights`
- `in a fantasy battlefield with banners and distant armies`
- `in a concert stage with colorful spotlights and confetti`
- `in a peaceful flower field with a bright blue sky`

### 9.7. Banco de ESTILOS (plantilla estética — elige 1)

- **(Ghelber estándar, default)**: `style of clean anime illustration, Ghelber aesthetic, bold clean lineart with varied line weight, T-junction emphasis, flat cel-shading with hard shadow edges, vibrant solid color blocks, expressive oversized anime eyes with vivid highlights, chunky hair style with sharp ends, professional character concept art`
- **Chibi/cute**: `style of chibi anime illustration, cute deformed proportions with oversized head and tiny body, clean thick lineart, flat vibrant cel-shading, adorable sparkly eyes`
- **Comic/halftone (Scott Pilgrim)**: `style of comic book anime illustration, dynamic halftone shading, speed lines, bold outlines, energetic action framing`
- **Ritmo oscuro (NecroDancer)**: `style of anime illustration, dark moody lighting, vibrant neon rim light on dark background, crisp chunky lineart, rhythm game character design`
- **Candy gore**: `style of cute candy gore anime illustration, rounded soft shapes, neon pink cyan and lime palette, glossy highlights, no realistic textures`
- **Pixel art**: `style of detailed pixel art anime character, crisp clean pixels, vibrant limited palette, chunky silhouette, game sprite design`
- **Acuarela suave**: `style of soft watercolor anime illustration, delicate clean lines, gentle cel shading, dreamy pastel palette, cute character design`
- **Mecha limpio**: `style of clean mecha anime illustration, smooth polished plastic armor, aerodynamic curves, rounded joints, neon cyan accents`
- **Chibi sticker**: `style of cute anime sticker illustration, thick white outline around the character, kawaii face, solid bright background`
- **Key visual (banner)**: `style of professional anime key visual, cinematic composition, dramatic lighting, high detail, vibrant colors, epic atmosphere`

### 9.8. Banco de NEGATIVOS adicionales (ampliar §8.3)

- **Anti-recorte**: `cropped at waist, cropped at chest, missing legs, half body cut off`
- **Anti-anatomía**: `extra fingers, missing fingers, three fingers, broken hands, twisted limbs`
- **Anti-manos flotantes**: `floating limbs, detached hand, extra hand, arms not attached to shoulders` (lección 5 ago 2026: aventurera con mano voladora)
- **Anti-fondo**: `background bleed into character, background pattern on clothes`
- **Anti-texto**: `text, letters, watermark, signature, logo, title`
- **Anti-estilo**: `photograph, 3d render, realistic, painterly, soft gradients`

### 9.9. Prompts completos listos para usar (copy-paste)

**A) Personaje femenino, full body, sin fondo (→ transparencia):**
```
a brave young female adventurer with bright red hair and emerald green eyes, wearing a worn leather tunic with a small satchel and a short sword at her hip, extreme joyful smile with closed sparkling eyes, both hands firmly planted on her hips, dynamic victory pose, full body shot, whole character visible from head to toe, not cropped, standing with feet visible in frame, solid color horizontal background stripe, style of clean anime illustration, Ghelber aesthetic, bold clean lineart with varied line weight, T-junction emphasis, flat cel-shading with hard shadow edges, vibrant solid color blocks, expressive oversized anime eyes with vivid highlights, chunky hair style with sharp ends, professional character concept art
```

**B) Personaje masculino, full body, sin fondo (→ transparencia):**
```
a heroic young swordsman with spiky dark hair and determined blue eyes, wearing a simple green tunic with a leather belt and boots, determined fierce glare with set jaw, holding a sword raised overhead, action stance, full body shot, whole character visible from head to toe, not cropped, plain solid white background no details, style of clean anime illustration, Ghelber aesthetic, bold clean lineart with varied line weight, T-junction emphasis, flat cel-shading with hard shadow edges, vibrant solid color blocks, expressive oversized anime eyes with vivid highlights, chunky hair style with sharp ends, professional character concept art
```

**C) No-humano, full body, sin fondo (→ transparencia):**
```
a cute anthropomorphic white fox girl with fluffy ears and a bushy tail, wearing a fluffy winter coat with a knitted scarf, shy blushing look with eyes looking away, sitting cross-legged on the ground with relaxed posture, full body shot, whole character visible from head to toe, not cropped, solid color horizontal background stripe, style of chibi anime illustration, cute deformed proportions with oversized head and tiny body, clean thick lineart, flat vibrant cel-shading, adorable sparkly eyes
```

**D) Escena completa CON fondo (NO transparencia — estilo key visual):**
```
a brave young adventurer girl with bright red hair and emerald green eyes, wearing a worn leather tunic with a small satchel and a short sword at her hip, heroic confident smile, both hands firmly planted on her hips, dynamic victory pose, standing in front of a massive erupting volcano, anime background with glowing orange lava rivers, ash clouds and dramatic red sky, full body shot, whole character visible from head to toe, not cropped, style of professional anime key visual, cinematic composition, dramatic lighting, high detail, vibrant colors, epic atmosphere
```

**E) Retrato facial (avatar/icono):**
```
a calm mysterious mage girl with long silver hair and violet eyes, wearing an elegant dark blue robe with golden trims, calm gentle smile with soft relaxed eyes, portrait shot, close-up of the face, solid color horizontal background stripe, style of clean anime illustration, Ghelber aesthetic, bold clean lineart with varied line weight, flat cel-shading with hard shadow edges, expressive oversized anime eyes with vivid highlights, chunky hair style with sharp ends
```

**F) Dúo (dos personajes mirando al centro):**
```
a cheerful idol singer girl with twin pink drills and sparkling amber eyes, wearing a frilly pastel idol dress with a glowing microphone, side profile view facing right, extreme joyful smile with closed sparkling eyes, singing pose with one hand raised, and a cool reserved archer with long black ponytail and golden eyes, wearing a fitted dark uniform with a long scarf, side profile view facing left, calm gentle smile, standing back to back, full body shot, whole characters visible from head to toe, not cropped, solid color horizontal background stripe, style of clean anime illustration, Ghelber aesthetic, bold clean lineart, flat cel-shading with hard shadow edges, vibrant solid color blocks, professional character concept art
```

**G) Sprite pixel art de juego:**
```
a tough tomboy knight girl with short messy blonde hair and a scar on her cheek, wearing battered steel armor with a heavy shield, determined fierce glare with set jaw, holding a shield up defensive stance, full body shot, whole character visible from head to toe, not cropped, plain solid white background no details, style of detailed pixel art anime character, crisp clean pixels, vibrant limited palette, chunky silhouette, game sprite design
```

**H) Sticker con borde blanco:**
```
a cute slime girl with translucent blue body and a cheerful face, wearing a tiny bow on her head, extreme joyful smile with closed sparkling eyes, one hand raised waving hello, cheerful greeting pose, full body shot, whole character visible from head to toe, not cropped, solid bright pink background, style of cute anime sticker illustration, thick white outline around the character, kawaii face, solid bright background
```

**I) Ritmo oscuro (MuzicMania — fondo oscuro neón):**
```
a stoic futuristic android girl with short cyan hair and glowing blue circuit patterns on her skin, wearing a sleek white and black high-tech bodysuit with a visor headset, neutral cool expression with blank stare, arms crossed over the chest, confident stance, full body shot, whole character visible from head to toe, not cropped, plain solid dark navy background no details, style of anime illustration, dark moody lighting, vibrant neon rim light on dark background, crisp chunky lineart, rhythm game character design
```

**J) Candy gore (tema festivo oscuro, sin realismo):**
```
a ghostly pale gothic girl with black bobbed hair and crimson eyes, wearing a black gothic lace dress with a ribbon choker, mischievous grin showing a hint of teeth, holding a dripping candy heart in one hand, full body shot, whole character visible from head to toe, not cropped, solid color horizontal background stripe, style of cute candy gore anime illustration, rounded soft shapes, neon pink cyan and lime palette, glossy highlights, no realistic textures
```

### 9.10. Variantes de personalidad (para darles "vida" distinta)

Añade al final del prompt (después de la pose) una de estas para diferenciar personalidades entre personajes:
- `with a warm heroic aura and gentle confidence`
- `with a cold calculating aura, sharp focused eyes`
- `with a chaotic playful energy, always on the move`
- `with a sleepy lazy calmness, unhurried movements`
- `with an intense burning passion, fiery spark in the eyes`
- `with a mysterious enigmatic presence, secrets in the smile`
- `with a loyal protective stance, ready to defend`
- `with a proud regal elegance, head held high`
```
