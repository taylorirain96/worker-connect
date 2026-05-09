import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'
import { rateLimit } from '@/lib/rateLimit'

export const dynamic = 'force-dynamic'

const MBIE_VERIFY_TIMEOUT_MS = 10_000

interface MbieVerificationResult {
  governmentVerified: boolean
  verificationSource: 'mbie_api' | 'lbp_register' | 'electrical_register' | 'plumbing_register' | 'manual'
  referenceId?: string
}

async function verifyWithMbieProvider(input: {
  uid: string
  licenceId: string
  licenceType: string
  licenceNumber: string
}): Promise<MbieVerificationResult> {
  const endpoint = process.env.MBIE_LICENCE_VERIFICATION_URL
  if (!endpoint) {
    throw new Error('MBIE provider not configured')
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), MBIE_VERIFY_TIMEOUT_MS)
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (process.env.MBIE_LICENCE_VERIFICATION_API_KEY) {
      headers.Authorization = `Bearer ${process.env.MBIE_LICENCE_VERIFICATION_API_KEY}`
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(input),
      signal: controller.signal,
      cache: 'no-store',
    })

    let raw: {
      verified?: boolean
      status?: string
      referenceId?: string
    }
    try {
      raw = await response.json() as {
        verified?: boolean
        status?: string
        referenceId?: string
      }
    } catch {
      throw new Error('MBIE provider returned invalid JSON')
    }
    if (!response.ok) {
      throw new Error(`MBIE provider request failed (${response.status})`)
    }

    const verified = Boolean(raw.verified) || raw.status === 'clear' || raw.status === 'verified'
    return {
      governmentVerified: verified,
      verificationSource: 'mbie_api',
      referenceId: raw.referenceId,
    }
  } finally {
    clearTimeout(timeout)
  }
}

function verifyWithLegacyPattern(licenceType: string, licenceNumber?: string): MbieVerificationResult {
  const num = licenceNumber ?? ''
  let verificationSource: 'lbp_register' | 'electrical_register' | 'plumbing_register' | 'manual'

  if (licenceType === 'lbp' && /^LBP\d{6,7}$/i.test(num)) {
    verificationSource = 'lbp_register'
  } else if (licenceType === 'electrical' && /^R\d{6}$/i.test(num)) {
    verificationSource = 'electrical_register'
  } else if (licenceType === 'plumbing' && /^P\d{5,6}$/i.test(num)) {
    verificationSource = 'plumbing_register'
  } else {
    verificationSource = 'manual'
  }

  return {
    governmentVerified: verificationSource !== 'manual',
    verificationSource,
  }
}

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

      const useLiveMbie = Boolean(process.env.MBIE_LICENCE_VERIFICATION_URL)
      let verificationResult: MbieVerificationResult
      if (useLiveMbie) {
        try {
          verificationResult = await verifyWithMbieProvider({
            uid,
            licenceId,
            licenceType: licence.licenceType,
            licenceNumber: licence.licenceNumber ?? '',
          })
        } catch (providerError) {
          console.error('MBIE verification provider error:', providerError)
          return NextResponse.json(
            { error: 'MBIE verification provider unavailable. Please try again later.' },
            { status: 503 }
          )
        }
      } else {
        verificationResult = verifyWithLegacyPattern(licence.licenceType, licence.licenceNumber)
      }

      const now = new Date().toISOString()
      const updatePayload: Record<string, unknown> = {
        governmentVerified: verificationResult.governmentVerified,
        governmentVerifiedAt: now,
        verificationSource: verificationResult.verificationSource,
        updatedAt: now,
      }

      if (verificationResult.referenceId) {
        updatePayload.verificationReferenceId = verificationResult.referenceId
      }

      if (!verificationResult.governmentVerified) {
        const manualNotice = '[Pending admin review — manual verification required]'
        const currentNotes = licence.notes ?? ''
        if (!currentNotes.includes(manualNotice)) {
          updatePayload.notes = (currentNotes ? currentNotes + ' ' : '') + manualNotice
        }
    }

    await licenceRef.update(updatePayload)

    await adminDb.collection('users').doc(uid).update({
      verifiedLicenceTypes: FieldValue.arrayUnion(licence.licenceType),
    })

    return NextResponse.json({
      success: true,
      governmentVerified: verificationResult.governmentVerified,
      verificationSource: verificationResult.verificationSource,
    })
  } catch (error) {
    console.error('Verify licence error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
