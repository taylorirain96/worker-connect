'use client'

import type { ChatMessage } from '@/types'

interface MessageListProps {
  messages: ChatMessage[]
  currentUserId: string
}

export default function MessageList({ messages, currentUserId }: MessageListProps) {
  if (messages.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400 text-sm">No messages yet</div>
    )
  }

  return (
    <div className="space-y-3 p-4">
      {messages.map(msg => {
        const isOwn = msg.sender === currentUserId
        return (
          <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${isOwn ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'}`}>
              {!isOwn && <p className="text-xs font-medium mb-1 opacity-60">{msg.senderName}</p>}
              <p className="text-sm">{msg.content}</p>
              <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : ''}`}>
                <p className={`text-xs ${isOwn ? 'text-blue-200' : 'text-gray-400'}`}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
                {isOwn && msg.read && <span className="text-xs text-blue-200">✓✓</span>}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
