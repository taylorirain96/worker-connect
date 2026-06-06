'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { useAuth } from '@/components/providers/AuthProvider'
import { MessageSquare, Loader2 } from 'lucide-react'
import { getInitials } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { subscribeToConversations } from '@/lib/services/messagingService'
import type { Conversation } from '@/types'

function formatTs(iso?: string): string {
  if (!iso) return ''
  try {
    return formatDistanceToNow(new Date(iso), { addSuffix: true })
  } catch {
    return ''
  }
}

export default function MessagesPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loadingConvs, setLoadingConvs] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
    }
  }, [authLoading, user, router])

  useEffect(() => {
    if (!user) return
    setLoadingConvs(true)
    const unsub = subscribeToConversations(user.uid, (convs) => {
      setConversations(convs)
      setLoadingConvs(false)
    })
    return () => unsub()
  }, [user])

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

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-6">
            <MessageSquare className="h-6 w-6 text-primary-600" />
            Messages
          </h1>

          {loadingConvs ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 animate-pulse flex items-center gap-4"
                >
                  <div className="h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-40 bg-gray-200 dark:bg-gray-700 rounded" />
                    <div className="h-3 w-64 bg-gray-200 dark:bg-gray-700 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
              <MessageSquare className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                No messages yet
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No messages yet. Apply to a job or contact a tradie to start chatting!
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {conversations.map((conv) => {
                const otherId = conv.participants.find((id) => id !== user.uid) ?? ''
                const otherName = conv.participantNames?.[otherId] || 'Unknown User'
                const otherAvatar = conv.participantAvatars?.[otherId] ?? null
                const unread = conv.unreadCount?.[user.uid] ?? 0
                const chatHref = conv.jobId ? `/messages/${conv.jobId}` : `/messages/${conv.id}`

                // Unified inbox context label: when we know who posted the
                // job, show "Hiring you for …" if the other person posted
                // the job, or "Applying for your …" if the signed-in user
                // posted it. Falls back to the existing "Re: …" line for
                // older conversations missing jobEmployerId.
                let contextLabel: string | null = null
                let contextTone: 'tradie' | 'client' | 'neutral' = 'neutral'
                if (conv.jobTitle && conv.jobEmployerId) {
                  if (conv.jobEmployerId === user.uid) {
                    contextLabel = `Applying for your: ${conv.jobTitle}`
                    contextTone = 'client'
                  } else if (conv.jobEmployerId === otherId) {
                    contextLabel = `Hiring you for: ${conv.jobTitle}`
                    contextTone = 'tradie'
                  } else {
                    contextLabel = `Re: ${conv.jobTitle}`
                  }
                } else if (conv.jobTitle) {
                  contextLabel = `Re: ${conv.jobTitle}`
                }
                const contextClasses =
                  contextTone === 'tradie'
                    ? 'text-indigo-600 dark:text-indigo-400'
                    : contextTone === 'client'
                    ? 'text-violet-600 dark:text-violet-400'
                    : 'text-primary-500'

                return (
                  <Link
                    key={conv.id}
                    href={chatHref}
                    className="flex items-center gap-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      {otherAvatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={otherAvatar}
                          alt={otherName}
                          className="h-12 w-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold">
                          {getInitials(otherName)}
                        </div>
                      )}
                      {unread > 0 && (
                        <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full text-white text-xs font-bold flex items-center justify-center">
                          {unread > 9 ? '9+' : unread}
                        </span>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`font-semibold text-sm truncate ${
                            unread > 0
                              ? 'text-gray-900 dark:text-white'
                              : 'text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {otherName}
                        </span>
                        {conv.lastMessageAt && (
                          <span className="text-xs text-gray-400 flex-shrink-0">
                            {formatTs(conv.lastMessageAt)}
                          </span>
                        )}
                      </div>
                      {contextLabel && (
                        <p className={`text-xs truncate mt-0.5 ${contextClasses}`}>
                          {contextLabel}
                        </p>
                      )}
                      {conv.lastMessage && (
                        <p
                          className={`text-xs truncate mt-0.5 ${
                            unread > 0
                              ? 'text-gray-600 dark:text-gray-400 font-medium'
                              : 'text-gray-400'
                          }`}
                        >
                          {conv.lastMessage}
                        </p>
                      )}
                    </div>

                    {/* Unread badge */}
                    {unread > 0 && (
                      <span className="flex-shrink-0 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        {unread}
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
