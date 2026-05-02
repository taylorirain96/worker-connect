import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')

  if (!code) {
    return NextResponse.json({ valid: false, error: 'Missing code' }, { status: 400 })
  }

  try {
    const snap = await adminDb
      .collection('users')
      .where('referralCode', '==', code)
      .limit(1)
      .get()

    if (snap.empty) {
      return NextResponse.json({ valid: false, error: 'Invalid referral code' }, { status: 404 })
    }

    const referrerData = snap.docs[0].data()
    return NextResponse.json({
      valid: true,
      code,
      referrerName: referrerData.displayName ?? null,
    })
  } catch (err) {
    console.error('Failed to validate referral code:', err)
    return NextResponse.json({ valid: false, error: 'Validation failed' }, { status: 500 })
  }
}
