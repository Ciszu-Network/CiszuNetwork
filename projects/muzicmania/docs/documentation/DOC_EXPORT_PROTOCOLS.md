# DOC_EXPORT_PROTOCOLS — Protocolo de Exportación de Documentación Oficial (MuzicMania)

Versión: 1.0.0
Actualización: 2026-08-13
Identificador: DOC_EXPORT_PROTOCOLS_V1.0.0_2026_08_13_ciszunetwork

> **Definición**: protocolo obligatorio para generar, nombrar y distribuir la documentación
> oficial de MuzicMania. Define la nomenclatura de archivos, el flujo canónico de formatos
> (txt → md → docx → pdf), los paquetes masivos ZIP, los estándares tipográficos de Word/PDF
> y el uso del script `scripts/export-docs.js`.

---

## 1. Propósito y alcance

MuzicMania distribuye documentación oficial en varios canales y formatos. Para garantizar que
**toda copia sea idéntica y trazable**, existe un protocolo único de exportación y una
nomenclatura que identifica cada archivo generado.

Este documento es la **fuente de verdad** de ese protocolo:

- Formato canónico de contenido (`.txt` → `.md` → `.docx` → `.pdf`).
- Nomenclatura de archivos (individual y paquetes ZIP).
- Estándares de formato en Word y PDF (tipografía, numeración, firma).
- Uso del script `scripts/export-docs.js`.
- Verificación, troubleshooting y FAQ.

> El estándar de documentación general del ecosistema (cabeceras, sufijos, reglas de calidad)
> vive en `` `DOCUMENTATION_SYSTEM.md` `` (ver ciszu). Este doc solo cubre el **flujo de
> exportación** del juego.

## 2. Formato canónico del contenido

Toda documentación oficial se redacta en **Markdown** y se deriva a los demás formatos desde
ahí. La cadena de derivación es:

```
.txt  →  .md  →  .docx  →  .pdf
```

| Paso | Formato | Función |
|---|---|---|
| 1 | `.txt` | Copia plana, sin markdown, para lectura universal y manifiestos |
| 2 | `.md` | Fuente de verdad (markdown) |
| 3 | `.docx` | Documento editable (Word) |
| 4 | `.pdf` | Documento final no editable, para distribución |

**Regla de oro**: el `.md` local es la fuente; los demás formatos son **derivados** y nunca
deben editarse a mano (se regeneran con el script).

## 3. Nomenclatura de archivos

### 3.1 Archivos individuales

Todos los archivos exportados deben seguir el formato:

```
[DOC_ID]_V[VERSION]_[AÑO_MES_DÍA]_muzicmania.[ext]
```

Ejemplo:

```
TERMS_AND_CONDITIONS_V1.2.0_2026_08_13_muzicmania.pdf
```

| Campo | Regla |
|---|---|
| `DOC_ID` | Identificador corto del documento en mayúsculas, separado por `_` (ej. `TERMS_AND_CONDITIONS`) |
| `V[VERSION]` | Versión semántica del documento (ej. `V1.2.0`) |
| `AÑO_MES_DÍA` | Fecha de exportación en formato `YYYY_MM_DD` |
| `muzicmania` | Sufijo obligatorio de propiedad del proyecto |
| `ext` | `txt`, `md`, `docx` o `pdf` |

### 3.2 Identificador

El **Identificador** (campo de metadatos de cabecera) incluye el sufijo `_muzicmania`
(ver sección 6).

### 3.3 Paquetes masivos (ZIP)

Nombre del ZIP:

```
DOCS_[DOC_ID]_V[VERSION]_[formatos]_[FECHA]_muzicmania.zip
```

- `[formatos]`: lista de formatos incluidos (ej. `txt_md_pdf_docx`).
- `[FECHA]`: fecha en formato `YYYY_MM_DD`.

Ejemplo:

```
DOCS_TERMS_AND_CONDITIONS_V1.2.0_txt_md_pdf_docx_2026_08_13_muzicmania.zip
```

> Todo ZIP debe incluir un **manifiesto `.txt`** con el mismo nombre detallando el contenido
> (archivos, versiones y hashes opcionales).

## 4. Estándares de formato (Word y PDF)

| Aspecto | Regla |
|---|---|
| **Tipografía** | Arial 11pt o 12pt (obligatorio) |
| **Numeración PDF** | Parte superior izquierda (estilo tradicional) |
| **Firma PDF** | "MUZICMANIA OFFICIAL DOCUMENTATION" centrada en el pie de página (copyright style) |
| **Encabezados** | Todos los archivos (incluidos los `.md` locales) deben llevar el bloque de metadatos oficial al inicio |
| **Identificador** | Incluye el sufijo `_muzicmania` en el campo Identificador |

### 4.1 Bloque de metadatos oficial

Bloque obligatorio al inicio de cada archivo, en cualquiera de los formatos:

```text
# [DOC_ID] — Título del documento (MuzicMania)

Versión: 1.0.0
Actualización: 2026-08-13
Identificador: DOC_ID_V1.0.0_2026_08_13_muzicmania
```

