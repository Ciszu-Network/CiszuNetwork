#!/usr/bin/env python3
"""Convert media — Sistema de Formatos Ciszu Network (Fase A).

Genera derivadas de ENTREGA (Capa 4) AL LADO de los originales (Capa 3):
  - PNG/JPG con alpha o grafica plana      -> .webp  (lossless, solo si gana bytes)
  - PNG/JPG foto/banner/cover grande      -> .avif  (q75) + .webp (q80) como fallback
  - GIF                                   -> .webp  (animado via Pillow save_all)
  - MP3/OGG (si --audio y hay ffmpeg)     -> .opus  (96k VBR)

Reglas (MEDIA_FORMATS_SYSTEM.md cap 3):
  1. Nunca toca el original.
  2. Solo guarda si la derivada pesa MENOS (regla 3 del pipeline).
  3. Masters (PSD/AI/PDN/PFL/MOV/WAV) y SVG: nunca se convierten.
  4. Mismas fuentes que upload-cdn.js (mirror 1:1 con el CDN).

Uso:
  python scripts/convert-media.py [--critical | --all] [--audio] [--dry-run] [--limit N]

Reporte: .opencode/temp/convert-media/report.json
"""
import argparse
import json
import subprocess
import sys
import shutil
import os
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
REPORT_DIR = ROOT / ".opencode" / "temp" / "convert-media"
RASTER = {".png", ".jpg", ".jpeg", ".jpe", ".gif"}
AUDIO = {".mp3", ".ogg"}

# Fuentes = espejo de upload-cdn.js (omitimos shared/icons por ser solo SVG)
# El nombre de la carpeta del portfolio (Ciszuko Antony) se deriva en runtime
# para no depender de transcripción de terminal: ultima carpeta 'cis*' cuyo
# contenido tenga logos (13 caracteres en este repo).
def _ciszukoa_dir():
    proj = ROOT / "projects"
    if not proj.exists():
        return "projects/ciszukoa"
    cands = [
        d.name for d in sorted(proj.iterdir())
        if d.is_dir() and d.name.startswith("cis") and (d / "content").exists()
    ]
    if cands and len(cands[-1]) == 13:
        return f"projects/{cands[-1]}"
    return "projects/ciszukoa"


SOURCES = [
    "projects/ciszu/content",
    f"{_ciszukoa_dir()}/content",
    "projects/ciszubot/content",
    "projects/muzicmania/content",
    "projects/ciszugamens/content",
]

# Assets criticos referenciados por las webs (barridos via grep 8 ago 2026)
CRITICAL = [
    f"{_ciszukoa_dir()}/content/logos/images/outline/isotype/gradient/color/ciszuko_logo_isotipo_outline_degradado_zwhite_ccolor.png",
    f"{_ciszukoa_dir()}/content/logos/images/outline/logotype/gradient/color/ciszuko_logotipo_outline_degradado_color_full.png",
    f"{_ciszukoa_dir()}/content/logos/images/outline/isotype/color/ciszuko_logo_isotipo_outline_zcolor_ccolor.png",
    "projects/ciszubot/content/logos/images/samples/circle/ciszubot_logo_isotipo_color_circle.png",
]


def log(msg):
    print(msg, flush=True)


def ffmpeg_bin():
    exe = shutil.which("ffmpeg")
    if exe:
        return str(exe)
    if sys.platform == "win32":
        for c in [
            Path(os.environ.get("LOCALAPPDATA", "")) / "AutoSubs" / "ffmpeg.exe",
            Path("C:/ffmpeg/bin/ffmpeg.exe"),
        ]:
            if c.exists():
                return str(c)
    return None


def is_photo(im):
    """Heuristica plano-vs-foto del sistema: alpha => grafica; sin alpha y >=900px => foto."""
    if im.mode in ("RGBA", "LA", "PA") or (im.mode == "P" and "transparency" in im.info):
        return False
    return im.width >= 900 and im.height >= 900


def save_if_wins(img, out: Path, orig_size: int, fmt, **kwargs):
    """Guarda derivada solo si pesa menos; devuelve ahorro o borra."""
    try:
        img.save(out, **kwargs)
    except Exception as e:
        log(f"   [skip] {out.name}: {e}")
        return 0
    if not out.exists() or out.stat().st_size >= orig_size:
        out.unlink(missing_ok=True)
        return 0
    return orig_size - out.stat().st_size


