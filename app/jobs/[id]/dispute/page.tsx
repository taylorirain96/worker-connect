'use client'
import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { useAuth } from '@/components/providers/AuthProvider'
import { db, storage } from '@/lib/firebase'
import { doc, getDoc } from 'firebase/firestore'
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
import { AlertTriangle, ArrowLeft, Upload, X, CheckCircle, Loader2 } from 'lucide-react'
import type { Job } from '@/types'

const DISPUTE_REASONS = [
  { value: 'incomplete_work', label: 'Work not completed' },
  { value: 'quality_issues', label: 'Work quality poor' },
  { value: 'non_delivery', label: 'Worker no-showed' },
  { value: 'non_payment', label: 'Homeowner refused to pay' },
  { value: 'other', label: 'Other' },
] as const

const DESIRED_OUTCOMES = [
  { value: 'full_refund', label: 'Full refund' },
  { value: 'partial_refund', label: 'Partial refund' },
  { value: 'release_payment', label: 'Release payment to worker' },
  { value: 'other', label: 'Other' },
] as const

type DisputeReason = (typeof DISPUTE_REASONS)[number]['value']
type DesiredOutcome = (typeof DESIRED_OUTCOMES)[number]['value']

export default function RaiseDisputePage() {
  const params = useParams()
  const router = useRouter()
  const { user, profile } = useAuth()
  const jobId = params.id as string

  const [job, setJob] = useState<Job | null>(null)
  const [loadingJob, setLoadingJob] = useState(true)
  const [alreadyDisputed, setAlreadyDisputed] = useState(false)

  const [reason, setReason] = useState<DisputeReason>('incomplete_work')
  const [description, setDescription] = useState('')
  const [desiredOutcome, setDesiredOutcome] = useState<DesiredOutcome>('full_refund')
  const [photos, setPhotos] = useState<File[]>([])
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([])

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!jobId || !db) {
      setLoadingJob(false)
      return
    }
    async function fetchJob() {
      try {
        const snap = await getDoc(doc(db!, 'jobs', jobId))
        if (snap.exists()) {
          setJob({ id: snap.id, ...snap.data() } as Job)
          if ((snap.data() as Job).status === 'disputed') {
            setAlreadyDisputed(true)
          }
        }
      } catch {
        // Firestore unavailable — proceed with limited info
      } finally {
        setLoadingJob(false)
      }
    }
    fetchJob()
  }, [jobId])

  const effectiveStatus = job?.status ?? 'in_progress'
  const canDispute = effectiveStatus === 'in_progress' || effectiveStatus === 'completed'
  const isEmployer = user?.uid === job?.employerId
  const isWorker = user?.uid === job?.assignedWorkerId
  const isParty = isEmployer || isWorker

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    const remaining = 5 - photos.length
    const toAdd = files.slice(0, remaining)
    setPhotos((prev) => [...prev, ...toAdd])
    toAdd.forEach((file) => {
      const url = URL.createObjectURL(file)
      setPhotoPreviews((prev) => [...prev, url])
    })
    // Reset input so same file can be re-selected after removal
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function removePhoto(index: number) {
    URL.revokeObjectURL(photoPreviews[index])
    setPhotos((prev) => prev.filter((_, i) => i !== index))
    setPhotoPreviews((prev) => prev.filter((_, i) => i !== index))
  }

  async function uploadPhotos(): Promise<string[]> {
    if (!storage || photos.length === 0) return []
    const urls: string[] = []
    for (const file of photos) {
      const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
      const path = `disputes/${jobId}/${user!.uid}/${Date.now()}_${safeFileName}`
      const sRef = storageRef(storage, path)
      await uploadBytes(sRef, file)
      const url = await getDownloadURL(sRef)
      urls.push(url)
    }
    return urls
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user) { setError('You must be logged in.'); return }
    if (!isParty) { setError('Only the job owner or assigned worker can raise a dispute.'); return }
    if (!canDispute) { setError('Disputes can only be raised on in-progress or completed jobs.'); return }
    if (description.trim().length < 50) { setError('Description must be at least 50 characters.'); return }

    setSubmitting(true)
    setError(null)

    try {
      const evidenceUrls = await uploadPhotos()

      const raisedByRole: 'homeowner' | 'worker' = isEmployer ? 'homeowner' : 'worker'

      const res = await fetch('/api/disputes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId,
          raisedBy: user.uid,
          raisedByRole,
          raisedByName: user.displayName ?? profile?.displayName ?? raisedByRole,
          reason,
          description: description.trim(),
          desiredOutcome,
          evidenceUrls,
          jobTitle: job?.title ?? '',
          homeownerId: job?.employerId ?? '',
          homeownerName: job?.employerName ?? '',
          workerId: job?.assignedWorkerId ?? '',
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? 'Failed to submit dispute')
      }

      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit dispute. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loadingJob) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </main>
        <Footer />
      </div>
    )
  }

  // Confirmation screen
  if (submitted) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4 py-16">
          <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-8 text-center">
            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Dispute Submitted
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Your dispute has been submitted. We&apos;ll review within 24 hours.
            </p>
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-6 text-left">
              <p className="text-sm text-amber-800 dark:text-amber-300">
                ⚠️ This job has been flagged as disputed. Both parties have been notified.
              </p>
            </div>
            <Link
              href={`/jobs/${jobId}`}
              className="block w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors"
            >
              Back to Job
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  // Already disputed
  if (alreadyDisputed) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4 py-16">
          <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-8 text-center">
            <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Already Under Dispute
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              A dispute has already been raised for this job. Our team is currently reviewing it.
            </p>
            <Link
              href={`/jobs/${jobId}`}
              className="block w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors"
            >
              Back to Job
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  // Not eligible
  if (!canDispute) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4 py-16">
          <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-8 text-center">
            <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Dispute Not Available
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Disputes can only be raised on jobs that are in progress or completed.
            </p>
            <Link
              href={`/jobs/${jobId}`}
              className="block w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors"
            >
              Back to Job
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-6">

          <Link
            href={`/jobs/${jobId}`}
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Job
          </Link>

          <div className="flex items-center gap-3">
            <AlertTriangle className="h-7 w-7 text-amber-500 flex-shrink-0" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Raise a Dispute</h1>
              {job?.title && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                  {job.title}
                </p>
              )}
            </div>
          </div>

          <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 text-sm text-amber-800 dark:text-amber-300">
            <strong>What happens next:</strong> Once submitted, this job will be flagged as disputed.
            Both parties will be notified and our team will review within 24 hours.
          </div>

          <form
            onSubmit={handleSubmit}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-5"
          >

            {/* Reason */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                What went wrong? *
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value as DisputeReason)}
                required
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {DISPUTE_REASONS.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description *
                <span className="ml-1 font-normal text-gray-400">(min 50 characters)</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                minLength={50}
                maxLength={2000}
                rows={5}
                placeholder="Describe what happened in as much detail as possible — include dates, amounts, and any communication you had with the other party…"
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
              <p className={`mt-1 text-xs ${description.length < 50 ? 'text-amber-500' : 'text-gray-400'}`}>
                {description.length} / 2000 characters{description.length < 50 ? ` — ${50 - description.length} more needed` : ''}
              </p>
            </div>

            {/* Evidence photos */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Evidence Photos
                <span className="ml-1 font-normal text-gray-400">(up to 5 images)</span>
              </label>

              {photos.length < 5 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-500 dark:text-gray-400 hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  <Upload className="h-4 w-4" />
                  Upload photos
                </button>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handlePhotoChange}
              />

              {photoPreviews.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {photoPreviews.map((src, i) => (
                    <div key={i} className="relative h-20 w-20 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt={`Evidence ${i + 1}`} className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removePhoto(i)}
                        className="absolute top-0.5 right-0.5 h-5 w-5 rounded-full bg-red-600 flex items-center justify-center text-white hover:bg-red-700"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Desired outcome */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Desired Outcome *
              </label>
              <select
                value={desiredOutcome}
                onChange={(e) => setDesiredOutcome(e.target.value as DesiredOutcome)}
                required
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {DESIRED_OUTCOMES.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-sm text-red-700 dark:text-red-400">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-1">
              <Link
                href={`/jobs/${jobId}`}
                className="flex-1 flex items-center justify-center px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={submitting || description.trim().length < 50}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting…
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-4 w-4" />
                    Submit Dispute
                  </>
                )}
              </button>
            </div>
          </form>

        </div>
      </main>
      <Footer />
    </div>
  )
}
