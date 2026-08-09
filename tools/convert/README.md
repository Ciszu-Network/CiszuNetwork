# convert — Kit universal de conversión de formatos

CLI único para convertir documentos en cualquier formato **en todo el repo**, sin memorizar
scripts sueltos. Reutiliza los motores instalados: **pandoc** (md→docx), **weasyprint** o
**reportlab** (md→pdf), **Word COM** (docx→pdf), **pypdf** (pdf→txt), **openpyxl** (csv↔xlsx).

## Uso

```bash
node tools/convert/convert.js <conversion> <input> [--out <archivo|directorio>]
```

| Conversión | Motor | Requisito |
| --- | --- | --- |
| `md2txt` | JS puro | ninguno |
| `txt2md` | JS puro | ninguno |
| `md2docx` | pandoc | pandoc (WinGet) |
| `md2pdf` | pandoc+weasyprint **o** reportlab | weasyprint opcional; reportlab (default) |
| `docx2pdf` | Word COM | Microsoft Word instalado (Windows) |
| `pdf2txt` | pypdf | `pip install pypdf` |
| `csv2xlsx` | openpyxl | `pip install openpyxl` |
| `xlsx2csv` | openpyxl | `pip install openpyxl` |

## Ejemplos

```bash
# Archivo individual → al lado del original
node tools/convert/convert.js md2pdf projects/ciszu/docs/plantillas/acta-constitutiva-srl.md
node tools/convert/convert.js md2docx guia.md --out salida/guia.docx

# Batch: directorio completo (recursivo, preserva estructura)
node tools/convert/convert.js md2txt projects/ciszu/docs/ --out .opencode/temp/txt
node tools/convert/convert.js csv2xlsx archives/legal/contabilidad/ --out archives/legal/contabilidad/xlsx

# pdf → txt (para reutilizar contenido)
node tools/convert/convert.js pdf2txt documento.pdf
```

## Reglas

- `--out` con archivo = destino exacto (solo single-file); con directorio = carpeta destino.
- Batch: por defecto crea subcarpeta con la extensión destino (`<input>/<ext>/`).
- md2pdf usa weasyprint si está en PATH; si no, cae a reportlab (sin dependencias extra).
- Los CSV generados/leídos usan UTF-8 con BOM (compatibles con Excel).

## Scripts legacy equivalentes (siguen funcionando)

| scripts/ | Modo | Para qué |
| --- | --- | --- |
| `scripts/md2office.js` | carpeta `md/` → `docx/` + `pdf/` | migraciones masivas de docs |
| `scripts/txt2md.js` | carpeta `txt/` → `md/` | migraciones masivas de docs |
| `scripts/txt2pdf.py` | carpeta `md/` → `pdf/` (reportlab) | PDFs masivos |
| `scripts/docx2pdf.ps1` | carpeta `docx/` → `pdf/` | PDFs masivos con Word |

## Añadir una conversión nueva

1. Añadir la entrada en `CONVERSIONS` en `convert.js` (extensión fuente/destino).
2. Implementar el caso en `convertFile()` o crear un engine en `engines/`.
3. Documentarla en esta tabla.
