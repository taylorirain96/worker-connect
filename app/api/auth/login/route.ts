import { NextResponse } from 'next/server'
import { rateLimit } from '@/lib/rateLimit'

export async function POST(request: Request) {
  if (rateLimit(request, { max: 5, windowMs: 60_000, key: 'auth' })) {
    return NextResponse.json(
      { error: 'Too many login attempts. Please wait a moment before trying again.' },
      { status: 429 }
    )
  }

  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Firebase Auth login is handled client-side via Firebase SDK
    return NextResponse.json({
      message: 'Login handled client-side via Firebase SDK',
      success: true,
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
