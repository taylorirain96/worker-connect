'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { useAuth } from '@/components/providers/AuthProvider'
import { HardHat, CheckCircle, Circle, ExternalLink, Save } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

const CHECKLIST = [
  {
    key: 'inductionComplete' as const,
    label: 'Site Induction Complete',
    description: 'You have completed a site-specific health & safety induction.',
  },
  {
    key: 'ppeConfirmed' as const,
    label: 'PPE Requirements Confirmed',
    description: 'You have confirmed the required personal protective equipment for your role.',
  },
  {
    key: 'hazardRegisterViewed' as const,
    label: 'Hazard Register Reviewed',
    description: 'You have reviewed the site hazard register and understand identified risks.',
  },
  {
    key: 'safetyPlanUploaded' as const,
    label: 'Safety Plan Uploaded',
    description: 'A site-specific safety plan has been reviewed or uploaded.',
  },
]

type ComplianceKey = 'inductionComplete' | 'ppeConfirmed' | 'hazardRegisterViewed' | 'safetyPlanUploaded'

interface ComplianceState {
  inductionComplete: boolean
  ppeConfirmed: boolean
  hazardRegisterViewed: boolean
  safetyPlanUploaded: boolean
}

export default function WorkSafeCompliancePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [compliance, setCompliance] = useState<ComplianceState>({
    inductionComplete: false,
    ppeConfirmed: false,
    hazardRegisterViewed: false,
    safetyPlanUploaded: false,
  })
  const [fetching, setFetching] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!loading && !user) router.push('/auth/login')
  }, [loading, user, router])

  useEffect(() => {
    if (!user) return
    fetch('/api/worksafe', { headers: { 'x-user-id': user.uid } })
      .then((r) => r.json())
      .then((data) => {
        if (data.worksafeCompliance) {
          setCompliance({
            inductionComplete: data.worksafeCompliance.inductionComplete ?? false,
            ppeConfirmed: data.worksafeCompliance.ppeConfirmed ?? false,
            hazardRegisterViewed: data.worksafeCompliance.hazardRegisterViewed ?? false,
            safetyPlanUploaded: data.worksafeCompliance.safetyPlanUploaded ?? false,
          })
        }
      })
      .catch(() => {})
      .finally(() => setFetching(false))
  }, [user])

  const toggle = (key: ComplianceKey) => {
    setCompliance((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    try {
      const res = await fetch('/api/worksafe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': user.uid },
        body: JSON.stringify(compliance),
      })
      if (!res.ok) throw new Error('Save failed')
      toast.success('Compliance status saved!')
    } catch {
      toast.error('Could not save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const allComplete = Object.values(compliance).every(Boolean)

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
            <Link href="/dashboard/worker" className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white mb-4 transition-colors">
              ← Back to Dashboard
            </Link>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                <HardHat className="h-7 w-7 text-orange-400" />
                WorkSafe NZ Compliance
              </h1>
              {allComplete && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-300 text-sm font-semibold">
                  <HardHat className="h-4 w-4" />
                  Compliant
                </span>
              )}
            </div>
            <p className="text-slate-400 mt-2">
              Confirm your WorkSafe NZ compliance to show employers you work safely.{' '}
              <a
                href="https://www.worksafe.govt.nz"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-0.5"
              >
                worksafe.govt.nz <ExternalLink className="h-3 w-3" />
              </a>
            </p>
          </div>

          {/* Checklist */}
          <div className="space-y-3 mb-8">
            {CHECKLIST.map((item) => {
              const checked = compliance[item.key]
              return (
                <button
                  key={item.key}
                  onClick={() => toggle(item.key)}
                  className={`w-full flex items-start gap-4 p-5 rounded-xl border text-left transition-all ${
                    checked
                      ? 'border-orange-500/30 bg-orange-900/15'
                      : 'border-slate-700/50 bg-slate-800/50 hover:border-slate-600'
                  }`}
                >
                  {checked ? (
                    <CheckCircle className="h-6 w-6 text-orange-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <Circle className="h-6 w-6 text-slate-500 flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className={`font-medium ${checked ? 'text-orange-200' : 'text-slate-300'}`}>
                      {item.label}
                    </p>
                    <p className="text-sm text-slate-500 mt-0.5">{item.description}</p>
                  </div>
                </button>
              )
            })}
          </div>

          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-slate-500">
              {Object.values(compliance).filter(Boolean).length} of {CHECKLIST.length} items confirmed
            </p>
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-60 text-white font-semibold text-sm transition-all"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Saving…' : 'Save Compliance Status'}
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
