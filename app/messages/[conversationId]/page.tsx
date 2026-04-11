'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { useAuth } from '@/components/providers/AuthProvider'
import Button from '@/components/ui/Button'
import { ArrowLeft, Send, Loader2, MessageSquare } from 'lucide-react'
import { getInitials } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import {
  onConversations,
  onMessages,
  sendMessage,
  markMessagesRead,
} from '@/lib/messaging'
import type { ChatConversation, RTDBMessage } from '@/lib/messaging'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'

function formatTs(ts: number): string {
  return formatDistanceToNow(new Date(ts), { addSuffix: true })
}

export default function ConversationPage() {
  const params = useParams()
  const conversationId = Array.isArray(params?.conversationId)
    ? params.conversationId[0]
    : (params?.conversationId as string)
  const router = useRouter()
  const { user, profile, loading: authLoading } = useAuth()

  const [conversation, setConversation] = useState<ChatConversation | null>(null)
  const [messages, setMessages] = useState<RTDBMessage[]>([])
  const [messageText, setMessageText] = useState('')
  const [loadingConv, setLoadingConv] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auth guard
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
    }
  }, [authLoading, user, router])

  // Load conversation metadata via the same onConversations listener
  useEffect(() => {
    if (!user) return
    const unsub = onConversations(user.uid, (convs) => {
      const conv = convs.find((c) => c.id === conversationId) ?? null
      setConversation(conv)
      setLoadingConv(false)

      // Participant check: redirect if not a participant
      if (conv !== null && !conv.participants?.[user.uid]) {
        router.push('/messages')
      }
    })
    return () => unsub()
  }, [user, conversationId, router])

  // Subscribe to messages
  useEffect(() => {
    if (!conversationId) return
    const unsub = onMessages(conversationId, setMessages)
    return () => unsub()
  }, [conversationId])

  // Mark as read when page loads / when conversation changes
  useEffect(() => {
    if (!conversationId || !user) return
    markMessagesRead(conversationId, user.uid).catch(() => {})
  }, [conversationId, user])

  // Auto-scroll to bottom
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
        content
      )
    } catch {
      toast.error('Failed to send message. Please try again.')
      setMessageText(content)
    } finally {
      setSending(false)
    }
  }, [messageText, user, profile, sending, conversationId])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSend()
      }
    },
    [handleSend]
  )

  if (authLoading || !user) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 text-primary-500 animate-spin" />
        </main>
        <Footer />
      </div>
    )
  }

  if (loadingConv) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="animate-pulse space-y-4">
              <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700" />
                  <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className={cn('flex', i % 2 === 0 ? 'justify-start' : 'justify-end')}>
                      <div className="h-10 w-48 bg-gray-200 dark:bg-gray-700 rounded-2xl" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const otherId = conversation
    ? Object.keys(conversation.participants).find((id) => id !== user.uid) ?? ''
    : ''
  const otherName = conversation?.participantNames?.[otherId] || 'Unknown User'
  const otherAvatar = conversation?.participantAvatars?.[otherId] ?? null

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col" style={{ height: 'calc(100vh - 130px)' }}>
          {/* Back link */}
          <Link
            href="/messages"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mb-4 text-sm transition-colors w-fit"
          >
            <ArrowLeft className="h-4 w-4" />
            All Messages
          </Link>

          <div className="flex-1 flex flex-col bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3 flex-shrink-0">
              {otherAvatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={otherAvatar}
                  alt={otherName}
                  className="h-9 w-9 rounded-full object-cover flex-shrink-0"
                />
              ) : (
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {getInitials(otherName)}
                </div>
              )}
              <div className="min-w-0">
                <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                  {otherName}
                </p>
                {conversation?.jobTitle && (
                  <p className="text-xs text-primary-500 truncate">
                    {conversation.jobId ? (
                      <Link
                        href={`/jobs/${conversation.jobId}`}
                        className="hover:underline"
                      >
                        Re: {conversation.jobTitle}
                      </Link>
                    ) : (
                      <>Re: {conversation.jobTitle}</>
                    )}
                  </p>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-900/50">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <MessageSquare className="h-10 w-10 text-gray-300 dark:text-gray-600 mb-3" />
                  <p className="text-sm text-gray-400">No messages yet. Say hello!</p>
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const isMe = msg.senderId === user.uid
                  const prevMsg = idx > 0 ? messages[idx - 1] : null
                  const nextMsg = idx < messages.length - 1 ? messages[idx + 1] : null
                  const isFirstInGroup = !prevMsg || prevMsg.senderId !== msg.senderId
                  const isLastInGroup = !nextMsg || nextMsg.senderId !== msg.senderId

                  return (
                    <div key={msg.id} className={cn('flex', isMe ? 'justify-end' : 'justify-start')}>
                      {!isMe && (
                        <div
                          className={cn(
                            'h-7 w-7 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mr-2 self-end mb-0.5',
                            !isFirstInGroup && 'opacity-0'
                          )}
                        >
                          {getInitials(msg.senderName)}
                        </div>
                      )}
                      <div className="flex flex-col max-w-xs lg:max-w-md">
                        {!isMe && isFirstInGroup && (
                          <span className="text-xs text-gray-500 mb-1 ml-1">{msg.senderName}</span>
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
                        </div>
                        {isLastInGroup && (
                          <span
                            className={cn(
                              'text-xs text-gray-400 mt-1',
                              isMe ? 'text-right' : 'text-left ml-1'
                            )}
                          >
                            {formatTs(msg.createdAt)}
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message…"
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
