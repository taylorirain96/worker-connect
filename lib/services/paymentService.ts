/**
 * Payment service — Firestore helpers for payments, invoices, and payouts.
 * All write operations are fire-and-forget; callers should handle errors.
 */
import {
  collection,
  doc,
  addDoc,
  updateDoc,
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
import type { Payment, Invoice, Payout, PayoutSettings } from '@/types'

// ─── Collection names ──────────────────────────────────────────────────────

const PAYMENTS_COL = 'payments'
const INVOICES_COL = 'invoices'
const PAYOUTS_COL = 'payouts'
const PAYOUT_SETTINGS_COL = 'payoutSettings'

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
  const ref = doc(db, PAYOUT_SETTINGS_COL, workerId)
  await updateDoc(ref, {
    ...settings,
    workerId,
    updatedAt: serverTimestamp(),
  }).catch(async () => {
    // Document may not exist yet — use addDoc equivalent via setDoc
    const { setDoc } = await import('firebase/firestore')
    await setDoc(ref, {
      ...settings,
      workerId,
      updatedAt: serverTimestamp(),
    })
  })
}
