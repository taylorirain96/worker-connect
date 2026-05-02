import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { sendQuoteReceivedEmail } from '@/lib/email/transactional'
import { sendAdminNotification } from '@/lib/notifications/admin'

export const dynamic = 'force-dynamic'

/**
 * POST /api/quotes
 * Submit a new quote for a job.
 */
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json() as {
      jobId?: string
      jobTitle?: string
      employerId?: string
      workerId?: string
      workerName?: string
      workerAvatar?: string
      basePrice?: number
      laborHours?: number
      laborRate?: number
      materials?: { description: string; cost: number }[]
      travel?: { distance: number; cost: number }
      description?: string
      timeline?: string
      availability?: string
      conditions?: string
      attachments?: { url: string; name: string; type: 'image' | 'document' }[]
    }

    const {
      jobId,
      jobTitle,
      employerId,
      workerId,
      workerName,
      workerAvatar,
      basePrice,
      laborHours,
      laborRate,
      materials,
      travel,
      description,
      timeline,
      availability,
      conditions,
      attachments,
    } = body

    if (!jobId || !jobTitle || !employerId || !workerId || !workerName || !description) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (basePrice === undefined || basePrice < 0) {
      return NextResponse.json({ error: 'basePrice must be a non-negative number' }, { status: 400 })
    }

    // Calculate total price
    const materialsTotal = materials?.reduce((s, m) => s + m.cost, 0) ?? 0
    const travelCost = travel?.cost ?? 0
    const laborTotal = laborHours && laborRate ? laborHours * laborRate : 0
    const totalPrice = Math.round((basePrice + materialsTotal + travelCost + laborTotal) * 100) / 100

    const { createQuote } = await import('@/lib/services/quoteService')
    const quoteId = await createQuote({
      jobId,
      jobTitle,
      employerId,
      workerId,
      workerName,
      workerAvatar,
      basePrice,
      laborHours,
      laborRate,
      materials,
      travel,
      totalPrice,
      description,
      timeline,
      availability,
      conditions,
      attachments,
    })

    // Send "Quote Received" email to the homeowner (non-fatal)
    try {
      let homeownerEmail: string | undefined
      let homeownerName: string | undefined
      if (adminDb) {
        const employerSnap = await adminDb.collection('users').doc(employerId).get()
        if (!employerSnap.exists) {
          console.warn(`Quote-received email: employer document not found for id ${employerId}`)
        } else {
          const employerData = employerSnap.data()
          homeownerEmail = employerData?.email as string | undefined
          homeownerName = (employerData?.displayName ?? employerData?.name) as string | undefined
        }
      }
      if (homeownerEmail) {
        await sendQuoteReceivedEmail({
          homeownerEmail,
          homeownerName: homeownerName ?? 'there',
          workerName,
          jobTitle,
          amount: totalPrice,
          jobId,
        })
      }

      // Push notification to homeowner
      await sendAdminNotification({
        userId: employerId,
        title: 'New quote received 📋',
        body: `${workerName} submitted a quote of NZ$${totalPrice.toFixed(2)} for "${jobTitle}".`,
        type: 'application_received',
        link: `/jobs/${jobId}`,
      })
    } catch (emailErr) {
      console.error('Failed to send quote-received email:', emailErr)
    }

    return NextResponse.json({ id: quoteId, totalPrice }, { status: 201 })
  } catch (err) {
    console.error('POST /api/quotes error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}