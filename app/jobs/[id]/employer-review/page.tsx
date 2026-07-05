'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { useAuth } from '@/components/providers/AuthProvider'
import Button from '@/components/ui/Button'
import RatingStars from '@/components/reviews/RatingStars'
import toast from 'react-hot-toast'
import { Star, ArrowLeft, CheckCircle, Send } from 'lucide-react'
import { getUserProfile } from '@/lib/users/getProfile'
import { db } from '@/lib/firebase'
import { collection, doc, getDoc, getDocs, limit, query, where } from 'firebase/firestore'
import type { Job, UserProfile } from '@/types'
import Link from 'next/link'

const EMPLOYER_REVIEW_TAGS = [
  'Clear instructions',
  'Paid on time',
  'Respectful',
  'Well organised',
  'Would work for again',
  'Good communication',
]

const RATING_LABELS: Record<number, string> = {
  5: 'Excellent',
  4: 'Very Good',
  3: 'Good',
  2: 'Fair',
  1: 'Poor',
}

async function hasWorkerReviewed(jobId: string, workerId: string): Promise<boolean> {
  if (!db) return false
  const snap = await getDocs(
    query(
      collection(db, 'reviews'),
      where('jobId', '==', jobId),
      where('reviewerId', '==', workerId),
      where('reviewType', '==', 'employer_review'),
      limit(1)
    )
  )
  return !snap.empty
}

