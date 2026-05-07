import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')

  if (!code) {
    return NextResponse.json({ valid: false, error: 'Missing code' }, { status: 400 })
  }

  try {
    const snap = await adminDb
      .collection('referralCodes')
      .where('code', '==', code)
      .where('active', '==', true)
      .limit(1)
      .get()

    if (snap.empty) {
      return NextResponse.json({ valid: false, error: 'Invalid referral code' }, { status: 404 })
    }

    const data = snap.docs[0].data() as { code: string; ownerId?: string; usesRemaining?: number }
    return NextResponse.json({ valid: true, code: data.code, ownerId: data.ownerId ?? null, usesRemaining: data.usesRemaining ?? null })
  } catch (err) {
    console.error('Referral validate error:', err)
    return NextResponse.json({ valid: false, error: 'Internal server error' }, { status: 500 })
  }
}
