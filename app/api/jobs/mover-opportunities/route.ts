import { NextRequest, NextResponse } from 'next/server'
import { getMoverOpportunities } from '@/lib/services/moverService'
import { matchJobsForWorker, MOCK_JOBS } from '@/lib/services/jobMatchingService'
import type { MatchedJob } from '@/types'

export const dynamic = 'force-dynamic'

/**
 * Mover Mode scoring bonuses applied on top of base match score.
 *  - Target city match: +20
 *  - Nearby city (same state): +10
 *  - High urgency: +5
 *  - Premium match (employer uses Mover Mode): +10
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

    // Fallback: legacy endpoint behaviour using moverService
    const legacyOpportunities = await getMoverOpportunities(targetCity)

    // Also produce scored jobs from mock data for the target city
    const cityJobs = MOCK_JOBS.filter(
      (j) =>
        j.remote ||
        (targetCity && (j.location ?? '').toLowerCase().includes(targetCity.toLowerCase()))
    )

    const scoredCityJobs: MatchedJob[] = cityJobs.map((j) => ({
      ...j,
      matchScore: 70 + (j.urgency === 'high' ? 5 : 0),
      matchReasons: [`Mover Mode: Jobs in ${targetCity}`],
      isRemote: j.remote ?? false,
    }))

    return NextResponse.json({
      opportunities: legacyOpportunities,
      jobs: scoredCityJobs,
      count: legacyOpportunities.length,
      targetCity,
    })
  } catch (error) {
    console.error('Mover opportunities error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

