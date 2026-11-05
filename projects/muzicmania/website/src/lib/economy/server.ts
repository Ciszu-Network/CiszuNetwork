import { isAdultBirthDate } from './format';

export interface PaymentFlags {
  crypto: boolean;
  card: boolean;
  paypal: boolean;
}

export function readPaymentFlags(env: NodeJS.ProcessEnv = process.env): PaymentFlags {
  return {
    crypto: env.PAYMENTS_CRYPTO_ENABLED === 'true',
    card: env.PAYMENTS_CARD_ENABLED === 'true',
    paypal: env.PAYMENTS_PAYPAL_ENABLED === 'true',
  };
}

export function assertAdultProfile(profile: { birth_date?: string | null }): true {
  if (!profile.birth_date || !isAdultBirthDate(profile.birth_date)) {
    throw new Error('adult_required');
  }
  return true;
}

export async function adultStatus(admin: any, userId: string) {
  const { data, error } = await admin.schema('muzicmania').from('profiles').select('birth_date,email_verified,purchase_terms_version,purchase_terms_accepted_at,adult_confirmed_at').eq('id', userId).maybeSingle();
  if (error) throw new Error(error.message);
  const birthDate = typeof data?.birth_date === 'string' ? data.birth_date : null;
  return {
    birthDate,
    isAdult: Boolean(birthDate && isAdultBirthDate(birthDate)),
    emailVerified: data?.email_verified === true,
    termsVersion: data?.purchase_terms_version ?? null,
    termsAccepted: Boolean(data?.purchase_terms_accepted_at),
  };
}

export function jsonError(message: string, status: number) {
  return { error: message, status };
}
