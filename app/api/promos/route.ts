/**
 * GET  /api/promos        — list all promo codes (admin only)
 * POST /api/promos        — create a new promo code (admin only)
 */
import { NextRequest, NextResponse } from 'next/server'
import { adminDb, adminAuth } from '@/lib/firebase-admin'
import type { PromoCode } from '@/types'
import type { QueryDocumentSnapshot } from 'firebase-admin/firestore'

export const dynamic = 'force-dynamic'

async function requireAdmin(req: NextRequest): Promise<string | null> {
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return null
  try {
    const decoded = await adminAuth.verifyIdToken(token)
    const userDoc = await adminDb.collection('users').doc(decoded.uid).get()
    if (userDoc.data()?.role !== 'admin') return null
    return decoded.uid
  } catch {
    return null
  }
}

export async function GET(req: NextRequest) {
  const uid = await requireAdmin(req)
  if (!uid) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  try {
    const snap = await adminDb.collection('promoCodes').orderBy('createdAt', 'desc').get()
    const codes: PromoCode[] = snap.docs.map((d: QueryDocumentSnapshot) => ({
      ...(d.data() as Omit<PromoCode, 'code'>),
      code: d.id,
    }))
    return NextResponse.json({ codes })
  } catch (err) {
    console.error('GET /api/promos error:', err)
    return NextResponse.json({ error: 'Failed to fetch promo codes' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const uid = await requireAdmin(req)
  if (!uid) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  try {
    const body = await req.json() as Partial<PromoCode>
    const { code, discountType, discountAmount, maxUses, expiresAt, applicableTo } = body

    if (!code || !discountType || discountAmount === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: code, discountType, discountAmount' },
        { status: 400 },
      )
    }

    const normalised = code.trim().toUpperCase()
    const docRef = adminDb.collection('promoCodes').doc(normalised)
    const existing = await docRef.get()
    if (existing.exists) {
      return NextResponse.json({ error: 'Promo code already exists' }, { status: 409 })
    }

    const now = new Date().toISOString()
    const promoData: Omit<PromoCode, 'code'> = {
      discountType,
      discountAmount: Number(discountAmount),
      maxUses: Number(maxUses ?? 0),
      usedCount: 0,
      expiresAt: expiresAt ?? null,
      createdBy: uid,
      active: true,
      applicableTo: applicableTo ?? 'all_jobs',
      createdAt: now,
      updatedAt: now,
    }

    await docRef.set(promoData)
    return NextResponse.json({ success: true, code: normalised }, { status: 201 })
  } catch (err) {
    console.error('POST /api/promos error:', err)
    return NextResponse.json({ error: 'Failed to create promo code' }, { status: 500 })
  }
}
