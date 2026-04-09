import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/request'
import { adminDb } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'

export const dynamic = 'force-dynamic'

export async function PUT(
  _request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params
    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
    }

    const userRef = adminDb.collection('users').doc(userId)
    const snapshot = await userRef.get()

    if (!snapshot.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const data = snapshot.data()
    if (data?.role !== 'worker') {
      return NextResponse.json({ error: 'Only workers can toggle mover mode' }, { status: 403 })
    }

    const newMode = !data.moverMode
    await userRef.update({
      moverMode: newMode,
      updatedAt: FieldValue.serverTimestamp(),
    })

    return NextResponse.json({ userId, moverMode: newMode })
  } catch (error) {
    console.error('Toggle mover mode error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
