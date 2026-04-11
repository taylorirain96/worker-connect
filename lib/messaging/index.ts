/**
 * lib/messaging/index.ts
 *
 * Public messaging API — wraps the Firestore-backed messagingService with
 * the function signatures required by the Lot 7 spec.
 */
import {
  getOrCreateConversation as _getOrCreateConversation,
  sendMessage as _sendMessage,
  subscribeToMessages,
  subscribeToConversations,
  markConversationRead,
} from '@/lib/services/messagingService'
import type { Conversation, Message } from '@/types'

// Re-export types for convenience
export type { Conversation, Message }

/**
 * Get or create a 1-to-1 conversation for a specific job.
 * The conversation ID is deterministic — it will be the same
 * Firestore document for the same pair of users + job.
 *
 * @returns The conversation ID (Firestore document ID)
 */
export async function getOrCreateConversation(
  userId1: string,
  user1Name: string,
  userId2: string,
  user2Name: string,
  jobId: string,
  jobTitle: string,
  photo1?: string,
  photo2?: string
): Promise<string> {
  const participantNames: Record<string, string> = {
    [userId1]: user1Name,
    [userId2]: user2Name,
  }

  const participantAvatars: Record<string, string> | undefined =
    photo1 || photo2
      ? {
          ...(photo1 ? { [userId1]: photo1 } : {}),
          ...(photo2 ? { [userId2]: photo2 } : {}),
        }
      : undefined

  return _getOrCreateConversation(
    [userId1, userId2],
    participantNames,
    participantAvatars,
    jobId,
    jobTitle
  )
}

/**
 * Send a text message to a conversation.
 */
export async function sendMessage(
  conversationId: string,
  senderId: string,
  senderName: string,
  text: string
): Promise<void> {
  await _sendMessage(conversationId, senderId, senderName, text)
}

/**
 * Subscribe to real-time messages in a conversation.
 * @returns An unsubscribe function.
 */
export function onMessages(
  conversationId: string,
  callback: (messages: Message[]) => void
): () => void {
  return subscribeToMessages(conversationId, callback)
}

/**
 * Subscribe to all conversations for a user in real time.
 * @returns An unsubscribe function.
 */
export function onConversations(
  userId: string,
  callback: (conversations: Conversation[]) => void
): () => void {
  return subscribeToConversations(userId, callback)
}

/**
 * Mark all messages in a conversation as read for the given user
 * and reset the unread counter.
 */
export async function markMessagesRead(
  conversationId: string,
  userId: string
): Promise<void> {
  await markConversationRead(conversationId, userId)
}
