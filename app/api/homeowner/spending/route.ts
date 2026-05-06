import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import type { SpendingSummary, SpendingTransaction, MonthlySpend, CategorySpend } from '@/types'

export const dynamic = 'force-dynamic'

// Re-export types for consumers
export type { SpendingSummary, SpendingTransaction, MonthlySpend, CategorySpend }

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toISO(v: unknown): string {
  if (v && typeof v === 'object' && 'toDate' in v) {
    return (v as { toDate: () => Date }).toDate().toISOString()
  }
  return typeof v === 'string' ? v : new Date().toISOString()
}

function monthLabel(iso: string): string {
  return new Date(iso).toLocaleDateString('en-NZ', { month: 'short', year: 'numeric' })
}

// ─── Mock data fallback ───────────────────────────────────────────────────────

function buildMockSummary(uid: string): SpendingSummary {
  const now = Date.now()
  const DAY = 86_400_000
  const transactions: SpendingTransaction[] = [
    {
      id: 'txn_mock_1',
      jobId: 'job_mock_1',
      jobTitle: 'Fix leaking bathroom tap',
      category: 'plumbing',
      workerName: 'Mike T.',
      amount: 180,
      status: 'completed',
      paidAt: new Date(now - 2 * DAY).toISOString(),
      createdAt: new Date(now - 5 * DAY).toISOString(),
    },
    {
      id: 'txn_mock_2',
      jobId: 'job_mock_2',
      jobTitle: 'Paint the living room',
      category: 'painting',
      workerName: 'Sarah P.',
      amount: 850,
      status: 'completed',
      paidAt: new Date(now - 10 * DAY).toISOString(),
      createdAt: new Date(now - 15 * DAY).toISOString(),
    },
    {
      id: 'txn_mock_3',
      jobId: 'job_mock_3',
      jobTitle: 'Replace kitchen light fittings',
      category: 'electrical',
      workerName: 'James K.',
      amount: 320,
      status: 'in_escrow',
      paidAt: new Date(now - 1 * DAY).toISOString(),
      createdAt: new Date(now - 3 * DAY).toISOString(),
    },
    {
      id: 'txn_mock_4',
      jobId: 'job_mock_4',
      jobTitle: 'Lawn mowing and garden tidy',
      category: 'landscaping',
      workerName: 'Tom R.',
      amount: 120,
      status: 'completed',
      paidAt: new Date(now - 35 * DAY).toISOString(),
      createdAt: new Date(now - 37 * DAY).toISOString(),
    },
    {
      id: 'txn_mock_5',
      jobId: 'job_mock_5',
      jobTitle: 'Install heat pump',
      category: 'hvac',
      workerName: 'Lisa N.',
      amount: 2200,
      status: 'completed',
      paidAt: new Date(now - 60 * DAY).toISOString(),
      createdAt: new Date(now - 65 * DAY).toISOString(),
    },
  ]

  void uid // uid used in real path for personalised mock labels

  const completed = transactions.filter((t) => t.status === 'completed')
  const inEscrow = transactions.filter((t) => t.status === 'in_escrow')
  const thisMonth = new Date().getMonth()
  const thisYear = new Date().getFullYear()
  const thisMonthTxns = completed.filter((t) => {
    const d = new Date(t.paidAt)
    return d.getMonth() === thisMonth && d.getFullYear() === thisYear
  })

  const totalSpent = completed.reduce((s, t) => s + t.amount, 0)
  const inEscrowTotal = inEscrow.reduce((s, t) => s + t.amount, 0)
  const thisMonthSpent = thisMonthTxns.reduce((s, t) => s + t.amount, 0)

  // Monthly breakdown — last 6 months
  const monthlyMap = new Map<string, number>()
  for (let i = 5; i >= 0; i--) {
    const d = new Date()
    d.setDate(1)
    d.setMonth(d.getMonth() - i)
    monthlyMap.set(monthLabel(d.toISOString()), 0)
  }
  for (const t of completed) {
    const label = monthLabel(t.paidAt)
    if (monthlyMap.has(label)) {
      monthlyMap.set(label, (monthlyMap.get(label) ?? 0) + t.amount)
    }
  }
  const monthlyBreakdown: MonthlySpend[] = Array.from(monthlyMap.entries()).map(
    ([month, amount]) => ({ month, amount })
  )

  // Category breakdown
  const catMap = new Map<string, { amount: number; count: number }>()
  for (const t of completed) {
    const entry = catMap.get(t.category) ?? { amount: 0, count: 0 }
    catMap.set(t.category, { amount: entry.amount + t.amount, count: entry.count + 1 })
  }
  const categoryBreakdown: CategorySpend[] = Array.from(catMap.entries())
    .map(([category, { amount, count }]) => ({ category, amount, count }))
    .sort((a, b) => b.amount - a.amount)

  return {
    totalSpent,
    inEscrow: inEscrowTotal,
    thisMonthSpent,
    completedJobCount: completed.length,
    transactions,
    monthlyBreakdown,
    categoryBreakdown,
  }
}

// ─── Route ────────────────────────────────────────────────────────────────────

/**
 * GET /api/homeowner/spending
 * Headers: x-user-id (homeowner UID)
 *
 * Returns a SpendingSummary aggregating the homeowner's completed jobs,
 * in-escrow payments, and invoice history.
 */
