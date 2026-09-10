import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

function resolvePushFile(): string {
  const cwd = process.cwd();
  const candidates = [
    path.resolve(cwd, "..", "..", "..", "test", "website", "debug", "local-logs", "ads_push.json"),
    path.resolve(cwd, "..", "..", "test", "website", "debug", "local-logs", "ads_push.json"),
    path.resolve(cwd, "test", "website", "debug", "local-logs", "ads_push.json"),
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }
  return candidates[0];
}

export async function GET(_request: NextRequest) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ enabled: false, createdAt: null });
  }
  try {
    const pushFile = resolvePushFile();
    if (!fs.existsSync(pushFile)) return NextResponse.json({ enabled: false, createdAt: null });
    const raw = fs.readFileSync(pushFile, "utf8").replace(/^\uFEFF/, "");
    return NextResponse.json(JSON.parse(raw));
  } catch {
    return NextResponse.json({ enabled: false, createdAt: null });
  }
}
