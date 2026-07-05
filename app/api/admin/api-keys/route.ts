import { NextRequest, NextResponse } from 'next/server'
import type { DocumentData, QueryDocumentSnapshot } from 'firebase-admin/firestore'
import { adminDb } from '@/lib/firebase-admin'
import { randomBytes } from 'crypto'

async function assertAdmin(uid: string): Promise<boolean> {
  const snap = await adminDb.collection('users').doc(uid).get()
  return snap.exists && snap.data()?.role === 'admin'
}

export async function POST(req: NextRequest) {
  const uid = req.headers.get('x-user-id')
  if (!uid || !(await assertAdmin(uid))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const { name, ownerEmail, ownerId } = await req.json()
    if (!name) {
      return NextResponse.json({ error: 'name is required' }, { status: 400 })
    }

    const key = randomBytes(16).toString('hex') // 32-char hex
    await adminDb.collection('apiKeys').doc(key).set({
      key,
      name,
      ownerId: ownerId ?? uid,
      ownerEmail: ownerEmail ?? '',
      createdAt: new Date().toISOString(),
      active: true,
    })

    return NextResponse.json({ key, name, createdAt: new Date().toISOString() })
  } catch (err) {
    console.error('admin/api-keys POST error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const uid = req.headers.get('x-user-id')
  if (!uid || !(await assertAdmin(uid))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const snapshot = await adminDb.collection('apiKeys').orderBy('createdAt', 'desc').get()
    const keys = snapshot.docs.map((d: QueryDocumentSnapshot<DocumentData>) => {
      const data = d.data()
      return {
        key: d.id,
        name: data.name,
        ownerId: data.ownerId,
        ownerEmail: data.ownerEmail,
        createdAt: data.createdAt,
        active: data.active,
      }
    })
    return NextResponse.json({ keys })
  } catch (err) {
    console.error('admin/api-keys GET error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const uid = req.headers.get('x-user-id')
  if (!uid || !(await assertAdmin(uid))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const { key, active } = await req.json()
    if (!key || typeof active !== 'boolean') {
      return NextResponse.json({ error: 'key and active are required' }, { status: 400 })
    }
    await adminDb.collection('apiKeys').doc(key).update({ active })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('admin/api-keys PATCH error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
