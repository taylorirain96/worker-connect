import { db } from '@/lib/firebase'
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
} from 'firebase/firestore'
import type { Job, MatchedJob, WorkerMatchProfile } from '@/types'
import type { MoverSettings } from '@/types/reputation'

// Default assumed hours for a fixed-price job when computing implied hourly rate
const DEFAULT_FIXED_PRICE_HOURS = 8

const SKILL_SYNONYMS: Record<string, string[]> = {
  plumbing: ['pipe fitting', 'drain', 'plumber', 'waterworks'],
  electrical: ['electrician', 'wiring', 'circuits', 'electric'],
  carpentry: ['woodworking', 'framing', 'cabinet', 'carpenter'],
  painting: ['painter', 'coating', 'refinishing'],
  hvac: ['heating', 'cooling', 'air conditioning', 'ventilation'],
  landscaping: ['gardening', 'lawn', 'grounds', 'horticulture'],
  cleaning: ['janitorial', 'housekeeping', 'sanitation', 'maid'],
  roofing: ['roofer', 'shingles', 'gutters'],
  flooring: ['tile', 'hardwood', 'laminate', 'carpet'],
  moving: ['mover', 'relocation', 'hauling', 'transport'],
  general: ['handyman', 'maintenance', 'repair', 'general contractor'],
}

function normalizeSkill(skill: string): string {
  return skill.toLowerCase().trim()
}

function skillsMatch(workerSkill: string, jobSkill: string): boolean {
  const ws = normalizeSkill(workerSkill)
  const js = normalizeSkill(jobSkill)
  if (ws === js) return true
  // Check synonyms
  const workerSynonyms = SKILL_SYNONYMS[ws] ?? []
  const jobSynonyms = SKILL_SYNONYMS[js] ?? []
  if (workerSynonyms.includes(js) || jobSynonyms.includes(ws)) return true
  // Substring match
  if (ws.includes(js) || js.includes(ws)) return true
  return false
}

// ─── Haversine distance formula ──────────────────────────────────────────────

export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// ─── Core scoring functions ───────────────────────────────────────────────────

/**
 * Filter jobs by skill match.
 * Returns jobs with a skillScore > 0 (exact or partial match).
 */
export function filterJobsBySkills(jobs: Job[], workerSkills: string[]): Job[] {
  if (!workerSkills.length) return jobs
  return jobs.filter((job) => {
    const requiredSkills: string[] = job.skills ?? []
    if (!requiredSkills.length) return true
    const matchCount = requiredSkills.filter((rs) =>
      workerSkills.some((ws) => skillsMatch(ws, rs))
    ).length
    return matchCount > 0
  })
}

/**
 * Filter jobs by budget compatibility.
 * Keeps jobs where implied hourly rate >= workerHourlyRate * (1 - bufferPercent/100).
 * NOTE: Fixed-price jobs are converted to an implied hourly rate by dividing
 * the budget by DEFAULT_FIXED_PRICE_HOURS (8 h). This is a simplifying assumption —
 * adjust this constant or extend the Job type with a duration field for greater accuracy.
 */
export function filterJobsByBudget(
  jobs: Job[],
  hourlyRate: number,
  bufferPercent: number = 20
): Job[] {
  const minAcceptable = hourlyRate * (1 - bufferPercent / 100)
  return jobs.filter((job) => {
    if (job.budgetType === 'hourly') {
      return job.budget >= minAcceptable
    }
    // Fixed-price job: assume DEFAULT_FIXED_PRICE_HOURS hour project, compute implied hourly rate
    const impliedHourly = job.budget / DEFAULT_FIXED_PRICE_HOURS
    return impliedHourly >= minAcceptable
  })
}

/**
 * Filter jobs by location proximity.
 * Remote jobs always pass. Non-remote jobs must be within maxDistance km.
 */
export function filterJobsByLocation(
  jobs: JobWithCoordinates[],
  workerCoordinates: [number, number],
  maxDistance: number = 50
): (JobWithCoordinates & { distanceKm: number })[] {
  return jobs
    .map((job) => {
      const coords = job.coordinates
      if (!coords) {
        return { ...job, distanceKm: 0 }
      }
      const dist = calculateDistanceKm(
        workerCoordinates[0],
        workerCoordinates[1],
        coords[0],
        coords[1]
      )
      return { ...job, distanceKm: dist }
    })
    .filter((job) => job.remote || job.distanceKm <= maxDistance)
}

