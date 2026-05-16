import { NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase-admin'
import { isAllowedRole, type AllowedRole } from '@/lib/auth/roles'
import { createSessionToken } from '@/lib/auth/sessionToken'

export const runtime = 'nodejs'

const SESSION_COOKIE = 'auth-session'
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 5 // 5 days — matches typical Firebase session length
const FIREBASE_UID_PATTERN = /^[A-Za-z0-9_-]{6,128}$/

const baseCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
}

// Legacy cookie names — cleared on sign-in/out so older clients can't keep
// using an unsigned uid cookie to satisfy the middleware guard.
const LEGACY_COOKIES = ['x-user-id', 'x-user-role'] as const

async function lookupRole(uid: string): Promise<AllowedRole | null> {
  try {
    const snap = await adminDb.collection('users').doc(uid).get()
    if (!snap.exists) return null
    const role = (snap.data() as { role?: unknown } | undefined)?.role
    return isAllowedRole(role) ? role : null
  } catch (error) {
    console.error('Auth session role lookup error:', error)
    return null
  }
}

export async function POST(request: Request) {
  let body: { idToken?: unknown }
  try {
    body = (await request.json()) as { idToken?: unknown }
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const idToken = typeof body.idToken === 'string' ? body.idToken.trim() : ''
  if (!idToken) {
    return NextResponse.json({ error: 'Missing idToken' }, { status: 400 })
  }

  let uid: string
  try {
    const decoded = await adminAuth.verifyIdToken(idToken)
    uid = decoded.uid
  } catch (error) {
    console.error('Auth session token verification failed:', error)
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 })
  }

  if (!FIREBASE_UID_PATTERN.test(uid)) {
    return NextResponse.json({ error: 'Invalid uid format' }, { status: 400 })
  }

  const role = await lookupRole(uid)

  let token: string
  try {
    token = await createSessionToken(uid, role, COOKIE_MAX_AGE_SECONDS)
  } catch (error) {
    console.error('Auth session token signing failed:', error)
    return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 })
  }

  const response = NextResponse.json({ success: true, role })
  response.cookies.set(SESSION_COOKIE, token, {
    ...baseCookieOptions,
    maxAge: COOKIE_MAX_AGE_SECONDS,
  })
  // Best-effort cleanup of the previous unsigned cookies.
  for (const name of LEGACY_COOKIES) {
    response.cookies.set(name, '', { ...baseCookieOptions, maxAge: 0 })
  }
  return response
}

export async function DELETE() {
  const response = NextResponse.json({ success: true })
  response.cookies.set(SESSION_COOKIE, '', { ...baseCookieOptions, maxAge: 0 })
  for (const name of LEGACY_COOKIES) {
    response.cookies.set(name, '', { ...baseCookieOptions, maxAge: 0 })
  }
  return response
}
