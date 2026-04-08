'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Card, CardContent } from '@/components/ui/Card'
import { useAuth } from '@/components/providers/AuthProvider'
import { fileDispute, DISPUTE_REASON_LABELS } from '@/lib/services/disputeService'
import type { DisputeResolutionReason } from '@/types'
import { AlertTriangle, ArrowLeft, Send } from 'lucide-react'

const DISPUTE_FILING_WINDOW_DAYS = 7

// Mock completed jobs the user can file a dispute for.
// In production, replace with a Firestore query for the user's completed jobs.
const MOCK_COMPLETED_JOBS = [
  { id: 'job_1', title: 'Plumbing Repair — Kitchen Sink', workerId: 'worker_1', workerName: 'Alex Rivera', completedAt: new Date(Date.now() - 3 * 86400000).toISOString() },
  { id: 'job_2', title: 'Electrical Panel Upgrade', workerId: 'worker_2', workerName: 'Sam Torres', completedAt: new Date(Date.now() - 5 * 86400000).toISOString() },
  { id: 'job_3', title: 'Old Job (outside window)', workerId: 'worker_3', workerName: 'Jordan Kim', completedAt: new Date(Date.now() - 10 * 86400000).toISOString() },
]

export default function NewDisputePage() {
  const router = useRouter()
  const { user } = useAuth()

  const [selectedJobId, setSelectedJobId] = useState('')
  const [reason, setReason] = useState<DisputeResolutionReason>('quality_issues')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const now = Date.now()
  const eligibleJobs = MOCK_COMPLETED_JOBS.filter(
    (j) => now - new Date(j.completedAt).getTime() <= DISPUTE_FILING_WINDOW_DAYS * 86400000
  )

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user) { setError('You must be logged in to file a dispute.'); return }
    if (!selectedJobId) { setError('Please select a job.'); return }
    if (!description.trim()) { setError('Please describe the issue.'); return }

    const job = MOCK_COMPLETED_JOBS.find((j) => j.id === selectedJobId)
    if (!job) { setError('Job not found.'); return }

    setSubmitting(true)
    setError(null)
    try {
      const dueDate = new Date(Date.now() + 7 * 86400000).toISOString()
      const id = await fileDispute({
        jobId: job.id,
        jobTitle: job.title,
        workerId: job.workerId,
        workerName: job.workerName,
        clientId: user.uid,
        clientName: user.displayName ?? 'Client',
        reason,
        description: description.trim(),
        status: 'open',
        filedBy: user.uid,
        dueDate,
      })
      router.push(`/disputes/${id}`)
    } catch {
      setError('Failed to file dispute. Please try again.')
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
            href="/disputes"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Disputes
          </Link>

          <div className="flex items-center gap-3">
            <AlertTriangle className="h-7 w-7 text-red-500" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">File a Dispute</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Disputes must be filed within {DISPUTE_FILING_WINDOW_DAYS} days of job completion.
              </p>
            </div>
          </div>

          {/* Eligibility notice */}
          <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 text-sm text-amber-800 dark:text-amber-300">
            <strong>Filing Window:</strong> You can file disputes for jobs completed in the last {DISPUTE_FILING_WINDOW_DAYS} days.
            {eligibleJobs.length === 0 && (
              <span className="block mt-1 font-medium">You have no eligible jobs to dispute right now.</span>
            )}
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
                    <option value="">Choose a completed job…</option>
                    {eligibleJobs.map((j) => (
                      <option key={j.id} value={j.id}>{j.title}</option>
                    ))}
                  </select>
                </div>

                {/* Reason selector */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Reason for Dispute *
                  </label>
                  <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value as DisputeResolutionReason)}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {Object.entries(DISPUTE_REASON_LABELS).map(([val, lbl]) => (
                      <option key={val} value={val}>{lbl}</option>
                    ))}
                  </select>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Describe the Issue *
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    rows={5}
                    placeholder="Provide as much detail as possible about the issue, including dates, amounts, and any communication you had with the worker…"
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  />
                  <p className="mt-1 text-xs text-gray-400">{description.length}/2000 characters</p>
                </div>

                {error && (
                  <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-sm text-red-700 dark:text-red-400">
                    {error}
                  </div>
                )}

                <div className="flex gap-3">
                  <Link
                    href="/disputes"
                    className="flex-1 flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    disabled={submitting || eligibleJobs.length === 0}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    <Send className="h-4 w-4" />
                    {submitting ? 'Filing…' : 'File Dispute'}
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
