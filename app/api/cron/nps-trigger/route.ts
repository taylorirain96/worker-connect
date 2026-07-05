import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import type { QueryDocumentSnapshot } from 'firebase-admin/firestore'

export const dynamic = 'force-dynamic'

function getNpsNotificationId(jobId: string, userId: string) {
  return `nps_${jobId}_${userId}`
}

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const now = new Date()
    const sevenDaysAgo = new Date(now)
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const eightDaysAgo = new Date(now)
    eightDaysAgo.setDate(eightDaysAgo.getDate() - 8)

    const startIso = eightDaysAgo.toISOString()
    const endIso = sevenDaysAgo.toISOString()

    const [completedAtSnap, updatedAtSnap] = await Promise.all([
      adminDb.collection('jobs')
        .where('status', '==', 'completed')
        .where('completedAt', '>=', startIso)
        .where('completedAt', '<', endIso)
        .limit(100)
        .get(),
      adminDb.collection('jobs')
        .where('status', '==', 'completed')
        .where('updatedAt', '>=', startIso)
        .where('updatedAt', '<', endIso)
        .limit(100)
        .get(),
    ])

    const candidateDocs = new Map<string, QueryDocumentSnapshot>(
      completedAtSnap.docs.map((doc) => [doc.id, doc])
    )
    for (const doc of updatedAtSnap.docs) {
      if (candidateDocs.has(doc.id)) continue
      const data = doc.data()
      // Legacy completed jobs can be missing completedAt but still have status=completed
      // and an updatedAt timestamp in the target window, so include them as a backfill path.
      if (!data?.completedAt) {
        candidateDocs.set(doc.id, doc)
      }
    }

    let triggered = 0

    for (const doc of candidateDocs.values()) {
      const job = doc.data() as {
        employerId?: string
        assignedWorkerId?: string
        title?: string
      }
      const nowIso = new Date().toISOString()
      const jobId = doc.id

      const userIds: string[] = []
      if (job.employerId) userIds.push(job.employerId)
      if (job.assignedWorkerId) userIds.push(job.assignedWorkerId)

      for (const userId of userIds) {
        const notificationId = getNpsNotificationId(jobId, userId)
        const [existingSurvey, existingNotification] = await Promise.all([
          adminDb.collection('npsSurveys')
            .where('jobId', '==', jobId)
            .where('userId', '==', userId)
            .limit(1)
            .get(),
          adminDb.collection('notifications').doc(notificationId).get(),
        ])

        if (!existingSurvey.empty || existingNotification.exists) continue

        await adminDb.collection('notifications').doc(notificationId).set({
          userId,
          type: 'nps_survey',
          title: 'How did it go?',
          message: 'Rate your experience — it only takes 10 seconds',
          actionUrl: `/nps?jobId=${jobId}`,
          relatedJobId: jobId,
          read: false,
          createdAt: nowIso,
        })

        triggered++
      }
    }

    return NextResponse.json({ triggered })
  } catch (error) {
    console.error('NPS trigger cron error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
