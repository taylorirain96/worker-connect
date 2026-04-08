import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'
import type { Application } from '@/types'

export async function GET() {
  try {
    const snapshot = await adminDb
      .collection('applications')
      .orderBy('createdAt', 'desc')
      .get()
    const applications = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Application))
    return NextResponse.json({ applications, total: applications.length })
  } catch (error) {
    console.error('Get applications error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { jobId, workerId, workerName, workerAvatar, employerId, jobTitle, coverLetter, proposedRate } = body as {
      jobId: string
      workerId: string
      workerName: string
      workerAvatar?: string
      employerId: string
      jobTitle: string
      coverLetter: string
      proposedRate: number
    }

    if (!jobId || !workerId || !employerId || !coverLetter || !proposedRate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Prevent duplicate applications
    const existing = await adminDb
      .collection('applications')
      .where('jobId', '==', jobId)
      .where('workerId', '==', workerId)
      .limit(1)
      .get()

    if (!existing.empty) {
      return NextResponse.json({ error: 'Already applied to this job' }, { status: 409 })
    }

    const now = FieldValue.serverTimestamp()
    const applicationData = {
      jobId,
      jobTitle: jobTitle ?? '',
      workerId,
      workerName: workerName ?? '',
      workerAvatar: workerAvatar ?? null,
      employerId,
      coverLetter,
      proposedRate: parseFloat(String(proposedRate)),
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    }

    const docRef = await adminDb.collection('applications').add(applicationData)

    // Increment the job's applicant count
    await adminDb
      .collection('jobs')
      .doc(jobId)
      .update({ applicantsCount: FieldValue.increment(1) })

    return NextResponse.json({ id: docRef.id, ...applicationData, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }, { status: 201 })
  } catch (error) {
    console.error('Create application error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
