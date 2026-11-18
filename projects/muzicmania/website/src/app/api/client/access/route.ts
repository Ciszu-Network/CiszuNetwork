import { NextResponse } from 'next/server';
import manifest from '@/data/releases-manifest.json';

interface Release { launcherVersion: string; status: string; os: string; arch: string; }
interface Block { from: string; to: string; reason: string; message: string; }
interface ManifestShape { minimumSupported: Record<string, string>; blocks: Block[]; releases: Release[]; support: unknown; }
const data = manifest as unknown as ManifestShape;

function parts(value: string) {
  return String(value || '').match(/(\d+)\.(\d+)\.(\d+)/)?.slice(1).map(Number) || [0, 0, 0];
}

function compare(left: string, right: string) {
  const a = parts(left);
  const b = parts(right);
  for (let i = 0; i < 3; i += 1) if (a[i] !== b[i]) return a[i] > b[i] ? 1 : -1;
  return 0;
}

function inRange(version: string, from: string, to: string) {
  return compare(version, from) >= 0 && compare(version, to) <= 0;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const version = searchParams.get('version') || '';
  const channel = searchParams.get('channel') || 'beta';
  const os = searchParams.get('os') || 'windows11';
  const arch = searchParams.get('arch') || 'x64';
  if (!version) return NextResponse.json({ allowed: false, error: 'version_required' }, { status: 400 });

  const floor = data.minimumSupported?.[channel] || data.minimumSupported?.launcher || '0.0.0';
  const block = (data.blocks || []).find((item) => inRange(version, item.from, item.to));
  const supportsFloor = compare(version, floor) >= 0;
  const mandatory = Boolean(block) || !supportsFloor;
  const releases = (data.releases || [])
    .filter((release: Release) => release.os === os && release.arch === arch)
    .filter((release: Release) => release.status === 'supported')
    .filter((release: Release) => compare(release.launcherVersion, version) > 0)
    .sort((a: Release, b: Release) => compare(a.launcherVersion, b.launcherVersion));
  const nearest = releases[0] || null;
  const latestSafe = releases[releases.length - 1] || null;

  return NextResponse.json({
    allowed: !mandatory,
    mandatory,
    reason: block?.reason || (supportsFloor ? 'none' : 'support'),
    message: block?.message || (supportsFloor ? '' : 'Esta versión ya no recibe soporte.'),
    minimumSupported: floor,
    nearest,
    latestSafe,
    support: data.support,
  });
}


