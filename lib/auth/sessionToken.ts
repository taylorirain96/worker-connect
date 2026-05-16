/**
 * Signed session cookie utilities (Edge-runtime compatible).
 *
 * The session cookie value is of the form:
 *   <base64url-payload>.<base64url-hmac>
 *
 * The payload JSON is `{ uid, role, exp }` where `exp` is a unix timestamp
 * in seconds. Tokens are HMAC-SHA256 signed with `AUTH_SESSION_SECRET`.
 *
 * This module uses the Web Crypto API (`crypto.subtle`) instead of the Node
 * `crypto` module so it can be imported from `middleware.ts`, which runs on
 * the Vercel Edge runtime.
 */
import { isAllowedRole, type AllowedRole } from './roles'

const DEFAULT_TTL_SECONDS = 60 * 60 * 24 * 5 // 5 days

export interface SessionPayload {
  uid: string
  role: AllowedRole | null
  exp: number
}

function getSecret(): string {
  const secret = process.env.AUTH_SESSION_SECRET
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        'AUTH_SESSION_SECRET is not set. Refusing to sign session cookies with an insecure fallback in production.'
      )
    }
    console.warn(
      'AUTH_SESSION_SECRET is not set. Falling back to a development-only secret. ' +
        'Set AUTH_SESSION_SECRET in production.'
    )
    return 'dev-auth-session-secret'
  }
  return secret
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = ''
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i])
  // btoa is available in both Edge and Node 20+ runtimes.
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function base64UrlToBytes(value: string): Uint8Array {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((value.length + 3) % 4)
  const binary = atob(padded)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

function stringToBytes(value: string): Uint8Array {
  return new TextEncoder().encode(value)
}

function bytesToString(bytes: Uint8Array): string {
  return new TextDecoder().decode(bytes)
}

/**
 * Copy a Uint8Array's contents into a fresh ArrayBuffer-backed Uint8Array so
 * the result is unambiguously a `BufferSource` (TypeScript's lib.dom.d.ts
 * disallows SharedArrayBuffer-backed views in some Web Crypto signatures).
 */
function toArrayBufferView(bytes: Uint8Array): Uint8Array<ArrayBuffer> {
  const copy = new Uint8Array(new ArrayBuffer(bytes.byteLength))
  copy.set(bytes)
  return copy
}

async function importKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    toArrayBufferView(stringToBytes(secret)),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  )
}

async function sign(payload: string): Promise<string> {
  const key = await importKey(getSecret())
  const sig = await crypto.subtle.sign('HMAC', key, toArrayBufferView(stringToBytes(payload)))
  return bytesToBase64Url(new Uint8Array(sig))
}

/**
 * Constant-time string comparison to avoid timing oracles when comparing
 * HMAC tags. Both inputs are expected to be base64url strings of equal length;
 * if the lengths differ the comparison still runs over the longer length so
 * that callers don't leak length differences.
 */
function timingSafeEqual(a: string, b: string): boolean {
  const len = Math.max(a.length, b.length)
  let diff = a.length ^ b.length
  for (let i = 0; i < len; i++) {
    diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0)
  }
  return diff === 0
}

/**
 * Create a signed session cookie value for the given user.
 */
export async function createSessionToken(
  uid: string,
  role: AllowedRole | null,
  ttlSeconds: number = DEFAULT_TTL_SECONDS
): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + ttlSeconds
  const payloadJson = JSON.stringify({ uid, role, exp })
  const payload = bytesToBase64Url(stringToBytes(payloadJson))
  const mac = await sign(payload)
  return `${payload}.${mac}`
}

/**
 * Verify a signed session cookie value. Returns the decoded payload or null
 * if the token is malformed, has an invalid signature, or has expired.
 */
export async function verifySessionToken(token: string | undefined | null): Promise<SessionPayload | null> {
  if (!token || typeof token !== 'string') return null
  const dotIndex = token.indexOf('.')
  if (dotIndex <= 0 || dotIndex === token.length - 1) return null
  const payload = token.slice(0, dotIndex)
  const mac = token.slice(dotIndex + 1)

  let expected: string
  try {
    expected = await sign(payload)
  } catch {
    return null
  }
  if (!timingSafeEqual(mac, expected)) return null

  let parsed: unknown
  try {
    parsed = JSON.parse(bytesToString(base64UrlToBytes(payload)))
  } catch {
    return null
  }

  if (!parsed || typeof parsed !== 'object') return null
  const { uid, role, exp } = parsed as { uid?: unknown; role?: unknown; exp?: unknown }
  if (typeof uid !== 'string' || !uid) return null
  if (typeof exp !== 'number' || !Number.isFinite(exp)) return null
  if (exp * 1000 < Date.now()) return null

  // Reject any role value that isn't on the explicit allow-list. A tampered
  // (but correctly-signed-by-a-leaked-secret) token must not be able to
  // smuggle in a value like 'superadmin' that downstream callers might trust.
  let safeRole: AllowedRole | null
  if (role === null || role === undefined) {
    safeRole = null
  } else if (isAllowedRole(role)) {
    safeRole = role
  } else {
    return null
  }

  return { uid, role: safeRole, exp }
}
