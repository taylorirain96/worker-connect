import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'
import { sendApplicationUpdateEmail } from '@/lib/email/transactional'

export async function PUT(
  request: Request,
  context: { params: Promise<{ applicationId: string }> }
) {
  const params = await context.params
  try {
    const { applicationId } = params
    const body = await request.json()
    const { status } = body as { status: string }

    if (!status || !['pending', 'accepted', 'rejected', 'withdrawn'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const appRef = adminDb.collection('applications').doc(applicationId)
    const snapshot = await appRef.get()
    if (!snapshot.exists) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    await appRef.update({ status, updatedAt: FieldValue.serverTimestamp() })

    // Send "Application Update" email to the applicant (non-blocking)
    ;(async () => {
      try {
        const appData = snapshot.data()
        const workerId = appData?.workerId as string | undefined
        const jobTitle = appData?.jobTitle as string | undefined
        if (workerId) {
          const workerSnap = await adminDb.collection('users').doc(workerId).get()
          if (workerSnap.exists) {
            const workerData = workerSnap.data()
            const applicantEmail = workerData?.email as string | undefined
            const applicantName = (workerData?.displayName ?? workerData?.name ?? 'there') as string
            if (applicantEmail) {
              await sendApplicationUpdateEmail({
                applicantEmail,
                applicantName,
                jobTitle: jobTitle ?? 'your application',
                newStatus: status,
                applicationId,
              })
            }
          }
        }
      } catch (emailErr) {
        console.error('Failed to send application-update email:', emailErr)
      }
    })().catch(() => {})

    return NextResponse.json({ id: applicationId, status, updatedAt: new Date().toISOString() })
  } catch (error) {
    console.error('Update application error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
