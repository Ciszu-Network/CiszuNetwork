import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import registryData from '@/data/downloads-registry.json';

const OS_VERSION_MAP: Record<string, string> = {
  w10: 'windows10',
  w11: 'windows11',
};

const OS_LABEL: Record<string, string> = {
  w10: 'Windows 10',
  w11: 'Windows 11',
};

interface RegistryEntry {
  launcherVersion: string;
  gameVersion: string;
  channel: string;
  os: string;
  arch: string;
  fileName: string;
  path: string;
  releaseTag?: string;
  remoteFileName?: string;
}

function readRegistry(): RegistryEntry[] {
  return Array.isArray(registryData) ? (registryData as RegistryEntry[]) : [];
}
function selectEntry(entries: RegistryEntry[], os: string, arch: string, version?: string, channel?: string) {
  const exact = entries.filter((entry) => {
    if (entry.os !== os || entry.arch !== arch) return false;
    if (version && entry.launcherVersion !== version) return false;
    if (channel && entry.channel !== channel) return false;
    return true;
  });

  return exact.sort((a, b) => {
    const byVersion = b.launcherVersion.localeCompare(a.launcherVersion, undefined, { numeric: true });
    if (byVersion !== 0) return byVersion;
    if (a.channel !== b.channel) {
      if (a.channel === 'release') return -1;
      if (b.channel === 'release') return 1;
      if (a.channel === 'beta') return -1;
      if (b.channel === 'beta') return 1;
    }
    return 0;
  })[0];
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const os = searchParams.get('os') || 'w10';
    const arch = searchParams.get('arch') || 'x64';
    const version = searchParams.get('version') || undefined;
    const channel = searchParams.get('channel') || undefined;
    const osDir = OS_VERSION_MAP[os];

    if (!osDir || arch !== 'x64') {
      return NextResponse.json({
        error: `El instalador para ${OS_LABEL[os] || os} (${arch}) aún no ha sido compilado.`,
      }, { status: 404 });
    }

    const entry = selectEntry(readRegistry(), osDir, arch, version, channel);
    if (!entry) {
      return NextResponse.json({
        error: `Todavía no hay un instalador publicado para ${OS_LABEL[os]}.`,
      }, { status: 404 });
    }

    const publicPath = path.join(process.cwd(), 'public', 'downloads', entry.path);
    if (fs.existsSync(publicPath)) {
      const fileBuffer = fs.readFileSync(publicPath);
      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Disposition': `attachment; filename="${entry.fileName}"`,
          'Content-Type': 'application/octet-stream',
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }

    if (entry.releaseTag) {
      const releaseUrl = `https://github.com/Ciszu-Network/CiszuNetwork/releases/download/${encodeURIComponent(entry.releaseTag)}/${encodeURIComponent(entry.remoteFileName || entry.fileName)}`;
      return NextResponse.redirect(releaseUrl, 307);
    }

    return NextResponse.json({ error: 'El instalador no está disponible.' }, { status: 404 });
  } catch {
    return NextResponse.json({ error: 'No se pudo procesar la descarga' }, { status: 500 });
  }
}


