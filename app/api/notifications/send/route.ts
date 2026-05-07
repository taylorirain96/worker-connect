/**
 * POST /api/notifications/send
 *
 * Sends a Firebase Cloud Messaging (FCM) push notification to all registered
 * tokens for the target user via the Firebase Admin SDK.
 * Automatically removes tokens that are reported as invalid by FCM.
 *
 * Body: {
 *   userId: string
 *   title: string
 *   body: string
 *   data?: Record<string, string>   // optional key/value pairs sent to the app
 *   actionUrl?: string              // where to navigate on notification tap
 * }
 */
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import admin, { adminDb } from '@/lib/firebase-admin'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      userId?: string
      title?: string
      body?: string
      data?: Record<string, string>
      actionUrl?: string
    }

    const { userId, title, body: msgBody, data, actionUrl } = body

    if (!userId || !title || !msgBody) {
      return NextResponse.json(
        { error: 'userId, title, and body are required' },
        { status: 400 }
      )
    }

    // Fetch the user's FCM tokens from Firestore
    const userDoc = await adminDb.collection('users').doc(userId).get()
    if (!userDoc.exists) {
      return NextResponse.json({ success: true, sent: 0, message: 'User not found' })
    }

    const userData = userDoc.data()
    const tokens: string[] = userData?.fcmTokens ?? []

    if (tokens.length === 0) {
      return NextResponse.json({ success: true, sent: 0, message: 'No FCM tokens registered' })
    }

    // Build the FCM message payload
    const messageData: Record<string, string> = {
      ...(data ?? {}),
      ...(actionUrl ? { actionUrl } : {}),
    }

    // Send to each token (sendEachForMulticast is more efficient but available in admin v11+)
    const messaging = admin.messaging()
    const results: { token: string; success: boolean; error?: string }[] = []

    await Promise.all(
      tokens.map(async (token) => {
        try {
          await messaging.send({
            token,
            notification: { title, body: msgBody },
            data: messageData,
            webpush: {
              notification: {
                title,
                body: msgBody,
                icon: '/icon-192.png',
                badge: '/badge-72.png',
                ...(actionUrl ? { data: { url: actionUrl } } : {}),
              },
              fcmOptions: actionUrl ? { link: actionUrl } : undefined,
            },
            android: {
              notification: {
                title,
                body: msgBody,
                clickAction: actionUrl ?? 'FLUTTER_NOTIFICATION_CLICK',
              },
            },
            apns: {
              payload: {
                aps: {
                  alert: { title, body: msgBody },
                  sound: 'default',
                  badge: 1,
                },
              },
            },
          })
          results.push({ token, success: true })
        } catch (err) {
          const errCode = (err as { code?: string })?.code ?? ''
          const isInvalid =
            errCode === 'messaging/registration-token-not-registered' ||
            errCode === 'messaging/invalid-registration-token'
          results.push({ token, success: false, error: errCode })

          // Clean up invalid token from Firestore
          if (isInvalid) {
            adminDb
              .collection('users')
              .doc(userId)
              .update({
                fcmTokens: admin.firestore.FieldValue.arrayRemove(token),
              })
              .catch(() => {})
          }
        }
      })
    )

    const sent = results.filter((r) => r.success).length
    return NextResponse.json({ success: true, sent, total: tokens.length })
  } catch (error) {
    console.error('POST /api/notifications/send error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
