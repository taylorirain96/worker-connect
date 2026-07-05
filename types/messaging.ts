export interface Message {
  id: string
  conversationId: string
  senderId: string
  senderName: string
  senderAvatar?: string
  content: string
  type: 'text' | 'image' | 'file'
  imageUrls?: string[]
  read: boolean
  createdAt: string
}

export interface Conversation {
  id: string
  participants: string[]
  participantNames: Record<string, string>
  participantAvatars?: Record<string, string>
  lastMessage?: string
  lastMessageAt?: string
  unreadCount?: Record<string, number>
  jobId?: string
  jobTitle?: string
  /**
   * The user id of the employer/poster on the related job, when known.
   * Used to label conversations in the unified inbox as "Hiring you" vs
   * "Applying for your …" without splitting the inbox by role.
   */
  jobEmployerId?: string
  createdAt: string
}

export interface ChatConversation {
  id: string
  participants: Record<string, true>
  participantNames: Record<string, string>
  participantAvatars?: Record<string, string | null>
  lastMessage?: string
  lastMessageAt?: number
  jobId?: string
  jobTitle?: string
  unreadCount?: Record<string, number>
  createdAt: number
}

/** Payload for POST /api/messages/send */
export interface SendMessagePayload {
  conversationId: string
  senderId: string
  senderName: string
  content: string
  type?: 'text' | 'image' | 'file'
  senderAvatar?: string
}

/** Payload for starting a new conversation */
export interface StartConversationPayload {
  participantIds: string[]
  participantNames: Record<string, string>
  participantAvatars?: Record<string, string>
  jobId?: string
  jobTitle?: string
}

/** Response from GET /api/messages/conversations */
export interface ConversationsResponse {
  conversations: Conversation[]
  total: number
}

/** Response from GET /api/messages/[conversationId] */
export interface ConversationMessagesResponse {
  conversation: Conversation | null
  messages: Message[]
  total: number
}

/** Typing indicator payload for real-time updates */
export interface TypingIndicatorPayload {
  conversationId: string
  userId: string
  userName: string
  isTyping: boolean
}

/** Message with extra read-receipt metadata */
export interface MessageWithReceipt extends Message {
  deliveredAt?: string
  readAt?: string
}

/** Email digest frequency options */
export type DigestFrequency = 'daily' | 'weekly'

/** Payload for POST /api/notifications/send-digest */
export interface SendDigestPayload {
  userId: string
  frequency: DigestFrequency
  /** Override recipient email (defaults to user's email) */
  email?: string
}

/** Push subscription data for Web Push API */
export interface WebPushSubscription {
  endpoint: string
  expirationTime?: number | null
  keys: {
    p256dh: string
    auth: string
  }
}
