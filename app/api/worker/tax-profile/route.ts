import { NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import type { WorkerTaxProfile } from '@/types/global'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const userId = request.headers.get('x-user-id')
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!db) return NextResponse.json({ profile: null })

  const snap = await getDoc(doc(db, 'workerTaxProfiles', userId))
  if (!snap.exists()) return NextResponse.json({ profile: null })

  return NextResponse.json({ profile: snap.data() as WorkerTaxProfile })
}

export async function POST(request: Request) {
  const userId = request.headers.get('x-user-id')
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json() as Partial<WorkerTaxProfile>

  const profile: WorkerTaxProfile = {
    id: userId,
    workerId: userId,
    countryCode: body.countryCode ?? 'US',
    taxId: body.taxId ?? '',
    residencyStatus: body.residencyStatus ?? 'resident',
    classification: body.classification ?? 'contractor',
    taxYear: body.taxYear ?? new Date().getFullYear(),
    currency: body.currency ?? 'USD',
    acceptedTerms: body.acceptedTerms ?? {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  if (!db) return NextResponse.json({ profile })

  await setDoc(doc(db, 'workerTaxProfiles', userId), profile)
  return NextResponse.json({ profile }, { status: 201 })
}

export async function PUT(request: Request) {
  const userId = request.headers.get('x-user-id')
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!db) return NextResponse.json({ error: 'Database unavailable' }, { status: 503 })

  const body = await request.json() as Partial<WorkerTaxProfile>
  const ref = doc(db, 'workerTaxProfiles', userId)
  const existing = await getDoc(ref)

  if (!existing.exists()) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  }

  const updated = {
    ...existing.data(),
    ...body,
    id: userId,
    workerId: userId,
    updatedAt: new Date().toISOString(),
  }

  await setDoc(ref, updated)
  return NextResponse.json({ profile: updated })
}
