'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { useAuth } from '@/components/providers/AuthProvider'
import { CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

function scoreColor(score: number): string {
  if (score <= 6) return 'bg-red-500/20 border-red-500/40 text-red-300 hover:bg-red-500/30'
  if (score <= 8) return 'bg-amber-500/20 border-amber-500/40 text-amber-300 hover:bg-amber-500/30'
  return 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30'
}

function selectedColor(score: number): string {
  if (score <= 6) return 'bg-red-500 border-red-400 text-white'
  if (score <= 8) return 'bg-amber-500 border-amber-400 text-white'
  return 'bg-emerald-500 border-emerald-400 text-white'
}

function NPSContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, profile, loading: authLoading } = useAuth()

  const jobId = searchParams.get('jobId') ?? ''

  const [score, setScore] = useState<number | null>(null)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/auth/signin')
    }
  }, [authLoading, user, router])

  async function handleSubmit() {
    if (!user || score === null) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/nps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': user.uid },
        body: JSON.stringify({ jobId, score, comment: comment.trim() || undefined, role: profile?.role ?? 'homeowner' }),
      })
      if (!res.ok) {
        const data = await res.json() as { error?: string }
        throw new Error(data.error ?? 'Failed to submit')
      }
      setSubmitted(true)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to submit')
    } finally {
      setSubmitting(false)
    }
  }

  if (authLoading || !user) return null

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="h-16 w-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mb-5">
          <CheckCircle className="h-8 w-8 text-emerald-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Thank you!</h2>
        <p className="text-slate-400 mb-6">Your feedback helps us improve QuickTrade for everyone.</p>
        <button
          onClick={() => router.push('/dashboard/homeowner')}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors"
        >
          Back to Dashboard
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">How did it go?</h1>
        <p className="text-slate-400">
          On a scale of 0–10, how likely are you to recommend QuickTrade to a friend?
        </p>
      </div>

      <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-6 space-y-6">
        {/* Score selector */}
        <div>
          <div className="flex justify-between text-xs text-slate-500 mb-2 px-0.5">
            <span>Not likely</span>
            <span>Very likely</span>
          </div>
          <div className="grid grid-cols-11 gap-1.5">
            {Array.from({ length: 11 }, (_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setScore(i)}
                className={`rounded-lg border py-2.5 text-sm font-semibold transition-all ${
                  score === i ? selectedColor(i) : scoreColor(i)
                }`}
              >
                {i}
              </button>
            ))}
          </div>
        </div>

        {/* Comment */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            Any comments? <span className="text-slate-500">(optional)</span>
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Tell us what you thought…"
            rows={3}
            className="w-full rounded-xl border border-slate-700 bg-slate-800/60 text-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-500"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={score === null || submitting}
          className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? 'Submitting…' : 'Submit Feedback'}
        </button>
      </div>
    </div>
  )
}

export default function NPSPage() {
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Suspense fallback={null}>
          <NPSContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}
