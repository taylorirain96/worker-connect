'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { useAuth } from '@/components/providers/AuthProvider'
import { ShieldCheck, ShieldOff, AlertCircle, Save } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function LiabilityInsurancePage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  const [hasInsurance, setHasInsurance] = useState<boolean | null>(null)
  const [provider, setProvider] = useState('')
  const [fetching, setFetching] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!loading && !user) router.push('/auth/login')
  }, [loading, user, router])

  useEffect(() => {
    if (!user) return
    fetch('/api/liability-insurance', { headers: { 'x-user-id': user.uid } })
      .then((r) => r.json())
      .then((data) => {
        if (data.hasLiabilityInsurance !== null) {
          setHasInsurance(Boolean(data.hasLiabilityInsurance))
        }
        if (data.insuranceProvider) {
          setProvider(data.insuranceProvider)
        }
      })
      .catch(() => {})
      .finally(() => setFetching(false))
  }, [user])

  const handleSave = async () => {
    if (!user || hasInsurance === null) return
    setSaving(true)
    try {
      const res = await fetch('/api/liability-insurance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': user.uid },
        body: JSON.stringify({ hasLiabilityInsurance: hasInsurance, insuranceProvider: provider }),
      })
      if (!res.ok) throw new Error('Save failed')
      toast.success('Insurance status saved!')
    } catch {
      toast.error('Could not save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading || fetching) {
    return (
      <div className="flex flex-col min-h-screen luxury-bg">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="h-8 w-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </main>
        <Footer />
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="flex flex-col min-h-screen luxury-bg">
      <Navbar />
      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/dashboard/worker"
              className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white mb-4 transition-colors"
            >
              ← Back to Dashboard
            </Link>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                <ShieldCheck className="h-7 w-7 text-teal-400" />
                Public Liability Insurance
              </h1>
              {hasInsurance && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-teal-500/15 border border-teal-500/30 text-teal-300 text-sm font-semibold">
                  <ShieldCheck className="h-4 w-4" />
                  Insured
                </span>
              )}
            </div>
            <p className="text-slate-400 mt-2">
              Let clients know whether you hold public liability insurance. This information is displayed on your profile.
            </p>
          </div>

          {/* Question */}
          <div className="space-y-4 mb-8">
            <p className="text-slate-200 font-medium text-base">
              Do you currently hold public liability insurance?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setHasInsurance(true)}
                className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-xl border text-left transition-all font-medium ${
                  hasInsurance === true
                    ? 'border-teal-500/50 bg-teal-900/20 text-teal-200'
                    : 'border-slate-700/50 bg-slate-800/50 text-slate-300 hover:border-slate-600'
                }`}
              >
                <ShieldCheck className={`h-5 w-5 ${hasInsurance === true ? 'text-teal-400' : 'text-slate-500'}`} />
                Yes
              </button>
              <button
                onClick={() => setHasInsurance(false)}
                className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-xl border text-left transition-all font-medium ${
                  hasInsurance === false
                    ? 'border-red-500/50 bg-red-900/20 text-red-200'
                    : 'border-slate-700/50 bg-slate-800/50 text-slate-300 hover:border-slate-600'
                }`}
              >
                <ShieldOff className={`h-5 w-5 ${hasInsurance === false ? 'text-red-400' : 'text-slate-500'}`} />
                No
              </button>
            </div>
          </div>

          {/* Provider field (if Yes) */}
          {hasInsurance === true && (
            <div className="mb-8">
              <label className="block text-slate-300 text-sm font-medium mb-2" htmlFor="provider">
                Insurance Provider <span className="text-slate-500 font-normal">(optional)</span>
              </label>
              <input
                id="provider"
                type="text"
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                placeholder="e.g. AMI, Vero, IAG…"
                className="w-full px-4 py-3 rounded-xl bg-slate-800/70 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/60 focus:border-teal-500/60 transition"
              />
            </div>
          )}

          {/* Informational notice (if No) */}
          {hasInsurance === false && (
            <div className="mb-8 flex gap-3 p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-200">
              <AlertCircle className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm leading-relaxed">
                <span className="font-semibold">QuickTrade does not provide liability coverage.</span> We recommend obtaining public liability insurance before taking on jobs. You can still post and accept jobs without it — this is for disclosure purposes only.
              </p>
            </div>
          )}

          {/* Save button */}
          <div className="flex items-center justify-end gap-4">
            <button
              onClick={handleSave}
              disabled={saving || hasInsurance === null}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 disabled:opacity-60 text-white font-semibold text-sm transition-all"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
