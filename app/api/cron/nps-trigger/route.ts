import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'

export const dynamic = 'force-dynamic'

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

    const snap = await adminDb.collection('jobs')
      .where('status', '==', 'completed')
      .where('completedAt', '>=', eightDaysAgo.toISOString())
      .where('completedAt', '<', sevenDaysAgo.toISOString())
      .limit(100)
      .get()

    let triggered = 0

    for (const doc of snap.docs) {
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
        const existing = await adminDb.collection('npsSurveys')
          .where('jobId', '==', jobId)
          .where('userId', '==', userId)
          .limit(1)
          .get()

        if (!existing.empty) continue

        await adminDb.collection('notifications').add({
          userId,
          type: 'general',
          title: 'How did it go?',
          message: 'Rate your experience — it only takes 10 seconds',
          actionUrl: `/nps?jobId=${jobId}`,
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
