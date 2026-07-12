import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { sendMessage } from '@/lib/services/messagingService'
import { adminDb } from '@/lib/firebase-admin'
import { sendAdminNotification } from '@/lib/notifications/admin'
import { rateLimit } from '@/lib/rateLimit'
import { detectContactInfo } from '@/lib/contactInfoDetector'

export const dynamic = 'force-dynamic'

/**
 * Escrow statuses that represent an active or completed payment transaction.
 * Excludes 'failed' and 'cancelled' which indicate no real transaction occurred.
 */
const ACTIVE_ESCROW_STATUSES = [
  'pending',
  'processing',
  'held',
  'in_escrow',
  'released',
  'completed',
  'disputed',
  'partial_refund',
]

/**
 * POST /api/messages/send
 * Send a message in a conversation.
 */
export async function POST(request: NextRequest) {
  try {
    if (rateLimit(request, { max: 30, windowMs: 60_000 })) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const body = await request.json()
    const { conversationId, senderId, senderName, content, type, senderAvatar, imageUrls, confirmed } = body
    const authenticatedUserId = request.headers.get('x-user-id')

    const textContent = typeof content === 'string' ? content.trim() : ''
    const imageList = Array.isArray(imageUrls) ? imageUrls : []

    if (!authenticatedUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (authenticatedUserId !== senderId) {
      return NextResponse.json({ error: 'Forbidden sender identity' }, { status: 403 })
    }

    if (!conversationId || !senderId || !senderName || (!textContent && imageList.length === 0)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (textContent.length > 5000) {
      return NextResponse.json({ error: 'Message is too long' }, { status: 400 })
    }

    if (imageList.length > 3) {
      return NextResponse.json({ error: 'Maximum 3 images allowed per message' }, { status: 400 })
    }

    if (imageList.some((url) => typeof url !== 'string' || !url.startsWith('https://'))) {
      return NextResponse.json({ error: 'Invalid image URL(s)' }, { status: 400 })
    }

    const convSnap = await adminDb.collection('conversations').doc(conversationId).get()
    if (!convSnap.exists) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }
    const convData = convSnap.data() ?? {}
    const participants: string[] = convData.participants ?? []
    if (!participants.includes(authenticatedUserId)) {
      return NextResponse.json({ error: 'Forbidden conversation access' }, { status: 403 })
    }

    // ── Contact-info circumvention check ─────────────────────────────────────
    // Only scan text messages (images have no detectable contact info).
    const jobId: string | undefined = convData.jobId
    const contactMatch = textContent ? detectContactInfo(textContent) : null

    if (contactMatch) {
      // Check whether a transaction has already occurred for this job.
      // If it has, skip the warning entirely.
      let transactionExists = false
      if (jobId) {
        const [escrowSnap, quoteSnap] = await Promise.all([
          adminDb
            .collection('escrowPayments')
            .where('jobId', '==', jobId)
            .where('status', 'in', ACTIVE_ESCROW_STATUSES)
            .limit(1)
            .get(),
          adminDb
            .collection('quotes')
            .where('jobId', '==', jobId)
            .where('status', '==', 'accepted')
            .limit(1)
            .get(),
        ])
        transactionExists = !escrowSnap.empty || !quoteSnap.empty
      }

      if (!transactionExists) {
        if (!confirmed) {
          // Ask the client to confirm before sending.
          return NextResponse.json(
            {
              warning: true,
              message:
                'Sharing contact details before booking may violate our Terms of Service. Send anyway?',
            },
            { status: 200 }
          )
        }

        // User confirmed — log the flagged message for admin review (non-blocking).
        adminDb.collection('flaggedMessages').add({
          conversationId,
          senderId,
          senderName,
          jobId: jobId ?? null,
          matchedPattern: contactMatch.pattern,
          matchedText: contactMatch.match,
          messagePreview: textContent.slice(0, 200),
          flaggedAt: new Date().toISOString(),
        }).catch((err) => {
          console.error('Failed to log flagged message:', err)
        })
      }
    }
    // ─────────────────────────────────────────────────────────────────────────

    const messageId = await sendMessage(
      conversationId,
      senderId,
      senderName,
      textContent,
      senderAvatar,
      type ?? 'text',
      imageList.length > 0 ? imageList : undefined
    )

    // Notify recipient(s) via push notification (non-blocking)
    ;(async () => {
      try {
        const recipients = participants.filter((uid) => uid !== senderId)
        const previewSource = textContent || 'Sent images'
        const preview = previewSource.length > 80 ? previewSource.slice(0, 80) + '…' : previewSource
        // Truncate senderName to avoid oversized notification titles
        const displayName = String(senderName).slice(0, 50)
        await Promise.all(
          recipients.map((uid) =>
            sendAdminNotification({
              userId: uid,
              title: `New message from ${displayName}`,
              body: preview,
              type: 'new_message',
              link: '/messages',
            })
          )
        )
      } catch {
        // Non-fatal
      }
    })().catch(() => {})

    return NextResponse.json({ id: messageId, success: true }, { status: 201 })
  } catch (error) {
    console.error('POST /api/messages/send error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
