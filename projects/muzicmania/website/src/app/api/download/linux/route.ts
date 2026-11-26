import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import registryData from '@/data/downloads-registry.json';

const FORMATS = new Set(['appimage', 'deb', 'rpm']);

interface RegistryEntry {
  launcherVersion: string;
  gameVersion: string;
  channel: string;
  os: string;
  arch: string;
  format?: string;
  fileName: string;
  path: string;
  releaseTag?: string;
  remoteFileName?: string;
}

function readRegistry(): RegistryEntry[] {
  return Array.isArray(registryData) ? (registryData as RegistryEntry[]) : [];
}

function selectEntry(entries: RegistryEntry[], format: string, version?: string, channel?: string) {
  const exact = entries.filter((entry) => {
    if (entry.os !== 'linux' || entry.arch !== 'x64' || entry.format !== format) return false;
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
    const arch = searchParams.get('arch') || 'x64';
    const format = (searchParams.get('format') || 'appimage').toLowerCase();
    const version = searchParams.get('version') || undefined;
    const channel = searchParams.get('channel') || undefined;

    if (arch !== 'x64' || !FORMATS.has(format)) {
      return NextResponse.json({
        error: `El instalador Linux (${arch}, ${format}) aún no ha sido compilado.`,
      }, { status: 404 });
    }

    const entry = selectEntry(readRegistry(), format, version, channel);
    if (!entry) {
      return NextResponse.json({
        error: `Todavía no hay un instalador Linux (${format}) publicado.`,
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

    return NextResponse.json({ error: 'El instalador Linux no está disponible.' }, { status: 404 });
  } catch {
    return NextResponse.json({ error: 'No se pudo procesar la descarga Linux' }, { status: 500 });
  }
}
