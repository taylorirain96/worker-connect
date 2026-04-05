import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET() {
  try {
    // In production, fetch from Firestore with searchParams filters
    return NextResponse.json({ applications: [], total: 0 })
  } catch (error) {
    console.error('Get applications error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { jobId, workerId, coverLetter, proposedRate } = body

    if (!jobId || !workerId || !coverLetter || !proposedRate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const application = {
      id: `app_${Date.now()}`,
      jobId,
      workerId,
      coverLetter,
      proposedRate: parseFloat(proposedRate),
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // In production, save to Firestore
    return NextResponse.json(application, { status: 201 })
  } catch (error) {
    console.error('Create application error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
