import type { DebugAccountLink, DebugFeature, DebugSite, DebugStatus } from '../debug/types';

const SITE_SCHEMAS: Record<DebugSite, string> = {
  ciszu: 'ciszunetwork',
  ciszukoantony: 'ciszukoantony',
  muzicmania: 'muzicmania',
  ciszubot: 'ciszubot',
};

const ALL_SITES: DebugSite[] = ['ciszu', 'ciszukoantony', 'muzicmania', 'ciszubot'];

interface DebugStatusOptions {
  admin: any;
  user: { userId: string; email: string };
  site: DebugSite;
  elevationToken: string | null;
  verifyElevation: (userId: string, token: string | null) => boolean;
}

type Row = Record<string, any>;

function featuresOf(row: Row): Record<DebugFeature, boolean> {
  const raw = row.features ?? {};
  return {
    placeholders: raw.placeholders === true,
    simulatedAnalytics: raw.simulatedAnalytics === true,
    officialEditor: raw.officialEditor === true,
    cheats: raw.cheats === true,
  };
}

export async function buildDebugStatus({
  admin,
  user,
  site,
  elevationToken,
  verifyElevation,
}: DebugStatusOptions): Promise<DebugStatus> {
  const [staffByEmail, whitelistByAuth] = await Promise.all([
    admin
      .schema('public')
      .from('debug_staff_view')
      .select('staff_id,nombre,correo,cargo,cargos,nivel,estado')
      .ilike('correo', user.email)
      .eq('estado', 'activo')
      .maybeSingle(),
    admin
      .schema('public')
      .from('debug_whitelist_view')
      .select('*')
      .eq('auth_user_id', user.userId)
      .in('site', [site, '*']),
  ]);

  let staff = staffByEmail.data as Row | null;
  let whitelistRows = (whitelistByAuth.data ?? []) as Row[];
  let whitelist = whitelistRows.find((row) => row.site === site) ?? whitelistRows.find((row) => row.site === '*') ?? null;

  if (!staff && whitelist?.staff_id) {
    const { data } = await admin
      .schema('public')
      .from('debug_staff_view')
      .select('staff_id,nombre,correo,cargo,cargos,nivel,estado')
      .eq('staff_id', whitelist.staff_id)
      .maybeSingle();
    staff = data as Row | null;
  }

  // Whitelist manual por nombre/staff_id: también vale si la fila aún no tiene
  // auth_user_id (la cuenta se vincula por el correo del empleado).
  if (staff && !whitelist) {
    const { data } = await admin
      .schema('public')
      .from('debug_whitelist_view')
      .select('*')
      .eq('staff_id', staff.staff_id)
      .in('site', [site, '*']);
    whitelistRows = (data ?? []) as Row[];
    whitelist = whitelistRows.find((row) => row.site === site) ?? whitelistRows.find((row) => row.site === '*') ?? null;
  }

  const { data: linkRows } = await admin
    .schema('public')
    .from('ciszu_account_links_view')
    .select('site,username,display_name')
    .eq('auth_user_id', user.userId);
  const links = ALL_SITES.map((linkSite): DebugAccountLink => {
    const row = ((linkRows ?? []) as Row[]).find((entry) => entry.site === linkSite);
    return {
      site: linkSite,
      username: row?.username ?? null,
      displayName: row?.display_name ?? null,
      linked: Boolean(row),
      siteUserId: row ? user.userId : null,
    };
  });
  if (!staff) {
    return { authorized: false, reason: 'not_staff', staff: null, features: { placeholders: false, simulatedAnalytics: false, officialEditor: false, cheats: false }, links };
  }

  if (!whitelist) {
    return { authorized: false, reason: 'not_whitelisted', staff: null, features: { placeholders: false, simulatedAnalytics: false, officialEditor: false, cheats: false }, links };
  }

  const debugStaff = {
    staffId: String(staff.staff_id),
    name: String(staff.nombre ?? staff.staff_id),
    role: (whitelist.role === 'owner' || whitelist.role === 'admin' ? whitelist.role : 'beta') as 'owner' | 'admin' | 'beta',
    nivel: Number(staff.nivel ?? 99),
  };

  if (whitelist.enabled === false) {
    return { authorized: false, reason: 'disabled', staff: debugStaff, features: { placeholders: false, simulatedAnalytics: false, officialEditor: false, cheats: false }, links };
  }

  if (!verifyElevation(user.userId, elevationToken)) {
    return { authorized: false, reason: 'elevation_required', staff: debugStaff, features: { placeholders: false, simulatedAnalytics: false, officialEditor: false, cheats: false }, links };
  }

  return {
    authorized: true,
    staff: debugStaff,
    features: featuresOf(whitelist),
    links,
  };
}
