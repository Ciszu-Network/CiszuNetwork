import { createClient } from '@supabase/supabase-js';
import {
  createTwoFactorService,
  sendBrandedEmail,
  twoFactorEmail,
  type TwoFactorMailer,
  type TwoFactorRecord,
  type TwoFactorStore,
} from '@ciszunetwork/utils';

/**
 * Infraestructura del 2FA de Ciszuko Antony.
 *
 * El código es ÚNICO POR WEBSITE: `website` forma parte de la clave, así que un
 * código emitido aquí no vale en otra web del ecosistema.
 */

export const SITE = 'ciszukoantony';

export const SITE_NAME = 'Ciszuko Antony';

/**
 * Vista mínima del cliente que usamos aquí.
 *
 * Se declara a mano en vez de usar los tipos generados del proyecto porque
 * `two_factor_codes` y `two_factor_settings` viven en el schema `public`,
 * que no está en el `Database` generado de las webs: con los tipos estrictos,
 * cada `.from(...)` resolvía a `never` y el archivo no compilaba.
 */
interface DbResult {
  data: unknown;
  error: { message: string } | null;
}

interface DbQuery extends PromiseLike<DbResult> {
  select(columns?: string): DbQuery;
  insert(values: Record<string, unknown>): DbQuery;
  update(values: Record<string, unknown>): DbQuery;
  upsert(values: Record<string, unknown>, options?: Record<string, unknown>): DbQuery;
  eq(column: string, value: unknown): DbQuery;
  order(column: string, options?: Record<string, unknown>): DbQuery;
  limit(count: number): DbQuery;
  single(): Promise<DbResult>;
  maybeSingle(): Promise<DbResult>;
}

interface Db {
  from(table: string): DbQuery;
  auth: { getUser(token: string): Promise<{ data: { user: { id: string; email?: string } | null }; error: { message: string } | null }> };
}

/** Cliente admin (service_role). Bajo demanda para no romper `next build`. */
export function adminClient(): Db {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('Supabase admin no configurado (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)');
  }
  return createClient(url, key) as unknown as Db;
}

const str = (value: unknown): string => (typeof value === 'string' ? value : '');
const num = (value: unknown): number => (typeof value === 'number' && Number.isFinite(value) ? value : 0);
const bool = (value: unknown): boolean => value === true;
const ts = (value: unknown, fallback: number): number => {
  const parsed = typeof value === 'string' ? Date.parse(value) : NaN;
  return Number.isFinite(parsed) ? parsed : fallback;
};

function toRecord(raw: unknown): TwoFactorRecord {
  const row = (raw ?? {}) as Record<string, unknown>;
  const createdAt = ts(row.created_at, Date.now());
  return {
    id: str(row.id),
    code: str(row.code),
    createdAt,
    used: bool(row.used),
    attempts: num(row.attempts),
    resends: num(row.resends),
    lastSentAt: ts(row.last_sent_at, createdAt),
    suspendedUntil: row.suspended_until ? ts(row.suspended_until, 0) : 0,
  };
}

function createStore(client: Db): TwoFactorStore {
  const table = 'two_factor_codes';
  return {
    async findLatest(userId, site) {
      const { data, error } = await client
        .from(table)
        .select('id, code, created_at, used, attempts, resends, last_sent_at, suspended_until')
        .eq('user_id', userId)
        .eq('website', site)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data ? toRecord(data) : null;
    },

    async create(input) {
      const { data, error } = await client
        .from(table)
        .insert({
          user_id: input.userId,
          website: input.site,
          code: input.code,
          expires_at: new Date(input.expiresAt).toISOString(),
          resends: input.resends,
          last_sent_at: new Date(input.sentAt).toISOString(),
          attempts: 0,
          used: false,
        })
        .select('id, code, created_at, used, attempts, resends, last_sent_at, suspended_until')
        .single();
      if (error) throw error;
      return toRecord(data);
    },

    async incrementAttempts(id) {
      const { data, error } = await client.from(table).select('attempts').eq('id', id).single();
      if (error) throw error;
      const next = num((data as Record<string, unknown> | null)?.attempts) + 1;
      const { error: updateError } = await client.from(table).update({ attempts: next }).eq('id', id);
      if (updateError) throw updateError;
      return next;
    },

    async markUsed(id) {
      await client.from(table).update({ used: true }).eq('id', id);
    },

    async suspend(id, until) {
      await client
        .from(table)
        .update({ suspended_until: new Date(until).toISOString() })
        .eq('id', id);
    },

    async clearSuspension(id) {
      await client.from(table).update({ suspended_until: null }).eq('id', id);
    },
  };
}

/** Envía el código con la plantilla con marca (remitente "Ciszu Network | …"). */
function createMailer(): TwoFactorMailer {
  return {
    async send({ to, code, siteName, expiresAt }) {
      const minutes = Math.max(1, Math.round((expiresAt - Date.now()) / 60000));
      const mail = twoFactorEmail({ siteName, code, expiresInMinutes: minutes, maxAttempts: 3 });
      const result = await sendBrandedEmail({
        to,
        subject: mail.subject,
        html: mail.html,
        text: mail.text,
      });
      return { sent: result.sent, error: result.error, previewOnly: result.previewOnly };
    },
  };
}

export function twoFactorService(client: Db = adminClient()) {
  return createTwoFactorService({
    site: SITE,
    siteName: SITE_NAME,
    store: createStore(client),
    mailer: createMailer(),
  });
}

export interface AuthedUser {
  userId: string;
  email: string;
  token: string;
}

/**
 * Valida el Bearer token y devuelve el usuario.
 * Devuelve `null` si no hay sesión válida (la ruta responde 401).
 */
export async function authenticate(request: Request): Promise<AuthedUser | null> {
  const header = request.headers.get('authorization');
  if (!header?.startsWith('Bearer ')) return null;
  const token = header.slice('Bearer '.length).trim();
  if (!token) return null;

  const { data, error } = await adminClient().auth.getUser(token);
  if (error || !data.user) return null;

  return { userId: data.user.id, email: data.user.email ?? '', token };
}

/** ¿El usuario tiene el 2FA activo en ESTA web? */
export async function isTwoFactorEnabled(userId: string): Promise<boolean> {
  const { data, error } = await adminClient()
    .from('two_factor_settings')
    .select('enabled')
    .eq('user_id', userId)
    .eq('website', SITE)
    .maybeSingle();
  if (error) throw error;
  return bool((data as Record<string, unknown> | null)?.enabled);
}

export async function setTwoFactorEnabled(userId: string, enabled: boolean): Promise<void> {
  const { error } = await adminClient()
    .from('two_factor_settings')
    .upsert(
      { user_id: userId, website: SITE, enabled, updated_at: new Date().toISOString() },
      { onConflict: 'user_id,website' },
    );
  if (error) throw error;
}
