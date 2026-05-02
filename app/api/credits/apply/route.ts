/**
 * POST /api/credits/apply
 *
 * Applies a user's credit balance against a payment amount.
 * Records the credit usage in Firestore and returns the adjusted amount.
 *
 * Body: { userId, amount, jobId }
 * Returns: { creditUsed, adjustedAmount, remainingCredit }
 */
import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'
import type { CreditTransaction } from '@/types'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { userId, amount, jobId } = await req.json() as {
      userId?: string
      amount?: number
      jobId?: string
    }

    if (!userId || amount === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, amount' },
        { status: 400 },
      )
    }

    const userRef = adminDb.collection('users').doc(userId)
    const userDoc = await userRef.get()
    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const currentCredit: number = userDoc.data()?.credit ?? 0
    if (currentCredit <= 0) {
      return NextResponse.json({ creditUsed: 0, adjustedAmount: amount, remainingCredit: 0 })
    }

    const creditUsed = Math.min(currentCredit, amount)
    const adjustedAmount = Math.max(0, amount - creditUsed)
    const remainingCredit = Math.round((currentCredit - creditUsed) * 100) / 100

    const now = new Date().toISOString()

    // Deduct credit and record transaction atomically
    await adminDb.runTransaction(async (tx) => {
      tx.update(userRef, { credit: FieldValue.increment(-creditUsed) })

      const txRef = adminDb
        .collection('creditTransactions')
        .doc(userId)
        .collection('items')
        .doc()

      const txData: Omit<CreditTransaction, 'id'> = {
        userId,
        amount: -creditUsed,
        type: 'promo_applied',
        description: `NZ$${creditUsed.toFixed(2)} credit applied at checkout`,
        ...(jobId ? { jobId } : {}),
        createdAt: now,
      }
      tx.set(txRef, txData)
    })

    return NextResponse.json({ creditUsed, adjustedAmount, remainingCredit })
  } catch (err) {
    console.error('POST /api/credits/apply error:', err)
    return NextResponse.json({ error: 'Failed to apply credit' }, { status: 500 })
  }
}
