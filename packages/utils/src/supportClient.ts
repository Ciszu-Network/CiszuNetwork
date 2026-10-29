export interface ContactFormPayload {
  name: string;
  email: string;
  subject: string;
  message: string;
  website?: string;
}

export interface SupportTicketPayload {
  displayName?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  region?: string;
  contactType?: string;
  phone?: string;
  device?: string;
  category?: string;
  subCategory?: string;
  message: string;
}

export interface SupportResult {
  ok: boolean;
  id?: string;
  error?: string;
  emailSent?: boolean;
}

export async function submitContactForm(payload: ContactFormPayload): Promise<SupportResult> {
  try {
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = (await res.json().catch(() => ({}))) as {
      ok?: boolean;
      id?: string;
      error?: string;
      email_sent?: boolean;
    };
    return { ok: Boolean(res.ok && json.ok), id: json.id, error: json.error, emailSent: json.email_sent };
  } catch {
    return { ok: false, error: 'network_error' };
  }
}

export async function submitSupportTicket(
  payload: SupportTicketPayload,
  token: string,
): Promise<SupportResult> {
  try {
    const res = await fetch('/api/support/ticket', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    const json = (await res.json().catch(() => ({}))) as {
      ok?: boolean;
      id?: string;
      error?: string;
      email_sent?: boolean;
    };
    return { ok: Boolean(res.ok && json.ok), id: json.id, error: json.error, emailSent: json.email_sent };
  } catch {
    return { ok: false, error: 'network_error' };
  }
}
