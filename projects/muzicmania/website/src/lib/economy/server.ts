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
  const [profileResult, credentialsResult] = await Promise.all([
    admin.schema('muzicmania').from('profiles').select('email_verified').eq('id', userId).maybeSingle(),
    admin.schema('muzicmania').from('purchase_credentials')
      .select('birth_date,purchase_terms_version,purchase_terms_accepted_at')
      .eq('user_id', userId).maybeSingle(),
  ]);
  if (profileResult.error) throw new Error(profileResult.error.message);
  if (credentialsResult.error) throw new Error(credentialsResult.error.message);
  const profile = profileResult.data;
  const credentials = credentialsResult.data;
  const birthDate = typeof credentials?.birth_date === 'string' ? credentials.birth_date : null;
  return {
    birthDate,
    isAdult: Boolean(birthDate && isAdultBirthDate(birthDate)),
    emailVerified: profile?.email_verified === true,
    termsVersion: credentials?.purchase_terms_version ?? null,
    termsAccepted: Boolean(credentials?.purchase_terms_accepted_at),
  };
}

export function jsonError(message: string, status: number) {
  return { error: message, status };
}
