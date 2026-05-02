import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { sendEmail } from '@/lib/email/sendEmail'
import { newMessageTemplate } from '@/lib/email/templates/newMessage'
import { createUnsubscribeToken } from '@/lib/email/unsubscribeToken'

export const dynamic = 'force-dynamic'

/** 1 hour cooldown between "new message" notification emails per conversation */
const MESSAGE_EMAIL_COOLDOWN_MS = 60 * 60 * 1000

/** 15 minutes — if user was active this recently, skip the email */
const ACTIVE_COOLDOWN_MS = 15 * 60 * 1000

/**
 * Parse a Firestore Timestamp, ISO string, or epoch ms into Unix ms.
 * Returns 0 if the value cannot be parsed.
 */
function parseTimestampMs(value: unknown): number {
  if (!value) return 0
  if (typeof value === 'object' && value !== null && typeof (value as { toMillis?: unknown }).toMillis === 'function') {
    return (value as { toMillis: () => number }).toMillis()
  }
  if (typeof value === 'string') return Date.parse(value) || 0
  if (typeof value === 'number') return value
  return 0
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get('conversationId')
    const userId = searchParams.get('userId')

    if (!conversationId && !userId) {
      return NextResponse.json({ error: 'conversationId or userId required' }, { status: 400 })
    }

    // Messages are fetched client-side via Firestore real-time listeners.
    // This endpoint is retained for server-side use cases (e.g., webhooks, admin).
    return NextResponse.json({ messages: [], total: 0 })
  } catch (error) {
    console.error('Get messages error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { conversationId, senderId, senderName, recipientId, content, type } = body

    if (!conversationId || !senderId || !senderName || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const message = {
      id: `msg_${Date.now()}`,
      conversationId,
      senderId,
      senderName,
      content,
      type: type || 'text',
      read: false,
      createdAt: new Date().toISOString(),
    }

    // Messages are persisted client-side via Firestore SDK for real-time delivery.
    // This endpoint can be used for server-to-server or admin message creation.

    // ── Send "new message" email notification to recipient (non-fatal) ────────
    if (recipientId && adminDb) {
      try {
        const now = Date.now()

        // 1. Check if recipient was recently active (skip if active in last 15 min)
        const recipientSnap = await adminDb.collection('users').doc(recipientId).get()
        const recipientData = recipientSnap.data()
        if (recipientData) {
          const lastActiveRaw = recipientData.lastActive
          const lastActiveMs = parseTimestampMs(lastActiveRaw)
          if (now - lastActiveMs < ACTIVE_COOLDOWN_MS) {
            // User is currently active — skip email
          } else {
            // 2. Check per-conversation email cooldown
            const cooldownRef = adminDb.collection('emailCooldowns').doc(`msg_${conversationId}`)
            const cooldownSnap = await cooldownRef.get()
            const lastEmailMs: number = parseTimestampMs(cooldownSnap.data()?.lastEmailSentAt)

            if (now - lastEmailMs >= MESSAGE_EMAIL_COOLDOWN_MS) {
              const recipientEmail = recipientData.email as string | undefined
              const recipientName = (recipientData.displayName ?? recipientData.name ?? 'there') as string

              // Check if user has opted out of newMessage emails
              const optedOut = recipientData.emailNotifications?.newMessage === false ||
                               recipientData.emailNotifications?.all === false

              if (recipientEmail && !optedOut) {
        const unsubscribeUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? ''}/api/email/unsubscribe?token=${encodeURIComponent(createUnsubscribeToken(recipientId, 'newMessage'))}`
                const html = newMessageTemplate({
                  recipientName,
                  senderName,
                  messagePreview: content,
                  conversationId,
                  unsubscribeUrl,
                })
                await sendEmail({
                  to: recipientEmail,
                  subject: `New message from ${senderName}`,
                  html,
                })
                // Record the cooldown timestamp
                await cooldownRef.set({ lastEmailSentAt: new Date() }, { merge: true })
              }
            }
          }
        }
      } catch (emailErr) {
        console.error('Failed to send new-message email:', emailErr)
      }
    }

    return NextResponse.json(message, { status: 201 })
  } catch (error) {
    console.error('Send message error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
