import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Endpoint de DEBUG LOCAL de anuncios (devcon). Devuelve la config que el
// devcon escribe en test/website/debug/local-logs/ads_debug.json para forzar
// anuncios en desarrollo. SOLO responde en dev; en producción devuelve vacío.
// (No es un endpoint de producción; el sistema de ads real usa GA4/AdSense.)

export async function GET(_request: NextRequest) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ enabled: false });
  }
  try {
    // projects/ciszu/website -> projects/ciszu -> projects -> E:\Ciszu Network
    const debugFile = path.resolve(
      process.cwd(), "..", "..", "..", "test", "website", "debug", "local-logs", "ads_debug.json"
    );
    if (!fs.existsSync(debugFile)) return NextResponse.json({ enabled: false });
    const raw = fs.readFileSync(debugFile, "utf8");
    return NextResponse.json(JSON.parse(raw));
  } catch {
    return NextResponse.json({ enabled: false });
  }
}