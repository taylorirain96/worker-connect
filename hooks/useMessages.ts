'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import {
  subscribeToConversations,
  subscribeToMessages,
  subscribeToTypingUsers,
  subscribeToTotalUnread,
  sendMessage,
  markConversationRead,
  setTypingStatus,
  getOrCreateConversation,
} from '@/lib/services/messagingService'
import type { Message, Conversation } from '@/types'
import toast from 'react-hot-toast'

interface UseMessagesOptions {
  /** Auto-subscribe to all conversations for this user */
  userId: string | null | undefined
  /** Pre-selected conversation id */
  initialConversationId?: string
  /** Number of messages to load per conversation */
  messageLimit?: number
}

interface UseMessagesReturn {
  conversations: Conversation[]
  loadingConversations: boolean
  selectedConversationId: string | null
  selectedConversation: Conversation | null
  selectConversation: (id: string) => void
  messages: Message[]
  typingUsers: string[]
  totalUnread: number
  sending: boolean
  sendMessageToConversation: (content: string, type?: Message['type']) => Promise<void>
  handleTyping: (value: string) => void
  startConversation: (
    participantIds: string[],
    participantNames: Record<string, string>,
    participantAvatars?: Record<string, string>,
    jobId?: string,
    jobTitle?: string
  ) => Promise<string>
}

export function useMessages({
  userId,
  initialConversationId,
  messageLimit = 50,
}: UseMessagesOptions): UseMessagesReturn {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loadingConversations, setLoadingConversations] = useState(true)
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(
    initialConversationId ?? null
  )
  const [messages, setMessages] = useState<Message[]>([])
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const [totalUnread, setTotalUnread] = useState(0)
  const [sending, setSending] = useState(false)
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Subscribe to conversations list
  useEffect(() => {
    if (!userId) {
      setLoadingConversations(false)
      return
    }
    setLoadingConversations(true)
    const unsub = subscribeToConversations(userId, (convs) => {
      setConversations(convs)
      setLoadingConversations(false)
    })
    return () => unsub()
  }, [userId])

  // Subscribe to messages for the selected conversation
  useEffect(() => {
    if (!selectedConversationId) {
      setMessages([])
      return
    }
    const unsub = subscribeToMessages(selectedConversationId, setMessages, messageLimit)
    return () => unsub()
  }, [selectedConversationId, messageLimit])

  // Mark conversation as read when selected
  useEffect(() => {
    if (!selectedConversationId || !userId) return
    markConversationRead(selectedConversationId, userId).catch(() => {})
  }, [selectedConversationId, userId])

  // Subscribe to typing indicators
  useEffect(() => {
    if (!selectedConversationId || !userId) return
    const unsub = subscribeToTypingUsers(selectedConversationId, userId, setTypingUsers)
    return () => unsub()
  }, [selectedConversationId, userId])

  // Subscribe to total unread count across all conversations
  useEffect(() => {
    if (!userId) return
    const unsub = subscribeToTotalUnread(userId, setTotalUnread)
    return () => unsub()
  }, [userId])

  // Clear typing status when conversation changes or component unmounts
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    }
  }, [])

  useEffect(() => {
    if (!selectedConversationId || !userId) return
    return () => {
      setTypingStatus(selectedConversationId, userId, false).catch(() => {})
    }
  }, [selectedConversationId, userId])

  const selectConversation = useCallback((id: string) => {
    setSelectedConversationId(id)
  }, [])

  const sendMessageToConversation = useCallback(
    async (content: string, type: Message['type'] = 'text') => {
      if (!content.trim() || !selectedConversationId || !userId || sending) return
      setSending(true)

      // Clear typing indicator
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
      setTypingStatus(selectedConversationId, userId, false).catch(() => {})

      try {
        const conv = conversations.find((c) => c.id === selectedConversationId)
        const senderName = conv?.participantNames?.[userId] ?? 'User'
        const senderAvatar = conv?.participantAvatars?.[userId]
        await sendMessage(selectedConversationId, userId, senderName, content, senderAvatar, type)
      } catch {
        toast.error('Failed to send message. Please try again.')
      } finally {
        setSending(false)
      }
    },
    [selectedConversationId, userId, sending, conversations]
  )

  const handleTyping = useCallback(
    (value: string) => {
      if (!selectedConversationId || !userId) return
      setTypingStatus(selectedConversationId, userId, value.length > 0).catch(() => {})
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
      if (value.length > 0) {
        typingTimeoutRef.current = setTimeout(() => {
          setTypingStatus(selectedConversationId, userId, false).catch(() => {})
        }, 3000)
      }
    },
    [selectedConversationId, userId]
  )

  const startConversation = useCallback(
    async (
      participantIds: string[],
      participantNames: Record<string, string>,
      participantAvatars?: Record<string, string>,
      jobId?: string,
      jobTitle?: string
    ): Promise<string> => {
      const conversationId = await getOrCreateConversation(
        participantIds,
        participantNames,
        participantAvatars,
        jobId,
        jobTitle
      )
      setSelectedConversationId(conversationId)
      return conversationId
    },
    []
  )

  const selectedConversation =
    conversations.find((c) => c.id === selectedConversationId) ?? null

  return {
    conversations,
    loadingConversations,
    selectedConversationId,
    selectedConversation,
    selectConversation,
    messages,
    typingUsers,
    totalUnread,
    sending,
    sendMessageToConversation,
    handleTyping,
    startConversation,
  }
}
