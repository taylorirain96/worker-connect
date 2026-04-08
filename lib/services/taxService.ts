/**
 * Tax service — track earnings, generate quarterly/annual summaries.
 * Workers are responsible for filing their own taxes.
 */
import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  setDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
  type DocumentData,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { EarningsRecord, QuarterlyEarnings, YearlyEarnings } from '@/types'

// ─── Constants ─────────────────────────────────────────────────────────────────

const EARNINGS_COL = 'earningsRecords'
const QUARTERLY_COL = 'quarterlyEarnings'
const PLATFORM_FEE_RATE = 0.10 // 10% platform commission

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toStr(ts: Timestamp | string | undefined): string {
  if (!ts) return new Date().toISOString()
  if (ts instanceof Timestamp) return ts.toDate().toISOString()
  return ts
}

function docToEarning(id: string, data: DocumentData): EarningsRecord {
  return {
    ...data,
    id,
    createdAt: toStr(data.createdAt),
    recordedDate: toStr(data.recordedDate),
  } as EarningsRecord
}

function getQuarterForMonth(month: number): 1 | 2 | 3 | 4 {
  if (month <= 2) return 1
  if (month <= 5) return 2
  if (month <= 8) return 3
  return 4
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

// ─── Earnings Tracking ────────────────────────────────────────────────────────

/**
 * Record an earning when a job is completed and payment is processed.
 * @param workerId  Worker who completed the job
 * @param jobId     Job id
 * @param jobTitle  Job title for display
 * @param grossAmount  Total amount paid by employer
 */
export async function trackEarning(
  workerId: string,
  jobId: string,
  jobTitle: string,
  grossAmount: number
): Promise<void> {
  if (!db) return
  const platformFee = Math.round(grossAmount * PLATFORM_FEE_RATE * 100) / 100
  const netAmount = Math.round((grossAmount - platformFee) * 100) / 100
  await addDoc(collection(db, EARNINGS_COL), {
    workerId,
    jobId,
    jobTitle,
    grossAmount,
    platformFee,
    netAmount,
    status: 'available',
    createdAt: serverTimestamp(),
    recordedDate: serverTimestamp(),
  })
}

/** Get all earnings records for a worker, optionally filtered by date range. */
export async function getWorkerEarnings(
  workerId: string,
  dateRange?: { from: string; to: string }
): Promise<EarningsRecord[]> {
  if (!db) return []
  const q = query(
    collection(db, EARNINGS_COL),
    where('workerId', '==', workerId),
    orderBy('recordedDate', 'desc')
  )
  const snap = await getDocs(q)
  let records = snap.docs.map((d) => docToEarning(d.id, d.data()))

  if (dateRange) {
    const from = new Date(dateRange.from).getTime()
    const to = new Date(dateRange.to).getTime()
    records = records.filter((r) => {
      const t = new Date(r.recordedDate).getTime()
      return t >= from && t <= to
    })
  }
  return records
}

/** Calculate quarterly earnings for a worker. */
export async function calculateQuarterlyEarnings(
  workerId: string,
  quarter: 1 | 2 | 3 | 4,
  year: number
): Promise<QuarterlyEarnings> {
  if (!db) {
    return { workerId, year, quarter, totalEarnings: 0, totalJobs: 0, monthBreakdown: [] }
  }

  // Quarter month ranges (0-indexed)
  const firstMonth = (quarter - 1) * 3
  const lastMonth = firstMonth + 2

  const from = new Date(year, firstMonth, 1).toISOString()
  const to = new Date(year, lastMonth + 1, 0, 23, 59, 59).toISOString()

  const records = await getWorkerEarnings(workerId, { from, to })

  // Build monthly breakdown
  const breakdown: Record<number, { earnings: number; jobs: number }> = {}
  for (let m = firstMonth; m <= lastMonth; m++) {
    breakdown[m] = { earnings: 0, jobs: 0 }
  }

  for (const r of records) {
    const month = new Date(r.recordedDate).getMonth()
    if (breakdown[month]) {
      breakdown[month].earnings += r.netAmount
      breakdown[month].jobs += 1
    }
  }

  const monthBreakdown = Object.entries(breakdown).map(([m, v]) => ({
    month: `${MONTH_NAMES[Number(m)]} ${year}`,
    earnings: Math.round(v.earnings * 100) / 100,
    jobs: v.jobs,
  }))

  const totalEarnings = records.reduce((s, r) => s + r.netAmount, 0)

  return {
    workerId,
    year,
    quarter,
    totalEarnings: Math.round(totalEarnings * 100) / 100,
    totalJobs: records.length,
    monthBreakdown,
  }
}

/** Get yearly earnings summary for a worker. */
export async function getYearlyEarnings(
  workerId: string,
  year: number
): Promise<YearlyEarnings> {
  const quarters = await Promise.all([
    calculateQuarterlyEarnings(workerId, 1, year),
    calculateQuarterlyEarnings(workerId, 2, year),
    calculateQuarterlyEarnings(workerId, 3, year),
    calculateQuarterlyEarnings(workerId, 4, year),
  ])

  const totalEarnings = quarters.reduce((s, q) => s + q.totalEarnings, 0)
  const totalJobs = quarters.reduce((s, q) => s + q.totalJobs, 0)

  return {
    workerId,
    year,
    totalEarnings: Math.round(totalEarnings * 100) / 100,
    totalJobs,
    byQuarter: quarters,
  }
}

/** Cache quarterly earnings in Firestore for quick retrieval. */
export async function cacheQuarterlyEarnings(data: QuarterlyEarnings): Promise<void> {
  if (!db) return
  const id = `${data.workerId}_${data.year}_Q${data.quarter}`
  await setDoc(doc(db, QUARTERLY_COL, id), {
    ...data,
    cachedAt: serverTimestamp(),
  })
}

/** Get cached quarterly earnings. Returns null if not cached yet. */
export async function getCachedQuarterlyEarnings(
  workerId: string,
  quarter: 1 | 2 | 3 | 4,
  year: number
): Promise<QuarterlyEarnings | null> {
  if (!db) return null
  const id = `${workerId}_${year}_Q${quarter}`
  const snap = await getDoc(doc(db, QUARTERLY_COL, id))
  if (!snap.exists()) return null
  return snap.data() as QuarterlyEarnings
}

export { getQuarterForMonth }
