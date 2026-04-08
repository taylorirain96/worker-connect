import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    // In production, fetch evidence for this dispute from Firestore
    return NextResponse.json({ evidence: [], disputeId: id })
  } catch (error) {
    console.error('GET /api/disputes/[id]/evidence error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { type, fileUrl, fileName, fileSize, description, uploadedBy, uploaderName } = body

    if (!type || !description || !uploadedBy) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // In production, write to Firestore and return the created record:
    // const adminDb = (await import('@/lib/firebase-admin')).adminDb
    // const docRef = await adminDb.collection('disputeEvidence').add({ disputeId: id, ...body, timestamp: FieldValue.serverTimestamp() })

    const mockEvidence = {
      id: `ev_${Date.now()}`,
      disputeId: id,
      type,
      fileUrl: fileUrl ?? null,
      fileName: fileName ?? null,
      fileSize: fileSize ?? null,
      description,
      uploadedBy,
      uploaderName: uploaderName ?? 'User',
      timestamp: new Date().toISOString(),
    }

    return NextResponse.json({ evidence: mockEvidence }, { status: 201 })
  } catch (error) {
    console.error('POST /api/disputes/[id]/evidence error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