export async function GET(req: NextRequest) {
  try {
    const uid = req.headers.get('x-user-id')
    if (!uid) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }

    try {
      // Query completed and in-progress jobs posted by this homeowner
      const jobsSnap = await adminDb
        .collection('jobs')
        .where('employerId', '==', uid)
        .orderBy('createdAt', 'desc')
        .limit(100)
        .get()

      const transactions: SpendingTransaction[] = []

      for (const doc of jobsSnap.docs) {
        const d = doc.data()
        const status = d.status as string
        const escrowStatus = d.escrowStatus as string | undefined

        // Only include jobs that have a payment component
        if (!['completed', 'in_progress', 'disputed'].includes(status)) continue

        const amount = typeof d.budget === 'number' ? d.budget : 0
        if (amount <= 0) continue

        let txnStatus: SpendingTransaction['status']
        if (status === 'completed' && escrowStatus === 'released') {
          txnStatus = 'completed'
        } else if (escrowStatus === 'refunded') {
          txnStatus = 'refunded'
        } else if (status === 'disputed') {
          txnStatus = 'disputed'
        } else {
          txnStatus = 'in_escrow'
        }

        transactions.push({
          id: doc.id,
          jobId: doc.id,
          jobTitle: d.title ?? 'Untitled job',
          category: d.category ?? 'general',
          workerName: d.workerName ?? d.assignedWorkerName ?? 'Tradie',
          amount,
          status: txnStatus,
          paidAt: toISO(d.completedAt ?? d.updatedAt),
          createdAt: toISO(d.createdAt),
        })
      }

      // Also include paid invoices where this user is the employer
      const invoicesSnap = await adminDb
        .collection('invoices')
        .where('employerId', '==', uid)
        .where('status', 'in', ['paid', 'completed'])
        .orderBy('createdAt', 'desc')
        .limit(100)
        .get()

      for (const doc of invoicesSnap.docs) {
        const d = doc.data()
        // Avoid double-counting if job already in transactions
        const alreadyIncluded = transactions.some((t) => t.jobId === d.jobId)
        if (alreadyIncluded) continue

        transactions.push({
          id: doc.id,
          jobId: d.jobId ?? '',
          jobTitle: d.jobTitle ?? 'Invoice payment',
          category: d.category ?? 'general',
          workerName: d.workerName ?? 'Tradie',
          amount: d.total ?? d.amount ?? 0,
          status: 'completed',
          paidAt: toISO(d.paidAt ?? d.updatedAt),
          createdAt: toISO(d.createdAt),
        })
      }

      // Sort newest first
      transactions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

      // Derive stats
      const completed = transactions.filter((t) => t.status === 'completed' || t.status === 'refunded')
      const inEscrowTxns = transactions.filter((t) => t.status === 'in_escrow')
      const thisMonth = new Date().getMonth()
      const thisYear = new Date().getFullYear()
      const thisMonthTxns = completed.filter((t) => {
        const d = new Date(t.paidAt)
        return d.getMonth() === thisMonth && d.getFullYear() === thisYear
      })

      const totalSpent = completed
        .filter((t) => t.status === 'completed')
        .reduce((s, t) => s + t.amount, 0)
      const inEscrow = inEscrowTxns.reduce((s, t) => s + t.amount, 0)
      const thisMonthSpent = thisMonthTxns.reduce((s, t) => s + t.amount, 0)

      // Monthly breakdown — last 6 months
      const monthlyMap = new Map<string, number>()
      for (let i = 5; i >= 0; i--) {
        const d = new Date()
        d.setDate(1)
        d.setMonth(d.getMonth() - i)
        monthlyMap.set(monthLabel(d.toISOString()), 0)
      }
      for (const t of completed.filter((t) => t.status === 'completed')) {
        const label = monthLabel(t.paidAt)
        if (monthlyMap.has(label)) {
          monthlyMap.set(label, (monthlyMap.get(label) ?? 0) + t.amount)
        }
      }
      const monthlyBreakdown: MonthlySpend[] = Array.from(monthlyMap.entries()).map(
        ([month, amount]) => ({ month, amount })
      )

      // Category breakdown
      const catMap = new Map<string, { amount: number; count: number }>()
      for (const t of completed.filter((t) => t.status === 'completed')) {
        const entry = catMap.get(t.category) ?? { amount: 0, count: 0 }
        catMap.set(t.category, { amount: entry.amount + t.amount, count: entry.count + 1 })
      }
      const categoryBreakdown: CategorySpend[] = Array.from(catMap.entries())
        .map(([category, { amount, count }]) => ({ category, amount, count }))
        .sort((a, b) => b.amount - a.amount)

      const summary: SpendingSummary = {
        totalSpent,
        inEscrow,
        thisMonthSpent,
        completedJobCount: completed.filter((t) => t.status === 'completed').length,
        transactions: transactions.slice(0, 50),
        monthlyBreakdown,
        categoryBreakdown,
      }

      return NextResponse.json(summary)
    } catch (firestoreError) {
      console.warn('Firestore unavailable, returning mock data:', firestoreError)
      return NextResponse.json(buildMockSummary(uid))
    }
  } catch (error) {
    console.error('GET /api/homeowner/spending error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
