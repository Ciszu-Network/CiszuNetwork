# -*- coding: utf-8 -*-
"""md2pdf — Markdown a PDF con reportlab (fallback sin pandoc/weasyprint).
Uso: python tools/convert/engines/md2pdf.py <input.md> --out <output.pdf>"""
import sys, os, re
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

def get_fonts():
    for name, bold, path in (("Arial", "Arial-Bold", r"C:\Windows\Fonts\arial.ttf"),
                             ("Arial-Bold", None, r"C:\Windows\Fonts\arialbd.ttf")):
        try:
            if path and os.path.exists(path):
                if name == "Arial":
                    pdfmetrics.registerFont(TTFont("Arial", path))
                else:
                    pdfmetrics.registerFont(TTFont("Arial-Bold", path))
        except Exception:
            pass
    try:
        return "Arial", "Arial-Bold"
    except Exception:
        return "Helvetica", "Helvetica-Bold"

def main():
    args = sys.argv[1:]
    inp = args[0] if args else None
    out = None
    if "--out" in args:
        out = args[args.index("--out") + 1]
    if not inp or not out:
        print("Uso: python md2pdf.py <input.md> --out <output.pdf>"); sys.exit(1)

    font, bold = get_fonts()
    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle("DocTitle", fontName=bold, fontSize=16, alignment=TA_CENTER, spaceAfter=12, spaceBefore=6))
    styles.add(ParagraphStyle("DocSection", fontName=bold, fontSize=13, alignment=TA_LEFT, spaceAfter=8, spaceBefore=14))
    styles.add(ParagraphStyle("DocSubSection", fontName=bold, fontSize=11, alignment=TA_LEFT, spaceAfter=6, spaceBefore=10))
    styles.add(ParagraphStyle("DocBody", fontName=font, fontSize=10, alignment=TA_JUSTIFY, spaceAfter=6, leading=14))
    styles.add(ParagraphStyle("DocItem", fontName=font, fontSize=10, alignment=TA_LEFT, spaceAfter=3, leftIndent=20, leading=14))
    styles.add(ParagraphStyle("DocCode", fontName="Courier", fontSize=8, alignment=TA_LEFT, spaceAfter=6, leading=11))

    doc = SimpleDocTemplate(out, pagesize=A4, leftMargin=2.5*cm, rightMargin=2.5*cm,
                            topMargin=2.5*cm, bottomMargin=2.5*cm, title=os.path.basename(inp))
    elements = []
    in_code = False
    code = []
    with open(inp, "r", encoding="utf-8") as f:
        for line in f:
            s = line.strip()
            if s.startswith("```"):
                if in_code:
                    elements.append(Paragraph("<br/>".join(code), styles["DocCode"])); code = []; in_code = False
                else:
                    in_code = True
                continue
            if in_code:
                code.append(s.replace("<", "&lt;").replace(">", "&gt;")); continue
            if not s:
                elements.append(Spacer(1, 6)); continue
            if s == "---":
                elements.append(Spacer(1, 12)); continue
            if s.startswith("### "):
                elements.append(Paragraph(s[4:], styles["DocSubSection"])); continue
            if s.startswith("## "):
                elements.append(Paragraph(s[3:], styles["DocSection"])); continue
            if s.startswith("# "):
                elements.append(Paragraph(s[2:], styles["DocTitle"])); continue
            if s.startswith("- "):
                elements.append(Paragraph("• " + s[2:], styles["DocItem"])); continue
            t = s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
            t = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", t)
            t = re.sub(r"`([^`]+)`", r"<font face='Courier'>\1</font>", t)
            elements.append(Paragraph(t, styles["DocBody"]))
    if code:
        elements.append(Paragraph("<br/>".join(code), styles["DocCode"]))
    doc.build(elements)
    print("OK", out)

if __name__ == "__main__":
    main()
