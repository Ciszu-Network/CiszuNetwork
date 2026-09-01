import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Endpoint de DEBUG LOCAL de disclaimers (devcon). Devuelve la config que el
// devcon escribe en test/website/debug/local-logs/disclaimers_debug.json para
// forzar disclaimers en desarrollo. SOLO responde en dev.
export async function GET(_request: NextRequest) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ items: [] });
  }
  try {
    // projects/ciszu/website -> projects/ciszu -> projects -> E:\Ciszu Network
    const debugFile = path.resolve(
      process.cwd(), "..", "..", "..", "test", "website", "debug", "local-logs", "disclaimers_debug.json"
    );
    if (!fs.existsSync(debugFile)) return NextResponse.json({ items: [] });
    const raw = fs.readFileSync(debugFile, "utf8");
    return NextResponse.json(JSON.parse(raw));
  } catch {
    return NextResponse.json({ items: [] });
  }
}