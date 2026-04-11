import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getPlacementsNeedingCheckIn, markCheckInSent } from '@/lib/placements/firebase'

export const dynamic = 'force-dynamic'

/** Resolve the internal app base URL from environment variables to avoid SSRF. */
function getAppBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '')
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return 'http://localhost:3000'
}

/**
 * POST /api/placements/checkin-cron
 *
 * Called daily by Vercel cron (see vercel.json).
 * Checks all active placements for pending 30/60/90-day check-ins and sends
 * emails to both the worker and employer.
 *
 * Secured with CRON_SECRET header to prevent unauthorised calls.
 */
export async function POST(request: NextRequest) {
  const secret = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && secret !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const baseUrl = getAppBaseUrl()
  const results: Record<string, number> = { day30: 0, day60: 0, day90: 0 }

  for (const dayMark of [30, 60, 90] as const) {
    const placements = await getPlacementsNeedingCheckIn(dayMark)

    for (const placement of placements) {
      // Confirmation links point to the GET handler which handles email click-throughs
      const confirmYesWorkerUrl = `${baseUrl}/api/placements/confirm?id=${placement.id}&by=worker&still=true`
      const confirmNoWorkerUrl = `${baseUrl}/api/placements/confirm?id=${placement.id}&by=worker&still=false`
      const confirmYesEmployerUrl = `${baseUrl}/api/placements/confirm?id=${placement.id}&by=employer&still=true`
      const confirmNoEmployerUrl = `${baseUrl}/api/placements/confirm?id=${placement.id}&by=employer&still=false`

      await Promise.allSettled([
        // Email to worker
        fetch(`${baseUrl}/api/notifications/email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: placement.workerEmail,
            type: 'placement_checkin_worker',
            vars: {
              workerName: placement.workerName,
              employerName: placement.employerName,
              jobTitle: placement.jobTitle,
              dayMark: String(dayMark),
              confirmYesUrl: confirmYesWorkerUrl,
              confirmNoUrl: confirmNoWorkerUrl,
              jobsUrl: `${baseUrl}/jobs`,
            },
          }),
        }).catch((err) =>
          console.error(`Worker check-in email failed for ${placement.id}:`, err)
        ),

        // Email to employer
        fetch(`${baseUrl}/api/notifications/email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: placement.employerEmail,
            type: 'placement_checkin_employer',
            vars: {
              employerName: placement.employerName,
              workerName: placement.workerName,
              jobTitle: placement.jobTitle,
              dayMark: String(dayMark),
              confirmYesUrl: confirmYesEmployerUrl,
              confirmNoUrl: confirmNoEmployerUrl,
              postJobUrl: `${baseUrl}/jobs/create`,
            },
          }),
        }).catch((err) =>
          console.error(`Employer check-in email failed for ${placement.id}:`, err)
        ),
      ])

      await markCheckInSent(placement.id, dayMark)
      results[`day${dayMark}`]++
    }
  }

  return NextResponse.json({ success: true, emailsSent: results })
}
