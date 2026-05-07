/**
 * GET /api/employer/payments
 *
 * Returns posted jobs and escrow records for the authenticated employer.
 * Headers: x-user-id
 */
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { rateLimit } from '@/lib/rateLimit'

export const dynamic = 'force-dynamic'

function toIso(val: unknown): string {
  if (val && typeof (val as { toDate?: () => Date }).toDate === 'function') {
    return (val as { toDate: () => Date }).toDate().toISOString()
  }
  return typeof val === 'string' ? val : new Date().toISOString()
}

export async function GET(req: NextRequest) {
  if (rateLimit(req, { max: 30, windowMs: 60_000 })) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  const uid = req.headers.get('x-user-id')
  if (!uid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const [jobsSnap, escrowsSnap] = await Promise.all([
      adminDb
        .collection('jobs')
        .where('employerId', '==', uid)
        .orderBy('createdAt', 'desc')
        .limit(50)
        .get(),
      adminDb
        .collection('escrows')
        .where('employerId', '==', uid)
        .orderBy('createdAt', 'desc')
        .limit(50)
        .get(),
    ])

    const postedJobs = jobsSnap.docs.map((doc) => {
      const d = doc.data()
      return {
        id: doc.id,
        title: (d.title as string | undefined) ?? 'Untitled Job',
        estimatedBudget: typeof d.budget === 'number' ? d.budget : 0,
        postingFee: typeof d.postingFee === 'number' ? d.postingFee : 0,
        feeSize: (d.feeSize as string | undefined) ?? 'small',
        feePaid: d.paymentStatus === 'active' || Boolean(d.feePaid),
        postedAt: toIso(d.createdAt),
        status: (d.status as string | undefined) ?? 'draft',
      }
    })

    const escrows = escrowsSnap.docs.map((doc) => {
      const d = doc.data()
      return {
        id: doc.id,
        jobId: (d.jobId as string | undefined) ?? '',
        jobTitle: (d.jobTitle as string | undefined) ?? 'Untitled Job',
        workerId: (d.workerId as string | undefined) ?? '',
        employerId: uid,
        amount: typeof d.amount === 'number' ? d.amount : 0,
        commission: typeof d.commission === 'number' ? d.commission : 0,
        commissionRate: typeof d.commissionRate === 'number' ? d.commissionRate : 0,
        workerReceives: typeof d.workerReceives === 'number' ? d.workerReceives : 0,
        currency: (d.currency as string | undefined) ?? 'nzd',
        status: (d.status as string | undefined) ?? 'pending',
        workerTier: (d.workerTier as string | undefined) ?? 'new_worker',
        createdAt: toIso(d.createdAt),
        updatedAt: toIso(d.updatedAt),
        releasedAt: d.releasedAt ? toIso(d.releasedAt) : undefined,
        autoReleaseAt: (d.autoReleaseAt as string | undefined) ?? undefined,
      }
    })

    return NextResponse.json({ postedJobs, escrows })
  } catch (error) {
    console.error('GET /api/employer/payments error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
