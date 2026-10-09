export interface SmsResult {
  sent: boolean;
  error?: string;
}

export function smsConfigured(): boolean {
  return Boolean(process.env.SMS_API_URL && process.env.SMS_API_KEY && process.env.SMS_FROM);
}

export async function sendSms({ to, text }: { to: string; text: string }): Promise<SmsResult> {
  if (!smsConfigured()) {
    return { sent: false, error: 'SMS no configurado (SMS_API_URL/SMS_API_KEY/SMS_FROM).' };
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
