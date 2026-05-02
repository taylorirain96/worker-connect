import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { jobId, employerId, jobTitle, companyName } = body as {
      jobId?: string
      employerId?: string
      jobTitle?: string
      companyName?: string
    }

    if (!jobId) {
      return NextResponse.json({ error: 'jobId is required' }, { status: 400 })
    }

    // Verify the caller's identity via Firebase ID token
    const authHeader = request.headers.get('authorization')
    let applicantId: string | null = null
    let applicantName: string | null = null
    let applicantEmail: string | null = null

    if (authHeader?.startsWith('Bearer ')) {
      try {
        const { adminAuth } = await import('@/lib/firebase-admin')
        const token = authHeader.slice(7)
        const decoded = await adminAuth.verifyIdToken(token)
        applicantId = decoded.uid
        applicantName = decoded.name ?? null
        applicantEmail = decoded.email ?? null
      } catch {
        // Token verification failed — unauthenticated callers are recorded without applicantId
      }
    }

    // Attempt to persist to Firestore
    try {
      const { adminDb } = await import('@/lib/firebase-admin')
      if (adminDb) {
        const { FieldValue } = await import('firebase-admin/firestore')
        await adminDb.collection('jobApplications').doc().set({
          jobId,
          jobTitle: jobTitle ?? null,
          companyName: companyName ?? null,
          employerId: employerId ?? null,
          applicantId,
          applicantName,
          applicantEmail,
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
