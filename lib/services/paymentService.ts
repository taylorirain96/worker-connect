/**
 * Payment service — Firestore helpers for payments, invoices, payouts, disputes, and refunds.
 * All write operations are fire-and-forget; callers should handle errors.
 */
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Payment, Invoice, InvoiceItem, Payout, PayoutSettings, Dispute, Refund } from '@/types'

// ─── Collection names ──────────────────────────────────────────────────────

const PAYMENTS_COL = 'payments'
const INVOICES_COL = 'invoices'
const PAYOUTS_COL = 'payouts'
const PAYOUT_SETTINGS_COL = 'payoutSettings'
const DISPUTES_COL = 'disputes'
const REFUNDS_COL = 'refunds'

// ─── Helpers ────────────────────────────────────────────────────────────────

function toTimestamp(ts: Timestamp | string | undefined): string {
  if (!ts) return new Date().toISOString()
  if (ts instanceof Timestamp) return ts.toDate().toISOString()
  return ts
}

// ─── Payments ───────────────────────────────────────────────────────────────

/** Fetch all payments for a worker, newest first. */
export async function getWorkerPayments(workerId: string): Promise<Payment[]> {
  if (!db) return []
  const q = query(
    collection(db, PAYMENTS_COL),
    where('workerId', '==', workerId),
    orderBy('createdAt', 'desc'),
    limit(100)
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => {
    const data = d.data()
    return {
      ...data,
      id: d.id,
      createdAt: toTimestamp(data.createdAt),
      updatedAt: toTimestamp(data.updatedAt),
    } as Payment
  })
}

/** Fetch all payments for an employer, newest first. */
export async function getEmployerPayments(employerId: string): Promise<Payment[]> {
  if (!db) return []
  const q = query(
    collection(db, PAYMENTS_COL),
    where('employerId', '==', employerId),
    orderBy('createdAt', 'desc'),
    limit(100)
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => {
    const data = d.data()
    return {
      ...data,
      id: d.id,
      createdAt: toTimestamp(data.createdAt),
      updatedAt: toTimestamp(data.updatedAt),
    } as Payment
  })
}

/** Fetch a single payment by id. */
export async function getPayment(paymentId: string): Promise<Payment | null> {
  if (!db) return null
  const snap = await getDoc(doc(db, PAYMENTS_COL, paymentId))
  if (!snap.exists()) return null
  const data = snap.data()
  return {
    ...data,
    id: snap.id,
    createdAt: toTimestamp(data.createdAt),
    updatedAt: toTimestamp(data.updatedAt),
  } as Payment
}

