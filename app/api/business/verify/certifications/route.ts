import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'
import type { CertificationRecord } from '@/types'
import { callVerificationProvider } from '@/lib/business-verification/providerClient'

export async function POST(request: NextRequest) {
  const uid = request.headers.get('x-user-id')
  if (!uid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { name, issuingOrganization, certificateNumber, issueDate, expirationDate } = body

  if (!name) {
    return NextResponse.json({ error: 'Certification name is required' }, { status: 400 })
  }

  try {
    const providerResult = await callVerificationProvider({
      endpoint: process.env.BUSINESS_VERIFICATION_CERTIFICATIONS_URL,
      payload: {
        userId: uid,
        name,
        issuingOrganization: issuingOrganization ?? null,
        certificateNumber: certificateNumber ?? null,
        issueDate: issueDate ?? null,
        expirationDate: expirationDate ?? null,
      },
      defaultProvider: 'Certification Verification API',
    })

    const result: CertificationRecord = {
      id: `cert_${Date.now()}`,
      name,
      issuingOrganization: issuingOrganization ?? null,
      certificateNumber: certificateNumber ?? null,
      issueDate: issueDate ?? null,
      expirationDate: expirationDate ?? null,
      verified: providerResult.verified,
      createdAt: new Date().toISOString(),
    }

    await adminDb.collection('businessVerifications').doc(uid).set(
      {
        certifications: FieldValue.arrayUnion(result),
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    )

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('Certification verification provider error:', error)
    return NextResponse.json(
      { error: 'Certification verification provider unavailable. Please try again later.' },
      { status: 503 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  const uid = request.headers.get('x-user-id')
  if (!uid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const certId = searchParams.get('id')
  if (!certId) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 })
  }

  const snap = await adminDb.collection('businessVerifications').doc(uid).get()
  if (!snap.exists) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const certs: CertificationRecord[] = Array.isArray(snap.data()?.certifications)
    ? (snap.data()!.certifications as CertificationRecord[])
    : []
  const certToRemove = certs.find((c) => c.id === certId)
  if (!certToRemove) {
    return NextResponse.json({ error: 'Certification not found' }, { status: 404 })
  }

  await adminDb.collection('businessVerifications').doc(uid).update({
    certifications: FieldValue.arrayRemove(certToRemove),
    updatedAt: FieldValue.serverTimestamp(),
  })

  return NextResponse.json({ success: true })
}
