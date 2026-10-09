export interface SmsResult {
  sent: boolean;
  error?: string;
}

/**
 * Proveedores soportados:
 * - `textbelt`: gratuito (1 SMS/día con la key "textbelt"; key de pago para más).
 * - genérico: cualquier API HTTP tipo Twilio-compatible vía SMS_API_URL/SMS_API_KEY/SMS_FROM.
 */
export function smsConfigured(): boolean {
  const provider = (process.env.SMS_PROVIDER || '').toLowerCase();
  if (provider === 'textbelt') return true;
  return Boolean(process.env.SMS_API_URL && process.env.SMS_API_KEY && process.env.SMS_FROM);
}

export async function sendSms({ to, text }: { to: string; text: string }): Promise<SmsResult> {
  const provider = (process.env.SMS_PROVIDER || '').toLowerCase();

  if (provider === 'textbelt') {
    try {
      const res = await fetch('https://textbelt.com/text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ phone: to, message: text, key: process.env.SMS_API_KEY || 'textbelt' }),
        signal: AbortSignal.timeout(10_000),
      });
      const json = (await res.json().catch(() => ({}))) as { success?: boolean; error?: string };
      if (!res.ok || json.success !== true) {
        return { sent: false, error: json.error || `Textbelt: HTTP ${res.status}` };
      }
      return { sent: true };
    } catch (e) {
      return { sent: false, error: e instanceof Error ? e.message : 'Error enviando SMS (Textbelt).' };
    }
  }

  if (!smsConfigured()) {
    return { sent: false, error: 'SMS no configurado (SMS_PROVIDER=textbelt o SMS_API_URL/SMS_API_KEY/SMS_FROM).' };
  }
  try {
    const res = await fetch(process.env.SMS_API_URL as string, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.SMS_API_KEY}`,
      },
      body: JSON.stringify({ to, from: process.env.SMS_FROM, text }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) return { sent: false, error: `Proveedor SMS: HTTP ${res.status}` };
    return { sent: true };
  } catch (e) {
    return { sent: false, error: e instanceof Error ? e.message : 'Error enviando SMS.' };
  }
}
