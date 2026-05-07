import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { rateLimit } from '@/lib/rateLimit'

function isValidVideoUrl(value: string): boolean {
  if (value.length > 2_000) return false
  try {
    const url = new URL(value)
    if (url.protocol !== 'https:') return false
    return true
  } catch {
    return false
  }
}

export async function POST(req: NextRequest) {
  const uid = req.headers.get('x-user-id')
  if (!uid) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  try {
    if (rateLimit(req, { max: 20, windowMs: 60_000 })) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const { videoUrl } = await req.json()
    if (!videoUrl || typeof videoUrl !== 'string') {
      return NextResponse.json({ error: 'videoUrl is required' }, { status: 400 })
    }
    if (!isValidVideoUrl(videoUrl)) {
      return NextResponse.json({ error: 'Invalid video URL' }, { status: 400 })
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
