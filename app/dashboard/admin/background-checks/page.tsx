'use client'
import { useEffect, useState } from 'react'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { ShieldCheck, CheckCircle, XCircle, Clock, RefreshCw, User, Calendar } from 'lucide-react'
import { useAuth } from '@/components/providers/AuthProvider'
import { collection, getDocs, orderBy, query } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import toast from 'react-hot-toast'

interface BackgroundCheckRecord {
  id: string
  uid: string
  fullName: string
  dateOfBirth: string
  status: 'pending' | 'approved' | 'rejected'
  submittedAt: string
  reviewedAt: string | null
  reviewedBy: string | null
  notes: string | null
}

function fmtDate(iso?: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-NZ', { day: 'numeric', month: 'short', year: 'numeric' })
}

const STATUS_BADGE: Record<string, 'success' | 'warning' | 'error' | 'default'> = {
  approved: 'success',
  pending: 'warning',
  rejected: 'error',
}

export default function AdminBackgroundChecksPage() {
  const { user } = useAuth()
  const [records, setRecords] = useState<BackgroundCheckRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)
  const [notes, setNotes] = useState<Record<string, string>>({})

  async function load() {
    setLoading(true)
    try {
      if (!db) return
      const snap = await getDocs(
        query(collection(db, 'backgroundChecks'), orderBy('submittedAt', 'desc')),
      )
      setRecords(snap.docs.map((d) => ({ id: d.id, ...d.data() } as BackgroundCheckRecord)))
    } catch (err) {
      console.error(err)
      toast.error('Failed to load background checks')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function review(record: BackgroundCheckRecord, decision: 'approved' | 'rejected') {
    if (!user) return
    setProcessing(record.uid)
    try {
      const res = await fetch('/api/background-checks/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': user.uid },
        body: JSON.stringify({ targetUid: record.uid, decision, notes: notes[record.uid] ?? null }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error || 'Review failed'); return }
      toast.success(`Background check ${decision}`)
      await load()
    } catch {
      toast.error('Something went wrong')
    } finally {
      setProcessing(null)
    }
  }

  const pending = records.filter((r) => r.status === 'pending')
  const reviewed = records.filter((r) => r.status !== 'pending')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-indigo-400" />
            Background Checks
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Review and approve/reject worker background check requests.
          </p>
        </div>
        <Button variant="outline" onClick={load} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
        </div>
      ) : records.length === 0 ? (
        <div className="rounded-2xl border border-white/5 bg-white/5 p-10 text-center text-slate-400">
          No background check requests yet.
        </div>
      ) : (
        <>
          {pending.length > 0 && (
            <section>
              <h2 className="mb-3 text-lg font-semibold text-white flex items-center gap-2">
                <Clock className="h-5 w-5 text-amber-400" /> Pending ({pending.length})
              </h2>
              <div className="space-y-4">
                {pending.map((record) => (
                  <div key={record.uid} className="rounded-2xl border border-white/5 bg-white/5 p-5">
                    <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-white flex items-center gap-2">
                          <User className="h-4 w-4 text-indigo-400" />
                          {record.fullName}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">UID: {record.uid}</p>
                        <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                          <Calendar className="h-3 w-3" /> DOB: {record.dateOfBirth}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">Submitted: {fmtDate(record.submittedAt)}</p>
                      </div>
                      <Badge variant="warning">Pending</Badge>
                    </div>
                    <textarea
                      placeholder="Optional notes (visible to worker if rejected)"
                      value={notes[record.uid] ?? ''}
                      onChange={(e) => setNotes((n) => ({ ...n, [record.uid]: e.target.value }))}
                      rows={2}
                      className="mb-3 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300 placeholder-slate-500 focus:border-indigo-500 focus:outline-none resize-none"
                    />
                    <div className="flex gap-3">
                      <Button
                        onClick={() => review(record, 'approved')}
                        disabled={processing === record.uid}
                        className="flex-1"
                      >
                        <CheckCircle className="h-4 w-4" />
                        Approve
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => review(record, 'rejected')}
                        disabled={processing === record.uid}
                        className="flex-1 border-red-500/30 text-red-400 hover:bg-red-500/10"
                      >
                        <XCircle className="h-4 w-4" />
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {reviewed.length > 0 && (
            <section>
              <h2 className="mb-3 text-lg font-semibold text-white">Reviewed ({reviewed.length})</h2>
              <div className="overflow-x-auto rounded-2xl border border-white/5">
                <table className="w-full text-sm text-slate-300">
                  <thead className="border-b border-white/5 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-4 py-3 text-left">Name</th>
                      <th className="px-4 py-3 text-left">Status</th>
                      <th className="px-4 py-3 text-left">Submitted</th>
                      <th className="px-4 py-3 text-left">Reviewed</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {reviewed.map((record) => (
                      <tr key={record.uid}>
                        <td className="px-4 py-3">
                          <p className="font-medium text-white">{record.fullName}</p>
                          <p className="text-xs text-slate-500">{record.uid}</p>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={STATUS_BADGE[record.status] ?? 'default'}>
                            {record.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">{fmtDate(record.submittedAt)}</td>
                        <td className="px-4 py-3">{fmtDate(record.reviewedAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </>
      )}
    </div>
  )
}
