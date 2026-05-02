import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { sendMessageReceivedEmail } from '@/lib/email/transactional'

export const dynamic = 'force-dynamic'

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

    // Send email to recipient if they've been inactive for 30+ minutes (non-blocking)
    if (recipientId && adminDb) {
      ;(async () => {
        try {
          const recipientSnap = await adminDb.collection('users').doc(recipientId).get()
          if (!recipientSnap.exists) return
          const recipientData = recipientSnap.data()
          const recipientEmail = recipientData?.email as string | undefined
          const recipientName = (recipientData?.displayName ?? recipientData?.name ?? 'there') as string
          const lastActive = recipientData?.lastActive as string | undefined

          if (!recipientEmail) return

          // Only email if the recipient has been inactive for 30+ minutes
          const thirtyMinsAgo = Date.now() - 30 * 60 * 1000
          const isInactive = !lastActive || new Date(lastActive).getTime() < thirtyMinsAgo

          if (isInactive) {
            const preview = content.length > 120 ? `${content.slice(0, 120)}\u2026` : content
            await sendMessageReceivedEmail({
              recipientEmail,
              recipientName,
              senderName,
              messagePreview: preview,
              conversationId,
            })
          }
        } catch (emailErr) {
          console.error('Failed to send message-received email:', emailErr)
        }
      })().catch(() => {})
    }

    return NextResponse.json(message, { status: 201 })
  } catch (error) {
    console.error('Send message error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
