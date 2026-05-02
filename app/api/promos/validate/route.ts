/**
 * POST /api/promos/validate
 *
 * Validates a promo code against the Firestore promoCodes collection.
 * Returns the discount amount and type if valid.
 *
 * Body: { code, userId, amount, jobId? }
 * Returns: { valid, discountType, discountAmount, discountedAmount, code }
 */
import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import type { PromoCode } from '@/types'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { code, userId, amount } = await req.json() as {
      code?: string
      userId?: string
      amount?: number
      jobId?: string
    }

    if (!code || !userId || amount === undefined) {
      return NextResponse.json(
        { valid: false, error: 'Missing required fields: code, userId, amount' },
        { status: 400 },
      )
    }

    const normalised = code.trim().toUpperCase()
    const docRef = adminDb.collection('promoCodes').doc(normalised)
    const snap = await docRef.get()

    if (!snap.exists) {
      return NextResponse.json({ valid: false, error: 'Promo code not found' }, { status: 404 })
    }

    const promo = snap.data() as PromoCode

    if (!promo.active) {
      return NextResponse.json({ valid: false, error: 'Promo code is no longer active' })
    }

    if (promo.expiresAt && new Date(promo.expiresAt) < new Date()) {
      return NextResponse.json({ valid: false, error: 'Promo code has expired' })
    }

    if (promo.maxUses > 0 && promo.usedCount >= promo.maxUses) {
      return NextResponse.json({ valid: false, error: 'Promo code has reached its usage limit' })
    }

    const discountAmount =
      promo.discountType === 'percent'
        ? Math.round((amount * promo.discountAmount) / 100 * 100) / 100
        : Math.min(promo.discountAmount, amount)

    const discountedAmount = Math.max(0, amount - discountAmount)

    return NextResponse.json({
      valid: true,
      code: normalised,
      discountType: promo.discountType,
      discountAmount,
      discountedAmount,
      applicableTo: promo.applicableTo,
    })
  } catch (err) {
    console.error('POST /api/promos/validate error:', err)
    return NextResponse.json({ valid: false, error: 'Validation failed' }, { status: 500 })
  }
}