/**
 * Boost job scores for Mover Mode workers (used inside the main matching algorithm).
 * Jobs in the worker's target relocation city get +15, jobs in nearby cities (same
 * state) get +5. These values are intentionally smaller than the endpoint-level
 * `applyMoverModeScoring` bonuses (+20 / +10) which are applied on top when the
 * dedicated mover-opportunities route is used.
 */
export function prioritizeMoverMode(
  jobs: MatchedJob[],
  moverSettings: MoverSettings
): MatchedJob[] {
  if (!moverSettings.isActive) return jobs
  const target = moverSettings.targetRelocationCity.toLowerCase().trim()
  return jobs.map((job) => {
    const jobCity = (job.location ?? '').toLowerCase()
    if (jobCity.includes(target)) {
      return {
        ...job,
        matchScore: Math.min(100, job.matchScore + 15),
        matchReasons: [...job.matchReasons, `Mover Mode: Target city match (+15)`],
      }
    }
    // Nearby: if cities share the same state prefix (simplistic heuristic)
    if (target && jobCity && jobCity.split(',')[1]?.trim() === target.split(',')[1]?.trim()) {
      return {
        ...job,
        matchScore: Math.min(100, job.matchScore + 5),
        matchReasons: [...job.matchReasons, `Mover Mode: Nearby city (+5)`],
      }
    }
    return job
  })
}

// ─── Match score calculation ──────────────────────────────────────────────────

interface JobWithCoordinates extends Job {
  coordinates?: [number, number]
  remote?: boolean
}

/**
 * Calculate 0-100 match score between worker and job.
 * Weights:
 *   Skills match:      40%
 *   Worker rating:     20%
 *   Completion rate:   20%
 *   Budget match:      10%
 *   Location:          10%
 */
export function calculateMatchScore(
  worker: WorkerMatchProfile,
  job: JobWithCoordinates
): { score: number; reasons: string[] } {
  const reasons: string[] = []

  // 1. Skills score (0-40)
  const requiredSkills: string[] = job.skills ?? []
  let skillScore = 0
  if (!requiredSkills.length) {
    skillScore = 20 // neutral if no skills required
    reasons.push('Skills match: Open to all workers')
  } else {
    const workerSkills = worker.skills ?? []
    const matchCount = requiredSkills.filter((rs) =>
      workerSkills.some((ws) => skillsMatch(ws, rs))
    ).length
    const matchRatio = matchCount / requiredSkills.length
    if (matchRatio === 1) {
      skillScore = 40
      reasons.push(`Skills match: 100% (${matchCount}/${requiredSkills.length})`)
    } else if (matchRatio >= 0.6) {
      skillScore = 15
      reasons.push(
        `Skills match: ${Math.round(matchRatio * 100)}% (${matchCount}/${requiredSkills.length})`
      )
    } else if (matchRatio > 0) {
      skillScore = 8
      reasons.push(
        `Skills match: ${Math.round(matchRatio * 100)}% partial (${matchCount}/${requiredSkills.length})`
      )
    } else {
      skillScore = 0
      reasons.push('Skills match: No match')
    }
  }

  // 2. Rating score (0-20): reputation is 0-100
  const ratingScore = Math.round((worker.reputation / 100) * 20)
  reasons.push(`Rating: ${worker.reputation}/100 (${ratingScore}/20 pts)`)

  // 3. Completion rate score (0-20): completionRate is 0-1
  const completionScore = Math.round(worker.completionRate * 20)
  reasons.push(
    `Completion rate: ${Math.round(worker.completionRate * 100)}% (${completionScore}/20 pts)`
  )

  // 4. Budget score (0-10)
  let budgetScore = 0
  const workerRate = worker.hourlyRate
  if (job.budgetType === 'hourly') {
    if (job.budget >= workerRate) {
      budgetScore = 10
      reasons.push(`Budget: Suitable ($${job.budget}/hr ≥ $${workerRate}/hr)`)
    } else if (job.budget >= workerRate * 0.8) {
      budgetScore = 5
      reasons.push(`Budget: Below rate but negotiable`)
    } else {
      budgetScore = 0
      reasons.push(`Budget: Below minimum ($${job.budget}/hr < $${workerRate}/hr)`)
    }
  } else {
    // Fixed price
    const impliedHourly = job.budget / DEFAULT_FIXED_PRICE_HOURS
    if (impliedHourly >= workerRate) {
      budgetScore = 10
      reasons.push(`Budget: Suitable (fixed $${job.budget})`)
    } else if (impliedHourly >= workerRate * 0.8) {
      budgetScore = 5
      reasons.push(`Budget: Fixed price near your rate`)
    } else {
      budgetScore = 0
      reasons.push(`Budget: Fixed price below minimum`)
    }
  }

  // 5. Location score (0-10)
  let locationScore = 0
  let distanceKm: number | undefined
  if (job.remote) {
    locationScore = 10
    reasons.push('Location: Remote — anywhere')
  } else if (job.coordinates && worker.location?.coordinates) {
    distanceKm = calculateDistanceKm(
      worker.location.coordinates[0],
      worker.location.coordinates[1],
      job.coordinates[0],
      job.coordinates[1]
    )
    if (distanceKm <= 10) {
      locationScore = 10
      reasons.push(`Location: ${distanceKm.toFixed(1)} km away`)
    } else if (distanceKm <= 25) {
      locationScore = 7
      reasons.push(`Location: ${distanceKm.toFixed(1)} km away`)
    } else if (distanceKm <= 50) {
      locationScore = 4
      reasons.push(`Location: ${distanceKm.toFixed(1)} km away`)
    } else {
      locationScore = 0
      reasons.push(`Location: ${distanceKm.toFixed(1)} km — too far`)
    }
  } else {
    locationScore = 5 // no coordinate data, neutral
    reasons.push('Location: Unknown distance')
  }

  const total = skillScore + ratingScore + completionScore + budgetScore + locationScore
  return { score: Math.min(100, total), reasons }
}

