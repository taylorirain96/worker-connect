import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import type { BusinessVerification } from '@/types'

export const dynamic = 'force-dynamic'

const EMPTY_VERIFICATION: Omit<BusinessVerification, 'id' | 'businessId' | 'updatedAt'> = {
  license: null,
  insurance: null,
  backgroundCheck: { status: 'not_started' },
  externalRatings: {},
  certifications: [],
  trustScore: 0,
  verifiedCount: 0,
}

export async function GET(req: NextRequest) {
  const uid = req.headers.get('x-user-id')
  if (!uid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const snap = await adminDb.collection('businessVerifications').doc(uid).get()

    if (!snap.exists) {
      return NextResponse.json({
        ...EMPTY_VERIFICATION,
        id: uid,
        businessId: uid,
        updatedAt: new Date().toISOString(),
      } satisfies BusinessVerification)
    }

    const data = snap.data()!
    return NextResponse.json({
      ...EMPTY_VERIFICATION,
      ...data,
      id: snap.id,
      businessId: uid,
      certifications: Array.isArray(data.certifications) ? data.certifications : [],
      updatedAt:
        data.updatedAt && typeof data.updatedAt.toDate === 'function'
          ? data.updatedAt.toDate().toISOString()
          : (data.updatedAt as string | undefined) ?? new Date().toISOString(),
    } satisfies BusinessVerification)
  } catch (error) {
    console.error('GET /api/business/verification-status error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
