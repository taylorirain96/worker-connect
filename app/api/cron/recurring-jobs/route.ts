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

    const snap = await adminDb.collection('jobs')
      .where('recurring', '==', true)
      .where('status', '==', 'open')
      .where('nextRecurrenceAt', '<=', now.toISOString())
      .limit(100)
      .get()

    let processed = 0

    for (const doc of snap.docs) {
      const job = { id: doc.id, ...doc.data() } as {
        id: string
        employerId: string
        recurrenceInterval?: 'weekly' | 'fortnightly' | 'monthly'
        nextRecurrenceAt?: string
        [key: string]: unknown
      }

      const newRef = adminDb.collection('jobs').doc()
      const nowIso = new Date().toISOString()

      // Destructure out the id so it's not written to the new document
      const { id: _jobId, ...jobWithoutId } = job
      const cloned = {
        ...jobWithoutId,
        status: 'open',
        applicantsCount: 0,
        createdAt: nowIso,
        updatedAt: nowIso,
        parentJobId: job.id,
      }

      await newRef.set(cloned)

      const intervalDays =
        job.recurrenceInterval === 'weekly' ? 7
        : job.recurrenceInterval === 'fortnightly' ? 14
        : 30

      const nextDate = new Date(now)
      nextDate.setDate(nextDate.getDate() + intervalDays)

      await doc.ref.update({ nextRecurrenceAt: nextDate.toISOString(), updatedAt: nowIso })

      await adminDb.collection('notifications').add({
        userId: job.employerId,
        type: 'job_posted',
        title: 'Recurring job re-posted',
        message: `Your recurring job "${job.title ?? 'Job'}" has been automatically re-posted.`,
        read: false,
        createdAt: nowIso,
      })

      processed++
    }

    return NextResponse.json({ processed })
  } catch (error) {
    console.error('Recurring jobs cron error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
