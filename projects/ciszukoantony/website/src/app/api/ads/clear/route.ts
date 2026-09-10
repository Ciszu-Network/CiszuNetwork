import { NextRequest, NextResponse } from "next/server";

export async function POST(_request: NextRequest) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ ok: false });
  }
  return NextResponse.json({ ok: true });
}
