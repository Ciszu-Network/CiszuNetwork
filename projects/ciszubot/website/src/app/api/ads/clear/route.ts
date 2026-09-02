import { NextRequest, NextResponse } from "next/server";

// Endpoint de DEBUG LOCAL (devcon). Dispara el evento 'ciszu:ads:clear' para que
// AdsProvider (paquete @ciszu/ui) limpie los anuncios en pantalla al instante.
// SOLO responde en dev; en producción devuelve 404.

export async function POST(_request: NextRequest) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ ok: false, reason: "dev-only" }, { status: 404 });
  }
  return NextResponse.json({ ok: true, event: "ciszu:ads:clear" });
}
