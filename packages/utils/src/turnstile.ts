export type TurnstileVerifyResult =
  | { success: true }
  | { success: false; error: string };

export async function verifyTurnstileToken(
  token: string,
  secretKey: string,
  timeoutMs = 5000,
): Promise<TurnstileVerifyResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret: secretKey, response: token }),
      signal: controller.signal,
    });

    const data = (await res.json()) as {
      success: boolean;
      'error-codes'?: string[];
    };

    if (data.success) {
      return { success: true };
    }

    const codes = Array.isArray(data['error-codes'])
      ? data['error-codes'].join(', ')
      : 'unknown';
    return { success: false, error: `Verification failed (${codes})` };
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return { success: false, error: 'Verification timed out' };
    }
    return { success: false, error: 'Internal error' };
  } finally {
    clearTimeout(timer);
  }
}
