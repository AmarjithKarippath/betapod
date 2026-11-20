// Port of api/app/core/security.py. Must stay wire-compatible with the
// Python implementation so existing password hashes and session cookies
// keep working after the cutover.
import { sign, verify } from "hono/jwt";
import { argon2d, argon2i, argon2id } from "@noble/hashes/argon2.js";

// Pure-JS argon2: workerd forbids runtime WebAssembly compilation, which
// rules out hash-wasm & co. Costs ~400ms CPU per hash (Workers Paid plan).

// argon2-cffi PasswordHasher() defaults.
const PARAMS = { t: 3, m: 65536, p: 4 };
const HASH_LEN = 32;
const SALT_LEN = 16;
const ALGOS = { argon2id, argon2i, argon2d } as const;

// PHC strings use standard base64 without padding.
const b64encode = (b: Uint8Array) => btoa(String.fromCharCode(...b)).replace(/=+$/, "");
const b64decode = (s: string) => Uint8Array.from(atob(s), (ch) => ch.charCodeAt(0));

function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LEN));
  const hash = argon2id(password, salt, { ...PARAMS, dkLen: HASH_LEN });
  return `$argon2id$v=19$m=${PARAMS.m},t=${PARAMS.t},p=${PARAMS.p}$${b64encode(salt)}$${b64encode(hash)}`;
}

/** Verifies a PHC-format hash, e.g. one produced by Python's argon2-cffi. */
export async function verifyPassword(password: string, encoded: string): Promise<boolean> {
  try {
    const m = /^\$(argon2id|argon2i|argon2d)\$v=19\$m=(\d+),t=(\d+),p=(\d+)\$([A-Za-z0-9+/]+)\$([A-Za-z0-9+/]+)$/.exec(encoded);
    if (!m) return false;
    const [, algo, mem, t, p, saltB64, hashB64] = m;
    const expected = b64decode(hashB64);
    const actual = ALGOS[algo as keyof typeof ALGOS](password, b64decode(saltB64), {
      m: Number(mem),
      t: Number(t),
      p: Number(p),
      dkLen: expected.length,
    });
    return timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

export async function createAccessToken(userId: number, secret: string, expireDays: number): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  return sign({ sub: String(userId), iat: now, exp: now + expireDays * 86400 }, secret, "HS256");
}

export async function decodeAccessToken(token: string, secret: string): Promise<number | null> {
  try {
    const payload = await verify(token, secret, "HS256");
    const id = Number(payload.sub);
    return Number.isInteger(id) ? id : null;
  } catch {
    return null;
  }
}