export default function LeaveEmployerReviewPage() {
  const params = useParams()
  const router = useRouter()
  const { user, profile, loading: authLoading } = useAuth()

  const jobId = params.id as string

  const [job, setJob] = useState<Job | null>(null)
  const [employer, setEmployer] = useState<UserProfile | null>(null)
  const [loadingJob, setLoadingJob] = useState(true)
  const [alreadyReviewed, setAlreadyReviewed] = useState(false)
  const [checkingReview, setCheckingReview] = useState(false)

  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)

  // Load job from Firestore
  useEffect(() => {
    if (!db) {
      setLoadingJob(false)
      return
    }
    const firestore = db
    async function fetchJob() {
      try {
        const snap = await getDoc(doc(firestore, 'jobs', jobId))
        if (snap.exists()) {
          setJob({ id: snap.id, ...snap.data() } as Job)
        }
      } catch {
        // Job not in Firestore — leave job as null (handled below)
      } finally {
        setLoadingJob(false)
      }
    }
    fetchJob()
  }, [jobId])

  // Load employer profile
  useEffect(() => {
    if (!job?.employerId) return
    getUserProfile(job.employerId)
      .then((p) => setEmployer(p))
      .catch(() => {})
  }, [job?.employerId])

  // Check for existing worker-to-employer review
  useEffect(() => {
    if (!user?.uid || !job) return
    setCheckingReview(true)
    hasWorkerReviewed(jobId, user.uid)
      .then((reviewed) => setAlreadyReviewed(reviewed))
      .catch(() => {})
      .finally(() => setCheckingReview(false))
  }, [user, job, jobId])

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  const handleSubmit = async () => {
    if (!user || !profile) {
      toast.error('Please sign in to leave a review.')
      return
    }
    if (!job?.employerId) {
      toast.error('No employer found for this job.')
      return
    }
    if (rating === 0) {
      toast.error('Please select a star rating.')
      return
    }
    if (comment.trim().length < 20) {
      toast.error('Your review must be at least 20 characters.')
      return
    }
    if (comment.length > 500) {
      toast.error('Your review must be 500 characters or fewer.')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId,
          reviewerId: user.uid,
          revieweeId: job.employerId,
          rating,
          comment: comment.trim(),
          tags: selectedTags,
          reviewType: 'employer_review',
          reviewerName: profile.displayName ?? user.displayName ?? 'Worker',
          reviewerAvatar: profile.photoURL ?? user.photoURL ?? undefined,
        }),
      })
      const data = await res.json() as { error?: string }
      if (!res.ok) {
        toast.error(data.error ?? 'Failed to submit review. Please try again.')
        return
      }
      router.push(`/jobs/${jobId}?employer-reviewed=true`)
    } catch {
      toast.error('Failed to submit review. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (authLoading || loadingJob) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="h-8 w-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
        </main>
        <Footer />
      </div>
    )
  }

  if (!authLoading && !user) {
    router.push(`/auth/login?redirect=/jobs/${jobId}/employer-review`)
    return null
  }

  // Only the assigned worker for this job can leave an employer review
  const isAssignedWorker = user?.uid === job?.assignedWorkerId
  if (job && !isAssignedWorker) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1">
          <div className="max-w-2xl mx-auto px-4 py-16 text-center">
            <p className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Access denied</p>
            <p className="text-gray-500 text-sm">Only the assigned worker can review the employer for this job.</p>
            <Link href={`/jobs/${jobId}`} className="inline-flex items-center gap-2 mt-4 text-primary-600 hover:underline text-sm">
              <ArrowLeft className="h-4 w-4" />
              Back to job
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (job && job.status !== 'completed') {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1">
          <div className="max-w-2xl mx-auto px-4 py-16 text-center">
            <p className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Job not yet completed</p>
            <p className="text-gray-500 text-sm">Reviews can only be left after a job has been completed.</p>
            <Link href={`/jobs/${jobId}`} className="inline-flex items-center gap-2 mt-4 text-primary-600 hover:underline text-sm">
              <ArrowLeft className="h-4 w-4" />
              Back to job
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
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
          <Link
            href={`/jobs/${jobId}`}
            className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mb-6 text-sm transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to job
          </Link>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-6">
              <Star className="h-6 w-6 text-yellow-500 fill-yellow-400" />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Review the Employer</h1>
            </div>

            {job && (
              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Job: <span className="text-gray-900 dark:text-white">{job.title}</span>
                </p>
                {employer && (
                  <p className="text-sm text-gray-500 mt-1">
                    Employer: <span className="font-medium text-gray-700 dark:text-gray-300">{employer.displayName ?? employer.companyName}</span>
                  </p>
                )}
              </div>
            )}

            {checkingReview ? (
              <div className="text-center py-8">
                <div className="h-6 w-6 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            ) : alreadyReviewed ? (
              <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                <div>
                  <p className="font-medium text-green-800 dark:text-green-300">Review already submitted</p>
                  <p className="text-sm text-green-700 dark:text-green-400 mt-0.5">
                    You have already reviewed the employer for this job. Thank you for your feedback!
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Star Rating */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Overall Rating <span className="text-red-500">*</span>
                  </label>
                  <RatingStars
                    rating={rating}
                    interactive
                    size="lg"
                    onRate={setRating}
                  />
                  {rating > 0 && (
                    <p className="mt-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                      {RATING_LABELS[rating]}
                    </p>
                  )}
                </div>

                {/* Written Review */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Written Review <span className="text-red-500">*</span>
                    <span className="text-gray-400 dark:text-gray-500 font-normal ml-1">(20–500 characters)</span>
                  </label>
                  <textarea
                    rows={5}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Describe your experience — were instructions clear? Was the employer respectful and did they pay on time?"
                    maxLength={500}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  />
                  <div className="flex justify-between mt-1">
                    <span className={`text-xs ${comment.trim().length > 0 && comment.trim().length < 20 ? 'text-red-500' : 'text-gray-400'}`}>
                      {comment.trim().length > 0 && comment.trim().length < 20
                        ? `${20 - comment.trim().length} more characters needed`
                        : ''}
                    </span>
                    <span className="text-xs text-gray-400">{comment.length}/500</span>
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Tags <span className="text-gray-400 dark:text-gray-500 font-normal">(optional)</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {EMPLOYER_REVIEW_TAGS.map((tag) => {
                      const active = selectedTags.includes(tag)
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => toggleTag(tag)}
                          className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                            active
                              ? 'bg-primary-600 border-primary-600 text-white'
                              : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-primary-400 hover:text-primary-600 dark:hover:text-primary-400'
                          }`}
                        >
                          {active ? '✓ ' : ''}{tag}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Submit */}
                <div className="flex gap-3 pt-2">
                  <Link href={`/jobs/${jobId}`} className="flex-1">
                    <Button variant="outline" className="w-full">
                      Cancel
                    </Button>
                  </Link>
                  <Button
                    className="flex-1 flex items-center justify-center gap-2"
                    onClick={handleSubmit}
                    loading={submitting}
                    disabled={rating === 0 || comment.trim().length < 20}
                  >
                    <Send className="h-4 w-4" />
                    Submit Review
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
