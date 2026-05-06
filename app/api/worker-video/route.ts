import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'

export async function POST(req: NextRequest) {
  const uid = req.headers.get('x-user-id')
  if (!uid) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  try {
    const { videoUrl } = await req.json()
    if (!videoUrl || typeof videoUrl !== 'string') {
      return NextResponse.json({ error: 'videoUrl is required' }, { status: 400 })
    }

    await adminDb.collection('users').doc(uid).update({
      videoProfileUrl: videoUrl,
      updatedAt: new Date().toISOString(),
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('worker-video POST error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const uid = req.headers.get('x-user-id')
  if (!uid) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  try {
    const snap = await adminDb.collection('users').doc(uid).get()
    if (!snap.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    const data = snap.data()
    return NextResponse.json({ videoProfileUrl: data?.videoProfileUrl ?? null })
  } catch (err) {
    console.error('worker-video GET error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
