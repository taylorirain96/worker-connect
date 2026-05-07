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

    const doc = snap.docs[0]
    const data = doc.data() as { displayName?: string; referralCode?: string }

    if (!data.referralCode) {
      return NextResponse.json({ valid: false, error: 'Referral code missing on referrer record' }, { status: 500 })
    }

    return NextResponse.json({
      valid: true,
      code: data.referralCode,
      ownerId: doc.id,
      referrerName: data.displayName ?? null,
      usesRemaining: null,
    })
  } catch (err) {
    console.error('Failed to validate referral code:', err)
    return NextResponse.json({ valid: false, error: 'Internal server error' }, { status: 500 })
  }
}
