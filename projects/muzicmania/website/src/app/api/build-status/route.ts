import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
  'Access-Control-Allow-Headers': '*',
};

export async function OPTIONS() {
  return new NextResponse(null, { headers: corsHeaders });
}

export async function GET() {
  try {
    const projectRoot = process.cwd();
    const targetPath = path.join(projectRoot, 'src-tauri', 'target');
    const hasTarget = fs.existsSync(targetPath);

    let hasMsi = false;
    let hasExe = false;

    const msiPath = path.join(projectRoot, 'src-tauri', 'target', 'release', 'bundle', 'msi');
    const nsisPath = path.join(projectRoot, 'src-tauri', 'target', 'release', 'bundle', 'nsis');

    if (fs.existsSync(msiPath)) {
      const files = fs.readdirSync(msiPath);
      hasMsi = files.some(file => file.endsWith('.msi'));
    }

    if (fs.existsSync(nsisPath)) {
      const files = fs.readdirSync(nsisPath);
      hasExe = files.some(file => file.endsWith('.exe'));
    }

    return NextResponse.json({
      compiled: hasTarget && (hasMsi || hasExe),
      hasTarget,
      hasMsi,
      hasExe
    }, { headers: corsHeaders });
  } catch (error) {
    return NextResponse.json({ compiled: false, error: String(error) }, { status: 500, headers: corsHeaders });
  }
}
