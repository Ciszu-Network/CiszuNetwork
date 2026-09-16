import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

/**
 * /api/changelogs/debug — changelogs locales (devcon).
 *
 * En modo LOCAL el devcon escribe `test/website/debug/local-logs/changelogs_debug.json`
 * (vía `node scripts/changelogs.js create --local ...`). Esta ruta lo expone solo en
 * desarrollo para previsualizar las entradas antes de publicarlas a la nube.
 *
 * GET  ?site=ciszu  → { enabled, entries } filtradas por web (respeta kill switch)
 * POST { slug, site } → marca la entrega local (fallback "pendiente hasta su creación")
 *
 * En producción devuelve vacío: los changelogs en vivo salen de Supabase.
 */
function resolveDebugFile(filename: string): string {
  const cwd = process.cwd();
  const candidates = [
    path.resolve(cwd, "..", "..", "..", "test", "website", "debug", "local-logs", filename),
    path.resolve(cwd, "..", "..", "test", "website", "debug", "local-logs", filename),
    path.resolve(cwd, "test", "website", "debug", "local-logs", filename),
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }
  return candidates[0];
}

interface DebugEntry {
  slug?: string;
  target?: string;
  published?: boolean;
  expires_at?: string | null;
  [key: string]: unknown;
}

interface DebugStore {
  enabled?: boolean;
  items?: DebugEntry[];
  deliveries?: Record<string, string[]>;
}

/** Lee el almacén local sin romper ante archivos ausentes o corruptos. */
function readStore(): { enabled: boolean; items: DebugEntry[]; deliveries: Record<string, string[]> } {
  try {
    const file = resolveDebugFile("changelogs_debug.json");
    if (!fs.existsSync(file)) return { enabled: true, items: [], deliveries: {} };
    const raw = fs.readFileSync(file, "utf8").replace(/^\uFEFF/, "");
    const parsed = JSON.parse(raw) as DebugStore;
    return {
      enabled: parsed.enabled !== false,
      items: Array.isArray(parsed.items) ? parsed.items : [],
      deliveries: parsed.deliveries && typeof parsed.deliveries === "object" ? parsed.deliveries : {},
    };
  } catch {
    return { enabled: true, items: [], deliveries: {} };
  }
}

/** ¿La entrada está dirigida a esta web (o a `global`)? */
function targetsSite(entry: DebugEntry, site: string | null): boolean {
  if (!site) return true;
  const target = String(entry.target ?? "global");
  if (target === "global") return true;
  const list = target.split(",").map((s) => s.trim()).filter(Boolean);
  const aliases = site === "ciszu" ? ["ciszu", "ciszunetwork"] : [site];
  return aliases.some((alias) => list.includes(alias));
}

/** ¿Sigue vigente la entrada (no expirada)? */
function isLive(entry: DebugEntry): boolean {
  if (entry.published === false) return false;
  if (entry.expires_at && new Date(String(entry.expires_at)).getTime() <= Date.now()) return false;
  return true;
}

export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ enabled: true, entries: [] });
  }
  const site = request.nextUrl.searchParams.get("site");
  const store = readStore();
  if (!store.enabled) return NextResponse.json({ enabled: false, entries: [] });
  const entries = store.items.filter(isLive).filter((entry) => targetsSite(entry, site));
  return NextResponse.json({ enabled: true, entries });
}

export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ ok: false, reason: "production" }, { status: 200 });
  }
  try {
    const body = (await request.json()) as { slug?: string; site?: string };
    const slug = String(body.slug ?? "").trim();
    const site = String(body.site ?? "").trim();
    if (!slug || !site) return NextResponse.json({ ok: false }, { status: 400 });

    const file = resolveDebugFile("changelogs_debug.json");
    const store = readStore();
    const current = Array.isArray(store.deliveries[slug]) ? store.deliveries[slug] : [];
    if (!current.includes(site)) {
      store.deliveries[slug] = [...current, site];
      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.writeFileSync(
        file,
        JSON.stringify({ ...store, updatedAt: new Date().toISOString() }, null, 2),
        "utf8",
      );
    }
    return NextResponse.json({ ok: true, slug, site });
  } catch {
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
