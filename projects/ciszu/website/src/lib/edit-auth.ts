const encoder = new TextEncoder();

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Comparación dex en tiempo constante (Edge + Node safe). */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

export async function editSessionCookie(): Promise<string> {
  const token = process.env.PUCK_EDIT_TOKEN || "";
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(`ciszu-edit:${token}`));
  return toHex(new Uint8Array(digest));
}

export async function cookieEqualsToken(cookie: string): Promise<boolean> {
  const expected = await editSessionCookie();
  return safeEqual(cookie, expected);
}

export async function verifyEditToken(input: string): Promise<boolean> {
  const expected = process.env.PUCK_EDIT_TOKEN || "";
  if (!expected || !input || !expected.length || !input.length) return false;
  const a = toHex(new Uint8Array(await crypto.subtle.digest("SHA-256", encoder.encode(input))));
  const b = toHex(new Uint8Array(await crypto.subtle.digest("SHA-256", encoder.encode(expected))));
  return safeEqual(a, b);
}