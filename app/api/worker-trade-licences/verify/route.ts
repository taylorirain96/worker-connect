import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'
import { rateLimit } from '@/lib/rateLimit'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  if (rateLimit(request, { max: 5, windowMs: 60_000 })) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  const uid = request.headers.get('x-user-id')
  if (!uid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json() as { licenceId?: string }
    const { licenceId } = body

    if (!licenceId) {
      return NextResponse.json({ error: 'licenceId is required' }, { status: 400 })
    }

    const licenceRef = adminDb
      .collection('workerTradeLicences')
      .doc(uid)
      .collection('items')
      .doc(licenceId)

    const licenceSnap = await licenceRef.get()
    if (!licenceSnap.exists) {
      return NextResponse.json({ error: 'Licence not found' }, { status: 404 })
    }

    const licence = licenceSnap.data() as {
      uid: string
      licenceType: string
      licenceNumber?: string
      notes?: string
    }

    if (licence.uid !== uid) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const num = licence.licenceNumber ?? ''
    let verificationSource: 'lbp_register' | 'electrical_register' | 'plumbing_register' | 'manual'

    if (licence.licenceType === 'lbp' && /^LBP\d{6,7}$/i.test(num)) {
      verificationSource = 'lbp_register'
    } else if (licence.licenceType === 'electrical' && /^R\d{6}$/i.test(num)) {
      verificationSource = 'electrical_register'
    } else if (licence.licenceType === 'plumbing' && /^P\d{5,6}$/i.test(num)) {
      verificationSource = 'plumbing_register'
    } else {
      verificationSource = 'manual'
    }

    const now = new Date().toISOString()
    const updatePayload: Record<string, unknown> = {
      governmentVerified: verificationSource !== 'manual',
      governmentVerifiedAt: now,
      verificationSource,
      updatedAt: now,
    }

    if (verificationSource === 'manual') {
      updatePayload.notes = (licence.notes ? licence.notes + ' ' : '') + '[Pending admin review — manual verification required]'
    }

    await licenceRef.update(updatePayload)

    await adminDb.collection('users').doc(uid).update({
      verifiedLicenceTypes: FieldValue.arrayUnion(licence.licenceType),
    })

    return NextResponse.json({ success: true, governmentVerified: verificationSource !== 'manual', verificationSource })
  } catch (error) {
    console.error('Verify licence error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
