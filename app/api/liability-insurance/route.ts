import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'

export async function POST(req: NextRequest) {
  const uid = req.headers.get('x-user-id')
  if (!uid) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { hasLiabilityInsurance, insuranceProvider } = body

    const update: Record<string, unknown> = {
      hasLiabilityInsurance: Boolean(hasLiabilityInsurance),
      updatedAt: new Date().toISOString(),
    }

    if (hasLiabilityInsurance && typeof insuranceProvider === 'string') {
      update.insuranceProvider = insuranceProvider.trim() || null
    } else {
      update.insuranceProvider = null
    }

    await adminDb.collection('users').doc(uid).update(update)

    return NextResponse.json({
      success: true,
      hasLiabilityInsurance: update.hasLiabilityInsurance,
      insuranceProvider: update.insuranceProvider,
    })
  } catch (err) {
    console.error('liability-insurance POST error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const uid = req.headers.get('x-user-id')
  if (!uid) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  try {
    const snap = await adminDb.collection('users').doc(uid).get()
    if (!snap.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    const data = snap.data()
    return NextResponse.json({
      hasLiabilityInsurance: data?.hasLiabilityInsurance ?? null,
      insuranceProvider: data?.insuranceProvider ?? null,
    })
  } catch (err) {
    console.error('liability-insurance GET error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
