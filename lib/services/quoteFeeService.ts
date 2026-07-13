import { adminDb } from '@/lib/firebase-admin'
import type { QuoteFeePayment } from '@/types'
import { normalizeCurrencyAmount } from '@/lib/utils/money'

const QUOTE_FEE_PAYMENTS_COL = 'quoteFeePayments'

export const QUOTE_FEE_COMMISSION_RATE = 0.1

function toIso(value: unknown, fallback: string): string {
  if (typeof value === 'string') return value
  if (
    value &&
    typeof value === 'object' &&
    'toDate' in value &&
    typeof (value as { toDate?: unknown }).toDate === 'function'
  ) {
    return (value as { toDate: () => Date }).toDate().toISOString()
  }
  return fallback
}

function toQuoteFeePayment(id: string, data: Record<string, unknown>): QuoteFeePayment {
  const fallback = new Date().toISOString()

  return {
    id,
    employerId: String(data.employerId ?? ''),
    workerId: String(data.workerId ?? ''),
    workerName: String(data.workerName ?? 'Worker'),
    amount: Number(data.amount ?? 0),
    currency: data.currency === 'aud' ? 'aud' : 'nzd',
    status:
      data.status === 'completed' ||
      data.status === 'failed' ||
      data.status === 'refunded'
        ? data.status
        : 'pending',
    stripePaymentIntentId:
      typeof data.stripePaymentIntentId === 'string' ? data.stripePaymentIntentId : undefined,
    commissionRate: Number(data.commissionRate ?? QUOTE_FEE_COMMISSION_RATE),
    commissionAmount: Number(data.commissionAmount ?? 0),
    workerAmount: Number(data.workerAmount ?? 0),
    directRequestId: typeof data.directRequestId === 'string' ? data.directRequestId : undefined,
    requestDescription:
      typeof data.requestDescription === 'string' ? data.requestDescription : undefined,
    requestedDate: typeof data.requestedDate === 'string' ? data.requestedDate : undefined,
    address: typeof data.address === 'string' ? data.address : undefined,
    paymentType: 'quote_fee',
    createdAt: toIso(data.createdAt, fallback),
    updatedAt: toIso(data.updatedAt, fallback),
    completedAt: data.completedAt ? toIso(data.completedAt, fallback) : undefined,
    failedAt: data.failedAt ? toIso(data.failedAt, fallback) : undefined,
  }
}

export function calculateQuoteFeeCommission(amount: number) {
  const normalizedAmount = normalizeCurrencyAmount(amount)
  const commissionCents = Math.round(normalizedAmount * QUOTE_FEE_COMMISSION_RATE * 100)
  const commissionAmount = commissionCents / 100
  const workerAmount = normalizeCurrencyAmount(normalizedAmount - commissionAmount)

  return {
    commissionRate: QUOTE_FEE_COMMISSION_RATE,
    commissionAmount,
    workerAmount,
  }
}

export async function createQuoteFeePaymentRecord(
  data: Omit<QuoteFeePayment, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  if (!adminDb) throw new Error('Firestore not available')

  const now = new Date().toISOString()
  const ref = await adminDb.collection(QUOTE_FEE_PAYMENTS_COL).add({
    ...data,
    createdAt: now,
    updatedAt: now,
  })

  return ref.id
}

export async function getQuoteFeePaymentByIntent(
  stripePaymentIntentId: string
): Promise<QuoteFeePayment | null> {
  if (!adminDb) return null

  const snapshot = await adminDb
    .collection(QUOTE_FEE_PAYMENTS_COL)
    .where('stripePaymentIntentId', '==', stripePaymentIntentId)
    .limit(1)
    .get()

  if (snapshot.empty) return null

  return toQuoteFeePayment(
    snapshot.docs[0].id,
    snapshot.docs[0].data() as Record<string, unknown>
  )
}

export async function updateQuoteFeePayment(
  id: string,
  updates: Partial<Omit<QuoteFeePayment, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<void> {
  if (!adminDb) throw new Error('Firestore not available')

  await adminDb.collection(QUOTE_FEE_PAYMENTS_COL).doc(id).set(
    {
      ...updates,
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  )
}
