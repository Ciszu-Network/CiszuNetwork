import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createRateLimiter, parseJsonBody } from "@ciszunetwork/utils";
import { editSessionCookie, verifyEditToken } from "@/lib/edit-auth";

const limiter = createRateLimiter({ windowMs: 60_000, max: 10 });

const loginSchema = z.object({
  token: z.string().min(1).max(200),
});

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const rl = limiter.allow(ip);
  if (!rl.allowed) {
    return NextResponse.json(
      { success: false, error: "Demasiados intentos. Espera un momento." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(rl.resetInMs / 1000)) } }
    );
  }

  const parsed = await parseJsonBody(request, loginSchema);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: "Payload inválido" }, { status: 400 });
  }

  const ok = await verifyEditToken(parsed.data.token);
  if (!ok) {
    return NextResponse.json({ success: false, error: "Token incorrecto" }, { status: 401 });
  }

  const session = await editSessionCookie();
  const response = NextResponse.json({ success: true });
  response.cookies.set("edit_session", session, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24,
  });
  return response;
}