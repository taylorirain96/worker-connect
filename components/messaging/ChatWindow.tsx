'use client'
import { useRef, useEffect, useCallback, useState } from 'react'
import { Send, Loader2, WifiOff } from 'lucide-react'
import { cn, getInitials } from '@/lib/utils'
import Button from '@/components/ui/Button'
import MessageList from './MessageList'
import type { Conversation, Message } from '@/types'

interface ChatWindowProps {
  /** The active conversation */
  conversation: Conversation
  /** Messages in the conversation */
  messages: Message[]
  /** Current user's id */
  currentUserId: string
  /** Names of users who are currently typing */
  typingNames?: string[]
  /** Whether a send operation is in progress */
  sending?: boolean
  /** Whether the user is offline */
  isOffline?: boolean
  /** Called when the user submits a message */
  onSend: (content: string) => Promise<void>
  /** Called as the user types (for typing indicator) */
  onTyping?: (value: string) => void
  className?: string
}

/**
 * Full-featured chat window: header, scrollable message list,
 * typing indicator, and message input with keyboard shortcut support.
 */
export default function ChatWindow({
  conversation,
  messages,
  currentUserId,
  typingNames = [],
  sending = false,
  isOffline = false,
  onSend,
  onTyping,
  className,
}: ChatWindowProps) {
  const [text, setText] = useState('')
  const endRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typingNames])

  const otherName = getOtherParticipantName(conversation, currentUserId)

  const handleSend = useCallback(async () => {
    const content = text.trim()
    if (!content || sending || isOffline) return
    setText('')
    onTyping?.('')
    await onSend(content)
  }, [text, sending, isOffline, onSend, onTyping])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSend()
      }
    },
    [handleSend]
  )

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      setText(value)
      onTyping?.(value)
    },
    [onTyping]
  )

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* ── Header ── */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex-shrink-0">
        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
          {getInitials(otherName)}
        </div>
        <div className="min-w-0">
          <p className="font-medium text-gray-900 dark:text-white text-sm truncate">
            {otherName}
          </p>
          {conversation.jobTitle && (
            <p className="text-xs text-primary-500 truncate">Re: {conversation.jobTitle}</p>
          )}
        </div>
        {isOffline && (
          <span className="ml-auto flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
            <WifiOff className="h-3.5 w-3.5" aria-hidden="true" />
            Offline
          </span>
        )}
      </div>

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900/50">
        <MessageList
          messages={messages}
          currentUserId={currentUserId}
          typingNames={typingNames}
          endRef={endRef}
        />
      </div>

      {/* ── Input ── */}
      <div className="px-3 py-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex-shrink-0">
        <div className="flex gap-2">
          <input
            type="text"
            value={text}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={isOffline ? 'You are offline…' : 'Type a message…'}
            disabled={isOffline}
            aria-label="Message input"
            className="flex-1 px-4 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
          />
          <Button
            onClick={handleSend}
            disabled={!text.trim() || sending || isOffline}
            size="sm"
            aria-label="Send message"
          >
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Send className="h-4 w-4" aria-hidden="true" />
            )}
          </Button>
        </div>
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
