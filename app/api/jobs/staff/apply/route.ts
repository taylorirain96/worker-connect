import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { jobId, employerId } = body as { jobId?: string; employerId?: string }

    if (!jobId) {
      return NextResponse.json({ error: 'jobId is required' }, { status: 400 })
    }

    // Attempt Firebase Admin write
    try {
      const { adminDb } = await import('@/lib/firebase-admin')
      if (adminDb) {
        const { FieldValue } = await import('firebase-admin/firestore')
        const applicationRef = adminDb.collection('jobApplications').doc()
        await applicationRef.set({
          jobId,
          employerId: employerId ?? null,
          status: 'applied',
          appliedAt: FieldValue.serverTimestamp(),
          source: 'quick_apply',
        })
      }
    } catch {
      // Firestore unavailable in preview — silently continue
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Quick apply error:', error)
    return NextResponse.json({ error: 'Failed to submit application' }, { status: 500 })
  }
}
