import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Endpoint de DEBUG LOCAL (devcon) para PUSH de anuncios forzados.
// Lee test/website/debug/local-logs/ads_push.json que el devcon escribe y
// AdsProvider (@ciszu/ui) consume en desarrollo para mostrar el anuncio YA,
// con aviso "enviado por devcon". SOLO responde en dev.

export async function GET(_request: NextRequest) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ enabled: false });
  }
  try {
    const pushFile = path.resolve(
      process.cwd(), "..", "..", "..", "test", "website", "debug", "local-logs", "ads_push.json"
    );
    if (!fs.existsSync(pushFile)) return NextResponse.json({ enabled: false });
    const raw = fs.readFileSync(pushFile, "utf8");
    return NextResponse.json(JSON.parse(raw));
  } catch {
    return NextResponse.json({ enabled: false });
  }
}
