import { NextRequest, NextResponse } from 'next/server'
import { getMoverOpportunities } from '@/lib/services/moverService'
import { matchJobsForWorker } from '@/lib/services/jobMatchingService'
import { adminDb } from '@/lib/firebase-admin'
import type { MatchedJob } from '@/types'

export const dynamic = 'force-dynamic'

/**
 * Mover Mode scoring bonuses applied on top of base match score.
 *  - Target city match: +20
 *  - Nearby city (same state): +10
 *  - High urgency: +5
 * NOTE: A future "Premium match (employer uses Mover Mode): +10" bonus is planned
 * once the employer Mover Mode flag is stored on the Job document.
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

    // Fetch live jobs from Firestore filtered by target city
    let scoredCityJobs: MatchedJob[] = []
    try {
      const snap = await adminDb
        .collection('jobs')
        .where('status', '==', 'open')
        .orderBy('createdAt', 'desc')
        .limit(50)
        .get()
      const cityLower = targetCity.toLowerCase()
      scoredCityJobs = snap.docs
        .map((d) => {
          const j = d.data()
          return {
            id: d.id,
            title: j.title ?? '',
            description: j.description ?? '',
            category: j.category ?? 'general',
            employerId: j.employerId ?? '',
            employerName: j.employerName ?? '',
            location: j.location ?? '',
            budget: j.budget ?? 0,
            budgetType: j.budgetType ?? 'fixed',
            urgency: j.urgency ?? 'medium',
            status: j.status ?? 'open',
            skills: j.skills ?? [],
            applicantsCount: j.applicantsCount ?? 0,
            createdAt: j.createdAt ?? null,
            updatedAt: j.updatedAt ?? null,
            matchScore: 70 + (j.urgency === 'high' || j.urgency === 'emergency' ? 5 : 0),
            matchReasons: [`Mover Mode: Jobs in ${targetCity}`],
            isRemote: j.remote ?? false,
          } as MatchedJob
        })
        .filter(
          (j) =>
            j.isRemote ||
            (cityLower && j.location.toLowerCase().includes(cityLower))
        )
    } catch {
      // Firestore unavailable — return empty list
      scoredCityJobs = []
    }

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

