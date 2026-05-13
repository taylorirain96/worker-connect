import { NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase-admin'

export const runtime = 'nodejs'

const UID_COOKIE = 'x-user-id'
const ROLE_COOKIE = 'x-user-role'
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 5 // 5 days — matches typical Firebase session length
const FIREBASE_UID_PATTERN = /^[A-Za-z0-9_-]{6,128}$/

const baseCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
}

type AllowedRole =
  | 'worker'
  | 'employer'
  | 'admin'
  | 'homeowner'
  | 'tradie'
  | 'jobseeker'
  | 'property_manager'

const ALLOWED_ROLES: AllowedRole[] = [
  'worker',
  'employer',
  'admin',
  'homeowner',
  'tradie',
  'jobseeker',
  'property_manager',
]

function isAllowedRole(value: unknown): value is AllowedRole {
  return typeof value === 'string' && (ALLOWED_ROLES as string[]).includes(value)
}

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

  const response = NextResponse.json({ success: true, role })
  response.cookies.set(UID_COOKIE, uid, {
    ...baseCookieOptions,
    maxAge: COOKIE_MAX_AGE_SECONDS,
  })
  if (role) {
    response.cookies.set(ROLE_COOKIE, role, {
      ...baseCookieOptions,
      maxAge: COOKIE_MAX_AGE_SECONDS,
    })
  } else {
    response.cookies.delete(ROLE_COOKIE)
  }
  return response
}

export async function DELETE() {
  const response = NextResponse.json({ success: true })
  response.cookies.set(UID_COOKIE, '', { ...baseCookieOptions, maxAge: 0 })
  response.cookies.set(ROLE_COOKIE, '', { ...baseCookieOptions, maxAge: 0 })
  return response
}
