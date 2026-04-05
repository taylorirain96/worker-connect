import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password, displayName, role } = body

    if (!email || !password || !displayName || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
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
