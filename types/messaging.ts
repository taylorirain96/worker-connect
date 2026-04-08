/**
 * TypeScript interfaces for the messaging system.
 * Core Message and Conversation types live in types/index.ts;
 * this file adds messaging-specific request/response shapes.
 */
export type { Message, Conversation } from '@/types'

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
  conversations: import('@/types').Conversation[]
  total: number
}

/** Response from GET /api/messages/[conversationId] */
export interface ConversationMessagesResponse {
  conversation: import('@/types').Conversation | null
  messages: import('@/types').Message[]
  total: number
}

/** Typing indicator payload for real-time updates */
export interface TypingIndicatorPayload {
  conversationId: string
  userId: string
  userName: string
  isTyping: boolean
}

import type { Message as BaseMessage } from '@/types'

/** Message with extra read-receipt metadata */
export interface MessageWithReceipt extends BaseMessage {
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
