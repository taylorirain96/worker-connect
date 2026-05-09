import { NextResponse } from 'next/server'

const COOKIE_NAME = 'x-user-id'
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30
const FIREBASE_UID_PATTERN = /^[A-Za-z0-9_-]{6,128}$/

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as { uid?: string }
    const uid = typeof body.uid === 'string' ? body.uid.trim() : ''
    if (!uid) {
      return NextResponse.json({ error: 'Missing uid' }, { status: 400 })
    }
    if (!FIREBASE_UID_PATTERN.test(uid)) {
      return NextResponse.json({ error: 'Invalid uid format' }, { status: 400 })
    }

    const response = NextResponse.json({ success: true })
    response.cookies.set(COOKIE_NAME, uid, {
      ...cookieOptions,
      maxAge: COOKIE_MAX_AGE_SECONDS,
    })
    return response
  } catch (error) {
    console.error('Auth session set error:', error)
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true })
  response.cookies.set(COOKIE_NAME, '', {
    ...cookieOptions,
    maxAge: 0,
  })
  return response
}
