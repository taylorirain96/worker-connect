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

    if (stillEmployed) {
      await confirmStillEmployed(placementId, confirmedBy)
      return NextResponse.json({ success: true, action: 'confirmed' })
    }

    // Mark placement as ended
    await updatePlacementStatus(placementId, 'ended')

    // Send re-engagement emails to both worker and employer (fire-and-forget)
    const baseUrl = request.nextUrl.origin

    const workerEmailPromise = fetch(`${baseUrl}/api/notifications/email`, {
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
    }).catch((err) => console.error('Failed to send worker re-engagement email:', err))

    const employerEmailPromise = fetch(`${baseUrl}/api/notifications/email`, {
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
    }).catch((err) => console.error('Failed to send employer re-engagement email:', err))

    await Promise.allSettled([workerEmailPromise, employerEmailPromise])
    await markReEngagementSent(placementId)

    return NextResponse.json({ success: true, action: 'ended' })
  } catch (error) {
    console.error('POST /api/placements/confirm error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
