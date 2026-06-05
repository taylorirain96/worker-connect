'use client'
import { useState, useRef, useEffect, type PointerEvent as ReactPointerEvent } from 'react'
import { MessageCircle, X, Send, Bot } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const BUTTON_SIZE = 56 // matches w-14 h-14
const STORAGE_KEY = 'qt_support_chat_pos'
const DRAG_THRESHOLD = 5 // px before a pointer move is treated as a drag

export default function SupportChatbot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Kia ora! 👋 I\'m the QuickTrade support assistant. How can I help you today?' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Draggable floating button position. `null` = use default CSS positioning
  // (above the mobile tab bar on small screens, bottom-right on desktop).
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null)
  const dragState = useRef<{
    startX: number
    startY: number
    offsetX: number
    offsetY: number
    moved: boolean
    pointerId: number
  } | null>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Restore saved position
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw) as { x: number; y: number }
      if (typeof parsed?.x === 'number' && typeof parsed?.y === 'number') {
        setPos(clampToViewport(parsed.x, parsed.y))
      }
    } catch {
      /* ignore */
    }
  }, [])

  // Keep the button on-screen if the viewport is resized.
  useEffect(() => {
    if (typeof window === 'undefined') return
    const onResize = () => {
      setPos(prev => (prev ? clampToViewport(prev.x, prev.y) : prev))
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  function clampToViewport(x: number, y: number) {
    if (typeof window === 'undefined') return { x, y }
    const maxX = Math.max(0, window.innerWidth - BUTTON_SIZE - 4)
    const maxY = Math.max(0, window.innerHeight - BUTTON_SIZE - 4)
    return {
      x: Math.min(Math.max(4, x), maxX),
      y: Math.min(Math.max(4, y), maxY),
    }
  }

  const send = async () => {
    if (!input.trim() || loading) return
    const userMsg = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMsg }])
    setLoading(true)

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, { role: 'user', content: userMsg }] }),
      })
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply ?? 'Sorry, I had trouble with that. Try again or email hello@quicktrade.co.nz' }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Something went wrong. Please email hello@quicktrade.co.nz' }])
    } finally {
      setLoading(false)
    }
  }

  const onPointerDown = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const rect = buttonRef.current?.getBoundingClientRect()
    if (!rect) return
    dragState.current = {
      startX: e.clientX,
      startY: e.clientY,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
      moved: false,
      pointerId: e.pointerId,
    }
    buttonRef.current?.setPointerCapture(e.pointerId)
  }

  const onPointerMove = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const state = dragState.current
    if (!state || state.pointerId !== e.pointerId) return
    const dx = e.clientX - state.startX
    const dy = e.clientY - state.startY
    if (!state.moved && Math.hypot(dx, dy) < DRAG_THRESHOLD) return
    state.moved = true
    setPos(clampToViewport(e.clientX - state.offsetX, e.clientY - state.offsetY))
  }

  const endDrag = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const state = dragState.current
    if (!state || state.pointerId !== e.pointerId) return
    try {
      buttonRef.current?.releasePointerCapture(e.pointerId)
    } catch {
      /* ignore */
    }
    const moved = state.moved
    dragState.current = null
    if (moved && pos) {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(pos))
      } catch {
        /* ignore */
      }
    }
  }

  const onClick = () => {
    // Suppress the click that fires at the end of a drag.
    if (dragState.current?.moved) return
    setOpen(o => !o)
  }

  // Button positioning: explicit coords once dragged, otherwise default
  // anchored bottom-right and lifted above the mobile tab bar (h-16 = 4rem).
  const buttonStyle = pos
    ? { left: pos.x, top: pos.y, right: 'auto', bottom: 'auto', touchAction: 'none' as const }
    : { touchAction: 'none' as const }
  const buttonPositionClass = pos
    ? ''
    : 'bottom-20 right-4 md:bottom-6 md:right-6'

  // Window positioning: anchor to the button if dragged, else default.
  const windowStyle = pos
    ? (() => {
        const desiredWidth = typeof window !== 'undefined' && window.innerWidth < 640 ? 320 : 384
        const left = Math.max(8, Math.min(pos.x, (typeof window !== 'undefined' ? window.innerWidth : desiredWidth) - desiredWidth - 8))
        const top = Math.max(8, pos.y - 480 - 8)
        return { left, top, right: 'auto', bottom: 'auto', maxHeight: '480px' }
      })()
    : { maxHeight: '480px' }
  const windowPositionClass = pos
    ? ''
    : 'bottom-[10.5rem] right-4 md:bottom-24 md:right-6'

  return (
    <>
      {/* Floating draggable button */}
      <button
        ref={buttonRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onClick={onClick}
        className={`fixed z-50 w-14 h-14 rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 shadow-lg shadow-indigo-500/30 flex items-center justify-center text-white hover:scale-105 transition-transform select-none cursor-grab active:cursor-grabbing ${buttonPositionClass}`}
        style={buttonStyle}
        aria-label="Open support chat (drag to move)"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {/* Chat window */}
      {open && (
        <div
          className={`fixed z-50 w-80 sm:w-96 rounded-2xl border border-gray-700 bg-gray-900 shadow-2xl flex flex-col overflow-hidden ${windowPositionClass}`}
          style={windowStyle}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm">QuickTrade Support</p>
              <p className="text-indigo-200 text-xs">Usually replies instantly</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ maxHeight: '300px' }}>
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-sm'
                    : 'bg-gray-800 text-gray-200 rounded-bl-sm border border-gray-700'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-800 border border-gray-700 rounded-2xl rounded-bl-sm px-3 py-2">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-700 p-3 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder="Ask anything..."
              className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-indigo-500"
            />
            <button
              onClick={send}
              disabled={loading || !input.trim()}
              className="w-9 h-9 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 flex items-center justify-center transition-colors flex-shrink-0"
            >
              <Send className="h-4 w-4 text-white" />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
