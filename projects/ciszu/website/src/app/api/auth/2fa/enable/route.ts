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
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { code } = await request.json();
    if (!code) {
      return NextResponse.json({ error: 'Code required' }, { status: 400 });
    }

    // Verify the code
    const { data: codeData, error: codeError } = await supabase
      .from('two_factor_codes')
      .select('*')
      .eq('user_id', user.id)
      .eq('code', code.toUpperCase())
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (codeError || !codeData) {
      return NextResponse.json({ error: 'Invalid or expired code' }, { status: 400 });
    }

    // Mark code as used
    await supabase
      .from('two_factor_codes')
      .update({ used: true })
      .eq('id', codeData.id);

    // Enable 2FA
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ two_factor_enabled: true })
      .eq('id', user.id);

    if (updateError) throw updateError;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
