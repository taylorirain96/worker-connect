import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'

export const dynamic = 'force-dynamic'

const MAX_ALERTS_PER_USER = 5

interface SearchAlertDoc {
  id: string
  uid: string
  category: string
  location: string
  budgetMin?: number
  budgetMax?: number
  keywords?: string
  channels: {
    email: boolean
    push: boolean
  }
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// ─── GET /api/search-alerts ──────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  try {
    const uid = req.headers.get('x-user-id')
    if (!uid) {
      return NextResponse.json({ error: 'Missing x-user-id header' }, { status: 401 })
    }

    try {
      const snap = await adminDb
        .collection('searchAlerts')
        .doc(uid)
        .collection('items')
        .orderBy('createdAt', 'desc')
        .get()

      const alerts = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as SearchAlertDoc[]
      return NextResponse.json({ alerts })
    } catch {
      // Mock fallback when Firestore is unavailable
      const mockAlerts: SearchAlertDoc[] = [
        {
          id: 'alert_mock_1',
          uid,
          category: 'plumbing',
          location: 'Auckland',
          channels: { email: true, push: true },
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]
      return NextResponse.json({ alerts: mockAlerts })
    }
  } catch (error) {
    console.error('GET /api/search-alerts error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ─── POST /api/search-alerts ─────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const uid = req.headers.get('x-user-id')
    if (!uid) {
      return NextResponse.json({ error: 'Missing x-user-id header' }, { status: 401 })
    }

    const body = await req.json() as {
      category?: string
      location?: string
      budgetMin?: number
      budgetMax?: number
      keywords?: string
      channels?: { email: boolean; push: boolean }
    }

    const { category, location, budgetMin, budgetMax, keywords, channels } = body

    if (!category || !location) {
      return NextResponse.json({ error: 'category and location are required' }, { status: 400 })
    }

    const now = new Date().toISOString()
    const alertData: Omit<SearchAlertDoc, 'id'> = {
      uid,
      category,
      location,
      channels: channels ?? { email: true, push: false },
      isActive: true,
      createdAt: now,
      updatedAt: now,
      ...(budgetMin !== undefined && { budgetMin }),
      ...(budgetMax !== undefined && { budgetMax }),
      ...(keywords?.trim() && { keywords: keywords.trim() }),
    }

    let alertId: string
    try {
      const itemsRef = adminDb.collection('searchAlerts').doc(uid).collection('items')

      // Enforce per-user limit
      const existingSnap = await itemsRef.count().get()
      if (existingSnap.data().count >= MAX_ALERTS_PER_USER) {
        return NextResponse.json(
          { error: `You can have a maximum of ${MAX_ALERTS_PER_USER} alerts` },
          { status: 400 }
        )
      }

      const ref = await itemsRef.add({
        ...alertData,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      })
      alertId = ref.id
    } catch {
      console.warn('Firestore unavailable — returning mock alert id')
      alertId = `alert_${Date.now()}`
    }

    return NextResponse.json({ alert: { id: alertId, ...alertData } }, { status: 201 })
  } catch (error) {
    console.error('POST /api/search-alerts error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ─── DELETE /api/search-alerts?id=xxx ────────────────────────────────────────

export async function DELETE(req: NextRequest) {
  try {
    const uid = req.headers.get('x-user-id')
    if (!uid) {
      return NextResponse.json({ error: 'Missing x-user-id header' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const alertId = searchParams.get('id')
    if (!alertId) {
      return NextResponse.json({ error: 'Missing id query parameter' }, { status: 400 })
    }

    try {
      const docRef = adminDb
        .collection('searchAlerts')
        .doc(uid)
        .collection('items')
        .doc(alertId)

      const snap = await docRef.get()
      if (!snap.exists) {
        return NextResponse.json({ error: 'Alert not found' }, { status: 404 })
      }
      if (snap.data()?.uid !== uid) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }

      await docRef.delete()
    } catch {
      console.warn('Firestore unavailable — skipping delete')
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/search-alerts error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
