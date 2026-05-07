'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { useAuth } from '@/components/providers/AuthProvider'
import Button from '@/components/ui/Button'
import {
  ArrowLeft,
  Send,
  Loader2,
  MessageSquare,
  Hammer,
  Paperclip,
  X,
  Check,
  CheckCheck,
  Image as ImageIcon,
} from 'lucide-react'
import { getInitials, cn } from '@/lib/utils'
import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns'
import {
  subscribeToConversations,
  subscribeToMessages,
  markConversationRead,
  setTypingStatus,
  subscribeToTypingUsers,
} from '@/lib/services/messagingService'
import type { Conversation, Message } from '@/types'
import toast from 'react-hot-toast'
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage } from '@/lib/firebase'
import { getUserProfile } from '@/lib/users/getProfile'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatMessageTime(iso: string): string {
  const d = new Date(iso)
  if (isToday(d)) return format(d, 'h:mm a')
  if (isYesterday(d)) return `Yesterday ${format(d, 'h:mm a')}`
  return format(d, 'd MMM, h:mm a')
}

function formatLastSeen(iso?: string): string {
  if (!iso) return ''
  return formatDistanceToNow(new Date(iso), { addSuffix: true })
}

function DateSeparator({ iso }: { iso: string }) {
  const d = new Date(iso)
  let label: string
  if (isToday(d)) label = 'Today'
  else if (isYesterday(d)) label = 'Yesterday'
  else label = format(d, 'd MMMM yyyy')
  return (
    <div className="flex items-center gap-3 my-4">
      <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
      <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">{label}</span>
      <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
    </div>
  )
}

const MAX_IMAGES = 3
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

// ─── Component ────────────────────────────────────────────────────────────────

