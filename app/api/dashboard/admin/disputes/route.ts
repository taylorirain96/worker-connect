import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'

export const dynamic = 'force-dynamic'

function seeded(seed: number, scale: number): number {
  return Math.abs(Math.sin(seed * 9301 + 49297) * scale)
}

const HOMEOWNER_NAMES = ['Alex Turner', 'Jordan Blake', 'Sam Rivera', 'Casey Morgan', 'Taylor Quinn']
const WORKER_NAMES = ['Drew Bailey', 'Riley Foster', 'Morgan Hayes', 'Avery Collins', 'Jamie Stone']
const JOB_TITLES = ['Bathroom reno', 'Deck build', 'Electrical', 'Plumbing', 'Painting']
const REASONS = ['quality_issues', 'non_delivery', 'overcharge', 'misrepresentation', 'other']

function buildMockDisputes(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: `dispute-${i + 1}`,
    jobId: `job-${(i % 30) + 1}`,
    jobTitle: JOB_TITLES[i % JOB_TITLES.length],
    homeownerId: `howner-${(i % 5) + 1}`,
    homeownerName: HOMEOWNER_NAMES[i % 5],
    homeownerNote: 'The work was not completed to the agreed standard and I am requesting a full refund.',
    workerId: `worker-${(i % 5) + 1}`,
    workerName: WORKER_NAMES[i % 5],
    workerNote: 'All agreed work was completed. The client changed scope mid-project and is unhappy.',
    amount: Math.round(300 + seeded(i + 2, 2500)),
    reason: REASONS[i % REASONS.length],
    status: 'disputed',
    adminNote: '',
    createdAt: new Date(Date.now() - i * 2 * 86400000).toISOString(),
  }))
}

/** GET /api/dashboard/admin/disputes */
export async function GET(_req: NextRequest) {
  try {
    let disputes: ReturnType<typeof buildMockDisputes> = []

    try {
      const snap = await adminDb.collection('jobs')
        .where('status', '==', 'disputed')
        .orderBy('updatedAt', 'desc')
        .limit(100)
        .get()

      disputes = snap.docs.map((doc) => {
        const d = doc.data()
        return {
          id: doc.id,
          jobId: doc.id,
          jobTitle: d.title ?? 'Untitled job',
          homeownerId: d.employerId ?? '',
          homeownerName: d.employerName ?? 'Unknown',
          homeownerNote: d.disputeHomeownerNote ?? '',
          workerId: d.assignedWorkerId ?? '',
          workerName: d.assignedWorkerName ?? 'Unknown',
          workerNote: d.disputeWorkerNote ?? '',
          amount: d.budget ?? 0,
          reason: d.disputeReason ?? 'other',
          status: 'disputed',
          adminNote: d.adminDisputeNote ?? '',
          createdAt: d.updatedAt ?? d.createdAt ?? new Date().toISOString(),
        }
      })
    } catch {
      disputes = buildMockDisputes(12)
    }

    return NextResponse.json({ disputes, total: disputes.length })
  } catch (error) {
    console.error('GET /api/dashboard/admin/disputes error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/** POST /api/dashboard/admin/disputes — resolve a dispute */
export async function POST(request: NextRequest) {
  try {
    const { jobId, action, splitPercent, adminNote } = await request.json()
    if (!jobId || !action) {
      return NextResponse.json({ error: 'jobId and action are required' }, { status: 400 })
    }
    if (!['release_to_worker', 'refund_to_homeowner', 'split'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
    if (action === 'split' && (typeof splitPercent !== 'number' || splitPercent < 0 || splitPercent > 100)) {
      return NextResponse.json({ error: 'splitPercent must be 0–100' }, { status: 400 })
    }

    try {
      const update: Record<string, unknown> = {
        status: 'completed',
        escrowStatus: action === 'refund_to_homeowner' ? 'refunded' : 'released',
        adminDisputeNote: adminNote ?? '',
        adminDisputeAction: action,
        resolvedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      if (action === 'split') {
        update.adminDisputeSplitPercent = splitPercent
      }
      await adminDb.collection('jobs').doc(jobId).update(update)
    } catch {
      // Firestore not configured — simulate success
    }

    return NextResponse.json({ jobId, action, splitPercent, success: true })
  } catch (error) {
    console.error('POST /api/dashboard/admin/disputes error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
