'use client'
import { useState, useEffect, useRef } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { useAuth } from '@/components/providers/AuthProvider'
import Button from '@/components/ui/Button'
import { Send, MessageSquare, Search } from 'lucide-react'
import { cn, getInitials, formatRelativeDate } from '@/lib/utils'

interface MockConversation {
  id: string
  otherUser: string
  otherUserRole: string
  lastMessage: string
  lastMessageAt: string
  unread: number
  avatar?: string
}

interface MockMessage {
  id: string
  senderId: string
  content: string
  createdAt: string
}

const MOCK_CONVERSATIONS: MockConversation[] = [
  {
    id: 'conv1',
    otherUser: 'John Smith',
    otherUserRole: 'Employer',
    lastMessage: 'Can you come tomorrow at 9am?',
    lastMessageAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    unread: 2,
  },
  {
    id: 'conv2',
    otherUser: 'Sarah Johnson',
    otherUserRole: 'Employer',
    lastMessage: 'Great work on the panel upgrade!',
    lastMessageAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    unread: 0,
  },
  {
    id: 'conv3',
    otherUser: 'Mike Chen',
    otherUserRole: 'Worker',
    lastMessage: 'I am available this weekend',
    lastMessageAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    unread: 1,
  },
]

const MOCK_MESSAGES: Record<string, MockMessage[]> = {
  conv1: [
    { id: 'm1', senderId: 'emp1', content: 'Hi! I saw your profile and think you\'d be great for my plumbing job.', createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
    { id: 'm2', senderId: 'me', content: 'Hi John! Thanks for reaching out. I\'d be happy to help. What exactly needs to be done?', createdAt: new Date(Date.now() - 90 * 60 * 1000).toISOString() },
    { id: 'm3', senderId: 'emp1', content: 'I have a leaking pipe under the bathroom sink. It needs to be fixed ASAP.', createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString() },
    { id: 'm4', senderId: 'me', content: 'I can take care of that. My rate is $85/hr and I estimate it will take about 1-2 hours.', createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString() },
    { id: 'm5', senderId: 'emp1', content: 'That sounds good! Can you come tomorrow at 9am?', createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString() },
  ],
}

export default function MessagesPage() {
  const { user } = useAuth()
  const [selectedConv, setSelectedConv] = useState<string | null>('conv1')
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<MockMessage[]>(MOCK_MESSAGES['conv1'] || [])
  const [search, setSearch] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSelectConv = (convId: string) => {
    setSelectedConv(convId)
    setMessages(MOCK_MESSAGES[convId] || [])
  }

  const handleSend = () => {
    if (!message.trim()) return
    const newMsg: MockMessage = {
      id: `msg_${Date.now()}`,
      senderId: 'me',
      content: message.trim(),
      createdAt: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, newMsg])
    setMessage('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const filteredConversations = MOCK_CONVERSATIONS.filter((c) =>
    c.otherUser.toLowerCase().includes(search.toLowerCase())
  )

  const selectedConversation = MOCK_CONVERSATIONS.find((c) => c.id === selectedConv)

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
                  {filteredConversations.map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => handleSelectConv(conv.id)}
                      className={cn(
                        'w-full flex items-start gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left',
                        selectedConv === conv.id && 'bg-primary-50 dark:bg-primary-900/20 border-r-2 border-primary-600'
                      )}
                    >
                      <div className="relative flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-sm font-bold">
                          {getInitials(conv.otherUser)}
                        </div>
                        {conv.unread > 0 && (
                          <div className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            {conv.unread}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <span className={cn('text-sm font-medium truncate', conv.unread > 0 ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300')}>
                            {conv.otherUser}
                          </span>
                          <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                            {formatRelativeDate(conv.lastMessageAt)}
                          </span>
                        </div>
                        <p className={cn('text-xs truncate mt-0.5', conv.unread > 0 ? 'text-gray-600 dark:text-gray-400 font-medium' : 'text-gray-400')}>
                          {conv.lastMessage}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat Area */}
              <div className="flex-1 flex flex-col">
                {selectedConversation ? (
                  <>
                    {/* Chat Header */}
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-sm font-bold">
                        {getInitials(selectedConversation.otherUser)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white text-sm">{selectedConversation.otherUser}</p>
                        <p className="text-xs text-gray-500">{selectedConversation.otherUserRole}</p>
                      </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-900/50">
                      {messages.map((msg) => {
                        const isMe = msg.senderId === 'me'
                        return (
                          <div key={msg.id} className={cn('flex', isMe ? 'justify-end' : 'justify-start')}>
                            <div className={cn(
                              'max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-sm',
                              isMe
                                ? 'bg-primary-600 text-white rounded-br-sm'
                                : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-bl-sm'
                            )}>
                              <p>{msg.content}</p>
                              <p className={cn('text-xs mt-1', isMe ? 'text-primary-200' : 'text-gray-400')}>
                                {formatRelativeDate(msg.createdAt)}
                              </p>
                            </div>
                          </div>
                        )
                      })}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          onKeyDown={handleKeyDown}
                          placeholder="Type a message..."
                          className="flex-1 px-4 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                        <Button onClick={handleSend} disabled={!message.trim()} size="sm">
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">Select a conversation to start chatting</p>
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
