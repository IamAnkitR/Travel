const COOKIE_NAME = "partner_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 14; // 14 days
const PARTNER_ID_HEADER = "x-partner-id";

function toHex(buffer: ArrayBuffer) {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function toBase64Url(input: string) {
  return btoa(input).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(input: string) {
  const padded = input.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(input.length / 4) * 4, "=");
  return atob(padded);
}

async function sign(payload: string): Promise<string> {
  const secret = process.env.PARTNER_SESSION_SECRET || process.env.ADMIN_SESSION_SECRET || "dev-secret";
  const data = new TextEncoder().encode(`${payload}:${secret}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return toHex(digest);
}

/** Stateless, signed session token: base64url(accountId:expiryUnixSeconds).signatureHex */
export async function createPartnerToken(accountId: string): Promise<string> {
  const expiry = Math.floor(Date.now() / 1000) + MAX_AGE_SECONDS;
  const payload = `${accountId}:${expiry}`;
  const signature = await sign(payload);
  return `${toBase64Url(payload)}.${signature}`;
}

export async function verifyPartnerToken(token: string | undefined | null): Promise<string | null> {
  if (!token) return null;
  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) return null;

  let payload: string;
  try {
    payload = fromBase64Url(encodedPayload);
  } catch {
    return null;
  }

  const expected = await sign(payload);
  if (expected !== signature) return null;

  const [accountId, expiryStr] = payload.split(":");
  const expiry = Number(expiryStr);
  if (!accountId || !Number.isFinite(expiry) || expiry < Math.floor(Date.now() / 1000)) return null;

  return accountId;
}

export { COOKIE_NAME, MAX_AGE_SECONDS, PARTNER_ID_HEADER };
