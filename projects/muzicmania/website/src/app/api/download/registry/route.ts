import { NextResponse } from 'next/server';
import registry from '@/data/downloads-registry.json';

export async function GET() {
  const releases = Array.isArray(registry) ? registry : [];
  return NextResponse.json(releases);
}
