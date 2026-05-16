import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'

export const dynamic = 'force-dynamic'

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params
  try {
    const { id } = params
    const snap = await adminDb
      .collection('disputes')
      .doc(id)
      .collection('evidence')
      .orderBy('timestamp', 'desc')
      .get()
    const evidence = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    return NextResponse.json({ evidence, disputeId: id })
  } catch (error) {
    console.error('GET /api/disputes/[id]/evidence error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params
  try {
    const { id } = params
    const body = await request.json()
    const { type, fileUrl, fileName, fileSize, description, uploadedBy, uploaderName } = body

    if (!type || !description || !uploadedBy) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (!adminDb) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 503 })
    }

    const docRef = await adminDb
      .collection('disputes')
      .doc(id)
      .collection('evidence')
      .add({
        disputeId: id,
        type,
        fileUrl: fileUrl ?? null,
        fileName: fileName ?? null,
        fileSize: fileSize ?? null,
        description,
        uploadedBy,
        uploaderName: uploaderName ?? 'User',
        timestamp: FieldValue.serverTimestamp(),
      })

    const created = {
      id: docRef.id,
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

    return NextResponse.json({ evidence: created }, { status: 201 })
  } catch (error) {
    console.error('POST /api/disputes/[id]/evidence error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
