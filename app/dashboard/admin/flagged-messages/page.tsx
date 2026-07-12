'use client'
import { useEffect, useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

// ─── Types ────────────────────────────────────────────────────────────────────

interface FlaggedMessage {
  id: string
  conversationId: string
  senderId: string
  senderName: string
  jobId: string | null
  matchedPattern: string
  matchedText: string
  messagePreview: string
  flaggedAt: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString('en-NZ', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const PATTERN_LABELS: Record<string, string> = {
  nz_phone: 'NZ phone',
  au_phone: 'AU phone',
  intl_phone: 'Intl. phone',
  email: 'Email address',
  phrase: 'Off-platform phrase',
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function FlaggedMessagesPage() {
  const [messages, setMessages] = useState<FlaggedMessage[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dashboard/admin/flagged-messages?pageSize=100')
      .then((r) => r.json())
      .then((d) => {
        setMessages(d.messages ?? [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <AlertTriangle className="h-6 w-6 text-yellow-400" />
        <div>
          <h1 className="text-2xl font-bold text-white">Flagged Messages</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Messages that contained contact details or off-platform phrases and were sent after user confirmation.
          </p>
        </div>
      </div>

      {messages.length === 0 ? (
        <div className="bg-slate-800 rounded-xl p-10 text-center text-slate-400">
          No flagged messages yet.
        </div>
      ) : (
        <div className="bg-slate-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700 text-slate-400 text-xs uppercase tracking-wider">
                <th className="px-4 py-3 text-left">Sender</th>
                <th className="px-4 py-3 text-left">Pattern</th>
                <th className="px-4 py-3 text-left">Matched text</th>
                <th className="px-4 py-3 text-left">Preview</th>
                <th className="px-4 py-3 text-left">Job ID</th>
                <th className="px-4 py-3 text-left">Flagged at</th>
              </tr>
            </thead>
            <tbody>
              {messages.map((msg) => (
                <tr key={msg.id} className="border-b border-slate-700/50 last:border-0 hover:bg-slate-700/30">
                  <td className="px-4 py-3 text-white">
                    <div className="font-medium truncate max-w-[140px]">{msg.senderName}</div>
                    <div className="text-xs text-slate-500 font-mono truncate max-w-[140px]">{msg.senderId}</div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="warning" size="sm">
                      {PATTERN_LABELS[msg.matchedPattern] ?? msg.matchedPattern}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-yellow-300 font-mono text-xs max-w-[160px] truncate">
                    {msg.matchedText}
                  </td>
                  <td className="px-4 py-3 text-slate-300 max-w-[240px] truncate" title={msg.messagePreview}>
                    {msg.messagePreview}
                  </td>
                  <td className="px-4 py-3 text-slate-400 font-mono text-xs">
                    {msg.jobId ? (
                      <span className="truncate max-w-[100px] block">{msg.jobId}</span>
                    ) : (
                      <span className="text-slate-600">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-400 whitespace-nowrap">{fmtDate(msg.flaggedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
