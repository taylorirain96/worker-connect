import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { categoriseJob } from '@/lib/ai/categorise-job'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const location = searchParams.get('location')
    const status = searchParams.get('status') || 'open'
    const urgency = searchParams.get('urgency')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    // In production, query Firestore with these filters
    // For now return empty array since Firestore requires server setup
    return NextResponse.json({
      jobs: [],
      total: 0,
      page,
      limit,
      filters: { category, location, status, urgency },
    })
  } catch (error) {
    console.error('Get jobs error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      title,
      description,
      category,
      location,
      budget,
      budgetType,
      urgency,
      skills,
      deadline,
      employerId,
      employerName,
    } = body

    if (!title || !description || !category || !location || !budget || !employerId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // In production, save to Firestore
    const job = {
      id: `job_${Date.now()}`,
      title,
      description,
      category,
      location,
      budget: parseFloat(budget),
      budgetType: budgetType || 'fixed',
      urgency: urgency || 'medium',
      status: 'open',
      skills: skills || [],
      deadline: deadline || null,
      employerId,
      employerName,
      applicantsCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const jobId = job.id

    // Auto-categorise in the background (non-blocking).
    // In production when this route saves to Firestore, uncomment the adminDb update below.
    categoriseJob(title, description).then(async (aiCategory) => {
      // Update the job document with the AI-assigned category:
      // const { adminDb } = await import('@/lib/firebase-admin')
      // await adminDb.collection('jobs').doc(jobId).update({ category: aiCategory, categorisedAt: new Date().toISOString() })
      console.log(`Job ${jobId} auto-categorised as: ${aiCategory}`)
    }).catch(() => {}) // silently ignore

    return NextResponse.json(job, { status: 201 })
  } catch (error) {
    console.error('Create job error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}