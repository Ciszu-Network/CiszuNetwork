import type { DebugFeature, DebugSite } from '../debug/types';

const VALID_SITES = new Set(['ciszu', 'ciszukoantony', 'muzicmania', 'ciszubot', '*']);

function cleanFeatures(raw: unknown): Record<DebugFeature, boolean> {
  const value = (raw ?? {}) as Record<string, unknown>;
  return {
    placeholders: value.placeholders === true,
    simulatedAnalytics: value.simulatedAnalytics === true,
    officialEditor: value.officialEditor === true,
    cheats: value.cheats === true,
  };
}

export async function listDebugWhitelist(admin: any) {
  const [staff, whitelist] = await Promise.all([
    admin.schema('public').from('debug_staff_view').select('staff_id,nombre,correo,cargo,nivel,estado').eq('estado', 'activo').order('nivel', { ascending: true }),
    admin.schema('public').from('debug_whitelist_view').select('staff_id,site,role,features,enabled,notes,updated_at').order('staff_id', { ascending: true }),
  ]);
  if (staff.error) throw new Error(staff.error.message);
  if (whitelist.error) throw new Error(whitelist.error.message);
  return { staff: staff.data ?? [], whitelist: whitelist.data ?? [] };
}

export async function upsertDebugWhitelist(
  admin: any,
  actor: string,
  input: { staff_id?: string; site?: string; role?: string; features?: unknown; enabled?: boolean; notes?: string },
) {
  const staffId = String(input.staff_id ?? '').trim();
  const site = String(input.site ?? '*').trim();
  if (!/^CZ-\d{3,}$/i.test(staffId)) throw new Error('invalid_staff_id');
  if (!VALID_SITES.has(site)) throw new Error('invalid_site');
  const role = input.role === 'owner' || input.role === 'admin' ? input.role : 'beta';
  const { data: staff, error: staffError } = await admin
    .schema('public')
    .from('debug_staff_view')
    .select('staff_id,correo')
    .eq('staff_id', staffId)
    .maybeSingle();
  if (staffError) throw new Error(staffError.message);
  if (!staff) throw new Error('staff_not_found');

  const features = cleanFeatures(input.features);
  const { data, error } = await admin.schema('public').rpc('debug_whitelist_upsert', {
    p_staff_id: staffId,
    p_site: site,
    p_role: role,
    p_features: features,
    p_enabled: input.enabled !== false,
    p_notes: input.notes ?? null,
    p_actor: actor,
  });
  if (error) throw new Error(error.message);
  return data;
}

export async function removeDebugWhitelist(admin: any, staffId: string, site: string) {
  if (!/^CZ-\d{3,}$/i.test(staffId)) throw new Error('invalid_staff_id');
  if (!VALID_SITES.has(site)) throw new Error('invalid_site');
  const { data, error } = await admin.schema('public').rpc('debug_whitelist_remove', { p_staff_id: staffId, p_site: site });
  if (error) throw new Error(error.message);
  return data ?? { success: true };
}
