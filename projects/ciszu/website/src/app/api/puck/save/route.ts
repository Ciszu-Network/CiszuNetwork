import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createRateLimiter, parseJsonBody } from "@ciszunetwork/utils";
import { savePuckPage } from "@/lib/puck";

const APP = "ciszunetwork";

const limiter = createRateLimiter({ windowMs: 60_000, max: 20 });

const puckSaveSchema = z.object({
  path: z.string().min(1).max(200),
  data: z.record(z.string(), z.unknown()),
});

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const rl = limiter.allow(ip);
  if (!rl.allowed) {
    return NextResponse.json(
      { success: false, error: "Demasiadas publicaciones. Espera un momento." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(rl.resetInMs / 1000)) } }
    );
  }

  const parsed = await parseJsonBody(request, puckSaveSchema);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: "Payload inválido" }, { status: 400 });
  }

  const { path, data } = parsed.data;
  const normalized = path.startsWith("/") ? path : "/" + path;

  try {
    await savePuckPage(APP, normalized, data);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, error: "Error al guardar" }, { status: 500 });
  }
}
