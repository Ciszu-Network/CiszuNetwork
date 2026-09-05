import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

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

export async function GET(_request: NextRequest) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ enabled: false });
  }
  try {
    const pushFile = resolveDebugFile("ads_push.json");
    if (!fs.existsSync(pushFile)) return NextResponse.json({ enabled: false });
    const raw = fs.readFileSync(pushFile, "utf8");
    return NextResponse.json(JSON.parse(raw));
  } catch {
    return NextResponse.json({ enabled: false });
  }
}
