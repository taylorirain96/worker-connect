'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { useAuth } from '@/components/providers/AuthProvider'
import { Shield, ShieldCheck, Clock, XCircle, ExternalLink, ChevronRight } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'

const STEPS = [
  { label: 'Submit Application', description: 'Apply online via the NZ Police vetting portal.' },
  { label: 'Police Vetting', description: 'NZ Police review your application (typically 1–3 weeks).' },
  { label: 'Certificate Issued', description: 'Your vetting certificate is issued and your profile is updated.' },
]

type CheckStatus = 'notStarted' | 'pending' | 'approved' | 'rejected'

export default function BackgroundCheckPage() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()
  const [status, setStatus] = useState<CheckStatus>('notStarted')
  const [expiry, setExpiry] = useState<string | null>(null)
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    if (!loading && !user) router.push('/auth/login')
  }, [loading, user, router])

  useEffect(() => {
    if (!user) return
    fetch('/api/background-check', { headers: { 'x-user-id': user.uid } })
      .then((r) => r.json())
      .then((data) => {
        setStatus(data.backgroundCheckStatus ?? 'notStarted')
        setExpiry(data.backgroundCheckExpiry ?? null)
      })
      .catch(() => {})
      .finally(() => setFetching(false))
  }, [user])

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

  const currentStep = status === 'notStarted' ? 0 : status === 'pending' ? 1 : status === 'approved' ? 2 : -1

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
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <Shield className="h-7 w-7 text-green-400" />
              Background Check
            </h1>
            <p className="text-slate-400 mt-2">
              An NZ Police vetting certificate helps build trust with employers and homeowners.
            </p>
          </div>

          {/* Status banner */}
          <div className={`rounded-xl border p-5 mb-8 ${
            status === 'approved'
              ? 'bg-green-900/20 border-green-500/30'
              : status === 'pending'
              ? 'bg-amber-900/20 border-amber-500/30'
              : status === 'rejected'
              ? 'bg-red-900/20 border-red-500/30'
              : 'bg-slate-800/60 border-slate-700/50'
          }`}>
            <div className="flex items-center gap-3">
              {status === 'approved' && <ShieldCheck className="h-6 w-6 text-green-400 flex-shrink-0" />}
              {status === 'pending' && <Clock className="h-6 w-6 text-amber-400 flex-shrink-0" />}
              {status === 'rejected' && <XCircle className="h-6 w-6 text-red-400 flex-shrink-0" />}
              {status === 'notStarted' && <Shield className="h-6 w-6 text-slate-400 flex-shrink-0" />}
              <div>
                {status === 'approved' && (
                  <>
                    <p className="font-semibold text-green-300">✓ Background Check Passed</p>
                    {expiry && (
                      <p className="text-sm text-green-500 mt-0.5">Valid until {formatDate(expiry)}</p>
                    )}
                  </>
                )}
                {status === 'pending' && (
                  <>
                    <p className="font-semibold text-amber-300">Application Under Review</p>
                    <p className="text-sm text-amber-500 mt-0.5">NZ Police are processing your vetting application.</p>
                  </>
                )}
                {status === 'rejected' && (
                  <>
                    <p className="font-semibold text-red-300">Application Unsuccessful</p>
                    <p className="text-sm text-red-500 mt-0.5">Please contact NZ Police for further information.</p>
                  </>
                )}
                {status === 'notStarted' && (
                  <>
                    <p className="font-semibold text-slate-300">Not yet applied</p>
                    <p className="text-sm text-slate-500 mt-0.5">Apply for an NZ Police vetting check to get started.</p>
                  </>
                )}
              </div>
            </div>

            {status === 'notStarted' && (
              <a
                href="https://www.police.govt.nz/advice-services/personal-vetting"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold text-sm transition-colors"
              >
                Apply for NZ Police Check
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </div>

          {/* 3-step process */}
          <div className="space-y-4 mb-8">
            <h2 className="text-lg font-semibold text-white">How it works</h2>
            <div className="space-y-3">
              {STEPS.map((step, i) => {
                const done = i < currentStep
                const active = i === currentStep
                return (
                  <div
                    key={step.label}
                    className={`flex items-start gap-4 p-4 rounded-xl border ${
                      done
                        ? 'border-green-500/30 bg-green-900/10'
                        : active
                        ? 'border-indigo-500/40 bg-indigo-900/20'
                        : 'border-slate-700/50 bg-slate-800/40'
                    }`}
                  >
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                      done ? 'bg-green-600 text-white' : active ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-400'
                    }`}>
                      {done ? '✓' : i + 1}
                    </div>
                    <div>
                      <p className={`font-medium ${done ? 'text-green-300' : active ? 'text-white' : 'text-slate-400'}`}>
                        {step.label}
                      </p>
                      <p className="text-sm text-slate-500 mt-0.5">{step.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Reference link */}
          <div className="rounded-xl border border-slate-700/50 bg-slate-800/40 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-300">NZ Police Vetting Service</p>
                <p className="text-xs text-slate-500 mt-0.5">Official information about the vetting process</p>
              </div>
              <a
                href="https://www.police.govt.nz/advice-services/personal-vetting"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                Visit <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
