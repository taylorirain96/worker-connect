import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const body = await request.json()
  const { name, issuingOrganization, certificateNumber, issueDate, expirationDate } = body

  if (!name) {
    return NextResponse.json({ error: 'Certification name is required' }, { status: 400 })
  }

  // TODO: save to Firestore certifications array
  const result = {
    id: `cert_${Date.now()}`,
    name,
    issuingOrganization: issuingOrganization ?? null,
    certificateNumber: certificateNumber ?? null,
    issueDate: issueDate ?? null,
    expirationDate: expirationDate ?? null,
    verified: false,
    createdAt: new Date().toISOString(),
  }

  return NextResponse.json(result, { status: 201 })
}
