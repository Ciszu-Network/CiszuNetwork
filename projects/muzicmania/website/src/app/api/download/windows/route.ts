import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const APP_VERSION = '2.0.1';
const INSTALLER_VERSION = '2.1.3';

const AVAILABLE: Record<string, string[]> = {
  w10: ['x64'],
  w11: ['x64'],
};

const OS_VERSION_MAP: Record<string, string> = {
  w10: 'Windows10',
  w11: 'Windows11',
};

const OS_LABEL: Record<string, string> = {
  w10: 'Windows 10',
  w11: 'Windows 11',
};

const EXT_MAP: Record<string, string> = {
  w10: 'exe',
  w11: 'exe',
};

function buildFilename(os: string, arch: string) {
  const osVer = OS_VERSION_MAP[os];
  const ext = EXT_MAP[os];
  return `MuzicMania(v${APP_VERSION})_InstallerSetup(v${INSTALLER_VERSION})_${osVer}_x64.${ext}`;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const os = searchParams.get('os') || 'w10';
    const arch = searchParams.get('arch') || 'x64';

    const osVer = OS_VERSION_MAP[os];
    const ext = EXT_MAP[os];

    if (!osVer || !ext) {
      return NextResponse.json({ error: 'Parámetros no válidos' }, { status: 400 });
    }

    if (!AVAILABLE[os]?.includes(arch)) {
      const osName = OS_LABEL[os] || os;
      return NextResponse.json({
        error: `El instalador para ${osName} (x64) aún no ha sido compilado.`,
        available: AVAILABLE,
      }, { status: 404 });
    }

    const filename = buildFilename(os, arch);
    const publicPath = path.join(process.cwd(), 'public', 'downloads', filename);

    if (fs.existsSync(publicPath)) {
      const fileBuffer = fs.readFileSync(publicPath);
      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Content-Type': 'application/octet-stream',
        },
      });
    }

    // Fallback a build local de Tauri
    const possibleDirs = [
      path.join(process.cwd(), 'src-tauri', 'target', 'x86_64-pc-windows-msvc', 'release', 'bundle', 'nsis'),
      path.join(process.cwd(), 'src-tauri', 'target', 'release', 'bundle', 'nsis'),
    ];
    let installerFile: string | null = null;
    for (const bundleDir of possibleDirs) {
      if (fs.existsSync(bundleDir)) {
        installerFile = fs.readdirSync(bundleDir).find(f => f.endsWith(`.${ext}`)) || null;
        if (installerFile) {
          const fileBuffer = fs.readFileSync(path.join(bundleDir, installerFile));
          return new NextResponse(fileBuffer, {
            headers: {
              'Content-Disposition': `attachment; filename="${filename}"`,
              'Content-Type': 'application/octet-stream',
            },
          });
        }
      }
    }

    return NextResponse.json({
      error: 'Instalador no disponible. Compila con pnpm tauri:build o añade el archivo en public/downloads/',
      available: AVAILABLE,
    }, { status: 404 });
  } catch (error) {
    return NextResponse.json({ error: 'No se pudo procesar la descarga' }, { status: 500 });
  }
}
