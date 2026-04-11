import { ref, push, set, onValue, update, get } from 'firebase/database'
import { rtdb } from '@/lib/firebase'
import type { ChatConversation } from '@/types'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RTDBMessage {
  id: string
  senderId: string
  senderName: string
  content: string
  createdAt: number
  read: boolean
}

// Re-export the shared type so consumers only need one import
export type { ChatConversation }

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeConversationId(uid1: string, uid2: string, jobId?: string): string {
  const sorted = [uid1, uid2].sort()
  return jobId ? `${sorted[0]}_${sorted[1]}_${jobId}` : `${sorted[0]}_${sorted[1]}`
}

// ─── Conversation management ──────────────────────────────────────────────────

/**
 * Get or create a conversation between two users.
 * Returns the deterministic conversationId.
 */
export async function getOrCreateConversation(
  uid1: string,
  name1: string,
  avatar1: string | null,
  uid2: string,
  name2: string,
  avatar2: string | null,
  jobId?: string,
  jobTitle?: string
): Promise<string> {
  if (!rtdb) throw new Error('Firebase Realtime Database is not initialised')

  const conversationId = makeConversationId(uid1, uid2, jobId)
  const convRef = ref(rtdb, `/conversations/${conversationId}`)
  const snapshot = await get(convRef)

  if (snapshot.exists()) return conversationId

  const participants: Record<string, true> = { [uid1]: true, [uid2]: true }
  const participantNames: Record<string, string> = { [uid1]: name1, [uid2]: name2 }
  const participantAvatars: Record<string, string | null> = { [uid1]: avatar1, [uid2]: avatar2 }
  const unreadCount: Record<string, number> = { [uid1]: 0, [uid2]: 0 }

  const convData = {
    participants,
    participantNames,
    participantAvatars,
    unreadCount,
    createdAt: Date.now(),
    ...(jobId && { jobId }),
    ...(jobTitle && { jobTitle }),
  }

  await set(convRef, convData)
  return conversationId
}

// ─── Messaging ────────────────────────────────────────────────────────────────

/** Send a message and update conversation metadata. */
export async function sendMessage(
  conversationId: string,
  senderId: string,
  senderName: string,
  content: string
): Promise<void> {
  if (!rtdb) throw new Error('Firebase Realtime Database is not initialised')

  const newMessageRef = push(ref(rtdb, `/messages/${conversationId}`))

  await set(newMessageRef, {
    senderId,
    senderName,
    content,
    createdAt: Date.now(),
    read: false,
  })

  // Update conversation lastMessage / lastMessageAt / unreadCount
  const convRef = ref(rtdb, `/conversations/${conversationId}`)
  const convSnap = await get(convRef)

  if (convSnap.exists()) {
    const convData = convSnap.val() as ChatConversation
    const participants = Object.keys(convData.participants || {})
    const unreadCount: Record<string, number> = { ...(convData.unreadCount || {}) }

    participants.forEach((pid) => {
      if (pid !== senderId) {
        unreadCount[pid] = (unreadCount[pid] || 0) + 1
      }
    })

    await update(convRef, {
      lastMessage: content,
      lastMessageAt: Date.now(),
      unreadCount,
    })
  }
}

// ─── Real-time listeners ──────────────────────────────────────────────────────

/** Subscribe to messages in a conversation (sorted oldest→newest). */
export function onMessages(
  conversationId: string,
  callback: (messages: RTDBMessage[]) => void
): () => void {
  if (!rtdb) return () => {}

  const messagesRef = ref(rtdb, `/messages/${conversationId}`)
  const unsubscribe = onValue(messagesRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback([])
      return
    }
    const data = snapshot.val() as Record<string, Omit<RTDBMessage, 'id'>>
    const messages: RTDBMessage[] = Object.entries(data)
      .map(([id, msg]) => ({ id, ...msg }))
      .sort((a, b) => a.createdAt - b.createdAt)
    callback(messages)
  })

  return unsubscribe
}

/** Subscribe to all conversations the user participates in (sorted newest first). */
export function onConversations(
  uid: string,
  callback: (conversations: ChatConversation[]) => void
): () => void {
  if (!rtdb) return () => {}

  const convRef = ref(rtdb, '/conversations')
  const unsubscribe = onValue(convRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback([])
      return
    }
    const data = snapshot.val() as Record<string, Omit<ChatConversation, 'id'>>
    const conversations: ChatConversation[] = Object.entries(data)
      .filter(([, conv]) => conv.participants?.[uid] === true)
      .map(([id, conv]) => ({ id, ...conv }))
      .sort((a, b) => (b.lastMessageAt ?? b.createdAt) - (a.lastMessageAt ?? a.createdAt))
    callback(conversations)
  })

  return unsubscribe
}

/** Mark all unread messages in a conversation as read and reset the unread counter. */
export async function markMessagesRead(
  conversationId: string,
  uid: string
): Promise<void> {
  if (!rtdb) return

  // Reset unread counter
  await update(ref(rtdb, `/conversations/${conversationId}/unreadCount`), { [uid]: 0 })

  // Mark individual messages as read
  const messagesRef = ref(rtdb, `/messages/${conversationId}`)
  const snapshot = await get(messagesRef)
  if (!snapshot.exists()) return

  const data = snapshot.val() as Record<string, Omit<RTDBMessage, 'id'>>
  const updates: Record<string, boolean> = {}

  Object.entries(data).forEach(([msgId, msg]) => {
    if (!msg.read && msg.senderId !== uid) {
      updates[`/messages/${conversationId}/${msgId}/read`] = true
    }
  })

  if (Object.keys(updates).length > 0) {
    await update(ref(rtdb), updates)
  }
}

/** Subscribe to the total unread message count across all conversations for a user. */
export function onUnreadMessagesCount(
  uid: string,
  callback: (count: number) => void
): () => void {
  if (!rtdb) return () => {}

  const convRef = ref(rtdb, '/conversations')
  const unsubscribe = onValue(convRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback(0)
      return
    }
    const data = snapshot.val() as Record<string, ChatConversation>
    let total = 0
    Object.values(data).forEach((conv) => {
      if (conv.participants?.[uid]) {
        total += conv.unreadCount?.[uid] ?? 0
      }
    })
    callback(total)
  })

  return unsubscribe
}
