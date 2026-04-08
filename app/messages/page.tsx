'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { useAuth } from '@/components/providers/AuthProvider'
import Button from '@/components/ui/Button'
import { Send, MessageSquare, Search, Loader2, WifiOff } from 'lucide-react'
import { cn, getInitials, formatRelativeDate } from '@/lib/utils'
import {
  subscribeToConversations,
  subscribeToMessages,
  sendMessage,
  markConversationRead,
  setTypingStatus,
  subscribeToTypingUsers,
} from '@/lib/services/messagingService'
import type { Conversation, Message } from '@/types'
import toast from 'react-hot-toast'

// Animation delays for the typing indicator dots
const TYPING_DOT_DELAYS = ['0ms', '150ms', '300ms'] as const

export default function MessagesPage() {
  const { user, profile } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [messageText, setMessageText] = useState('')
  const [search, setSearch] = useState('')
  const [sending, setSending] = useState(false)
  const [loadingConvs, setLoadingConvs] = useState(true)
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const [isOnline, setIsOnline] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const autoSelectedRef = useRef(false)

  // Online/offline detection
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Subscribe to conversations
  useEffect(() => {
    if (!user) return
    setLoadingConvs(true)
    const unsub = subscribeToConversations(user.uid, (convs) => {
      setConversations(convs)
      setLoadingConvs(false)
      // Auto-select first conversation on first load only
      if (!autoSelectedRef.current && convs.length > 0) {
        autoSelectedRef.current = true
        setSelectedConvId(convs[0].id)
      }
    })
    return () => unsub()
  }, [user])

  // Subscribe to messages for selected conversation
  useEffect(() => {
    if (!selectedConvId) { setMessages([]); return }
    const unsub = subscribeToMessages(selectedConvId, setMessages)
    return () => unsub()
  }, [selectedConvId])

  // Mark conversation as read when selected
  useEffect(() => {
    if (!selectedConvId || !user) return
    markConversationRead(selectedConvId, user.uid).catch(() => {})
  }, [selectedConvId, user])

  // Subscribe to typing indicators
  useEffect(() => {
    if (!selectedConvId || !user) return
    const unsub = subscribeToTypingUsers(selectedConvId, user.uid, setTypingUsers)
    return () => unsub()
  }, [selectedConvId, user])

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSelectConversation = useCallback(async (convId: string) => {
    setSelectedConvId(convId)
  }, [])

  const handleSend = useCallback(async () => {
    if (!messageText.trim() || !selectedConvId || !user || sending) return
    const content = messageText.trim()
    setMessageText('')
    setSending(true)

    // Clear typing indicator
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    setTypingStatus(selectedConvId, user.uid, false).catch(() => {})

    try {
      await sendMessage(
        selectedConvId,
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
  }, [messageText, selectedConvId, user, profile, sending])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }, [handleSend])

  const handleTyping = useCallback((value: string) => {
    setMessageText(value)
    if (!selectedConvId || !user) return

    setTypingStatus(selectedConvId, user.uid, value.length > 0).catch(() => {})

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    if (value.length > 0) {
      typingTimeoutRef.current = setTimeout(() => {
        setTypingStatus(selectedConvId, user.uid, false).catch(() => {})
      }, 3000)
    }
  }, [selectedConvId, user])

  // Clean up typing on unmount / conversation change
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    }
  }, [])

  useEffect(() => {
    if (!selectedConvId || !user) return
    return () => {
      setTypingStatus(selectedConvId, user.uid, false).catch(() => {})
    }
  }, [selectedConvId, user])

  const filteredConversations = conversations.filter((c) => {
    if (!search) return true
    const otherName = getOtherParticipantName(c, user?.uid)
    return otherName.toLowerCase().includes(search.toLowerCase())
  })

  const selectedConversation = conversations.find((c) => c.id === selectedConvId) ?? null

  const typingNames = typingUsers.map((uid) => {
    const conv = selectedConversation
    return conv?.participantNames?.[uid] || 'Someone'
  })

  if (!user) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Sign in to view messages</h2>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
            <MessageSquare className="h-5 w-5 text-primary-600" />
            Messages
            {!isOnline && (
              <span className="flex items-center gap-1 text-sm font-normal text-amber-600 dark:text-amber-400 ml-2">
                <WifiOff className="h-4 w-4" />
                Offline
              </span>
            )}
          </h1>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden" style={{ height: 'calc(100vh - 220px)', minHeight: '500px' }}>
            <div className="flex h-full">
              {/* Conversations List */}
              <div className="w-80 flex-shrink-0 border-r border-gray-200 dark:border-gray-700 flex flex-col">
                <div className="p-3 border-b border-gray-100 dark:border-gray-700">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search conversations..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {loadingConvs ? (
                    <div className="flex items-center justify-center h-32">
                      <Loader2 className="h-6 w-6 text-primary-500 animate-spin" />
                    </div>
                  ) : filteredConversations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-32 px-4 text-center">
                      <MessageSquare className="h-8 w-8 text-gray-300 mb-2" />
                      <p className="text-sm text-gray-400">No conversations yet</p>
                    </div>
                  ) : (
                    filteredConversations.map((conv) => {
                      const otherName = getOtherParticipantName(conv, user.uid)
                      const unread = conv.unreadCount?.[user.uid] ?? 0
                      return (
                        <button
                          key={conv.id}
                          onClick={() => handleSelectConversation(conv.id)}
                          className={cn(
                            'w-full flex items-start gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left',
                            selectedConvId === conv.id && 'bg-primary-50 dark:bg-primary-900/20 border-r-2 border-primary-600'
                          )}
                        >
                          <div className="relative flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-sm font-bold">
                              {getInitials(otherName)}
                            </div>
                            {unread > 0 && (
                              <div className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                {unread > 9 ? '9+' : unread}
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                              <span className={cn('text-sm font-medium truncate', unread > 0 ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300')}>
                                {otherName}
                              </span>
                              {conv.lastMessageAt && (
                                <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                                  {formatRelativeDate(conv.lastMessageAt)}
                                </span>
                              )}
                            </div>
                            {conv.lastMessage && (
                              <p className={cn('text-xs truncate mt-0.5', unread > 0 ? 'text-gray-600 dark:text-gray-400 font-medium' : 'text-gray-400')}>
                                {conv.lastMessage}
                              </p>
                            )}
                            {conv.jobTitle && (
                              <p className="text-xs text-primary-500 truncate mt-0.5">
                                Re: {conv.jobTitle}
                              </p>
                            )}
                          </div>
                        </button>
                      )
                    })
                  )}
                </div>
              </div>

              {/* Chat Area */}
              <div className="flex-1 flex flex-col min-w-0">
                {selectedConversation ? (
                  <>
                    {/* Chat Header */}
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center gap-3 flex-shrink-0">
                      <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                        {getInitials(getOtherParticipantName(selectedConversation, user.uid))}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white text-sm truncate">
                          {getOtherParticipantName(selectedConversation, user.uid)}
                        </p>
                        {selectedConversation.jobTitle && (
                          <p className="text-xs text-primary-500 truncate">Re: {selectedConversation.jobTitle}</p>
                        )}
                      </div>
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
                          const showAvatar = !isMe && (!prevMsg || prevMsg.senderId !== msg.senderId)
                          return (
                            <div key={msg.id} className={cn('flex', isMe ? 'justify-end' : 'justify-start')}>
                              {!isMe && (
                                <div className={cn('h-7 w-7 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mr-2 self-end', !showAvatar && 'opacity-0')}>
                                  {getInitials(msg.senderName)}
                                </div>
                              )}
                              <div className={cn(
                                'max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-sm',
                                isMe
                                  ? 'bg-primary-600 text-white rounded-br-sm'
                                  : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-bl-sm'
                              )}>
                                <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                                <div className={cn('flex items-center gap-1 mt-1', isMe ? 'justify-end' : 'justify-start')}>
                                  <span className={cn('text-xs', isMe ? 'text-primary-200' : 'text-gray-400')}>
                                    {formatRelativeDate(msg.createdAt)}
                                  </span>
                                  {isMe && msg.read && (
                                    <span className="text-xs text-primary-200">✓✓</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          )
                        })
                      )}
                      {/* Typing indicator */}
                      {typingNames.length > 0 && (
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {getInitials(typingNames[0])}
                          </div>
                          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-2.5 rounded-2xl rounded-bl-sm">
                            <div className="flex items-center gap-1">
                              {TYPING_DOT_DELAYS.map((delay, i) => (
                                <span
                                  key={i}
                                  className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                                  style={{ animationDelay: delay }}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex-shrink-0">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={messageText}
                          onChange={(e) => handleTyping(e.target.value)}
                          onKeyDown={handleKeyDown}
                          placeholder="Type a message..."
                          disabled={!isOnline}
                          className="flex-1 px-4 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
                        />
                        <Button onClick={handleSend} disabled={!messageText.trim() || sending || !isOnline} size="sm">
                          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">
                        {loadingConvs ? 'Loading conversations...' : 'Select a conversation to start chatting'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getOtherParticipantName(conv: Conversation, currentUserId?: string): string {
  if (!currentUserId) return 'Unknown'
  const otherId = conv.participants.find((p) => p !== currentUserId)
  if (!otherId) return 'Unknown'
  return conv.participantNames?.[otherId] || 'Unknown User'
}
