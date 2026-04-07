'use client'
import { cn, getInitials, formatRelativeDate } from '@/lib/utils'
import { Search, MessageSquare, Loader2 } from 'lucide-react'
import { useState } from 'react'
import type { Conversation } from '@/types'

interface ConversationListProps {
  conversations: Conversation[]
  loading?: boolean
  currentUserId: string
  selectedId?: string | null
  onSelect: (conversationId: string) => void
  className?: string
}

/**
 * Sidebar list of conversations with unread badge, last message preview,
 * and a search box to filter by participant name.
 */
export default function ConversationList({
  conversations,
  loading = false,
  currentUserId,
  selectedId,
  onSelect,
  className,
}: ConversationListProps) {
  const [search, setSearch] = useState('')

  const filtered = conversations.filter((c) => {
    if (!search) return true
    const name = getOtherParticipantName(c, currentUserId)
    return name.toLowerCase().includes(search.toLowerCase())
  })

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Search input */}
      <div className="p-3 border-b border-gray-100 dark:border-gray-700 flex-shrink-0">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
            aria-hidden="true"
          />
          <input
            type="search"
            placeholder="Search conversations…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search conversations"
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto" role="list" aria-label="Conversations">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-6 w-6 text-primary-500 animate-spin" aria-label="Loading…" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 px-4 text-center">
            <MessageSquare className="h-8 w-8 text-gray-300 mb-2" aria-hidden="true" />
            <p className="text-sm text-gray-400">
              {search ? 'No conversations found' : 'No conversations yet'}
            </p>
          </div>
        ) : (
          filtered.map((conv) => {
            const otherName = getOtherParticipantName(conv, currentUserId)
            const unread = conv.unreadCount?.[currentUserId] ?? 0
            const isSelected = conv.id === selectedId

            return (
              <button
                key={conv.id}
                role="listitem"
                onClick={() => onSelect(conv.id)}
                aria-current={isSelected ? 'true' : undefined}
                className={cn(
                  'w-full flex items-start gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
                  isSelected && 'bg-primary-50 dark:bg-primary-900/20 border-r-2 border-primary-600'
                )}
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-sm font-bold">
                    {getInitials(otherName)}
                  </div>
                  {unread > 0 && (
                    <span
                      className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                      aria-label={`${unread} unread`}
                    >
                      {unread > 9 ? '9+' : unread}
                    </span>
                  )}
                </div>

                {/* Meta */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <span
                      className={cn(
                        'text-sm font-medium truncate',
                        unread > 0
                          ? 'text-gray-900 dark:text-white'
                          : 'text-gray-700 dark:text-gray-300'
                      )}
                    >
                      {otherName}
                    </span>
                    {conv.lastMessageAt && (
                      <time
                        dateTime={conv.lastMessageAt}
                        className="text-xs text-gray-400 flex-shrink-0 ml-2"
                      >
                        {formatRelativeDate(conv.lastMessageAt)}
                      </time>
                    )}
                  </div>

                  {conv.lastMessage && (
                    <p
                      className={cn(
                        'text-xs truncate mt-0.5',
                        unread > 0
                          ? 'text-gray-600 dark:text-gray-400 font-medium'
                          : 'text-gray-400'
                      )}
                    >
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
  )
}

// ─── Helper ───────────────────────────────────────────────────────────────────

function getOtherParticipantName(conv: Conversation, currentUserId: string): string {
  const otherId = conv.participants.find((p) => p !== currentUserId)
  if (!otherId) return 'Unknown'
  return conv.participantNames?.[otherId] ?? 'Unknown User'
}
