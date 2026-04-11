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
import { onConversations } from '@/lib/messaging'
import type { ChatConversation } from '@/types'

function getOtherParticipantId(conv: ChatConversation, uid: string): string {
  return Object.keys(conv.participants).find((id) => id !== uid) ?? ''
}

function formatTs(ts?: number): string {
  if (!ts) return ''
  return formatDistanceToNow(new Date(ts), { addSuffix: true })
}

export default function MessagesPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [conversations, setConversations] = useState<ChatConversation[]>([])
  const [loadingConvs, setLoadingConvs] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
    }
  }, [authLoading, user, router])

  useEffect(() => {
    if (!user) return
    setLoadingConvs(true)
    const unsub = onConversations(user.uid, (convs) => {
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
                No messages yet. Apply to a job to start chatting!
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {conversations.map((conv) => {
                const otherId = getOtherParticipantId(conv, user.uid)
                const otherName = conv.participantNames?.[otherId] || 'Unknown User'
                const otherAvatar = conv.participantAvatars?.[otherId] ?? null
                const unread = conv.unreadCount?.[user.uid] ?? 0

                return (
                  <Link
                    key={conv.id}
                    href={`/messages/${conv.id}`}
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
                        <span className={`font-semibold text-sm truncate ${unread > 0 ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                          {otherName}
                        </span>
                        {conv.lastMessageAt && (
                          <span className="text-xs text-gray-400 flex-shrink-0">
                            {formatTs(conv.lastMessageAt)}
                          </span>
                        )}
                      </div>
                      {conv.jobTitle && (
                        <p className="text-xs text-primary-500 truncate mt-0.5">
                          Re: {conv.jobTitle}
                        </p>
                      )}
                      {conv.lastMessage && (
                        <p className={`text-xs truncate mt-0.5 ${unread > 0 ? 'text-gray-600 dark:text-gray-400 font-medium' : 'text-gray-400'}`}>
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