### 4.2 Configuración de página

- Márgenes estándar (2,54 cm) o A4/Letter según destino.
- Numeración de página arriba a la izquierda en PDF.
- Firma de pie de página centrada solo en el PDF final.

## 5. El script `scripts/export-docs.js`

El script es el encargado de **replicar el contenido `.md` en `.txt`, `.pdf` y `.docx`**,
asegurando que la información sea exactamente igual en todos los canales.

### 5.1 Flujo del script

1. Lee todos los `.md` de origen (carpeta de documentación oficial).
2. Genera la versión `.txt` (contenido plano).
3. Genera la versión `.docx` (Word, con el bloque de metadatos).
4. Genera la versión `.pdf` (con numeración y firma).
5. Aplica la nomenclatura de la sección 3 a cada salida.
6. Opcionalmente empaqueta los ZIP masivos con su manifiesto.

### 5.2 Salidas

```
launcher/public/docs/
├── txt/    # copias planas
├── md/     # fuente de verdad (espejo de los .md locales)
├── docx/   # documentos Word
└── pdf/    # documentos finales
```

### 5.3 Ejecución

```bash
# Desde el workspace de la web del juego
node scripts/export-docs.js

# Con variables de entorno para carpeta de salida (si aplica)
DOC_OUT_DIR="launcher/public/docs" node scripts/export-docs.js
```

## 6. Documentos cubiertos por el protocolo

El listado oficial que se exporta incluye (no exhaustivo):

| DOC_ID | Tema |
|---|---|
| `ABOUT` | Sobre el juego |
| `ACTA` | Acta oficial |
| `CHANGELOG` | Historial de cambios |
| `CONTACT` | Contacto |
| `CREDITS` | Créditos |
| `DOCUMENTATION` | Índice de documentación |
| `FAQ` | Preguntas frecuentes |
| `FORUM` | Normas del foro |
| `GUIDELINES` | Guías |
| `HELP` | Ayuda |
| `INFORMATION` | Información general |
| `LEADERBOARD` | Clasificaciones |
| `LIBRARY` | Biblioteca |
| `LICENSE` | Licencia |
| `POLICY` | Políticas |
| `RULES` | Reglas |
| `SECURITY` | Seguridad |
| `STATS` | Estadísticas |
| `SUPPORT` | Soporte |
| `TEAM` | Equipo |
| `TERMS_AND_CONDITIONS` | Términos y condiciones |

## 7. Verificación y calidad

Antes de publicar una exportación:

1. **Paridad de contenido**: dif entre el `.md` fuente y cada formato derivado.
2. **Nomenclatura**: validar `[DOC_ID]_V[VERSION]_[FECHA]_muzicmania.[ext]`.
3. **Bloque de metadatos**: presente en todas las copias.
4. **Tipografía**: Arial 11pt o 12pt en Word/PDF.
5. **ZIP**: manifiesto `.txt` incluido y coincidente.

## 8. Troubleshooting

| Problema | Causa probable | Solución |
|---|---|---|
| El PDF no abre o sale corrupto | Faltan fuentes o el generador falló | Re-ejecutar el script con logs de error activados |
| El `.txt` conserva markdown (`#`, `**`) | El paso de "plano" no se aplicó | Verificar la función de stripping en el script |
| La numeración no aparece arriba-izquierda | Config de plantilla PDF incorrecta | Revisar la plantilla de pie/cabecera |
| El ZIP no incluye manifiesto | Se saltó el paso de empaquetado | Usar el modo ZIP del script |
| Nombres duplicados por fecha | Se exporta dos veces el mismo día | Reemplazar archivo o versionar `V[x]` |
| El docx abre con tipografía distinta | Word reemplaza Arial ausente | Embeber la fuente o confiar en Arial estándar |

## 9. FAQ

**¿Por qué existe un `.txt` si ya existe el `.md`?**
Porque algunos lectores/plataformas solo aceptan texto plano y los manifiestos de ZIP deben
ser planos.

**¿Puedo editar el `.pdf` o `.docx` manualmente?**
No. Son derivados; cualquier edición se pierde en la siguiente exportación. Edita siempre el
`.md` y regenera.

**¿El bloque de metadatos es obligatorio en el `.txt`?**
Sí, el protocolo exige que todos los archivos (incluidos los `.md` locales y sus copias)
lleven el bloque de metadatos al inicio.

**¿Dónde se publican los resultados?**
En `launcher/public/docs/` (txt, md, docx, pdf) dentro del proyecto, servidos por el launcher.

**¿Qué pasa si cambio un `.md` sin re-exportar?**
Las copias quedan desincronizadas, rompiendo la regla de paridad. Regenera siempre tras cada
cambio.

## 10. Referencias

- `` `DOCUMENTATION_SYSTEM.md` `` (ver ciszu) — estándar general de documentación.
- `` `TAURI_SYSTEM.md` `` — distribución de documentos vía el launcher desktop.
- `scripts/export-docs.js` — script de exportación.
