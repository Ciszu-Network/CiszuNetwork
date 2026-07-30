/**
 * @ciszunetwork/supabase — Cliente compartido de Supabase
 *
 * Todos los proyectos del monorepo usan este paquete para conectarse
 * a la base de datos central de Ciszu Network.
 *
 * Uso:
 *   import { supabase } from '@ciszunetwork/supabase'
 *   import { supabaseAdmin } from '@ciszunetwork/supabase/admin'
 *
 * Variables de entorno requeridas:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY
 *   SUPABASE_SERVICE_ROLE_KEY  (solo para admin)
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Faltan variables de entorno: NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})