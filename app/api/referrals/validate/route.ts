import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')

  if (!code) {
    return NextResponse.json({ valid: false, error: 'Missing code' }, { status: 400 })
  }

  // TODO: Look up code in Firestore `referralCodes` collection
  // const snapshot = await db?.collection('referralCodes').where('code', '==', code).limit(1).get()
  // const valid = !snapshot?.empty

  // Mock response — treat any QT-XXXX-XXXXX pattern as valid
  const QT_PATTERN = /^QT-[A-Z0-9]{4}-[A-Z0-9]{5}$/
  const valid = QT_PATTERN.test(code)

  if (!valid) {
    return NextResponse.json({ valid: false, error: 'Invalid referral code' }, { status: 404 })
  }

  return NextResponse.json({ valid: true, code })
}
