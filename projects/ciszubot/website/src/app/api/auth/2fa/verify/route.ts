import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Cliente admin bajo demanda: evita ejecutar createClient al importar el módulo,
// que rompía `next build` cuando la env var no está disponible durante el build.
function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('Supabase admin no configurado (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)');
  }
  return createClient(url, key);
}

export async function POST(request: Request) {
  try {
    const supabase = createAdminClient();
    const { userId, website, code } = await request.json();

    if (!userId || !website || !code) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('two_factor_codes')
      .select('*')
      .eq('user_id', userId)
      .eq('website', website)
      .eq('code', code.toUpperCase())
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      return NextResponse.json({ valid: false, error: 'Invalid or expired code' }, { status: 400 });
    }

    await supabase
      .from('two_factor_codes')
      .update({ used: true })
      .eq('id', data.id);

    return NextResponse.json({ valid: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
