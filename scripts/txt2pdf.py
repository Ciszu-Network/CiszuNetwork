"""Convierte documentos TXT/MD a PDF usando reportlab.
Uso: python scripts/txt2pdf.py <ruta_docs>
Ejemplo: python scripts/txt2pdf.py docs
Ejemplo: python scripts/txt2pdf.py projects/ciszubot/docs
"""

import sys, os, re, glob
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

def get_fonts():
    """Registra Arial si está disponible, sino usa Helvetica."""
    arial_paths = [
        r"C:\Windows\Fonts\arial.ttf",
        r"C:\Windows\Fonts\ARIAL.TTF",
        r"C:\Windows\Fonts\Arial.ttf",
    ]
    arial_bold_paths = [
        r"C:\Windows\Fonts\arialbd.ttf",
        r"C:\Windows\Fonts\ARIALBD.TTF",
    ]
    try:
        for p in arial_paths:
            if os.path.exists(p):
                pdfmetrics.registerFont(TTFont("Arial", p))
                break
        for p in arial_bold_paths:
            if os.path.exists(p):
                pdfmetrics.registerFont(TTFont("Arial-Bold", p))
                break
        return "Arial", "Arial-Bold"
    except Exception:
        return "Helvetica", "Helvetica-Bold"

def get_styles(font_name, bold_font_name):
    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(
        "DocTitle", fontName=bold_font_name, fontSize=16, alignment=TA_CENTER,
        spaceAfter=12, spaceBefore=6
    ))
    styles.add(ParagraphStyle(
        "DocSubtitle", fontName=font_name, fontSize=10, alignment=TA_CENTER,
        spaceAfter=20, textColor="#666666"
    ))
    styles.add(ParagraphStyle(
        "DocSection", fontName=bold_font_name, fontSize=13, alignment=TA_LEFT,
        spaceAfter=8, spaceBefore=14
    ))
    styles.add(ParagraphStyle(
        "DocSubSection", fontName=bold_font_name, fontSize=11, alignment=TA_LEFT,
        spaceAfter=6, spaceBefore=10
    ))
    styles.add(ParagraphStyle(
        "DocBody", fontName=font_name, fontSize=10, alignment=TA_JUSTIFY,
        spaceAfter=6, leading=14
    ))
    styles.add(ParagraphStyle(
        "DocItem", fontName=font_name, fontSize=10, alignment=TA_LEFT,
        spaceAfter=3, leftIndent=20, leading=14
    ))
    return styles

def md_to_pdf_content(text, styles, font_name, bold_font_name):
    """Convierte markdown básico a elementos PDF."""
    elements = []
    lines = text.split("\n")
    in_code = False
    code_lines = []
    
    for line in lines:
        stripped = line.strip()
        
        # Código
        if stripped.startswith("```"):
            if in_code:
                elements.append(Paragraph(
                    f"<font face='Courier' size='8'>{'<br/>'.join(code_lines)}</font>",
                    styles["DocBody"]
                ))
                code_lines = []
                in_code = False
            else:
                in_code = True
            continue
        if in_code:
            code_lines.append(stripped)
            continue
        
        # Saltos
        if not stripped:
            elements.append(Spacer(1, 6))
            continue
        if stripped == "---":
            elements.append(Spacer(1, 12))
            continue
        
        # Headers
        if stripped.startswith("### "):
            elements.append(Paragraph(stripped[4:], styles["DocSubSection"]))
            continue
        if stripped.startswith("## "):
            elements.append(Paragraph(stripped[3:], styles["DocSection"]))
            continue
        if stripped.startswith("# "):
            elements.append(Paragraph(stripped[2:], styles["DocTitle"]))
            continue
        
        # Items
        if stripped.startswith("- "):
            text = stripped[2:]
            elements.append(Paragraph(f"• {text}", styles["DocItem"]))
            continue
        
        # Bold inline
        text = re.sub(r'\*\*(.+?)\*\*', r'<b>\1</b>', stripped)
        text = re.sub(r'\*(.+?)\*', r'<i>\1</i>', text)
        
        elements.append(Paragraph(text, styles["DocBody"]))
    
    if code_lines:
        elements.append(Paragraph(
            f"<font face='Courier' size='8'>{'<br/>'.join(code_lines)}</font>",
            styles["DocBody"]
        ))
    
    return elements

def generate_pdf(md_path, pdf_path, font_name, bold_font_name, styles):
    doc = SimpleDocTemplate(
        pdf_path, pagesize=A4,
        leftMargin=2.5*cm, rightMargin=2.5*cm,
        topMargin=2.5*cm, bottomMargin=2.5*cm,
        title=os.path.basename(md_path).replace(".md", ""),
    )
    
    with open(md_path, "r", encoding="utf-8") as f:
        text = f.read()
    
    # Extraer título del header
    title_id = ""
    for line in text.split("\n"):
        if line.startswith("Identificador:") or line.startswith("Identifier:"):
            title_id = line.split(":", 1)[1].strip()
            break
    
    elements = []
    if title_id:
        elements.append(Paragraph(title_id, styles["DocTitle"]))
        elements.append(Spacer(1, 6))
    
    content = md_to_pdf_content(text, styles, font_name, bold_font_name)
    elements.extend(content)
    
    doc.build(elements)

def main():
    if len(sys.argv) < 2:
        print("Uso: python scripts/txt2pdf.py <ruta_docs>")
        sys.exit(1)
    
    docs_path = sys.argv[1]
    md_dir = os.path.join(docs_path, "md")
    pdf_dir = os.path.join(docs_path, "pdf")
    
    if not os.path.exists(md_dir):
        print(f"No existe: {md_dir}")
        sys.exit(1)
    
    os.makedirs(pdf_dir, exist_ok=True)
    
    font_name, bold_font_name = get_fonts()
    styles = get_styles(font_name, bold_font_name)
    
    skip = {"GUIDELINES.md", "RULES.md", "ACTA.md"}
    files = sorted(glob.glob(os.path.join(md_dir, "*.md")))
    files = [f for f in files if os.path.basename(f) not in skip]
    
    success = 0; errors = 0
    
    for md_path in files:
        base = os.path.basename(md_path).replace(".md", ".pdf")
        pdf_path = os.path.join(pdf_dir, base)
        try:
            generate_pdf(md_path, pdf_path, font_name, bold_font_name, styles)
            print(f"  OK {base}")
            success += 1
        except Exception as e:
            print(f"  FAIL {base}: {e}")
            errors += 1
    
    print(f"\nPDFs: {success} generados, {errors} errores")
    print(f"Directorio: {pdf_dir}")

if __name__ == "__main__":
    main()