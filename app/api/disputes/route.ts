import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'

export const dynamic = 'force-dynamic'

/**
 * GET  /api/disputes?userId=xxx  — list disputes for a user
 * GET  /api/disputes?jobId=xxx   — fetch the dispute for a specific job
 * POST /api/disputes             — create a new dispute linked to a job or payment
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const jobId = searchParams.get('jobId')
    const paymentId = searchParams.get('paymentId')
    const pageSize = Math.min(parseInt(searchParams.get('limit') ?? '50', 10), 100)

    try {
      // Fetch dispute for a specific job (stored at disputes/{jobId})
      if (jobId) {
        const snap = await adminDb.collection('disputes').doc(jobId).get()
        if (snap.exists) {
          return NextResponse.json({ dispute: { id: snap.id, ...snap.data() } })
        }
        // Fall back to querying by jobId field for legacy records
        const qSnap = await adminDb
          .collection('disputes')
          .where('jobId', '==', jobId)
          .orderBy('createdAt', 'desc')
          .limit(1)
          .get()
        if (!qSnap.empty) {
          const d = qSnap.docs[0]
          return NextResponse.json({ dispute: { id: d.id, ...d.data() } })
        }
        return NextResponse.json({ dispute: null })
      }

      if (paymentId) {
        const snap = await adminDb
          .collection('disputes')
          .where('paymentId', '==', paymentId)
          .orderBy('createdAt', 'desc')
          .limit(pageSize)
          .get()
        const disputes = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
        return NextResponse.json({ disputes, total: disputes.length })
      }

      if (userId) {
        const [asWorker, asClient] = await Promise.all([
          adminDb
            .collection('disputes')
            .where('workerId', '==', userId)
            .orderBy('createdAt', 'desc')
            .limit(pageSize)
            .get(),
          adminDb
            .collection('disputes')
            .where('clientId', '==', userId)
            .orderBy('createdAt', 'desc')
            .limit(pageSize)
            .get(),
        ])
        const map = new Map<string, Record<string, unknown>>()
        ;[...asWorker.docs, ...asClient.docs].forEach((d) =>
          map.set(d.id, { id: d.id, ...d.data() })
        )
        const disputes = Array.from(map.values())
        return NextResponse.json({ disputes, userId })
      }

      return NextResponse.json({ disputes: [], userId: null })
    } catch {
      return NextResponse.json({ disputes: [], userId })
    }
  } catch (error) {
    console.error('GET /api/disputes error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as {
      // Job-based dispute fields (new schema)
      jobId?: string
      raisedBy?: string
      raisedByRole?: 'homeowner' | 'worker'
      raisedByName?: string
      reason?: string
      description?: string
      desiredOutcome?: string
      evidenceUrls?: string[]
      jobTitle?: string
      homeownerId?: string
      homeownerEmail?: string
      homeownerName?: string
      workerId?: string
      workerEmail?: string
      workerName?: string
      // Legacy payment-based fields
      paymentId?: string
      evidence?: string[]
      clientId?: string
      filedBy?: string
    }

    const { reason, description } = body

    if (!reason || !description) {
      return NextResponse.json({ error: 'Missing required fields: reason, description' }, { status: 400 })
    }

    if (!body.paymentId && !body.jobId) {
      return NextResponse.json({ error: 'Missing required field: jobId or paymentId' }, { status: 400 })
    }

    const now = new Date().toISOString()
    let disputeId: string

    // Job-based dispute — stored at disputes/{jobId} with the new schema
    if (body.jobId) {
      const {
        jobId, raisedBy, raisedByRole, raisedByName,
        desiredOutcome, evidenceUrls, jobTitle,
        homeownerId, homeownerEmail, homeownerName,
        workerId, workerEmail, workerName,
      } = body

      if (!raisedBy || !raisedByRole) {
        return NextResponse.json({ error: 'Missing required fields: raisedBy, raisedByRole' }, { status: 400 })
      }

      const disputeData: Record<string, unknown> = {
        jobId,
        raisedBy,
        raisedByRole,
        raisedByName: raisedByName ?? '',
        reason,
        description,
        desiredOutcome: desiredOutcome ?? '',
        evidenceUrls: evidenceUrls ?? [],
        status: 'open',
        resolution: '',
        resolvedBy: null,
        resolvedAt: null,
        ...(homeownerId ? { clientId: homeownerId } : {}),
        ...(homeownerEmail ? { homeownerEmail } : {}),
        ...(homeownerName ? { homeownerName } : {}),
        ...(workerId ? { workerId } : {}),
        ...(workerEmail ? { workerEmail } : {}),
        ...(workerName ? { workerName } : {}),
        ...(jobTitle ? { jobTitle } : {}),
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      }

      try {
        // Check if a dispute already exists for this job
        const existingSnap = await adminDb.collection('disputes').doc(jobId!).get()
        if (existingSnap.exists) {
          return NextResponse.json(
            { error: 'A dispute already exists for this job.' },
            { status: 409 }
          )
        }

        // Store at disputes/{jobId} so it's easy to look up by job
        await adminDb.collection('disputes').doc(jobId!).set(disputeData)
        disputeId = jobId!

        // Update job status to 'disputed'
        await adminDb.collection('jobs').doc(jobId!).update({
          status: 'disputed',
          updatedAt: FieldValue.serverTimestamp(),
        })

        // Send emails non-blocking
        try {
          const { sendDisputeRaisedEmail } = await import('@/lib/email/transactional')
          const reasonLabel = reason.replace(/_/g, ' ')
            .replace(/\b\w/g, (c) => c.toUpperCase())

          const emailPromises: Promise<void>[] = []

          if (homeownerEmail && homeownerName) {
            emailPromises.push(
              sendDisputeRaisedEmail({
                recipientEmail: homeownerEmail,
                recipientName: homeownerName,
                raisedByName: raisedByName ?? raisedByRole,
                jobTitle: jobTitle ?? 'your job',
                jobId: jobId!,
                reason: reasonLabel,
              })
            )
          }

          if (workerEmail && workerName) {
            emailPromises.push(
              sendDisputeRaisedEmail({
                recipientEmail: workerEmail,
                recipientName: workerName,
                raisedByName: raisedByName ?? raisedByRole,
                jobTitle: jobTitle ?? 'your job',
                jobId: jobId!,
                reason: reasonLabel,
              })
            )
          }

          const adminEmail = process.env.ADMIN_EMAIL
          if (adminEmail) {
            emailPromises.push(
              sendDisputeRaisedEmail({
                recipientEmail: adminEmail,
                recipientName: 'Admin',
                raisedByName: raisedByName ?? raisedByRole,
                jobTitle: jobTitle ?? 'a job',
                jobId: jobId!,
                reason: reasonLabel,
                isAdmin: true,
              })
            )
          }

          await Promise.allSettled(emailPromises)
        } catch (emailErr) {
          console.warn('Dispute email send failed (non-blocking):', emailErr)
        }

        console.log(`Job dispute created: ${disputeId} for job ${jobId}`)
      } catch (err) {
        disputeId = `dispute_${Date.now()}`
        console.warn('Firestore unavailable — returning mock dispute id:', err)
      }

      return NextResponse.json(
        {
          id: disputeId,
          jobId,
          raisedBy,
          raisedByRole,
          reason,
          description,
          desiredOutcome: desiredOutcome ?? '',
          evidenceUrls: evidenceUrls ?? [],
          status: 'open',
          createdAt: now,
          updatedAt: now,
        },
        { status: 201 }
      )
    }

    // Legacy payment-based dispute
    const { paymentId, evidence } = body

    const disputeData: Record<string, unknown> = {
      ...(paymentId ? { paymentId } : {}),
      ...(body.workerId ? { workerId: body.workerId } : {}),
      ...(body.clientId ? { clientId: body.clientId } : {}),
      ...(body.filedBy ? { filedBy: body.filedBy } : {}),
      reason,
      description,
      evidence: evidence ?? [],
      status: 'open',
      notes: '',
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      dueDate: new Date(Date.now() + 7 * 86400000).toISOString(),
    }

    try {
      const ref = await adminDb.collection('disputes').add(disputeData)
      disputeId = ref.id
      console.log(`Dispute created: ${disputeId} for payment ${paymentId}`)
    } catch {
      disputeId = `dispute_${Date.now()}`
      console.warn('Firestore unavailable — returning mock dispute id')
    }

    return NextResponse.json(
      {
        id: disputeId,
        paymentId,
        reason,
        description,
        evidence: evidence ?? [],
        status: 'open',
        createdAt: now,
        updatedAt: now,
        dueDate: new Date(Date.now() + 7 * 86400000).toISOString(),
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('POST /api/disputes error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
