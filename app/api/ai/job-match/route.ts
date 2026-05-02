import { NextRequest, NextResponse } from 'next/server'
import { rateLimit } from '@/lib/rateLimit'
import { adminDb } from '@/lib/firebase-admin'
import type { Job } from '@/types'

export const dynamic = 'force-dynamic'

interface JobMatchRequest {
  workerId: string
  skills: string[]
  location: string
  jobHistory?: string[]
}

interface ScoredJob {
  job: Job
  score: number
  reason: string
}

/** Keyword-based fallback scoring when OpenAI is unavailable. */
function keywordScore(job: Job, skills: string[], location: string): number {
  let score = 0
  const normalise = (s: string) => s.toLowerCase().trim()
  const workerSkills = skills.map(normalise)
  const jobSkills = job.skills.map(normalise)
  const jobText = `${job.title} ${job.description} ${job.category}`.toLowerCase()

  // Skill overlap (up to 60 pts)
  const matchedSkills = workerSkills.filter(
    (s) => jobSkills.some((js) => js.includes(s) || s.includes(js)) || jobText.includes(s)
  )
  score += Math.min(60, (matchedSkills.length / Math.max(workerSkills.length, 1)) * 60 + matchedSkills.length * 5)

  // Location match (up to 30 pts)
  if (location) {
    const workerCity = normalise(location).split(',')[0]
    const jobCity = normalise(job.location).split(',')[0]
    if (workerCity && jobCity === workerCity) score += 30
    else if (workerCity && normalise(job.location).includes(workerCity)) score += 15
  }

  // Urgency bonus (up to 10 pts)
  if (job.urgency === 'emergency') score += 10
  else if (job.urgency === 'high') score += 5

  return Math.min(100, Math.round(score))
}

export async function POST(request: NextRequest) {
  if (rateLimit(request, { max: 10, windowMs: 60_000 })) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait a moment before trying again.' },
      { status: 429 }
    )
  }

  try {
    const body = await request.json() as JobMatchRequest
    const { workerId, skills, location, jobHistory } = body

    if (!workerId || !Array.isArray(skills)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Fetch open jobs from Firestore
    let jobs: Job[] = []
    try {
      if (adminDb) {
        const snapshot = await adminDb.collection('jobs')
          .where('status', '==', 'open')
          .limit(50)
          .get()
        jobs = snapshot.docs.map((doc) => {
          const data = doc.data()
          return {
            ...data,
            id: doc.id,
            createdAt: data.createdAt?.toDate?.()?.toISOString() ?? new Date().toISOString(),
            updatedAt: data.updatedAt?.toDate?.()?.toISOString() ?? new Date().toISOString(),
          } as Job
        })
      }
    } catch {
      jobs = []
    }

    if (jobs.length === 0) {
      return NextResponse.json({ jobs: [] })
    }

    const apiKey = process.env.OPENAI_API_KEY

    // Try AI scoring first
    if (apiKey && skills.length > 0) {
      try {
        const prompt = `You are a job matching assistant for QuickTrade, a New Zealand trade platform.

Worker profile:
- Skills: ${skills.join(', ')}
- Location: ${location || 'New Zealand'}
${jobHistory && jobHistory.length > 0 ? `- Previous jobs: ${jobHistory.slice(0, 5).join(', ')}` : ''}

Available jobs:
${jobs.map((j, i) => `${i + 1}. ID: ${j.id} | Title: ${j.title} | Category: ${j.category} | Location: ${j.location} | Skills needed: ${j.skills.join(', ')} | Description: ${j.description.substring(0, 120)}`).join('\n')}

Score each job for this worker on a 0-100 scale based on skill match, location proximity, and relevance.
Return a JSON array for ALL jobs. Format:
[{"jobId": "...", "score": 85, "reason": "Strong plumbing skills match"}]
Return ONLY the JSON array, nothing else.`

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 1000,
            temperature: 0.2,
          }),
        })

        if (response.ok) {
          const data = await response.json() as { choices?: Array<{ message?: { content?: string } }> }
          const content = data.choices?.[0]?.message?.content?.trim() ?? '[]'

          let aiScores: Array<{ jobId: string; score: number; reason: string }> = []
          try {
            aiScores = JSON.parse(content)
          } catch {
            aiScores = []
          }

          if (aiScores.length > 0) {
            const scored: ScoredJob[] = aiScores
              .map((s) => {
                const job = jobs.find((j) => j.id === s.jobId)
                if (!job) return null
                return { job, score: s.score, reason: s.reason }
              })
              .filter((s): s is ScoredJob => s !== null)
              .sort((a, b) => b.score - a.score)

            return NextResponse.json({ jobs: scored })
          }
        }
      } catch {
        // Fall through to keyword matching
      }
    }

    // Keyword fallback
    const scored: ScoredJob[] = jobs
      .map((job) => ({
        job,
        score: keywordScore(job, skills, location),
        reason: 'Based on your skills and location',
      }))
      .sort((a, b) => b.score - a.score)

    return NextResponse.json({ jobs: scored })
  } catch (error) {
    console.error('POST /api/ai/job-match error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
