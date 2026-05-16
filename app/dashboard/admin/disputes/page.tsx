'use client'
import { useEffect, useState } from 'react'
import { AlertTriangle, RefreshCw, CheckCircle, RotateCcw, Scissors } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import toast from 'react-hot-toast'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Dispute {
  id: string
  jobId: string
  jobTitle: string
  homeownerId: string
  homeownerName: string
  homeownerNote: string
  workerId: string
  workerName: string
  workerNote: string
  amount: number
  reason: string
  status: string
  adminNote: string
  createdAt: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-NZ', { day: 'numeric', month: 'short', year: 'numeric' })
}

function fmtCurrency(n: number) {
  return new Intl.NumberFormat('en-NZ', { style: 'currency', currency: 'NZD', maximumFractionDigits: 0 }).format(n)
}

const REASON_LABELS: Record<string, string> = {
  quality_issues: 'Quality issues', non_delivery: 'Non-delivery',
  overcharge: 'Overcharge', misrepresentation: 'Misrepresentation', other: 'Other',
}

// ─── Dispute card ─────────────────────────────────────────────────────────────

function DisputePanel({ dispute, onResolved }: { dispute: Dispute; onResolved: () => void }) {
  const [adminNote, setAdminNote] = useState(dispute.adminNote)
  const [splitPct, setSplitPct] = useState(50)
  const [loading, setLoading] = useState<string | null>(null)
  const [showSplit, setShowSplit] = useState(false)

  async function resolve(action: 'release_to_worker' | 'refund_to_homeowner' | 'split') {
    setLoading(action)
    try {
      const res = await fetch('/api/dashboard/admin/disputes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: dispute.jobId,
          action,
          splitPercent: action === 'split' ? splitPct : undefined,
          adminNote: adminNote || undefined,
        }),
      })
      if (!res.ok) throw new Error('Resolution failed')
      toast.success('Dispute resolved')
      onResolved()
    } catch {
      toast.error('Resolution failed')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700">
      {/* Header */}
      <div className="flex items-start justify-between p-5 border-b border-slate-700">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="h-4 w-4 text-red-400" />
            <h3 className="font-semibold text-white">{dispute.jobTitle}</h3>
            <Badge variant="danger" size="sm">Disputed</Badge>
          </div>
          <p className="text-xs text-slate-400">
            Reason: <span className="text-slate-300">{REASON_LABELS[dispute.reason] ?? dispute.reason}</span>
            {' · '}Filed {fmtDate(dispute.createdAt)}
          </p>
        </div>
        <div className="text-right flex-shrink-0 ml-4">
          <p className="text-xs text-slate-400">Amount held</p>
          <p className="text-2xl font-bold text-white">{fmtCurrency(dispute.amount)}</p>
        </div>
      </div>

      {/* Two sides */}
      <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-700">
        <div className="p-5">
          <p className="text-xs font-semibold text-blue-400 uppercase tracking-wide mb-2">
            Homeowner — {dispute.homeownerName}
          </p>
          <p className="text-sm text-slate-300 leading-relaxed">
            {dispute.homeownerNote || 'No statement provided.'}
          </p>
        </div>
        <div className="p-5">
          <p className="text-xs font-semibold text-green-400 uppercase tracking-wide mb-2">
            Worker — {dispute.workerName}
          </p>
          <p className="text-sm text-slate-300 leading-relaxed">
            {dispute.workerNote || 'No statement provided.'}
          </p>
        </div>
      </div>

      {/* Admin note */}
      <div className="p-5 border-t border-slate-700">
        <label className="block text-xs font-medium text-slate-400 mb-1.5">Admin Note (saved to Firestore with dispute record)</label>
        <textarea
          value={adminNote}
          onChange={(e) => setAdminNote(e.target.value)}
          rows={2}
          placeholder="Optional resolution note…"
          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 resize-none"
        />
      </div>

      {/* Actions */}
      <div className="p-5 pt-0 flex flex-wrap items-center gap-2">
        <Button
          variant="primary"
          size="sm"
          onClick={() => resolve('release_to_worker')}
          disabled={!!loading}
        >
          {loading === 'release_to_worker' ? <RefreshCw className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
          Release to Worker
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => resolve('refund_to_homeowner')}
          disabled={!!loading}
        >
          {loading === 'refund_to_homeowner' ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
          Refund Homeowner
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowSplit((v) => !v)}
          disabled={!!loading}
        >
          <Scissors className="h-4 w-4" />
          Split Payment
        </Button>

        {showSplit && (
          <div className="flex items-center gap-2 mt-2 w-full">
            <span className="text-xs text-slate-400 whitespace-nowrap">Worker gets:</span>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={splitPct}
              onChange={(e) => setSplitPct(Number(e.target.value))}
              className="flex-1 accent-indigo-500"
            />
            <span className="text-sm text-white font-medium w-10 text-right">{splitPct}%</span>
            <Button
              variant="primary"
              size="sm"
              onClick={() => resolve('split')}
              disabled={!!loading}
            >
              {loading === 'split' ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Apply Split'}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminDisputesPage() {
  const [disputes, setDisputes] = useState<Dispute[]>([])
  const [loading, setLoading] = useState(true)

  async function loadDisputes() {
    setLoading(true)
    try {
      const res = await fetch('/api/dashboard/admin/disputes')
      const data = await res.json()
      setDisputes(data.disputes ?? [])
    } catch {
      toast.error('Failed to load disputes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadDisputes() }, [])

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Dispute Resolution</h1>
          <p className="text-sm text-slate-400 mt-1">
            {disputes.length} open {disputes.length === 1 ? 'dispute' : 'disputes'}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={loadDisputes} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40"><LoadingSpinner size="md" /></div>
      ) : disputes.length === 0 ? (
        <div className="bg-slate-800 rounded-xl p-12 text-center">
          <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-3" />
          <p className="text-white font-medium">No open disputes</p>
          <p className="text-slate-400 text-sm mt-1">All disputes have been resolved.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {disputes.map((d) => (
            <DisputePanel key={d.id} dispute={d} onResolved={loadDisputes} />
          ))}
        </div>
      )}
    </div>
  )
}
