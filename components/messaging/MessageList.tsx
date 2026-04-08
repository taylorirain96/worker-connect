'use client'
import { cn, formatRelativeDate, getInitials } from '@/lib/utils'
import type { Message } from '@/types'
import TypingIndicator from './TypingIndicator'

interface MessageListProps {
  messages: Message[]
  currentUserId: string
  typingNames?: string[]
  className?: string
  /** Ref to attach to the sentinel at the bottom (for auto-scroll) */
  endRef?: React.RefObject<HTMLDivElement>
}

/**
 * Scrollable list of chat messages with timestamps, avatars, and read receipts.
 * Automatically groups consecutive messages from the same sender.
 */
export default function MessageList({
  messages,
  currentUserId,
  typingNames = [],
  className,
  endRef,
}: MessageListProps) {
  return (
    <div className={cn('flex flex-col gap-2 px-4 py-3', className)}>
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 py-12 text-center">
          <span className="text-4xl mb-3" aria-hidden="true">💬</span>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            No messages yet. Say hello!
          </p>
        </div>
      ) : (
        messages.map((msg, idx) => {
          const isMe = msg.senderId === currentUserId
          const prevMsg = idx > 0 ? messages[idx - 1] : null
          const showAvatar = !isMe && (!prevMsg || prevMsg.senderId !== msg.senderId)
          const showName = showAvatar

          return (
            <div key={msg.id} className={cn('flex', isMe ? 'justify-end' : 'justify-start')}>
              {/* Other user avatar */}
              {!isMe && (
                <div
                  className={cn(
                    'h-7 w-7 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mr-2 self-end',
                    !showAvatar && 'opacity-0 pointer-events-none'
                  )}
                  aria-hidden={!showAvatar}
                >
                  {getInitials(msg.senderName)}
                </div>
              )}

              <div className="flex flex-col max-w-xs lg:max-w-md">
                {/* Sender name (shown only on first message in a group) */}
                {showName && !isMe && (
                  <span className="text-xs text-gray-400 dark:text-gray-500 mb-0.5 ml-1">
                    {msg.senderName}
                  </span>
                )}

                {/* Bubble */}
                <div
                  className={cn(
                    'px-4 py-2.5 rounded-2xl text-sm',
                    isMe
                      ? 'bg-primary-600 text-white rounded-br-sm'
                      : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-bl-sm shadow-sm'
                  )}
                >
                  <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                  <ReadReceipt message={msg} isMe={isMe} />
                </div>
              </div>
            </div>
          )
        })
      )}

      {/* Typing indicator */}
      {typingNames.length > 0 && (
        <TypingIndicator names={typingNames} className="ml-9" />
      )}

      {/* Scroll sentinel */}
      <div ref={endRef} aria-hidden="true" />
    </div>
  )
}

// ─── Read Receipt ─────────────────────────────────────────────────────────────

interface ReadReceiptProps {
  message: Message
  isMe: boolean
}

function ReadReceipt({ message, isMe }: ReadReceiptProps) {
  return (
    <div className={cn('flex items-center gap-1 mt-1', isMe ? 'justify-end' : 'justify-start')}>
      <time
        dateTime={message.createdAt}
        className={cn('text-xs', isMe ? 'text-primary-200' : 'text-gray-400')}
        title={new Date(message.createdAt).toLocaleString()}
      >
        {formatRelativeDate(message.createdAt)}
      </time>
      {isMe && (
        <span
          className={cn('text-xs', message.read ? 'text-primary-200' : 'text-primary-300/60')}
          title={message.read ? 'Read' : 'Sent'}
          aria-label={message.read ? 'Read' : 'Sent'}
        >
          {message.read ? '✓✓' : '✓'}
        </span>
      )}
    </div>
  )
}
