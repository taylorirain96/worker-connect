'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { ShieldCheck, CheckCircle, XCircle, Clock, User, RefreshCw } from 'lucide-react'
import { useAuth } from '@/components/providers/AuthProvider'
import toast from 'react-hot-toast'

interface VerificationRecord {
  uid: string
  status: 'pending' | 'approved' | 'rejected'
  frontUrl?: string
  backUrl?: string
  selfieUrl?: string
  rejectionReason?: string
  submittedAt?: string
  reviewedAt?: string
  // Joined from users collection
  workerName?: string
  workerEmail?: string
}

function fmtDate(iso?: string) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-NZ', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function ImagePreview({ url, label }: { url?: string; label: string }) {
  if (!url) {
    return (
      <div className="aspect-video rounded-lg bg-slate-700 flex items-center justify-center text-slate-400 text-xs border border-slate-600">
        {label} not uploaded
      </div>
    )
  }
  return (
    <div className="space-y-1">
      <p className="text-xs text-slate-400 font-medium">{label}</p>
      <div className="relative aspect-video rounded-lg overflow-hidden bg-slate-700 border border-slate-600">
        <Image
          src={url}
          alt={label}
          fill
          className="object-contain"
          unoptimized
        />
      </div>
    </div>
  )
}

export default function AdminVerificationPage() {
  const { user } = useAuth()
  const [records, setRecords] = useState<VerificationRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending')
  const [rejectionInputs, setRejectionInputs] = useState<Record<string, string>>({})
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({})
  const [expandedUid, setExpandedUid] = useState<string | null>(null)

  async function loadRecords() {
    setLoading(true)
    try {
      const res = await fetch('/api/dashboard/admin/verifications')
      if (res.ok) {
        const data = await res.json()
        setRecords(data.verifications ?? [])
      }
    } catch (err) {
      console.error('Error loading verifications:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRecords()
  }, [])

  async function handleAction(uid: string, action: 'approve' | 'reject') {
    if (!user) return
    const reason = rejectionInputs[uid]
    if (action === 'reject' && !reason?.trim()) {
      toast.error('Please enter a rejection reason')
      return
    }

    setActionLoading((prev) => ({ ...prev, [uid]: true }))
    try {
      const res = await fetch('/api/verification/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminUid: user.uid,
          uid,
          action,
          rejectionReason: action === 'reject' ? reason : undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Action failed')

      toast.success(action === 'approve' ? 'Worker verified!' : 'Verification rejected')
      setRecords((prev) =>
        prev.map((r) =>
          r.uid === uid
            ? {
                ...r,
                status: action === 'approve' ? 'approved' : 'rejected',
                rejectionReason: action === 'reject' ? reason : undefined,
                reviewedAt: new Date().toISOString(),
              }
            : r
        )
      )
      setExpandedUid(null)
    } catch (err) {
      console.error('Review action error:', err)
      toast.error('Action failed — please try again')
    } finally {
      setActionLoading((prev) => ({ ...prev, [uid]: false }))
    }
  }

  const filtered = records.filter((r) => filter === 'all' || r.status === filter)

  const statusCounts = {
    pending: records.filter((r) => r.status === 'pending').length,
    approved: records.filter((r) => r.status === 'approved').length,
    rejected: records.filter((r) => r.status === 'rejected').length,
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-6 w-6 text-green-400" />
          <div>
            <h1 className="text-2xl font-bold text-white">Identity Verification</h1>
            <p className="text-sm text-slate-400 mt-0.5">Review worker ID submissions and issue verified badges</p>
          </div>
        </div>
        <button
          onClick={loadRecords}
          className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Summary badges */}
      <div className="flex flex-wrap gap-3">
        {[
          { key: 'all', label: 'All', count: records.length, color: 'bg-slate-700' },
          { key: 'pending', label: 'Pending', count: statusCounts.pending, color: 'bg-amber-900/40 border border-amber-700' },
          { key: 'approved', label: 'Approved', count: statusCounts.approved, color: 'bg-green-900/40 border border-green-700' },
          { key: 'rejected', label: 'Rejected', count: statusCounts.rejected, color: 'bg-red-900/40 border border-red-700' },
        ].map(({ key, label, count, color }) => (
          <button
            key={key}
            onClick={() => setFilter(key as typeof filter)}
            aria-pressed={filter === key}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${color} ${
              filter === key ? 'ring-2 ring-white/30' : ''
            } text-white`}
          >
            {label} <span className="ml-1 opacity-70">{count}</span>
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <LoadingSpinner size="lg" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-slate-800 rounded-xl p-12 text-center text-slate-400">
          No {filter === 'all' ? '' : filter} verifications found.
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((record) => {
            const isExpanded = expandedUid === record.uid
            const isLoading = !!actionLoading[record.uid]

            return (
              <div
                key={record.uid}
                className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden"
              >
                {/* Row header */}
                <button
                  className="w-full flex items-center gap-4 p-4 hover:bg-slate-750 transition-colors text-left"
                  onClick={() => setExpandedUid(isExpanded ? null : record.uid)}
                >
                  <div className="h-9 w-9 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4 text-slate-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">
                      {record.workerName ?? record.uid}
                    </p>
                    <p className="text-xs text-slate-400 truncate">{record.workerEmail ?? '—'}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-xs text-slate-500 hidden sm:block">
                      {fmtDate(record.submittedAt)}
                    </span>
                    {record.status === 'pending' && (
                      <Badge variant="warning" size="sm">
                        <Clock className="h-3 w-3 mr-1" />
                        Pending
                      </Badge>
                    )}
                    {record.status === 'approved' && (
                      <Badge variant="success" size="sm">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Approved
                      </Badge>
                    )}
                    {record.status === 'rejected' && (
                      <Badge variant="danger" size="sm">
                        <XCircle className="h-3 w-3 mr-1" />
                        Rejected
                      </Badge>
                    )}
                    <span className="text-slate-500 text-sm">{isExpanded ? '▲' : '▼'}</span>
                  </div>
                </button>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="px-4 pb-4 space-y-4 border-t border-slate-700">
                    {/* Images */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                      <ImagePreview url={record.frontUrl} label="Front of ID" />
                      <ImagePreview url={record.backUrl} label="Back of ID" />
                      <ImagePreview url={record.selfieUrl} label="Selfie with ID" />
                    </div>

                    {/* Rejection reason (existing) */}
                    {record.status === 'rejected' && record.rejectionReason && (
                      <div className="bg-red-900/20 border border-red-800 rounded-lg p-3 text-sm text-red-300">
                        <span className="font-medium text-red-400">Rejection reason: </span>
                        {record.rejectionReason}
                      </div>
                    )}

                    {/* Actions — only for pending */}
                    {record.status === 'pending' && (
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Button
                          className="bg-green-600 hover:bg-green-700 text-white"
                          disabled={isLoading}
                          onClick={() => handleAction(record.uid, 'approve')}
                        >
                          {isLoading ? 'Processing…' : '✓ Approve'}
                        </Button>
                        <div className="flex gap-2 flex-1">
                          <input
                            type="text"
                            placeholder="Rejection reason…"
                            value={rejectionInputs[record.uid] ?? ''}
                            onChange={(e) =>
                              setRejectionInputs((prev) => ({ ...prev, [record.uid]: e.target.value }))
                            }
                            className="flex-1 bg-slate-700 border border-slate-600 text-white placeholder-slate-400 text-sm px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                          />
                          <Button
                            variant="outline"
                            className="border-red-700 text-red-400 hover:bg-red-900/30"
                            disabled={isLoading || !rejectionInputs[record.uid]?.trim()}
                            onClick={() => handleAction(record.uid, 'reject')}
                          >
                            Reject
                          </Button>
                        </div>
                      </div>
                    )}

                    {record.status !== 'pending' && (
                      <p className="text-xs text-slate-500">
                        Reviewed: {fmtDate(record.reviewedAt)}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