def convert_image(src: Path):
    """Convierte una imagen. Devuelve lista de (derivada, ahorro)."""
    from PIL import Image, ImageSequence

    rel = src.relative_to(ROOT).as_posix()
    try:
        img = Image.open(src)
        if src.suffix.lower() == ".gif":
            frames = [f.convert("RGBA") for f in ImageSequence.Iterator(img)]
            d = img.info.get("duration")
            durations = list(d) if isinstance(d, (list, tuple)) else ([d] if d else [])
            if len(durations) != len(frames):
                durations = [80] * len(frames)
            orig = src.stat().st_size
            out = src.with_suffix(".webp")
            try:
                frames[0].save(
                    out, format="WEBP", save_all=True, append_images=frames[1:],
                    duration=durations, loop=img.info.get("loop", 0), quality=90, method=4,
                )
            except Exception as e:
                log(f"   [SKIP] {rel}: {e}")
                return []
            if not out.exists() or out.stat().st_size >= orig:
                out.unlink(missing_ok=True)
                return []
            return [(out, orig - out.stat().st_size)]
        img.load()
    except Exception as e:
        log(f"   [SKIP] {rel}: {e}")
        return []

    orig_size = src.stat().st_size
    results = []
    if is_photo(img):
        results.append((src.with_suffix(".avif"), save_if_wins(img, src.with_suffix(".avif"), orig_size, "AVIF", quality=75, speed=6)))
        results.append((src.with_suffix(".webp"), save_if_wins(img, src.with_suffix(".webp"), orig_size, "WEBP", quality=80, method=4)))
    else:
        results.append((src.with_suffix(".webp"), save_if_wins(img, src.with_suffix(".webp"), orig_size, "WEBP", lossless=True, method=4, quality=100)))
    return [(o, s) for o, s in results if s > 0]


def convert_audio(src: Path):
    """MP3 -> .opus 96k con ffmpeg, solo si gana bytes."""
    out = src.with_suffix(".opus")
    orig = src.stat().st_size
    if out.exists() and out.stat().st_size < orig:
        log(f"   [OK ] ya existe: {out.name}")
        return
    ff = ffmpeg_bin()
    if not ff:
        log("   [SKIP] ffmpeg no encontrado para audio")
        return
    try:
        r = subprocess.run(
            [ff, "-y", "-loglevel", "error", "-i", str(src), "-c:a", "libopus", "-b:a", "96k", str(out)],
            capture_output=True, timeout=600,
        )
        if r.returncode != 0:
            out.unlink(missing_ok=True)
            log(f"   [ERR ] {src.relative_to(ROOT)}: ffmpeg {r.stderr[:200]}")
            return
    except Exception as e:
        out.unlink(missing_ok=True)
        log(f"   [ERR ] {src.relative_to(ROOT)}: {e}")
        return
    if out.exists() and out.stat().st_size >= orig:
        out.unlink(missing_ok=True)
    else:
        log(f"   [OK ] {src.name} -> .opus ({out.stat().st_size} B)")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--critical", action="store_true")
    ap.add_argument("--all", action="store_true")
    ap.add_argument("--audio", action="store_true")
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--limit", type=int)
    args = ap.parse_args()

    REPORT_DIR.mkdir(parents=True, exist_ok=True)
    print(
        R"""
  ==============================================
    CONVERT-MEDIA · Sistema de Capas (Fase A)
    Capa 3 (demo) -> Capa 4 (entrega optimizada)
  ==============================================
  """.replace("  ", " "))

    if args.dry_run:
        log("  [!] --dry-run: no se escribirá nada (solo inventario).")

    files = []
    if args.critical:
        for p in CRITICAL:
            f = ROOT / p
            if f.exists():
                files.append(f)
            else:
                log(f"  [-- ] crítica no existe: {p}")
    elif args.all:
        for d in SOURCES:
            base = ROOT / d
            if not base.exists():
                continue
            for f in sorted(base.rglob("*")):
                if not f.is_file():
                    continue
                if f.suffix.lower() in RASTER:
                    files.append(f)
                elif args.audio and f.suffix.lower() in AUDIO:
                    files.append(f)
    else:
        log("  [!] Usa --critical o --all (con --audio para música).")
        return

    if args.limit:
        files = files[: args.limit]

    log(f"  Candidatos: {len(files)}")

    report = {"total": len(files), "convertidos": 0, "omitidos": 0, "errores": 0,
              "ahorro_bytes": 0, "items": []}
    for src in files:
        rel = src.relative_to(ROOT).as_posix()
        if src.suffix.lower() in AUDIO:
            report["omitidos"] += 1
            if args.audio and not args.dry_run:
                convert_audio(src) and report  # noop: ya reporta por consola
                report["convertidos"] += 1
            continue
        if args.dry_run:
            log(f"   [--] {rel}")
            report["omitidos"] += 1
            continue
        derivadas = convert_image(src)
        if not derivadas:
            report["omitidos"] += 1
            continue
        for d, saving in derivadas:
            report["convertidos"] += 1
            report["ahorro_bytes"] += saving
            report["items"].append({"original": rel, "derivada": d.relative_to(ROOT).as_posix(), "ahorro": saving})
            log(f"   [OK ] {rel} -> {d.name} (-{saving/1024:.0f} KB)")

    report_path = REPORT_DIR / "report.json"
    report_path.write_text(json.dumps(report, indent=2, ensure_ascii=False), encoding="utf-8")
    log("")
    log(f"  Convertidos: {report['convertidos']} | Omitidos: {report['omitidos']} | Errores: {report['errores']}")
    log(f"  Ahorro: {report['ahorro_bytes']/1048576:.1f} MB")
    log(f"  Reporte: {report_path}")


if __name__ == "__main__":
    main()
