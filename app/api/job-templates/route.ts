import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import admin, { adminDb } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'

export const dynamic = 'force-dynamic'

/**
 * GET /api/job-templates
 * Returns all saved job templates for the authenticated homeowner.
 */
export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }

    const snap = await adminDb
      .collection('jobTemplates')
      .doc(userId)
      .collection('items')
      .orderBy('createdAt', 'desc')
      .get()

    const templates = snap.docs.map((d: admin.firestore.QueryDocumentSnapshot) => ({ id: d.id, ...d.data() }))
    return NextResponse.json({ templates })
  } catch (err) {
    console.error('GET /api/job-templates error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/job-templates
 * Saves a new job template for the authenticated homeowner.
 */
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }

    const body = await req.json() as {
      name?: string
      title?: string
      description?: string
      category?: string
      location?: string
      budgetMin?: number
      budgetMax?: number
      budgetType?: 'fixed' | 'hourly'
      urgency?: 'low' | 'medium' | 'high' | 'emergency'
      skills?: string
    }

    const { name, title, description, category } = body
    if (!name || !title || !description || !category) {
      return NextResponse.json(
        { error: 'Missing required fields: name, title, description, category' },
        { status: 400 },
      )
    }

    const template = {
      name: String(name).trim().slice(0, 80),
      title: String(title).trim().slice(0, 100),
      description: String(description).trim().slice(0, 2000),
      category: String(category),
      location: typeof body.location === 'string' ? body.location.trim() : '',
      budgetMin: typeof body.budgetMin === 'number' ? body.budgetMin : 0,
      budgetMax: typeof body.budgetMax === 'number' ? body.budgetMax : 0,
      budgetType: body.budgetType === 'hourly' ? 'hourly' : 'fixed',
      urgency: (['low', 'medium', 'high', 'emergency'] as const).includes(
        body.urgency as 'low' | 'medium' | 'high' | 'emergency',
      )
        ? (body.urgency as 'low' | 'medium' | 'high' | 'emergency')
        : 'medium',
      skills: typeof body.skills === 'string' ? body.skills : '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const ref = await adminDb
      .collection('jobTemplates')
      .doc(userId)
      .collection('items')
      .add(template)

    // Track template count on the parent document for easy reads
    await adminDb.collection('jobTemplates').doc(userId).set(
      { count: FieldValue.increment(1), updatedAt: new Date().toISOString() },
      { merge: true },
    )

    return NextResponse.json({ id: ref.id, ...template }, { status: 201 })
  } catch (err) {
    console.error('POST /api/job-templates error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
