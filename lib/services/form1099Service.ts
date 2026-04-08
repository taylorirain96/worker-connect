/**
 * 1099-NEC form service.
 * Generates and stores annual 1099-NEC forms for workers.
 * Workers are responsible for filing their own taxes.
 */
import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
  type DocumentData,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { TaxForm1099NEC } from '@/types'
import { getYearlyEarnings } from './taxService'

// ─── Constants ─────────────────────────────────────────────────────────────────

const FORMS_COL = 'taxForms1099'
const BUSINESS_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? 'worker-connect'
const BUSINESS_EIN = process.env.BUSINESS_EIN ?? '00-0000000'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toStr(ts: Timestamp | string | undefined): string {
  if (!ts) return new Date().toISOString()
  if (ts instanceof Timestamp) return ts.toDate().toISOString()
  return ts
}

function docToForm(id: string, data: DocumentData): TaxForm1099NEC {
  return {
    ...data,
    id,
    generatedAt: toStr(data.generatedAt),
    sentAt: data.sentAt ? toStr(data.sentAt) : undefined,
  } as TaxForm1099NEC
}

// ─── 1099 Management ──────────────────────────────────────────────────────────

/**
 * Generate (or retrieve existing) 1099-NEC for a worker and year.
 * If already generated, returns the existing form.
 */
export async function generate1099(
  workerId: string,
  workerName: string,
  workerEmail: string,
  workerAddress: string,
  year: number
): Promise<TaxForm1099NEC> {
  if (!db) throw new Error('Firestore not available')

  // Check if already generated
  const existing = await getWorker1099s(workerId)
  const found = existing.find((f) => f.year === year)
  if (found) return found

  // Calculate total earnings for the year
  const yearly = await getYearlyEarnings(workerId, year)

  const data: Omit<TaxForm1099NEC, 'id'> = {
    workerId,
    workerName,
    workerEmail,
    workerAddress,
    year,
    boxNC2: yearly.totalEarnings,
    businessName: BUSINESS_NAME,
    businessEIN: BUSINESS_EIN,
    generatedAt: new Date().toISOString(),
    status: 'generated',
  }

  const ref = await addDoc(collection(db, FORMS_COL), {
    ...data,
    generatedAt: serverTimestamp(),
  })

  return { ...data, id: ref.id }
}

/** Get all 1099 forms for a worker. */
export async function getWorker1099s(workerId: string): Promise<TaxForm1099NEC[]> {
  if (!db) return []
  const q = query(
    collection(db, FORMS_COL),
    where('workerId', '==', workerId),
    orderBy('year', 'desc')
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => docToForm(d.id, d.data()))
}

/** Get all 1099 forms for a given year (admin). */
export async function getAll1099sForYear(year: number): Promise<TaxForm1099NEC[]> {
  if (!db) return []
  const q = query(
    collection(db, FORMS_COL),
    where('year', '==', year),
    orderBy('generatedAt', 'desc')
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => docToForm(d.id, d.data()))
}

/** Get all 1099 forms (admin, all years). */
export async function getAllForms1099(filters?: {
  year?: number
  status?: TaxForm1099NEC['status']
}): Promise<TaxForm1099NEC[]> {
  if (!db) return []
  const constraints: Parameters<typeof query>[1][] = [orderBy('year', 'desc')]
  if (filters?.year) constraints.push(where('year', '==', filters.year))
  if (filters?.status) constraints.push(where('status', '==', filters.status))
  const q = query(collection(db, FORMS_COL), ...constraints)
  const snap = await getDocs(q)
  return snap.docs.map((d) => docToForm(d.id, d.data()))
}

/** Mark a 1099 as sent (after emailing to worker). */
export async function markFormSent(form1099Id: string): Promise<void> {
  if (!db) return
  await updateDoc(doc(db, FORMS_COL, form1099Id), {
    status: 'sent',
    sentAt: serverTimestamp(),
  })
}

/** Archive a 1099 form. */
export async function archiveForm(form1099Id: string): Promise<void> {
  if (!db) return
  await updateDoc(doc(db, FORMS_COL, form1099Id), { status: 'archived' })
}

/**
 * Send 1099 to worker via email.
 * In production: integrate SendGrid / Resend and attach a PDF.
 */
export async function send1099ToWorker(form1099Id: string): Promise<void> {
  if (!db) throw new Error('Firestore not available')
  const snap = await getDoc(doc(db, FORMS_COL, form1099Id))
  if (!snap.exists()) throw new Error(`1099 form ${form1099Id} not found`)
  const form = docToForm(snap.id, snap.data())

  // TODO: Integrate email provider (SendGrid / Resend) here.
  // Example with SendGrid:
  // await sgMail.send({
  //   to: form.workerEmail,
  //   from: 'noreply@worker-connect.com',
  //   subject: `Your ${form.year} 1099-NEC Tax Form (${BUSINESS_NAME})`,
  //   text: buildEmailBody(form),
  //   attachments: [{ content: pdfBase64, filename: `1099-NEC-${form.year}.pdf`, type: 'application/pdf' }],
  // })

  console.info(`[form1099Service] Would send 1099 to ${form.workerEmail} for year ${form.year}`)
  await markFormSent(form1099Id)
}

/**
 * Generate 1099s in batch for all workers who earned >= $600 in a given year.
 * Requires pre-built worker list with profile data.
 */
export async function generate1099Batch(
  workers: Array<{ id: string; name: string; email: string; address: string }>,
  year: number
): Promise<TaxForm1099NEC[]> {
  const results: TaxForm1099NEC[] = []
  for (const w of workers) {
    const yearly = await getYearlyEarnings(w.id, year)
    // IRS threshold: only generate if earnings >= $600
    if (yearly.totalEarnings >= 600) {
      const form = await generate1099(w.id, w.name, w.email, w.address, year)
      results.push(form)
    }
  }
  return results
}