export default function JobChatPage() {
  const params = useParams()
  const jobId = Array.isArray(params?.jobId) ? params.jobId[0] : (params?.jobId as string)
  const router = useRouter()
  const { user, profile, loading: authLoading } = useAuth()

  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [messageText, setMessageText] = useState('')
  const [loadingConv, setLoadingConv] = useState(true)
  const [sending, setSending] = useState(false)
  const [typingUserIds, setTypingUserIds] = useState<string[]>([])
  const [pendingImages, setPendingImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [uploadingImages, setUploadingImages] = useState(false)
  const [bothWorkers, setBothWorkers] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const conversationIdRef = useRef<string | null>(null)

  // Auth guard
  useEffect(() => {
    if (!authLoading && !user) router.push('/auth/login')
  }, [authLoading, user, router])

  // Load conversation that matches this jobId
  useEffect(() => {
    if (!user) return
    setLoadingConv(true)
    const unsub = subscribeToConversations(user.uid, (convs) => {
      const conv = convs.find((c) => c.jobId === jobId || c.id === jobId) ?? null
      setConversation(conv)
      conversationIdRef.current = conv?.id ?? null
      setLoadingConv(false)

      if (conv !== null && !conv.participants.includes(user.uid)) {
        router.push('/messages')
      }
    })
    return () => unsub()
  }, [user, jobId, router])

  // Subscribe to messages once we know the conversation id
  useEffect(() => {
    if (!conversation?.id) return
    const unsub = subscribeToMessages(conversation.id, setMessages)
    return () => unsub()
  }, [conversation?.id])

  // Mark as read when conversation is open
  useEffect(() => {
    if (!conversation?.id || !user) return
    markConversationRead(conversation.id, user.uid).catch(() => {})
  }, [conversation?.id, user])

  // Typing indicator subscription
  useEffect(() => {
    if (!conversation?.id || !user) return
    const unsub = subscribeToTypingUsers(conversation.id, user.uid, setTypingUserIds)
    return () => unsub()
  }, [conversation?.id, user])

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Check if both participants are workers
  useEffect(() => {
    if (!conversation) return
    const ids = conversation.participants
    if (ids.length < 2) return
    let mounted = true
    Promise.all(ids.map((id) => getUserProfile(id))).then((profiles) => {
      if (mounted) {
        const validProfiles = profiles.filter(Boolean)
        setBothWorkers(validProfiles.length === ids.length && validProfiles.every((p) => p?.role === 'worker'))
      }
    }).catch(() => {})
    return () => { mounted = false }
  }, [conversation])

  // ─── Typing indicator logic ──────────────────────────────────────────────

  const stopTyping = useCallback(() => {
    const convId = conversationIdRef.current
    if (!convId || !user) return
    setTypingStatus(convId, user.uid, false).catch(() => {})
  }, [user])

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setMessageText(e.target.value)
      const convId = conversationIdRef.current
      if (!convId || !user) return

      setTypingStatus(convId, user.uid, true).catch(() => {})

      if (typingTimerRef.current) clearTimeout(typingTimerRef.current)
      typingTimerRef.current = setTimeout(stopTyping, 3000)
    },
    [user, stopTyping]
  )

  // ─── Image handling ──────────────────────────────────────────────────────

  const handleImageSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    const valid = files.filter((f) => ACCEPTED_IMAGE_TYPES.includes(f.type))
    const remaining = MAX_IMAGES - pendingImages.length
    const toAdd = valid.slice(0, remaining)

    if (toAdd.length === 0) return

    setPendingImages((prev) => [...prev, ...toAdd])
    const previews = toAdd.map((f) => URL.createObjectURL(f))
    setImagePreviews((prev) => [...prev, ...previews])

    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = ''
  }, [pendingImages.length])

  const removeImage = useCallback((index: number) => {
    setPendingImages((prev) => prev.filter((_, i) => i !== index))
    setImagePreviews((prev) => {
      URL.revokeObjectURL(prev[index])
      return prev.filter((_, i) => i !== index)
    })
  }, [])

  const uploadImages = useCallback(async (convId: string): Promise<string[]> => {
    if (!storage || pendingImages.length === 0) return []
    const currentStorage = storage
    setUploadingImages(true)
    try {
      const urls = await Promise.all(
        pendingImages.map(async (file) => {
          const path = `messages/${convId}/${Date.now()}_${file.name}`
          const sRef = storageRef(currentStorage, path)
          await uploadBytes(sRef, file)
          return getDownloadURL(sRef)
        })
      )
      return urls
    } finally {
      setUploadingImages(false)
    }
  }, [pendingImages])

  // ─── Send message ─────────────────────────────────────────────────────────

  const handleSend = useCallback(async () => {
    if ((!messageText.trim() && pendingImages.length === 0) || !user || sending) return

    const content = messageText.trim()
    setMessageText('')
    setSending(true)

    // Stop typing indicator
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current)
    stopTyping()

    try {
      // This page only sends into an existing conversation; it does not create one.
      const convId = conversation?.id ?? null
      if (!convId) {
        toast.error('Conversation not found.')
        setMessageText(content)
        return
      }

      // Upload images
      let imageUrls: string[] = []
      if (pendingImages.length > 0) {
        try {
          imageUrls = await uploadImages(convId)
        } catch {
          toast.error('Failed to upload images. Please try again.')
          setMessageText(content)
          setSending(false)
          return
        }
        setPendingImages([])
        // Capture current previews and revoke before clearing state
        setImagePreviews((prev) => {
          const toRevoke = prev.slice()
          queueMicrotask(() => toRevoke.forEach((u) => URL.revokeObjectURL(u)))
          return []
        })
      }

      const msgType: Message['type'] = imageUrls.length > 0 ? 'image' : 'text'
      const msgContent = content || (imageUrls.length > 0 ? '📷 Photo' : '')

      // Use the API route — it writes to Firestore and sends push notification
      const res = await fetch('/api/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: convId,
          senderId: user.uid,
          senderName: profile?.displayName || user.displayName || user.email || 'User',
          content: msgContent,
          type: msgType,
          senderAvatar: profile?.photoURL ?? undefined,
          imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
        }),
      })
      if (!res.ok) throw new Error('Send failed')
    } catch {
      toast.error('Failed to send message. Please try again.')
      setMessageText(content)
    } finally {
      setSending(false)
    }
  }, [messageText, pendingImages, user, profile, sending, conversation, uploadImages, stopTyping])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSend()
      }
    },
    [handleSend]
  )

  // ─── Render ───────────────────────────────────────────────────────────────

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
    ? conversation.participants.find((id) => id !== user.uid) ?? ''
    : ''
  const otherName = conversation?.participantNames?.[otherId] || 'Unknown User'
  const otherAvatar = conversation?.participantAvatars?.[otherId] ?? null
  const lastMessageAt = conversation?.lastMessageAt

  // Typing user names
  const typingNames = typingUserIds
    .map((id) => conversation?.participantNames?.[id] || 'Someone')
    .filter(Boolean)
  const typingLabel =
    typingNames.length === 1
      ? `${typingNames[0]} is typing…`
      : typingNames.length > 1
      ? 'Several people are typing…'
      : null

  // Group messages by day for date separators
  let lastDate = ''

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 bg-gray-50 dark:bg-gray-900">
        <div
          className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col"
          style={{ height: 'calc(100vh - 130px)' }}
        >
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
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                  {otherName}
                </p>
                {conversation?.jobTitle ? (
                  <p className="text-xs text-primary-500 truncate">
                    {conversation.jobId ? (
                      <Link href={`/jobs/${conversation.jobId}`} className="hover:underline">
                        Re: {conversation.jobTitle}
                      </Link>
                    ) : (
                      <>Re: {conversation.jobTitle}</>
                    )}
                  </p>
                ) : lastMessageAt ? (
                  <p className="text-xs text-gray-400">
                    Last active {formatLastSeen(lastMessageAt)}
                  </p>
                ) : null}
              </div>
            </div>

            {/* Tradie-to-tradie banner */}
            {bothWorkers && (
              <div className="px-4 py-2.5 bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800 flex items-center gap-2 flex-shrink-0">
                <Hammer className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                <p className="text-xs text-amber-800 dark:text-amber-300 flex-1">
                  Working together?{' '}
                  <Link
                    href="/post/homeowner"
                    className="font-semibold underline hover:no-underline"
                  >
                    Create a job and pay securely through WorkerConnect
                  </Link>{' '}
                  — so your payment goes through escrow.
                </p>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-1 bg-gray-50 dark:bg-gray-900/50">
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

                  // Date separator
                  const msgDate = msg.createdAt ? msg.createdAt.slice(0, 10) : ''
                  const showDateSep = msgDate && msgDate !== lastDate
                  if (showDateSep) lastDate = msgDate

                  return (
                    <div key={msg.id}>
                      {showDateSep && <DateSeparator iso={msg.createdAt} />}
                      <div className={cn('flex', isMe ? 'justify-end' : 'justify-start', isLastInGroup ? 'mb-2' : 'mb-0.5')}>
                        {/* Other user avatar */}
                        {!isMe && (
                          <div
                            className={cn(
                              'h-7 w-7 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mr-2 self-end mb-0.5',
                              !isLastInGroup && 'opacity-0'
                            )}
                          >
                            {otherAvatar ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={otherAvatar}
                                alt={otherName}
                                className="h-7 w-7 rounded-full object-cover"
                              />
                            ) : (
                              getInitials(msg.senderName)
                            )}
                          </div>
                        )}

                        <div className="flex flex-col max-w-xs lg:max-w-md">
                          {!isMe && isFirstInGroup && (
                            <span className="text-xs text-gray-500 mb-1 ml-1">
                              {msg.senderName}
                            </span>
                          )}

                          {/* Bubble */}
                          <div
                            className={cn(
                              'px-4 py-2.5 rounded-2xl text-sm',
                              isMe
                                ? 'bg-indigo-600 text-white rounded-br-sm'
                                : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-bl-sm'
                            )}
                          >
                            {/* Text content */}
                            {msg.content && msg.content !== '📷 Photo' && (
                              <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                            )}

                            {/* Images */}
                            {msg.imageUrls && msg.imageUrls.length > 0 && (
                              <div
                                className={cn(
                                  'flex flex-wrap gap-1.5',
                                  msg.content && msg.content !== '📷 Photo' && 'mt-2'
                                )}
                              >
                                {msg.imageUrls.map((url, i) => (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    key={i}
                                    src={url}
                                    alt={`Attachment ${i + 1}`}
                                    className="rounded-lg max-h-48 max-w-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                    onClick={() => window.open(url, '_blank')}
                                  />
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Timestamp + read receipt */}
                          {isLastInGroup && (
                            <div
                              className={cn(
                                'flex items-center gap-1 mt-1',
                                isMe ? 'justify-end' : 'justify-start ml-1'
                              )}
                            >
                              <span className="text-xs text-gray-400">
                                {formatMessageTime(msg.createdAt)}
                              </span>
                              {isMe && (
                                <span
                                  className="ml-0.5"
                                  title={msg.read ? 'Read' : 'Sent'}
                                >
                                  {msg.read ? (
                                    <CheckCheck className="h-3.5 w-3.5 text-indigo-400" />
                                  ) : (
                                    <Check className="h-3.5 w-3.5 text-gray-400" />
                                  )}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })
              )}

              {/* Typing indicator */}
              {typingLabel && (
                <div className="flex items-center gap-2 mt-1">
                  <div className="h-7 w-7 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 opacity-60">
                    {getInitials(otherName)}
                  </div>
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl rounded-bl-sm px-4 py-2.5 flex items-center gap-1.5">
                    <span className="text-xs text-gray-500 dark:text-gray-400">{typingLabel}</span>
                    <span className="flex gap-0.5 ml-1">
                      {[0, 1, 2].map((i) => (
                        <span
                          key={i}
                          className="h-1.5 w-1.5 rounded-full bg-gray-400 dark:bg-gray-500 animate-bounce"
                          style={{ animationDelay: `${i * 150}ms` }}
                        />
                      ))}
                    </span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Image previews */}
            {imagePreviews.length > 0 && (
              <div className="px-3 pt-2 border-t border-gray-200 dark:border-gray-700 flex gap-2 flex-wrap flex-shrink-0">
                {imagePreviews.map((src, i) => (
                  <div key={i} className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={src}
                      alt={`Preview ${i + 1}`}
                      className="h-16 w-16 rounded-lg object-cover border border-gray-200 dark:border-gray-600"
                    />
                    <button
                      onClick={() => removeImage(i)}
                      className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                      aria-label="Remove image"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="p-3 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
              <div className="flex items-end gap-2">
                {/* Image attach button */}
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={ACCEPTED_IMAGE_TYPES.join(',')}
                    multiple
                    className="hidden"
                    onChange={handleImageSelect}
                    aria-label="Attach images"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={pendingImages.length >= MAX_IMAGES}
                    className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    title={pendingImages.length >= MAX_IMAGES ? 'Maximum 3 images per message' : 'Attach images'}
                    aria-label="Attach images"
                  >
                    {pendingImages.length > 0 ? (
                      <span className="relative">
                        <ImageIcon className="h-5 w-5 text-indigo-500" />
                        <span className="absolute -top-1.5 -right-1.5 h-3.5 w-3.5 bg-indigo-500 rounded-full text-white text-[9px] font-bold flex items-center justify-center">
                          {pendingImages.length}
                        </span>
                      </span>
                    ) : (
                      <Paperclip className="h-5 w-5" />
                    )}
                  </button>
                </div>

                {/* Text input */}
                <textarea
                  value={messageText}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message…"
                  rows={1}
                  className="flex-1 px-4 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none overflow-hidden"
                  style={{ minHeight: '40px', maxHeight: '120px' }}
                />

                {/* Send button */}
                <Button
                  onClick={handleSend}
                  disabled={(!messageText.trim() && pendingImages.length === 0) || sending || uploadingImages}
                  size="sm"
                >
                  {sending || uploadingImages ? (
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
