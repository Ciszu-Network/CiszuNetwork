import { NextRequest, NextResponse } from "next/server";
import { createRateLimiter, parseJsonBody } from "@ciszunetwork/utils";
import { z } from "zod";
import { supabase } from "@/config/supabase";

// Registro de impresiones de anuncios del ecosistema (telemetría del sistema ADS).
// Lo llama Ads.tsx (paquete @ciszu/ui) desde cualquier web tras mostrar un anuncio.
// El RLS permite INSERT a anon/authenticated; la lectura solo a service_role.

const limiter = createRateLimiter({ windowMs: 60_000, max: 60 });

const impressionSchema = z.object({
  site: z.string().min(1).max(40),
  ad_id: z.string().min(1).max(80),
  ad_type: z.string().min(1).max(20),
  ad_source: z.string().min(1).max(40).default("external"),
  user_id: z.string().uuid().nullable().optional(),
});

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const rl = limiter.allow(ip);
  if (!rl.allowed) {
    return NextResponse.json({ success: false, error: "rate_limited" }, { status: 429 });
  }

  const parsed = await parseJsonBody(request, impressionSchema);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: "invalid_payload" }, { status: 400 });
  }

  const { error } = await supabase.from("ads_impressions").insert({
    site: parsed.data.site,
    ad_id: parsed.data.ad_id,
    ad_type: parsed.data.ad_type,
    ad_source: parsed.data.ad_source,
    user_id: parsed.data.user_id ?? null,
  });

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}