/** Create a payment record in Firestore. */
export async function createPayment(
  data: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  if (!db) throw new Error('Firestore not available')
  const ref = await addDoc(collection(db, PAYMENTS_COL), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

/** Update a payment's status. */
export async function updatePaymentStatus(
  paymentId: string,
  status: Payment['status']
): Promise<void> {
  if (!db) return
  await updateDoc(doc(db, PAYMENTS_COL, paymentId), {
    status,
    updatedAt: serverTimestamp(),
  })
}

// ─── Invoices ───────────────────────────────────────────────────────────────

/** Fetch invoices for a worker. */
export async function getWorkerInvoices(workerId: string): Promise<Invoice[]> {
  if (!db) return []
  const q = query(
    collection(db, INVOICES_COL),
    where('workerId', '==', workerId),
    orderBy('createdAt', 'desc'),
    limit(100)
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => {
    const data = d.data()
    return {
      ...data,
      id: d.id,
      createdAt: toTimestamp(data.createdAt),
      paidAt: data.paidAt ? toTimestamp(data.paidAt) : undefined,
    } as Invoice
  })
}

/** Fetch a single invoice. */
export async function getInvoice(invoiceId: string): Promise<Invoice | null> {
  if (!db) return null
  const snap = await getDoc(doc(db, INVOICES_COL, invoiceId))
  if (!snap.exists()) return null
  const data = snap.data()
  return {
    ...data,
    id: snap.id,
    createdAt: toTimestamp(data.createdAt),
    paidAt: data.paidAt ? toTimestamp(data.paidAt) : undefined,
  } as Invoice
}

/** Create an invoice. Returns the new document id. */
export async function createInvoice(
  data: Omit<Invoice, 'id' | 'createdAt'>
): Promise<string> {
  if (!db) throw new Error('Firestore not available')
  const ref = await addDoc(collection(db, INVOICES_COL), {
    ...data,
    createdAt: serverTimestamp(),
  })
  return ref.id
}

/** Mark an invoice as paid. */
export async function markInvoicePaid(invoiceId: string): Promise<void> {
  if (!db) return
  await updateDoc(doc(db, INVOICES_COL, invoiceId), {
    status: 'paid',
    paidAt: serverTimestamp(),
  })
}

// ─── Payouts ────────────────────────────────────────────────────────────────

/** Fetch payouts for a worker. */
export async function getWorkerPayouts(workerId: string): Promise<Payout[]> {
  if (!db) return []
  const q = query(
    collection(db, PAYOUTS_COL),
    where('workerId', '==', workerId),
    orderBy('createdAt', 'desc'),
    limit(100)
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => {
    const data = d.data()
    return {
      ...data,
      id: d.id,
      createdAt: toTimestamp(data.createdAt),
      updatedAt: toTimestamp(data.updatedAt),
      paidAt: data.paidAt ? toTimestamp(data.paidAt) : undefined,
      estimatedArrival: data.estimatedArrival ? toTimestamp(data.estimatedArrival) : undefined,
    } as Payout
  })
}

/** Create a payout record. */
export async function createPayout(
  data: Omit<Payout, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  if (!db) throw new Error('Firestore not available')
  const ref = await addDoc(collection(db, PAYOUTS_COL), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

/** Update a payout's status. */
export async function updatePayoutStatus(
  payoutId: string,
  status: Payout['status'],
  extra?: Partial<Payout>
): Promise<void> {
  if (!db) return
  await updateDoc(doc(db, PAYOUTS_COL, payoutId), {
    status,
    ...extra,
    updatedAt: serverTimestamp(),
  })
}

// ─── Payout Settings ────────────────────────────────────────────────────────

/** Fetch payout settings for a worker. */
export async function getPayoutSettings(workerId: string): Promise<PayoutSettings | null> {
  if (!db) return null
  const snap = await getDoc(doc(db, PAYOUT_SETTINGS_COL, workerId))
  if (!snap.exists()) return null
  const data = snap.data()
  return {
    ...data,
    workerId,
    updatedAt: toTimestamp(data.updatedAt),
  } as PayoutSettings
}

/** Save payout settings for a worker. */
export async function savePayoutSettings(
  workerId: string,
  settings: Omit<PayoutSettings, 'workerId' | 'updatedAt'>
): Promise<void> {
  if (!db) throw new Error('Firestore not available')
  const { setDoc } = await import('firebase/firestore')
  const ref = doc(db, PAYOUT_SETTINGS_COL, workerId)
  // setDoc with merge:true creates or updates the document atomically
  await setDoc(ref, {
    ...settings,
    workerId,
    updatedAt: serverTimestamp(),
  }, { merge: true })
}

// ─── Invoice (extended) ─────────────────────────────────────────────────────

/** Generate an INV-YYYYMMDD-XXXX invoice number (utility). */
function buildInvoiceNumber(seq: number): string {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  return `INV-${datePart}-${String(seq).padStart(4, '0')}`
}

/** Fetch all invoices for a user (as employer or worker). */
export async function getUserInvoices(
  userId: string,
  filters?: { status?: Invoice['status']; pageSize?: number }
): Promise<Invoice[]> {
  if (!db) return []
  const ps = filters?.pageSize ?? 50
  const makeQuery = (field: string) => {
    const constraints = [
      where(field, '==', userId),
      orderBy('createdAt', 'desc'),
      limit(ps),
    ]
    if (filters?.status) {
      constraints.splice(1, 0, where('status', '==', filters.status))
    }
    return getDocs(query(collection(db!, INVOICES_COL), ...constraints))
  }

  const [asEmployer, asWorker] = await Promise.all([
    makeQuery('employerId'),
    makeQuery('workerId'),
  ])

  const map = new Map<string, Invoice>()
  ;[...asEmployer.docs, ...asWorker.docs].forEach((d) => {
    const data = d.data()
    map.set(d.id, {
      ...data,
      id: d.id,
      createdAt: toTimestamp(data.createdAt),
      updatedAt: data.updatedAt ? toTimestamp(data.updatedAt) : undefined,
      paidAt: data.paidAt ? toTimestamp(data.paidAt) : undefined,
    } as Invoice)
  })

  return Array.from(map.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
}

/** Create a full invoice with auto-generated invoice number. */
export async function createFullInvoice(
  data: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt' | 'invoiceNumber'> & {
    items: InvoiceItem[]
  }
): Promise<string> {
  if (!db) throw new Error('Firestore not available')
  const invoiceNumber = buildInvoiceNumber(Date.now() % 10000)
  const ref = await addDoc(collection(db, INVOICES_COL), {
    ...data,
    invoiceNumber,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

const INVOICE_TRANSITIONS: Record<string, string[]> = {
  draft: ['sent', 'cancelled'],
  sent: ['paid', 'cancelled', 'overdue'],
  paid: ['completed'],
  overdue: ['paid', 'cancelled'],
  completed: [],
  cancelled: [],
}

/** Update invoice status with transition validation. */
export async function updateInvoiceStatus(
  invoiceId: string,
  newStatus: Invoice['status']
): Promise<void> {
  if (!db) return
  const snap = await getDoc(doc(db, INVOICES_COL, invoiceId))
  if (!snap.exists()) throw new Error(`Invoice ${invoiceId} not found`)
  const currentStatus = snap.data()?.status as string
  const allowed = INVOICE_TRANSITIONS[currentStatus] ?? []
  if (!allowed.includes(newStatus)) {
    throw new Error(`Invalid status transition from '${currentStatus}' to '${newStatus}'`)
  }
  const updates: Record<string, unknown> = { status: newStatus, updatedAt: serverTimestamp() }
  if (newStatus === 'paid') updates.paidAt = serverTimestamp()
  await updateDoc(doc(db, INVOICES_COL, invoiceId), updates)
}

/** Delete a draft invoice. */
export async function deleteInvoice(invoiceId: string): Promise<void> {
  if (!db) return
  const snap = await getDoc(doc(db, INVOICES_COL, invoiceId))
  if (!snap.exists()) throw new Error(`Invoice ${invoiceId} not found`)
  if (snap.data()?.status !== 'draft') {
    throw new Error('Only draft invoices can be deleted')
  }
  await deleteDoc(doc(db, INVOICES_COL, invoiceId))
}

// ─── Disputes (payment-linked) ───────────────────────────────────────────────

function toDisputeTimestamps(id: string, data: Record<string, unknown>): Dispute {
  return {
    ...data,
    id,
    createdAt: toTimestamp(data.createdAt as Timestamp | string | undefined),
    updatedAt: toTimestamp(data.updatedAt as Timestamp | string | undefined),
    resolvedAt: data.resolvedAt
      ? toTimestamp(data.resolvedAt as Timestamp | string | undefined)
      : undefined,
  } as Dispute
}

/** Create a dispute record in Firestore. Returns the new document id. */
export async function createDisputeRecord(
  data: Omit<Dispute, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  if (!db) throw new Error('Firestore not available')
  const ref = await addDoc(collection(db, DISPUTES_COL), {
    ...data,
    status: data.status ?? 'open',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

/** Fetch a dispute by id. */
export async function getDisputeRecord(disputeId: string): Promise<Dispute | null> {
  if (!db) return null
  const snap = await getDoc(doc(db, DISPUTES_COL, disputeId))
  if (!snap.exists()) return null
  return toDisputeTimestamps(snap.id, snap.data() as Record<string, unknown>)
}

/** Fetch all disputes for a payment. */
export async function getPaymentDisputes(paymentId: string): Promise<Dispute[]> {
  if (!db) return []
  const snap = await getDocs(
    query(
      collection(db, DISPUTES_COL),
      where('paymentId', '==', paymentId),
      orderBy('createdAt', 'desc')
    )
  )
  return snap.docs.map((d) =>
    toDisputeTimestamps(d.id, d.data() as Record<string, unknown>)
  )
}

const DISPUTE_TRANSITIONS: Record<string, string[]> = {
  open: ['under_review', 'resolved', 'refunded'],
  under_review: ['resolved', 'refunded', 'open'],
  resolved: [],
  refunded: [],
}

/** Update dispute status with optional resolution notes. */
export async function updateDisputeStatus(
  disputeId: string,
  newStatus: string,
  notes?: string
): Promise<void> {
  if (!db) return
  const snap = await getDoc(doc(db, DISPUTES_COL, disputeId))
  if (!snap.exists()) throw new Error(`Dispute ${disputeId} not found`)
  const currentStatus = snap.data()?.status as string
  const allowed = DISPUTE_TRANSITIONS[currentStatus] ?? []
  if (!allowed.includes(newStatus)) {
    throw new Error(`Invalid status transition from '${currentStatus}' to '${newStatus}'`)
  }
  const updates: Record<string, unknown> = { status: newStatus, updatedAt: serverTimestamp() }
  if (notes !== undefined) updates.notes = notes
  if (newStatus === 'resolved' || newStatus === 'refunded') {
    updates.resolvedAt = serverTimestamp()
  }
  await updateDoc(doc(db, DISPUTES_COL, disputeId), updates)
}

/** Mark a dispute as resolved with a resolution object. */
export async function resolveDispute(
  disputeId: string,
  resolution: { notes: string; refundAmount?: number }
): Promise<void> {
  if (!db) return
  const updates: Record<string, unknown> = {
    status: 'resolved',
    notes: resolution.notes,
    resolvedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }
  if (resolution.refundAmount !== undefined) updates.refundAmount = resolution.refundAmount
  await updateDoc(doc(db, DISPUTES_COL, disputeId), updates)
}

// ─── Refunds ─────────────────────────────────────────────────────────────────

function toRefundTimestamps(id: string, data: Record<string, unknown>): Refund {
  return {
    ...data,
    id,
    createdAt: toTimestamp(data.createdAt as Timestamp | string | undefined),
    updatedAt: toTimestamp(data.updatedAt as Timestamp | string | undefined),
    completedAt: data.completedAt
      ? toTimestamp(data.completedAt as Timestamp | string | undefined)
      : undefined,
    failedAt: data.failedAt
      ? toTimestamp(data.failedAt as Timestamp | string | undefined)
      : undefined,
  } as Refund
}

/** Create a refund record in Firestore. Returns the new document id. */
export async function createRefund(
  data: Omit<Refund, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  if (!db) throw new Error('Firestore not available')
  const ref = await addDoc(collection(db, REFUNDS_COL), {
    ...data,
    status: data.status ?? 'pending',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

/** Fetch a refund by id. */
export async function getRefund(refundId: string): Promise<Refund | null> {
  if (!db) return null
  const snap = await getDoc(doc(db, REFUNDS_COL, refundId))
  if (!snap.exists()) return null
  return toRefundTimestamps(snap.id, snap.data() as Record<string, unknown>)
}

/** Fetch all refunds for a payment. */
export async function getPaymentRefunds(paymentId: string): Promise<Refund[]> {
  if (!db) return []
  const snap = await getDocs(
    query(
      collection(db, REFUNDS_COL),
      where('paymentId', '==', paymentId),
      orderBy('createdAt', 'desc')
    )
  )
  return snap.docs.map((d) =>
    toRefundTimestamps(d.id, d.data() as Record<string, unknown>)
  )
}

/** Update refund status with optional failure reason. */
export async function updateRefundStatus(
  refundId: string,
  status: Refund['status'],
  failureReason?: string
): Promise<void> {
  if (!db) return
  const updates: Record<string, unknown> = { status, updatedAt: serverTimestamp() }
  if (status === 'completed') updates.completedAt = serverTimestamp()
  if (status === 'failed') {
    updates.failedAt = serverTimestamp()
    if (failureReason) updates.failureReason = failureReason
  }
  await updateDoc(doc(db, REFUNDS_COL, refundId), updates)
}
