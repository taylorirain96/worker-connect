'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { useAuth } from '@/components/providers/AuthProvider'
import Button from '@/components/ui/Button'
import { ArrowLeft, Send, Loader2, MessageSquare } from 'lucide-react'
import { cn, getInitials, formatRelativeDate } from '@/lib/utils'
import {
  subscribeToMessages,
  sendMessage,
  markConversationRead,
  getConversation,
} from '@/lib/services/messagingService'
import type { Message, Conversation } from '@/types'
import toast from 'react-hot-toast'

export default function MessageThreadPage() {
  const params = useParams()
  const router = useRouter()
  const conversationId = params.id as string
  const { user, profile } = useAuth()

  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [messageText, setMessageText] = useState('')
  const [sending, setSending] = useState(false)
  const [loadingConv, setLoadingConv] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      router.push('/auth/login')
    }
  }, [user, router])

  // Load conversation metadata
  useEffect(() => {
    if (!user || !conversationId) return
    getConversation(conversationId)
      .then((conv) => setConversation(conv))
      .finally(() => setLoadingConv(false))
  }, [user, conversationId])

  // Subscribe to real-time messages
  useEffect(() => {
    if (!user || !conversationId) return
    const unsub = subscribeToMessages(conversationId, setMessages)
    return () => unsub()
  }, [user, conversationId])

  // Mark as read when thread opens
  useEffect(() => {
    if (!user || !conversationId) return
    markConversationRead(conversationId, user.uid).catch(() => {})
  }, [user, conversationId])

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = useCallback(async () => {
    if (!messageText.trim() || !user || sending) return
    const content = messageText.trim()
    setMessageText('')
    setSending(true)
    try {
      await sendMessage(
        conversationId,
        user.uid,
        profile?.displayName || user.displayName || user.email || 'User',
        content,
        profile?.photoURL || user.photoURL || undefined
      )
    } catch {
      toast.error('Failed to send message. Please try again.')
      setMessageText(content)
    } finally {
      setSending(false)
    }
  }, [messageText, conversationId, user, profile, sending])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSend()
      }
    },
    [handleSend]
  )

  const otherParticipantName = (() => {
    if (!conversation || !user) return 'Unknown'
    const otherId = conversation.participants.find((p) => p !== user.uid)
    if (!otherId) return 'Unknown'
    return conversation.participantNames?.[otherId] || 'Unknown User'
  })()

  if (!user) return null

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Back button */}
          <Link
            href="/messages"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mb-4 text-sm transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Messages
          </Link>

          <div
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col"
            style={{ height: 'calc(100vh - 220px)', minHeight: '500px' }}
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center gap-3 flex-shrink-0">
              {loadingConv ? (
                <div className="flex items-center gap-3 animate-pulse">
                  <div className="h-9 w-9 rounded-full bg-gray-200 dark:bg-gray-700" />
                  <div className="space-y-1">
                    <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
                    <div className="h-3 w-48 bg-gray-200 dark:bg-gray-700 rounded" />
                  </div>
                </div>
              ) : (
                <>
                  <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {getInitials(otherParticipantName)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white text-sm truncate">
                      {otherParticipantName}
                    </p>
                    {conversation?.jobTitle && (
                      <p className="text-xs text-primary-500 truncate">
                        Re: {conversation.jobTitle}
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-900/50">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <MessageSquare className="h-10 w-10 text-gray-300 mb-3" />
                  <p className="text-sm text-gray-400">No messages yet. Say hello!</p>
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const isMe = msg.senderId === user.uid
                  const prevMsg = idx > 0 ? messages[idx - 1] : null
                  const showName = !isMe && (!prevMsg || prevMsg.senderId !== msg.senderId)
                  return (
                    <div key={msg.id} className={cn('flex', isMe ? 'justify-end' : 'justify-start')}>
                      {!isMe && (
                        <div
                          className={cn(
                            'h-7 w-7 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mr-2 self-end',
                            !showName && 'opacity-0'
                          )}
                        >
                          {getInitials(msg.senderName)}
                        </div>
                      )}
                      <div className="flex flex-col max-w-xs lg:max-w-md">
                        {showName && (
                          <span className="text-xs text-gray-400 mb-1 ml-1">{msg.senderName}</span>
                        )}
                        <div
                          className={cn(
                            'px-4 py-2.5 rounded-2xl text-sm',
                            isMe
                              ? 'bg-primary-600 text-white rounded-br-sm'
                              : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-bl-sm'
                          )}
                        >
                          <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                          <div
                            className={cn(
                              'flex items-center gap-1 mt-1',
                              isMe ? 'justify-end' : 'justify-start'
                            )}
                          >
                            <span
                              className={cn(
                                'text-xs',
                                isMe ? 'text-primary-200' : 'text-gray-400'
                              )}
                            >
                              {formatRelativeDate(msg.createdAt)}
                            </span>
                            {isMe && msg.read && (
                              <span className="text-xs text-primary-200">✓✓</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex-shrink-0">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <Button
                  onClick={handleSend}
                  disabled={!messageText.trim() || sending}
                  size="sm"
                >
                  {sending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
