/**
 * PUT  /api/promos/[code]    — update a promo code (admin only)
 * DELETE /api/promos/[code]  — delete a promo code (admin only)
 */
import { NextRequest, NextResponse } from 'next/server'
import { adminDb, adminAuth } from '@/lib/firebase-admin'
import type { PromoCode } from '@/types'

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

export async function PUT(
  req: NextRequest,
  { params }: { params: { code: string } },
) {
  const uid = await requireAdmin(req)
  if (!uid) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const code = params.code.toUpperCase()
  try {
    const body = await req.json() as Partial<PromoCode>
    const docRef = adminDb.collection('promoCodes').doc(code)
    const snap = await docRef.get()
    if (!snap.exists) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const updates: Partial<Omit<PromoCode, 'code' | 'createdBy' | 'createdAt' | 'usedCount'>> = {
      updatedAt: new Date().toISOString(),
    }
    if (body.discountType !== undefined) updates.discountType = body.discountType
    if (body.discountAmount !== undefined) updates.discountAmount = Number(body.discountAmount)
    if (body.maxUses !== undefined) updates.maxUses = Number(body.maxUses)
    if (body.expiresAt !== undefined) updates.expiresAt = body.expiresAt
    if (body.active !== undefined) updates.active = body.active
    if (body.applicableTo !== undefined) updates.applicableTo = body.applicableTo

    await docRef.update(updates)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(`PUT /api/promos/${code} error:`, err)
    return NextResponse.json({ error: 'Failed to update promo code' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { code: string } },
) {
  const uid = await requireAdmin(req)
  if (!uid) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const code = params.code.toUpperCase()
  try {
    await adminDb.collection('promoCodes').doc(code).delete()
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(`DELETE /api/promos/${code} error:`, err)
    return NextResponse.json({ error: 'Failed to delete promo code' }, { status: 500 })
  }
}
