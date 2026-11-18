import { NextResponse } from 'next/server';
import manifest from '@/data/releases-manifest.json';

export async function GET() {
  const releases = manifest && Array.isArray(manifest.releases) ? manifest.releases : [];
  return NextResponse.json(releases);
}
