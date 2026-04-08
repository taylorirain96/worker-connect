'use client'

import { useState, useEffect } from 'react'
import type { Communication } from '@/types'

interface ChatListProps {
  userId: string
  onSelectChat?: (chatId: string) => void
  selectedChatId?: string
}

export default function ChatList({ userId, onSelectChat, selectedChatId }: ChatListProps) {
  const [chats, setChats] = useState<Communication[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/messages/list?userId=${userId}`)
      .then(r => r.json())
      .then(d => setChats(d.chats ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [userId])

  if (loading) {
    return (
      <div className="space-y-2 p-3">
        {[1, 2, 3].map(i => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}
      </div>
    )
  }

  if (chats.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 px-4">
        <p className="text-sm">No conversations yet</p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-gray-100">
      {chats.map(chat => {
        const isSelected = chat.id === selectedChatId
        const otherName = userId === chat.workerId ? chat.employerName : chat.workerName
        return (
          <button
            key={chat.id}
            onClick={() => onSelectChat?.(chat.id)}
            className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${isSelected ? 'bg-blue-50' : ''}`}
          >
            <div className="flex items-start justify-between">
              <p className={`text-sm font-medium ${isSelected ? 'text-blue-700' : 'text-gray-900'}`}>
                {otherName ?? 'Chat'}
              </p>
              {chat.unreadCount > 0 && (
                <span className="bg-blue-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {chat.unreadCount}
                </span>
              )}
            </div>
            {chat.lastMessage && (
              <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{chat.lastMessage}</p>
            )}
            <p className="text-xs text-gray-400 mt-0.5">{new Date(chat.updatedAt).toLocaleDateString()}</p>
          </button>
        )
      })}
    </div>
  )
}
