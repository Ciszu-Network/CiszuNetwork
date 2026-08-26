"""Convierte UN archivo markdown a PDF usando reportlab (reusa txt2pdf.py).
Uso: python scripts/staffpdf.py <entrada.md> <salida.pdf>
"""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from txt2pdf import get_fonts, get_styles, md_to_pdf_content

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer


def main():
    if len(sys.argv) < 3:
        print("Uso: python scripts/staffpdf.py <entrada.md> <salida.pdf>")
        sys.exit(1)
    md_path, pdf_path = sys.argv[1], sys.argv[2]

    font, bold = get_fonts()
    styles = get_styles(font, bold)

    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=A4,
        leftMargin=2.5 * cm, rightMargin=2.5 * cm,
        topMargin=2.5 * cm, bottomMargin=2.5 * cm,
        title=os.path.basename(md_path).replace(".md", ""),
    )

    with open(md_path, "r", encoding="utf-8") as f:
        text = f.read()

    title_id = ""
    for line in text.split("\n"):
        if line.startswith("Identificador:"):
            title_id = line.split(":", 1)[1].strip()
            break

    elements = []
    if title_id:
        elements.append(Paragraph(title_id, styles["DocTitle"]))
        elements.append(Spacer(1, 6))
    elements.extend(md_to_pdf_content(text, styles, font, bold))
    doc.build(elements)
    print(f"OK {os.path.basename(pdf_path)}")


if __name__ == "__main__":
    main()