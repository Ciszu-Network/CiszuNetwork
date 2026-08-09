# -*- coding: utf-8 -*-
"""pdf2txt — PDF a TXT con pypdf. Uso: python pdf2txt.py <input.pdf> --out <output.txt>"""
import sys
from pypdf import PdfReader

def main():
    args = sys.argv[1:]
    inp = args[0] if args else None
    out = None
    if "--out" in args:
        out = args[args.index("--out") + 1]
    if not inp or not out:
        print("Uso: python pdf2txt.py <input.pdf> --out <output.txt>"); sys.exit(1)
    reader = PdfReader(inp)
    text = "\n\n".join((page.extract_text() or "") for page in reader.pages)
    with open(out, "w", encoding="utf-8") as f:
        f.write(text)
    print(f"OK {out} ({len(reader.pages)} páginas)")

if __name__ == "__main__":
    main()
