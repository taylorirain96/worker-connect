'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Card, CardContent } from '@/components/ui/Card'
import { useAuth } from '@/components/providers/AuthProvider'
import { fileRatingAppeal } from '@/lib/services/disputeService'
import { Star, ArrowLeft, Send } from 'lucide-react'

// Mock completed jobs with ratings the worker can appeal.
// Replace with real Firestore queries in production.
const MOCK_RATED_JOBS = [
  { id: 'job_1', title: 'Plumbing Repair — Kitchen Sink', clientId: 'client_1', rating: 2 },
  { id: 'job_2', title: 'Electrical Panel Upgrade', clientId: 'client_2', rating: 1 },
]

export default function NewRatingAppealPage() {
  const router = useRouter()
  const { user } = useAuth()

  const [selectedJobId, setSelectedJobId] = useState('')
  const [appealReason, setAppealReason] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user) { setError('You must be logged in.'); return }
    if (!selectedJobId) { setError('Please select a job.'); return }
    if (!appealReason.trim()) { setError('Please explain your appeal.'); return }

    const job = MOCK_RATED_JOBS.find((j) => j.id === selectedJobId)
    if (!job) { setError('Job not found.'); return }

    setSubmitting(true)
    setError(null)
    try {
      await fileRatingAppeal({
        jobId: job.id,
        jobTitle: job.title,
        workerId: user.uid,
        workerName: user.displayName ?? 'Worker',
        clientId: job.clientId,
        currentRating: job.rating,
        appealReason: appealReason.trim(),
        status: 'pending',
      })
      router.push('/rating-appeals')
    } catch {
      setError('Failed to file appeal. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-6">

          <Link
            href="/rating-appeals"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Rating Appeals
          </Link>

          <div className="flex items-center gap-3">
            <Star className="h-7 w-7 text-yellow-500" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Appeal a Rating</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Request mediator review of an unfair or inaccurate rating.
              </p>
            </div>
          </div>

          <Card padding="lg">
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">

                {/* Job selector */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Select Job *
                  </label>
                  <select
                    value={selectedJobId}
                    onChange={(e) => setSelectedJobId(e.target.value)}
                    required
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Choose a job with a low rating…</option>
                    {MOCK_RATED_JOBS.map((j) => (
                      <option key={j.id} value={j.id}>
                        {j.title} — ★{j.rating}/5
                      </option>
                    ))}
                  </select>
                  {MOCK_RATED_JOBS.length === 0 && (
                    <p className="mt-1 text-xs text-gray-400">No jobs with low ratings found.</p>
                  )}
                </div>

                {/* Appeal reason */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Reason for Appeal *
                  </label>
                  <textarea
                    value={appealReason}
                    onChange={(e) => setAppealReason(e.target.value)}
                    required
                    rows={5}
                    placeholder="Explain why you believe this rating is unfair or inaccurate. Include any relevant context, evidence, or communication history…"
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  />
                  <p className="mt-1 text-xs text-gray-400">{appealReason.length}/2000 characters</p>
                </div>

                {error && (
                  <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-sm text-red-700 dark:text-red-400">
                    {error}
                  </div>
                )}

                <div className="flex gap-3">
                  <Link
                    href="/rating-appeals"
                    className="flex-1 flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    <Send className="h-4 w-4" />
                    {submitting ? 'Submitting…' : 'Submit Appeal'}
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}
