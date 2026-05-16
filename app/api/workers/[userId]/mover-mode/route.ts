import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'
import type { MoverSettings } from '@/types/reputation'

export const dynamic = 'force-dynamic'

const DEFAULT_SETTINGS: Omit<MoverSettings, 'workerId'> = {
  targetRelocationCity: '',
  relocationReadiness: 0,
  isActive: false,
  relocationAcceptanceRate: 0,
  relocationSuccessRate: 0,
  repeatClientRate: 0,
  hasRelocationBadge: false,
  willingToRelocate: false,
  fifoAvailable: false,
  targetCountries: [],
  workRightsNZ: false,
  workRightsAU: false,
  accommodationRequired: false,
  travelAssistanceRequired: false,
  relocationPreference: 'either',
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  const params = await context.params
  try {
    const { userId } = params
    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
    }

    const settingsSnap = await adminDb.collection('moverSettings').doc(userId).get()
    const settings: MoverSettings | null = settingsSnap.exists
      ? (settingsSnap.data() as MoverSettings)
      : null

    return NextResponse.json({ settings })
  } catch (error) {
    console.error('Get mover settings error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  const params = await context.params
  try {
    const { userId } = params
    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
    }

    // Authn/authz: caller must be the worker themselves (matches other worker routes)
    const callerId = request.headers.get('x-user-id')
    if (!callerId || callerId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userRef = adminDb.collection('users').doc(userId)
    const userSnap = await userRef.get()
    if (!userSnap.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    const userData = userSnap.data()
    if (userData?.role !== 'worker') {
      return NextResponse.json({ error: 'Only workers can update mover mode' }, { status: 403 })
    }

    let body: Partial<MoverSettings> = {}
    try {
      body = (await request.json()) as Partial<MoverSettings>
    } catch {
      // Empty body is allowed (treated as a no-op merge)
    }

    // Validate a few critical fields if present
    if (body.relocationReadiness !== undefined) {
      const r = Number(body.relocationReadiness)
      if (!Number.isFinite(r) || r < 0 || r > 100) {
        return NextResponse.json(
          { error: 'relocationReadiness must be a number between 0 and 100' },
          { status: 400 }
        )
      }
      body.relocationReadiness = r
    }
    if (body.targetCountries !== undefined) {
      if (
        !Array.isArray(body.targetCountries) ||
        body.targetCountries.some((c) => c !== 'NZ' && c !== 'AU')
      ) {
        return NextResponse.json(
          { error: 'targetCountries must be an array of "NZ" or "AU"' },
          { status: 400 }
        )
      }
    }

    const settingsRef = adminDb.collection('moverSettings').doc(userId)
    const existingSnap = await settingsRef.get()
    const existing = existingSnap.exists ? (existingSnap.data() as MoverSettings) : null

    const merged: MoverSettings = {
      ...DEFAULT_SETTINGS,
      ...(existing ?? {}),
      ...body,
      workerId: userId,
    }

    await settingsRef.set(merged, { merge: true })

    // Keep the convenience flag on the user doc in sync for quick filters
    await userRef.update({
      moverMode: Boolean(merged.isActive),
      updatedAt: FieldValue.serverTimestamp(),
    })

    return NextResponse.json({ userId, settings: merged })
  } catch (error) {
    console.error('Update mover settings error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
