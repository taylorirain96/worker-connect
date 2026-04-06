import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { status } = body as { status: string }

    if (!status || !['pending', 'accepted', 'rejected', 'withdrawn'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const appRef = adminDb.collection('applications').doc(id)
    const snapshot = await appRef.get()
    if (!snapshot.exists) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    await appRef.update({ status, updatedAt: FieldValue.serverTimestamp() })

    return NextResponse.json({ id, status, updatedAt: new Date().toISOString() })
  } catch (error) {
    console.error('Update application error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
