# Sistema de certificados — Ciszuko Antony

Estado: septiembre 2026.

- Datos: `src/data/certificates.ts`
- Manifiesto de previews: `src/data/certificates.previews.ts`
- Archivos originales: `shared/docs/certificados/` (espejados al CDN `ciszu-cdn`)
- Página: `/certificates`

## Regla de oro: nada se inventa

Cada campo declarado (`title`, `provider`, `date`, `credentialId`) se extrae del
propio documento. Si el documento no indica un dato, se omite y se explica en
`note`. Ejemplo: el diploma de bachillerato está censurado y su fecha no es
legible, así que no se declara fecha.

## Detección del contenido

Los PDF se convierten a texto con `pdftotext` (poppler) y de ahí se leen el
nombre real del curso, la fecha de finalización y el serial:

```bash
cd shared/docs/certificados
for f in *.pdf; do pdftotext -enc UTF-8 "$f" "${f%.pdf}.txt"; done
```

Antes, 13 documentos se titulaban `Certificate #373`, `Course 109`, etc. Ahora
cada uno usa el nombre real detectado en el documento (`Business English, Part 1`,
`SEO y content marketing`, `Fundamentos de ciberseguridad`, …).

## Nomenclatura de catálogo

```
CKO-<EMISOR>-<AAAA>-<NNN>
```

- `CKO` — prefijo del portafolio.
- `EMISOR` — sigla real: `CSCO`, `MSFT`, `IBM`, `HP`, `EFSET`, `PENN`, `16P`,
  `SMPL`. Para plataformas que no se identifican en el documento: `OAC`
  (seriales `OA-*`), `OLC` (IDs `cert_*`), `OEN` / `ONL`.
- `AAAA` — año del documento.
- `NNN` — consecutivo dentro de ese emisor y año, en orden cronológico.

Se calcula en `buildCatalogRefs()` / `catalogRef()` y se muestra como chip
monoespaciado en la card y en la ficha. **No es un número del emisor**: ese vive
en `credentialId`, copiado literalmente del documento. Es determinista (mismo
emisor + misma fecha ⇒ mismo código) y la opción de orden `Catalog ref ↑`
agrupa el catálogo por emisor y año.

## Clasificación

| Campo | Uso |
| --- | --- |
| `category` | Familia temática (`english`, `programming`, `marketing`, …) |
| `provider` | Emisor real (institución o plataforma) |
| `collection` | Colección (Cisco, HP LIFE, Penn ELP, …) |
| `files[].kind` | `certificate`, `credential`, `transcript`, `report`, `image` |
| `date` | Fecha ISO verificada en el documento |
| `credentialId` | Serial/ID literal del documento |

## Previews

`scripts/sync-certificates.js` rasteriza la página 1 de cada PDF **con las
fuentes estándar y los cMaps de `pdfjs-dist`** (`standardFontDataUrl`, `cMapUrl`);
sin ellos, los PDFs con fuentes estándar renderizaban sin texto. Genera el JPG
ASCII-seguro en `shared/docs/certificados/previews/<nombre>-preview.jpg` y
regenera el manifiesto `certificates.previews.ts`.

La página resuelve la preview con `PREVIEWS_BY_FILE[archivoPrincipal]`; si no
existe, cae al propio archivo. Una preview que no carga muestra un estado de
error explícito con icono, nunca un hueco vacío.

```bash
pnpm sync:certificates   # regenera previews + manifiesto
pnpm verify:catalog      # valida el catálogo (falla con exit 1)
```

## Criterios de calidad (verificados por `pnpm verify:catalog`)

1. Cero títulos genéricos (`Certificate #NNN`, `Course NNN`).
2. Cero `ref` de catálogo duplicadas.
3. Todo documento con fecha verificable la declara; el resto lo explica en `note`.
4. Cada archivo declarado existe en disco y tiene preview mapeada.
5. Cada preview mapeada existe en disco.

La disponibilidad en el CDN se comprueba aparte con `scripts/verify-previews.js`.

---

*Última actualización: septiembre 2026*
