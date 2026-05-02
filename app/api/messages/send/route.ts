import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { sendMessage } from '@/lib/services/messagingService'
import { adminDb } from '@/lib/firebase-admin'
import { sendAdminNotification } from '@/lib/notifications/admin'

export const dynamic = 'force-dynamic'

/**
 * POST /api/messages/send
 * Send a message in a conversation.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { conversationId, senderId, senderName, content, type, senderAvatar, imageUrls } = body

    if (!conversationId || !senderId || !senderName || (!content && !Array.isArray(imageUrls))) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const messageId = await sendMessage(
      conversationId,
      senderId,
      senderName,
      content,
      senderAvatar,
      type ?? 'text',
      Array.isArray(imageUrls) ? imageUrls : undefined
    )

    // Notify recipient(s) via push notification (non-blocking)
    ;(async () => {
      try {
        const convSnap = await adminDb.collection('conversations').doc(conversationId).get()
        if (!convSnap.exists) return
        const participants: string[] = convSnap.data()?.participants ?? []
        const recipients = participants.filter((uid) => uid !== senderId)
        const contentStr = typeof content === 'string' ? content : String(content)
        const preview = contentStr.length > 80 ? contentStr.slice(0, 80) + '…' : contentStr
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
