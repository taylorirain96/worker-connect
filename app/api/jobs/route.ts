import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { categoriseJob } from '@/lib/ai/categorise-job'
import { adminDb } from '@/lib/firebase-admin'
import { sendJobMatchesEmail } from '@/lib/email/transactional'
import { sendAdminNotification } from '@/lib/notifications/admin'
import {
  getCurrencyLabelForJobCountry,
  normalizeJobCountry,
} from '@/lib/services/jobCountryService'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const location = searchParams.get('location')
    const country = normalizeJobCountry(searchParams.get('country'))
    const status = searchParams.get('status') || 'open'
    const urgency = searchParams.get('urgency')
    const employerIdParam = searchParams.get('employerId')
    const employerIdHeader = request.headers.get('x-user-id')
    const employerId = employerIdParam ?? employerIdHeader ?? null
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')))

    if (!adminDb) {
      return NextResponse.json({
        jobs: [],
        total: 0,
        page,
        limit,
        filters: { category, location, country, status, urgency, employerId },
      })
    }

    // Build base query. When employerId is provided we scope to that user's jobs
    // (used by the mobile homeowner "My Jobs" tab); otherwise we list public open jobs.
    const jobsCollection = adminDb.collection('jobs')
    const q: FirebaseFirestore.Query = employerId
      ? jobsCollection.where('employerId', '==', employerId).orderBy('createdAt', 'desc')
      : status
        ? jobsCollection.where('status', '==', status).orderBy('createdAt', 'desc')
        : jobsCollection.orderBy('createdAt', 'desc')

    // Over-fetch then slice for simple offset pagination (matches /api/workers convention)
    const snapshot = await q.limit(limit * page).get()
    let jobs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as Array<Record<string, unknown>>

    // In-memory filters for fields that can't be combined with the existing orderBy
    if (category) {
      const cat = category.toLowerCase()
      jobs = jobs.filter((j) => String(j.category ?? '').toLowerCase() === cat)
    }
    if (location) {
      const loc = location.toLowerCase()
      jobs = jobs.filter((j) => String(j.location ?? '').toLowerCase().includes(loc))
    }
    if (country) {
      jobs = jobs.filter((j) => String(j.country ?? '').toUpperCase() === country)
    }
    if (urgency) {
      jobs = jobs.filter((j) => String(j.urgency ?? '') === urgency)
    }

    const total = jobs.length
    const start = (page - 1) * limit
    const paginated = jobs.slice(start, start + limit)

    return NextResponse.json({
      jobs: paginated,
      total,
      page,
      limit,
      filters: { category, location, country, status, urgency, employerId },
    })
  } catch (error) {
    console.error('Get jobs error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const headerUserId = request.headers.get('x-user-id')
    const {
      title,
      description,
      category,
      country,
      location,
      budget,
      budgetType,
      urgency,
      skills,
      deadline,
      employerName,
    } = body
    const employerId: string | undefined = body.employerId ?? headerUserId ?? undefined

    const normalizedCountry = normalizeJobCountry(country)

    if (!title || !description || !category || !normalizedCountry || !location || !budget || !employerId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const now = new Date().toISOString()
    const jobData = {
      title,
      description,
      category,
      country: normalizedCountry,
      location,
      budget: parseFloat(budget),
      budgetType: budgetType || 'fixed',
      urgency: urgency || 'medium',
      status: 'open' as const,
      skills: Array.isArray(skills) ? skills : [],
      deadline: deadline || null,
      employerId,
      employerName: employerName ?? 'Homeowner',
      applicantsCount: 0,
      createdAt: now,
      updatedAt: now,
    }

    let jobId: string
    if (adminDb) {
      const ref = await adminDb.collection('jobs').add(jobData)
      jobId = ref.id
    } else {
      // Fallback if firebase-admin is not configured (e.g. local dev without service account)
      jobId = `job_${Date.now()}`
    }
    const job = { id: jobId, ...jobData }

    // Auto-categorise in the background (non-blocking).
    categoriseJob(title, description).then(async (aiCategory) => {
      if (adminDb && aiCategory) {
        await adminDb.collection('jobs').doc(jobId).update({
          category: aiCategory,
          categorisedAt: new Date().toISOString(),
        })
      }
    }).catch(() => {}) // silently ignore

    // Notify matching workers by email — non-blocking, fire and forget
    if (adminDb) {
      ;(async () => {
        try {
          // Find workers whose skills include the job category and whose location matches
          // We match on either skills array contains the category, or the worker's location matches
          const workersSnap = await adminDb
            .collection('users')
            .where('role', '==', 'worker')
            .limit(50)
            .get()

          const notificationTasks: Promise<void | null>[] = []
          for (const workerDoc of workersSnap.docs) {
            const workerData = workerDoc.data()
            // Skip workers with no email
            const workerEmail = workerData?.email as string | undefined
            if (!workerEmail) continue

            // Match by skills (array contains category) or location
            const workerSkills: string[] = workerData?.skills ?? []
            const workerLocation: string = workerData?.location ?? ''
            const categoryMatch = workerSkills.some(
              (s: string) => s.toLowerCase() === category.toLowerCase()
            )
            const jobLocationPrefix = location.trim().split(',')[0].trim().toLowerCase()
            const locationMatch =
              workerLocation.length > 0 &&
              jobLocationPrefix.length > 0 &&
              workerLocation.toLowerCase().includes(jobLocationPrefix)

            const currencyLabel = getCurrencyLabelForJobCountry(normalizedCountry)
            if (categoryMatch || locationMatch) {
              const workerName = (workerData?.displayName ?? workerData?.name ?? 'there') as string
              const workerId = workerDoc.id
              notificationTasks.push(
                sendJobMatchesEmail({
                  workerEmail,
                  workerName,
                  jobTitle: title,
                  location,
                  budget: parseFloat(budget),
                  jobId,
                })
              )
              // Push notification to matching worker
              notificationTasks.push(
                sendAdminNotification({
                  userId: workerId,
                  title: '🔔 New job matching your skills',
                  body: `"${title}" in ${location} — ${currencyLabel}${parseFloat(budget).toFixed(0)} budget.`,
                  type: 'new_job',
                  link: `/jobs/${jobId}`,
                })
              )
            }
          }

          if (notificationTasks.length > 0) {
            await Promise.allSettled(notificationTasks)
          }
        } catch (matchErr) {
          console.error('Failed to send job-match emails:', matchErr)
        }
      })().catch(() => {})
    }

    return NextResponse.json(job, { status: 201 })
  } catch (error) {
    console.error('Create job error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}