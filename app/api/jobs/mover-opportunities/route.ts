import { NextRequest, NextResponse } from 'next/server'
import { getMoverOpportunities } from '@/lib/services/moverService'
import { matchJobsForWorker } from '@/lib/services/jobMatchingService'
import type { MatchedJob } from '@/types'

export const dynamic = 'force-dynamic'

/**
 * Mover Mode scoring bonuses applied on top of base match score.
 *  - Target city match: +20
 *  - Nearby city (same state): +10
 *  - High urgency: +5
 *  - Premium match (employer marked job relocationFriendly): +10
 */
function applyMoverModeScoring(
  jobs: MatchedJob[],
  targetCity: string
): MatchedJob[] {
  const target = targetCity.toLowerCase().trim()
  return jobs
    .map((job) => {
      const jobLocation = (job.location ?? '').toLowerCase()
      let bonus = 0
      const extraReasons: string[] = []

      if (target && jobLocation.includes(target)) {
        bonus += 20
        extraReasons.push(`Mover Mode: Target city (${targetCity}) +20`)
      } else if (target && jobLocation.split(',')[1]?.trim() === target.split(',')[1]?.trim()) {
        bonus += 10
        extraReasons.push(`Mover Mode: Nearby city +10`)
      }

      if (job.urgency === 'high' || job.urgency === 'emergency') {
        bonus += 5
        extraReasons.push(`Mover Mode: High urgency +5`)
      }

      if (job.relocationFriendly) {
        bonus += 10
        extraReasons.push('Mover Mode: Premium match (employer relocation-friendly) +10')
      }

      return {
        ...job,
        matchScore: Math.min(100, job.matchScore + bonus),
        matchReasons: [...job.matchReasons, ...extraReasons],
      }
    })
    .sort((a, b) => b.matchScore - a.matchScore)
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const targetCity = searchParams.get('targetCity') ?? ''
    const workerId = searchParams.get('workerId') ?? ''
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50', 10), 100)

    // If workerId is provided, use the full matching algorithm + mover scoring
    if (workerId) {
      const matchedJobs = await matchJobsForWorker(workerId, undefined, limit)
      const moverJobs = applyMoverModeScoring(matchedJobs, targetCity)
      return NextResponse.json({
        jobs: moverJobs,
        count: moverJobs.length,
        targetCity,
        workerId,
      })
    }

    // Fallback: city-only query via moverService (now backed by live Firestore data)
    const opportunities = await getMoverOpportunities(targetCity)

    return NextResponse.json({
      opportunities,
      count: opportunities.length,
      targetCity,
    })
  } catch (error) {
    console.error('Mover opportunities error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

