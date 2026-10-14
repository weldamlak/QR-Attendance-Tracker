import { createHmac, timingSafeEqual } from "crypto";

const SECRET = process.env.AUTH_SECRET!;

export function createSessionToken(ttlSeconds = 60 * 60 * 24 * 7) {
  const expires = Date.now() + ttlSeconds * 1000;
  const payload = String(expires);
  const sig = sign(payload);
  return `${payload}.${sig}`;
}

export function verifySessionToken(token: string | undefined): boolean {
  if (!token) return false;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return false;

  const expected = sign(payload);
  if (
    expected.length !== sig.length ||
    !timingSafeEqual(Buffer.from(expected), Buffer.from(sig))
  ) {
    return false;
  }

  const expires = Number(payload);
  if (!Number.isFinite(expires) || expires < Date.now()) return false;

  return true;
}

export function checkCredentials(username: string, password: string): boolean {
  const okUser = process.env.AUTH_USERNAME ?? "";
  const okPass = process.env.AUTH_PASSWORD ?? "";
  if (!okUser || !okPass) return false;

  const a = Buffer.from(username);
  const b = Buffer.from(okUser);
  const c = Buffer.from(password);
  const d = Buffer.from(okPass);

  const userOk = a.length === b.length && timingSafeEqual(a, b);
  const passOk = c.length === d.length && timingSafeEqual(c, d);

  return userOk && passOk;
}

function sign(payload: string): string {
  return createHmac("sha256", SECRET).update(payload).digest("hex");
}
