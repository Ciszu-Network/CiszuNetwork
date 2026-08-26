"""Genera un .xlsx estilizado (Excel) desde un .csv: columnas definidas con
anchos automaticos, fila de encabezado con color de marca, filas alternadas,
bordes de celda y autofiltro. Usa solo la stdlib (sin dependencias).

Uso: python scripts/xlsxgen.py <entrada.csv> <salida.xlsx>
"""

import sys
import csv
import zipfile

HEADER_BG = "FF34E2E2"   # cyan de marca
ALT_BG = "FFF2FBFF"      # azul muy claro (filas alternadas)
BORDER = "FF9AA7B0"


def col_letter(i):
    s = ""
    i += 1
    while i:
        i, r = divmod(i - 1, 26)
        s = chr(65 + r) + s
    return s


def esc(v):
    return str(v).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace('"', "&quot;").replace("\n", "&#10;")


def is_num(v):
    s = str(v).strip()
    if not s or len(s) > 15:
        return False
    return s.replace(".", "", 1).replace("-", "", 1).isdigit()


def build_sheet(rows):
    ncols = max(len(r) for r in rows)
    widths = []
    for c in range(ncols):
        w = max([len(str(r[c])) if c < len(r) else 0 for r in rows] + [8])
        widths.append(min(w + 2, 45))

    rows_xml = []
    for r_i, row in enumerate(rows):
        cells = []
        for c in range(ncols):
            v = row[c] if c < len(row) else ""
            ref = col_letter(c) + str(r_i + 1)
            if r_i == 0:
                cells.append(f'<c r="{ref}" t="inlineStr" s="1"><is><t>{esc(v)}</t></is></c>')
            else:
                style = "3" if r_i % 2 == 0 else "2"
                if is_num(v):
                    cells.append(f'<c r="{ref}" s="{style}"><v>{esc(v)}</v></c>')
                else:
                    cells.append(f'<c r="{ref}" t="inlineStr" s="{style}"><is><t>{esc(v)}</t></is></c>')
        rows_xml.append(f'<row r="{r_i + 1}">' + "".join(cells) + "</row>")

    cols_xml = "".join(f'<col min="{i + 1}" max="{i + 1}" width="{w}" customWidth="1"/>' for i, w in enumerate(widths))
    dim = f"A1:{col_letter(ncols - 1)}{len(rows)}"
    return (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'
        f'<dimension ref="{dim}"/><cols>{cols_xml}</cols>'
        "<sheetData>" + "".join(rows_xml) + "</sheetData>"
        f'<autoFilter ref="{dim}"/></worksheet>'
    )


STYLES = (
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
    '<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'
    '<fonts count="3">'
    '<font><sz val="11"/><name val="Calibri"/></font>'
    '<font><b/><sz val="11"/><name val="Calibri"/></font>'
    f'<font><b/><color rgb="FFFFFFFF"/><sz val="11"/><name val="Calibri"/></font>'
    '</fonts>'
    '<fills count="4">'
    '<fill><patternFill patternType="none"/></fill>'
    '<fill><patternFill patternType="gray125"/></fill>'
    f'<fill><patternFill patternType="solid"><fgColor rgb="{HEADER_BG}"/><bgColor indexed="64"/></patternFill></fill>'
    f'<fill><patternFill patternType="solid"><fgColor rgb="{ALT_BG}"/><bgColor indexed="64"/></patternFill></fill>'
    '</fills>'
    '<borders count="2">'
    '<border><left/><right/><top/><bottom/><diagonal/></border>'
    f'<border><left style="thin"><color rgb="{BORDER}"/></left><right style="thin"><color rgb="{BORDER}"/></right>'
    f'<top style="thin"><color rgb="{BORDER}"/></top><bottom style="thin"><color rgb="{BORDER}"/></bottom><diagonal/></border>'
    '</borders>'
    '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>'
    '<cellXfs count="4">'
    '<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>'
    '<xf numFmtId="0" fontId="2" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>'
    '<xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1"/>'
    '<xf numFmtId="0" fontId="0" fillId="3" borderId="1" xfId="0" applyFill="1" applyBorder="1"/>'
    '</cellXfs>'
    '<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>'
    '</styleSheet>'
)

WORKBOOK = (
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
    '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" '
    'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">'
    '<sheets><sheet name="Datos" sheetId="1" r:id="rId1"/></sheets></workbook>'
)

WORKBOOK_RELS = (
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
    '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>'
    '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>'
    '</Relationships>'
)

CONTENT_TYPES = (
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
    '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
    '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>'
    '<Default Extension="xml" ContentType="application/xml"/>'
    '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>'
    '<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>'
    '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>'
    '</Types>'
)

ROOT_RELS = (
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
    '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>'
    '</Relationships>'
)


def main():
    if len(sys.argv) < 3:
        print("Uso: python scripts/xlsxgen.py <entrada.csv> <salida.xlsx>")
        sys.exit(1)
    csv_path, xlsx_path = sys.argv[1], sys.argv[2]

    with open(csv_path, "r", encoding="utf-8", newline="") as f:
        rows = list(csv.reader(f))
    if not rows:
        print("CSV vacio")
        sys.exit(1)

    parts = {
        "[Content_Types].xml": CONTENT_TYPES,
        "_rels/.rels": ROOT_RELS,
        "xl/workbook.xml": WORKBOOK,
        "xl/_rels/workbook.xml.rels": WORKBOOK_RELS,
        "xl/styles.xml": STYLES,
        "xl/worksheets/sheet1.xml": build_sheet(rows),
    }
    with zipfile.ZipFile(xlsx_path, "w", zipfile.ZIP_DEFLATED) as z:
        for name, content in parts.items():
            z.writestr(name, content.encode("utf-8"))
    print(f"OK {os.path.basename(xlsx_path)}")


if __name__ == "__main__":
    import os
    main()