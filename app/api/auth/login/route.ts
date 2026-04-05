import { NextResponse } from 'next/server'

export async function POST(request: Request) {
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