// ─── Main matching function ───────────────────────────────────────────────────

export interface MatchFilters {
  skills?: string[]
  budgetRange?: { min: number; max: number }
  location?: string
  maxDistance?: number
  availability?: string
}

export async function matchJobsForWorker(
  workerId: string,
  filters?: MatchFilters,
  limit: number = 20
): Promise<MatchedJob[]> {
  // Fetch worker profile
  let worker: WorkerMatchProfile | null = null
  if (db) {
    try {
      const workerRef = doc(db, 'users', workerId)
      const snap = await getDoc(workerRef)
      if (snap.exists()) {
        const data = snap.data()
        worker = {
          workerId,
          skills: data.skills ?? [],
          hourlyRate: data.hourlyRate ?? 50,
          reputation: data.reputationScore ?? (data.rating ?? 3) * 20,
          completionRate: data.completionRate ?? 0.8,
          location: data.locationData ?? {
            city: data.location ?? '',
            state: '',
            coordinates: [0, 0] as [number, number],
          },
          availability: data.availability ?? 'full_time',
          moverMode: data.moverMode ?? undefined,
        }
      }
    } catch {
      return []
    }
  }

  if (!worker) return []

  // Fetch available jobs
  let jobs: JobWithCoordinates[] = []
  if (db) {
    try {
      const jobsRef = collection(db, 'jobs')
      const q = query(jobsRef, where('status', '==', 'open'), orderBy('createdAt', 'desc'))
      const snapshot = await getDocs(q)
      jobs = snapshot.docs.map((d) => {
        const data = d.data()
        return {
          ...data,
          id: d.id,
          coordinates: data.coordinates ?? undefined,
          remote: data.remote ?? false,
          createdAt:
            data.createdAt?.toDate?.()?.toISOString?.() ?? new Date().toISOString(),
          updatedAt:
            data.updatedAt?.toDate?.()?.toISOString?.() ?? new Date().toISOString(),
        } as JobWithCoordinates
      })
    } catch {
      return []
    }
  }

  if (!jobs.length) return []

  // Apply optional skill filter
  const workerSkills = filters?.skills ?? worker.skills
  const filteredBySkills = filterJobsBySkills(jobs, workerSkills)

  // Apply optional budget filter
  const filteredByBudget = filterJobsByBudget(filteredBySkills, worker.hourlyRate)

  // Score each job
  const scored: MatchedJob[] = filteredByBudget.map((job) => {
    const { score, reasons } = calculateMatchScore(worker!, job as JobWithCoordinates)
    const jobWithCoords = job as JobWithCoordinates
    const distanceKm =
      !jobWithCoords.remote && jobWithCoords.coordinates && worker!.location.coordinates
        ? calculateDistanceKm(
            worker!.location.coordinates[0],
            worker!.location.coordinates[1],
            jobWithCoords.coordinates[0],
            jobWithCoords.coordinates[1]
          )
        : undefined
    return {
      ...job,
      matchScore: score,
      matchReasons: reasons,
      isRemote: jobWithCoords.remote ?? false,
      distanceKm,
    } as MatchedJob
  })

  // Apply Mover Mode boost if applicable
  let result = scored
  if (worker.moverMode?.active) {
    const moverSettings = {
      workerId,
      targetRelocationCity: worker.moverMode.targetCity,
      relocationReadiness: worker.moverMode.relocationReadiness,
      isActive: true,
      relocationAcceptanceRate: 0,
      relocationSuccessRate: 0,
      repeatClientRate: 0,
      hasRelocationBadge: false,
      willingToRelocate: true,
      fifoAvailable: false,
      targetCountries: [] as ('NZ' | 'AU')[],
      workRightsNZ: false,
      workRightsAU: false,
      accommodationRequired: false,
      travelAssistanceRequired: false,
      relocationPreference: 'either' as const,
    }
    result = prioritizeMoverMode(scored, moverSettings)
  }

  // Sort by match score descending
  result.sort((a, b) => b.matchScore - a.matchScore)

  return result.slice(0, limit)
}

