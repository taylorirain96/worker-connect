import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import {
  getPlacement,
  confirmStillEmployed,
  updatePlacementStatus,
  markReEngagementSent,
} from '@/lib/placements/firebase'

export const dynamic = 'force-dynamic'

interface ConfirmBody {
  placementId: string
  confirmedBy: 'worker' | 'employer'
  stillEmployed: boolean
}

/** Resolve the internal app base URL from environment variables to avoid SSRF. */
function getAppBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '')
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return 'http://localhost:3000'
}

async function processConfirmation(
  placementId: string,
  confirmedBy: 'worker' | 'employer',
  stillEmployed: boolean
): Promise<{ success: boolean; action: string }> {
  if (stillEmployed) {
    await confirmStillEmployed(placementId, confirmedBy)
    return { success: true, action: 'confirmed' }
  }

  await updatePlacementStatus(placementId, 'ended')

  const placement = await getPlacement(placementId)
  if (!placement) return { success: true, action: 'ended' }

  const baseUrl = getAppBaseUrl()

  await Promise.allSettled([
    fetch(`${baseUrl}/api/notifications/email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: placement.workerEmail,
        type: 'placement_ended_worker',
        vars: {
          workerName: placement.workerName,
          employerName: placement.employerName,
          jobTitle: placement.jobTitle,
          actionUrl: `${baseUrl}/jobs`,
        },
      }),
    }).catch((err) => console.error(`Failed to send worker re-engagement email for placement ${placementId}:`, err)),

    fetch(`${baseUrl}/api/notifications/email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: placement.employerEmail,
        type: 'placement_ended_employer',
        vars: {
          employerName: placement.employerName,
          workerName: placement.workerName,
          jobTitle: placement.jobTitle,
          actionUrl: `${baseUrl}/jobs/create`,
        },
      }),
    }).catch((err) => console.error(`Failed to send employer re-engagement email for placement ${placementId}:`, err)),
  ])

  await markReEngagementSent(placementId)
  return { success: true, action: 'ended' }
}

/**
 * GET /api/placements/confirm?id=X&by=worker|employer&still=true|false
 *
 * Email click-through handler — workers and employers click YES/NO buttons
 * in their check-in emails which link here via GET.
 * After confirming, redirects to the appropriate dashboard.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const placementId = searchParams.get('id')
  const confirmedByParam = searchParams.get('by')
  const stillParam = searchParams.get('still')

  if (
    !placementId ||
    (confirmedByParam !== 'worker' && confirmedByParam !== 'employer') ||
    stillParam === null
  ) {
    return NextResponse.redirect(new URL('/', origin))
  }

  try {
    const confirmedBy = confirmedByParam as 'worker' | 'employer'
    const stillEmployed = stillParam === 'true'

    const placement = await getPlacement(placementId)
    if (!placement) return NextResponse.redirect(new URL('/', origin))

    const result = await processConfirmation(placementId, confirmedBy, stillEmployed)

    const redirectPath =
      result.action === 'ended'
        ? confirmedBy === 'worker'
          ? '/jobs'
          : '/jobs/create'
        : confirmedBy === 'worker'
        ? '/dashboard/worker'
        : '/dashboard/employer'

    return NextResponse.redirect(new URL(redirectPath, origin))
  } catch (error) {
    console.error('GET /api/placements/confirm error:', error)
    return NextResponse.redirect(new URL('/', origin))
  }
}

/**
 * POST /api/placements/confirm
 *
 * Body: { placementId, confirmedBy: 'worker' | 'employer', stillEmployed: boolean }
 *
 * - stillEmployed: true  → records confirmation timestamp
 * - stillEmployed: false → marks placement as ended and triggers re-engagement emails
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<ConfirmBody>
    const { placementId, confirmedBy, stillEmployed } = body

    if (!placementId || !confirmedBy || stillEmployed === undefined) {
      return NextResponse.json(
        { error: 'placementId, confirmedBy and stillEmployed are required' },
        { status: 400 }
      )
    }

    if (confirmedBy !== 'worker' && confirmedBy !== 'employer') {
      return NextResponse.json(
        { error: 'confirmedBy must be "worker" or "employer"' },
        { status: 400 }
      )
    }

    const placement = await getPlacement(placementId)
    if (!placement) {
      return NextResponse.json({ error: 'Placement not found' }, { status: 404 })
    }

    const result = await processConfirmation(placementId, confirmedBy, stillEmployed)
    return NextResponse.json(result)
  } catch (error) {
    console.error('POST /api/placements/confirm error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
