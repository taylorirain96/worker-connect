import { NextResponse } from 'next/server'
import { rateLimit } from '@/lib/rateLimit'

export async function POST(request: Request) {
  try {
    if (rateLimit(request, { max: 10, windowMs: 60_000 })) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const body = await request.json()
    const { email, password, displayName, role } = body

    if (!email || !password || !displayName || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }

    if (typeof password !== 'string' || password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
    }

    if (typeof displayName !== 'string' || displayName.trim().length < 2) {
      return NextResponse.json({ error: 'Display name is too short' }, { status: 400 })
    }

    // Firebase Auth registration is handled client-side via Firebase SDK
    // This endpoint can be used for additional server-side logic
    return NextResponse.json({
      message: 'Registration handled client-side via Firebase SDK',
      success: true,
    })
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