// ─── Get matched workers for a job ───────────────────────────────────────────

export interface WorkerWithScore {
  worker: WorkerMatchProfile
  matchScore: number
  matchReasons: string[]
}

export async function matchWorkersForJob(
  jobId: string,
  limit: number = 20
): Promise<WorkerWithScore[]> {
  // Fetch the job
  let job: JobWithCoordinates | null = null
  if (db) {
    try {
      const jobRef = doc(db, 'jobs', jobId)
      const snap = await getDoc(jobRef)
      if (snap.exists()) {
        const data = snap.data()
        job = {
          ...data,
          id: snap.id,
          coordinates: data.coordinates ?? undefined,
          remote: data.remote ?? false,
          createdAt: data.createdAt?.toDate?.()?.toISOString?.() ?? new Date().toISOString(),
          updatedAt: data.updatedAt?.toDate?.()?.toISOString?.() ?? new Date().toISOString(),
        } as JobWithCoordinates
      }
    } catch {
      // fall through
    }
  }

  if (!job) return []

  // Fetch workers
  let workers: WorkerMatchProfile[] = []
  if (db) {
    try {
      const usersRef = collection(db, 'users')
      const q = query(usersRef, where('role', '==', 'worker'), orderBy('rating', 'desc'))
      const snap = await getDocs(q)
      workers = snap.docs.map((d) => {
        const data = d.data()
        return {
          workerId: d.id,
          skills: data.skills ?? [],
          hourlyRate: data.hourlyRate ?? 50,
          reputation: data.reputationScore ?? (data.rating ?? 3) * 20,
          completionRate: data.completionRate ?? 0.8,
          location: data.locationData ?? {
            city: data.location ?? '',
            state: '',
            coordinates: [0, 0] as [number, number],
          },
          availability: data.availability ?? 'full_time',
        } as WorkerMatchProfile
      })
    } catch {
      // fall through
    }
  }

  if (!workers.length) return []

  const scored: WorkerWithScore[] = workers.map((w) => {
    const { score, reasons } = calculateMatchScore(w, job!)
    return { worker: w, matchScore: score, matchReasons: reasons }
  })

  scored.sort((a, b) => b.matchScore - a.matchScore)
  return scored.slice(0, limit)
}
