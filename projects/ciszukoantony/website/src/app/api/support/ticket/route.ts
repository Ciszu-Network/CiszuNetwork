import { processSupport } from '@ciszunetwork/utils/support-server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  return processSupport(request, 'ciszukoantony');
}
