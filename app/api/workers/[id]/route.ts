import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import type { UserProfile } from '@/types'

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    if (!id) {
      return NextResponse.json({ error: 'Worker id is required' }, { status: 400 })
    }

    const doc = await adminDb.collection('users').doc(id).get()
    if (!doc.exists) {
      return NextResponse.json({ error: 'Worker not found' }, { status: 404 })
    }

    const data = doc.data() as UserProfile
    if (data.role !== 'worker') {
      return NextResponse.json({ error: 'Worker not found' }, { status: 404 })
    }

    return NextResponse.json({ worker: { ...data, uid: doc.id } })
  } catch (error) {
    console.error('Get worker error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
