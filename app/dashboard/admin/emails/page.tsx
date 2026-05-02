'use client'
import { useEffect, useState, useCallback } from 'react'
import { Mail, RefreshCw, Send, CheckCircle, XCircle } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import toast from 'react-hot-toast'

// ─── Types ────────────────────────────────────────────────────────────────────

interface EmailLog {
  id: string
  recipient: string
  type: string
  subject: string
  status: string
  sentAt: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString('en-NZ', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

const TYPE_LABELS: Record<string, string> = {
  job_accepted: 'Job Accepted', payment_released: 'Payment Released',
  quote_received: 'Quote Received', message_received: 'Message', application_update: 'Application Update',
  review_received: 'Review Received', job_matches: 'Job Matches', welcome: 'Welcome',
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminEmailsPage() {
  const [logs, setLogs] = useState<EmailLog[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [resending, setResending] = useState<string | null>(null)

  const limit = 20
  const totalPages = Math.ceil(total / limit)

  const loadLogs = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) })
      const res = await fetch(`/api/dashboard/admin/emails?${params}`)
      const data = await res.json()
      setLogs(data.logs ?? [])
      setTotal(data.total ?? 0)
    } catch {
      toast.error('Failed to load email logs')
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => { loadLogs() }, [loadLogs])

  async function handleResend(emailId: string) {
    setResending(emailId)
    try {
      const res = await fetch('/api/dashboard/admin/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailId }),
      })
      if (!res.ok) throw new Error('Resend failed')
      toast.success('Email queued for resend')
    } catch {
      toast.error('Resend failed')
    } finally {
      setResending(null)
    }
  }

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Email Logs</h1>
          <p className="text-sm text-slate-400 mt-1">{total.toLocaleString()} emails logged</p>
        </div>
        <Button variant="outline" size="sm" onClick={loadLogs} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Info banner */}
      <div className="bg-indigo-900/30 border border-indigo-700/50 rounded-xl p-4 flex items-start gap-3">
        <Mail className="h-5 w-5 text-indigo-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-indigo-200">
          <p className="font-medium">Email logs are stored in Firestore <code className="text-xs bg-indigo-900/50 px-1 rounded">emailLogs</code> collection.</p>
          <p className="text-indigo-300 mt-0.5">Each transactional email sent via Resend writes a log entry automatically.</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40"><LoadingSpinner size="md" /></div>
        ) : logs.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Mail className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p>No email logs yet.</p>
            <p className="text-xs mt-1">Logs will appear here once emails are sent via Resend.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700 text-left">
                  <th className="px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wide">Recipient</th>
                  <th className="px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wide">Type</th>
                  <th className="px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wide">Subject</th>
                  <th className="px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wide">Sent At</th>
                  <th className="px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wide">Status</th>
                  <th className="px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wide">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-700/40 transition-colors">
                    <td className="px-4 py-3 text-slate-300">{log.recipient}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-0.5 bg-indigo-900/40 text-indigo-300 rounded-full border border-indigo-700/50">
                        {TYPE_LABELS[log.type] ?? log.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-white max-w-xs truncate">{log.subject}</td>
                    <td className="px-4 py-3 text-slate-300 whitespace-nowrap">{fmtDate(log.sentAt)}</td>
                    <td className="px-4 py-3">
                      {log.status === 'sent' ? (
                        <div className="flex items-center gap-1.5">
                          <CheckCircle className="h-3.5 w-3.5 text-green-400" />
                          <span className="text-xs text-green-400">Sent</span>
                        </div>
                      ) : log.status === 'skipped' ? (
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-slate-400">Skipped</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <XCircle className="h-3.5 w-3.5 text-red-400" />
                          <span className="text-xs text-red-400">Failed</span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleResend(log.id)}
                        disabled={resending === log.id}
                        className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white transition-colors disabled:opacity-50"
                        title="Resend this email"
                      >
                        {resending === log.id
                          ? <RefreshCw className="h-3 w-3 animate-spin" />
                          : <Send className="h-3 w-3" />}
                        Resend
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-400">
            Showing {Math.min((page - 1) * limit + 1, total)}–{Math.min(page * limit, total)} of {total}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1 || loading}>
              Previous
            </Button>
            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages || loading}>
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
