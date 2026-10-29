import { processContact } from '@ciszunetwork/utils/support-server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  return processContact(request, 'ciszunetwork');
}
