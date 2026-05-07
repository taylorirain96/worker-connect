import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'

export async function POST(req: NextRequest) {
  const uid = req.headers.get('x-user-id')
  if (!uid) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { inductionComplete, ppeConfirmed, hazardRegisterViewed, safetyPlanUploaded } = body

    const allComplete = inductionComplete && ppeConfirmed && hazardRegisterViewed && safetyPlanUploaded

    const compliance = {
      inductionComplete: Boolean(inductionComplete),
      ppeConfirmed: Boolean(ppeConfirmed),
      hazardRegisterViewed: Boolean(hazardRegisterViewed),
      safetyPlanUploaded: Boolean(safetyPlanUploaded),
      completedAt: allComplete ? new Date().toISOString() : undefined,
    }

    await adminDb.collection('users').doc(uid).update({
      worksafeCompliance: compliance,
      updatedAt: new Date().toISOString(),
    })

    return NextResponse.json({ success: true, compliance })
  } catch (err) {
    console.error('worksafe POST error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const uid = req.headers.get('x-user-id')
  if (!uid) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  try {
    const snap = await adminDb.collection('users').doc(uid).get()
    if (!snap.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    const data = snap.data()
    return NextResponse.json({
      worksafeCompliance: data?.worksafeCompliance ?? null,
    })
  } catch (err) {
    console.error('worksafe GET error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
