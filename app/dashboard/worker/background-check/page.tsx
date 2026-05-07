'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { useAuth } from '@/components/providers/AuthProvider'
import toast from 'react-hot-toast'
import {
  ShieldCheck, Clock, CheckCircle, XCircle, AlertTriangle,
  ExternalLink, User, Calendar,
} from 'lucide-react'

interface BackgroundCheck {
  id: string
  status: 'pending' | 'approved' | 'rejected'
  submittedAt: string
  reviewedAt: string | null
  notes: string | null
}

const STATUS_CONFIG = {
  pending: {
    icon: Clock,
    label: 'Under Review',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10 border-amber-500/30',
    description: 'Your request has been received and is being reviewed by our team. This typically takes 3–5 business days.',
  },
  approved: {
    icon: CheckCircle,
    label: 'Approved',
    color: 'text-green-400',
    bg: 'bg-green-500/10 border-green-500/30',
    description: 'Your background check has been approved. A verified badge will appear on your public profile.',
  },
  rejected: {
    icon: XCircle,
    label: 'Not Approved',
    color: 'text-red-400',
    bg: 'bg-red-500/10 border-red-500/30',
    description: 'Your background check was not approved. Please contact support for more information.',
  },
}

export default function BackgroundCheckPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [check, setCheck] = useState<BackgroundCheck | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ fullName: '', dateOfBirth: '', consent: false })

  useEffect(() => {
    if (!user) { router.push('/auth/login'); return }
    fetch('/api/background-checks', { headers: { 'x-user-id': user.uid } })
      .then((r) => r.json())
      .then((data) => setCheck(data.check))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [user, router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user || !form.consent) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/background-checks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': user.uid },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error || 'Submission failed'); return }
      setCheck(data.check)
      toast.success('Background check request submitted!')
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!user || loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <Navbar />
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />
      <main className="mx-auto max-w-2xl px-4 py-10">
        <div className="mb-8">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-sm text-indigo-300">
            <ShieldCheck className="h-4 w-4" />
            Background Check
          </div>
          <h1 className="mb-2 text-3xl font-bold text-white">Background Check Verification</h1>
          <p className="text-slate-400">
            A verified background check badge gives clients extra confidence when hiring you.
            QuickTrade submits requests on your behalf via the NZ Police vetting service.
          </p>
        </div>

        {/* Notice */}
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-4 text-sm text-slate-300">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-indigo-400" />
          <span>
            NZ Police vetting requests must be submitted by an authorised agency.{' '}
            <a
              href="https://www.police.govt.nz/advice-services/businesses-and-organisations/vetting"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-indigo-300 underline hover:text-indigo-200"
            >
              Learn more <ExternalLink className="h-3 w-3" />
            </a>
          </span>
        </div>

        {check ? (
          /* Existing check status */
          (() => {
            const cfg = STATUS_CONFIG[check.status]
            const Icon = cfg.icon
            return (
              <div className={`rounded-2xl border p-6 ${cfg.bg}`}>
                <div className="mb-4 flex items-center gap-3">
                  <Icon className={`h-8 w-8 ${cfg.color}`} />
                  <div>
                    <p className="font-semibold text-white">{cfg.label}</p>
                    {check.submittedAt && (
                      <p className="text-xs text-slate-400">
                        Submitted {new Date(check.submittedAt).toLocaleDateString('en-NZ')}
                      </p>
                    )}
                  </div>
                </div>
                <p className="text-sm text-slate-300">{cfg.description}</p>
                {check.notes && (
                  <div className="mt-4 rounded-xl bg-white/5 p-3 text-sm text-slate-400">
                    <strong className="text-slate-300">Admin notes:</strong> {check.notes}
                  </div>
                )}
              </div>
            )
          })()
        ) : (
          /* Request form */
          <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-white/5 bg-white/5 p-6">
            <h2 className="font-semibold text-white">Submit a Background Check Request</h2>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-300">
                <User className="mr-1.5 inline h-4 w-4 text-indigo-400" />
                Full Legal Name
              </label>
              <input
                type="text"
                required
                placeholder="As it appears on your ID"
                value={form.fullName}
                onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-300">
                <Calendar className="mr-1.5 inline h-4 w-4 text-indigo-400" />
                Date of Birth
              </label>
              <input
                type="date"
                required
                value={form.dateOfBirth}
                onChange={(e) => setForm((f) => ({ ...f, dateOfBirth: e.target.value }))}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none [color-scheme:dark]"
              />
            </div>

            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                required
                checked={form.consent}
                onChange={(e) => setForm((f) => ({ ...f, consent: e.target.checked }))}
                className="mt-0.5 h-4 w-4 shrink-0 rounded accent-indigo-500"
              />
              <span className="text-sm text-slate-300">
                I consent to QuickTrade submitting a NZ Police vetting request on my behalf and sharing the result
                (pass/fail only) on my public profile.
              </span>
            </label>

            <button
              type="submit"
              disabled={submitting || !form.consent}
              className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 py-3 font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:opacity-90 disabled:opacity-50"
            >
              {submitting ? 'Submitting…' : 'Submit Request'}
            </button>
          </form>
        )}
      </main>
      <Footer />
    </div>
  )
}
