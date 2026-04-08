'use client'

import { useState, useEffect, useRef } from 'react'
import type { Communication, ChatMessage } from '@/types'

interface NegotiationChatProps {
  chatId?: string
  jobId: string
  workerId: string
  employerId: string
  currentUserId: string
  currentUserName: string
  proposalId?: string
}

export default function NegotiationChat({
  chatId,
  jobId,
  workerId,
  employerId,
  currentUserId,
  currentUserName,
  proposalId,
}: NegotiationChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!chatId) return
    fetch(`/api/messages/${chatId}`)
      .then(r => r.json())
      .then(d => setMessages(d.messages ?? []))
      .catch(() => {})
  }, [chatId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage() {
    if (!input.trim()) return
    setLoading(true)
    try {
      const res = await fetch('/api/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId,
          workerId,
          employerId,
          proposalId,
          senderId: currentUserId,
          senderName: currentUserName,
          content: input.trim(),
        }),
      })
      const data = await res.json()
      if (res.ok) {
        const newMsg: ChatMessage = {
          id: data.messageId ?? `msg_${Date.now()}`,
          sender: currentUserId,
          senderName: currentUserName,
          content: input.trim(),
          timestamp: new Date().toISOString(),
          read: false,
        }
        setMessages(prev => [...prev, newMsg])
        setInput('')
      }
    } catch {}
    setLoading(false)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="flex flex-col h-96 bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b bg-gray-50">
        <h3 className="font-semibold text-gray-900 text-sm">Negotiation Chat</h3>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-center text-gray-400 text-sm py-8">No messages yet. Start the conversation!</p>
        )}
        {messages.map(msg => {
          const isOwn = msg.sender === currentUserId
          return (
            <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${isOwn ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'}`}>
                {!isOwn && <p className="text-xs font-medium mb-1 text-gray-500">{msg.senderName}</p>}
                <p>{msg.content}</p>
                <p className={`text-xs mt-1 ${isOwn ? 'text-blue-200' : 'text-gray-400'}`}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>
      <div className="border-t p-3 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
        >
          Send
        </button>
      </div>
    </div>
  )
}
