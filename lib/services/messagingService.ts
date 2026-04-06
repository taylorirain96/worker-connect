import {
  collection,
  doc,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  writeBatch,
  getDocs,
  getDoc,
  serverTimestamp,
  Timestamp,
  limit,
  setDoc,
  deleteField,
  type DocumentData,
  type Unsubscribe,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Message, Conversation } from '@/types'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function tsToIso(value: unknown): string {
  if (value instanceof Timestamp) return value.toDate().toISOString()
  if (typeof value === 'string') return value
  return new Date().toISOString()
}

function docToConversation(id: string, data: DocumentData): Conversation {
  return {
    ...data,
    id,
    createdAt: tsToIso(data.createdAt),
    lastMessageAt: data.lastMessageAt ? tsToIso(data.lastMessageAt) : undefined,
  } as Conversation
}

function docToMessage(id: string, data: DocumentData): Message {
  return {
    ...data,
    id,
    createdAt: tsToIso(data.createdAt),
  } as Message
}

// ─── Conversations ────────────────────────────────────────────────────────────

export function subscribeToConversations(
  userId: string,
  onChange: (conversations: Conversation[]) => void
): Unsubscribe {
  if (!db) return () => {}
  const ref = collection(db, 'conversations')
  const q = query(
    ref,
    where('participants', 'array-contains', userId),
    orderBy('lastMessageAt', 'desc')
  )
  return onSnapshot(q, (snapshot) => {
    onChange(snapshot.docs.map((d) => docToConversation(d.id, d.data())))
  })
}

export async function getOrCreateConversation(
  participantIds: string[],
  participantNames: Record<string, string>,
  participantAvatars?: Record<string, string>,
  jobId?: string,
  jobTitle?: string
): Promise<string> {
  if (!db) throw new Error('Firestore is not initialized')

  // Check if a conversation already exists for these participants (and optionally this job)
  const sorted = [...participantIds].sort()
  const ref = collection(db, 'conversations')
  const q = jobId
    ? query(ref, where('participants', '==', sorted), where('jobId', '==', jobId))
    : query(ref, where('participants', '==', sorted))

  const snapshot = await getDocs(q)
  if (!snapshot.empty) return snapshot.docs[0].id

  // Create new conversation
  const unreadCount: Record<string, number> = {}
  participantIds.forEach((id) => { unreadCount[id] = 0 })

  const data: Omit<Conversation, 'id'> = {
    participants: sorted,
    participantNames,
    ...(participantAvatars && { participantAvatars }),
    unreadCount,
    ...(jobId && { jobId }),
    ...(jobTitle && { jobTitle }),
    createdAt: new Date().toISOString(),
  }

  const docRef = await addDoc(ref, { ...data, createdAt: serverTimestamp() })
  return docRef.id
}

export async function getConversation(conversationId: string): Promise<Conversation | null> {
  if (!db) return null
  const ref = doc(db, 'conversations', conversationId)
  const snap = await getDoc(ref)
  if (!snap.exists()) return null
  return docToConversation(snap.id, snap.data())
}

// ─── Messages ────────────────────────────────────────────────────────────────

export function subscribeToMessages(
  conversationId: string,
  onChange: (messages: Message[]) => void,
  messageLimit = 50
): Unsubscribe {
  if (!db) return () => {}
  const ref = collection(db, 'conversations', conversationId, 'messages')
  const q = query(ref, orderBy('createdAt', 'asc'), limit(messageLimit))
  return onSnapshot(q, (snapshot) => {
    onChange(snapshot.docs.map((d) => docToMessage(d.id, d.data())))
  })
}

export async function sendMessage(
  conversationId: string,
  senderId: string,
  senderName: string,
  content: string,
  senderAvatar?: string,
  type: Message['type'] = 'text'
): Promise<string> {
  if (!db) throw new Error('Firestore is not initialized')

  const messagesRef = collection(db, 'conversations', conversationId, 'messages')
  const messageData = {
    conversationId,
    senderId,
    senderName,
    content,
    type,
    read: false,
    ...(senderAvatar && { senderAvatar }),
    createdAt: serverTimestamp(),
  }

  const docRef = await addDoc(messagesRef, messageData)

  // Update the parent conversation's lastMessage and lastMessageAt
  const convRef = doc(db, 'conversations', conversationId)
  const convSnap = await getDoc(convRef)
  if (convSnap.exists()) {
    const convData = convSnap.data() as Conversation
    const participants: string[] = convData.participants || []
    const unreadCount: Record<string, number> = (convData.unreadCount as Record<string, number>) || {}
    participants.forEach((pid) => {
      if (pid !== senderId) {
        unreadCount[pid] = (unreadCount[pid] || 0) + 1
      }
    })
    await updateDoc(convRef, {
      lastMessage: content,
      lastMessageAt: serverTimestamp(),
      unreadCount,
    })
  }

  return docRef.id
}

export async function markConversationRead(
  conversationId: string,
  userId: string
): Promise<void> {
  if (!db) return

  // Mark all unread messages as read
  const messagesRef = collection(db, 'conversations', conversationId, 'messages')
  const q = query(messagesRef, where('read', '==', false), where('senderId', '!=', userId))
  const snapshot = await getDocs(q)

  if (!snapshot.empty) {
    const batch = writeBatch(db)
    snapshot.docs.forEach((d) => batch.update(d.ref, { read: true }))
    await batch.commit()
  }

  // Reset unread count for this user
  const convRef = doc(db, 'conversations', conversationId)
  await updateDoc(convRef, { [`unreadCount.${userId}`]: 0 })
}

// ─── Typing Indicators ────────────────────────────────────────────────────────

export async function setTypingStatus(
  conversationId: string,
  userId: string,
  isTyping: boolean
): Promise<void> {
  if (!db) return
  const ref = doc(db, 'conversations', conversationId, 'typing', userId)
  if (isTyping) {
    await setDoc(ref, { userId, updatedAt: serverTimestamp() })
  } else {
    try {
      await updateDoc(ref, { userId, updatedAt: deleteField() })
    } catch {
      // Document may not exist; ignore
    }
  }
}

export function subscribeToTypingUsers(
  conversationId: string,
  currentUserId: string,
  onChange: (typingUserIds: string[]) => void
): Unsubscribe {
  if (!db) return () => {}
  const ref = collection(db, 'conversations', conversationId, 'typing')
  return onSnapshot(ref, (snapshot) => {
    const now = Date.now()
    const typingIds = snapshot.docs
      .map((d) => d.id)
      .filter((id) => {
        if (id === currentUserId) return false
        const data = snapshot.docs.find((d) => d.id === id)?.data()
        if (!data?.updatedAt) return false
        const ts = data.updatedAt instanceof Timestamp
          ? data.updatedAt.toMillis()
          : 0
        // Only consider typing if updated within the last 5 seconds
        return now - ts < 5000
      })
    onChange(typingIds)
  })
}

// ─── Unread count across all conversations ───────────────────────────────────

export function subscribeToTotalUnread(
  userId: string,
  onChange: (total: number) => void
): Unsubscribe {
  if (!db) return () => {}
  const ref = collection(db, 'conversations')
  const q = query(ref, where('participants', 'array-contains', userId))
  return onSnapshot(q, (snapshot) => {
    let total = 0
    snapshot.docs.forEach((d) => {
      const data = d.data()
      const unreadCount = data.unreadCount as Record<string, number> | undefined
      total += unreadCount?.[userId] ?? 0
    })
    onChange(total)
  })
}
