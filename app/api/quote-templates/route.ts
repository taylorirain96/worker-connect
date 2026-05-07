import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'
import type { QuoteTemplate } from '@/types'

export const dynamic = 'force-dynamic'

const MAX_TEMPLATES = 20

/**
 * GET /api/quote-templates
 * Returns saved quote templates for the authenticated worker.
 * Headers: x-user-id
 */
export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
      const snap = await adminDb
        .collection('quoteTemplates')
        .doc(userId)
        .collection('items')
        .orderBy('createdAt', 'desc')
        .limit(MAX_TEMPLATES)
        .get()

      const templates = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as QuoteTemplate[]
      return NextResponse.json({ templates })
    } catch {
      return NextResponse.json({ templates: [] })
    }
  } catch (error) {
    console.error('GET /api/quote-templates error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/quote-templates
 * Creates a new quote template for the authenticated worker.
 * Headers: x-user-id
 */
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json() as Partial<QuoteTemplate>

    if (!body.name?.trim()) {
      return NextResponse.json({ error: 'Template name is required' }, { status: 400 })
    }

    // Check template count limit
    try {
      const countSnap = await adminDb
        .collection('quoteTemplates')
        .doc(userId)
        .collection('items')
        .count()
        .get()

      if (countSnap.data().count >= MAX_TEMPLATES) {
        return NextResponse.json(
          { error: `You can save up to ${MAX_TEMPLATES} quote templates` },
          { status: 422 }
        )
      }
    } catch {
      // Ignore count check if unavailable
    }

    const now = new Date().toISOString()
    const templateData = {
      workerId: userId,
      name: body.name.trim(),
      basePrice: body.basePrice ?? 0,
      laborHours: body.laborHours ?? 0,
      laborRate: body.laborRate ?? 0,
      materials: Array.isArray(body.materials) ? body.materials : [],
      travelCost: body.travelCost ?? 0,
      description: body.description?.trim() ?? '',
      timeline: body.timeline?.trim() ?? '',
      conditions: body.conditions?.trim() ?? '',
      createdAt: now,
      updatedAt: now,
    }

    const ref = await adminDb
      .collection('quoteTemplates')
      .doc(userId)
      .collection('items')
      .add({ ...templateData, createdAtServer: FieldValue.serverTimestamp() })

    const template: QuoteTemplate = { id: ref.id, ...templateData }
    return NextResponse.json({ template }, { status: 201 })
  } catch (error) {
    console.error('POST /api/quote-templates error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/quote-templates?templateId=xxx
 * Deletes a specific quote template.
 * Headers: x-user-id
 */
export async function DELETE(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const templateId = searchParams.get('templateId')
    if (!templateId) {
      return NextResponse.json({ error: 'templateId is required' }, { status: 400 })
    }

    await adminDb
      .collection('quoteTemplates')
      .doc(userId)
      .collection('items')
      .doc(templateId)
      .delete()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/quote-templates error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
