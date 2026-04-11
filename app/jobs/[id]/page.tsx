'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { useAuth } from '@/components/providers/AuthProvider'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import PhotoGallery from '@/components/jobs/PhotoGallery'
import RatingStars from '@/components/reviews/RatingStars'
import toast from 'react-hot-toast'
import {
  MapPin, Clock, DollarSign, Users, AlertCircle, ArrowLeft,
  Calendar, Star, CheckCircle, Send, Camera, ClipboardList, Eye, MessageSquare, Sparkles
} from 'lucide-react'
import { formatCurrency, formatRelativeDate, JOB_CATEGORIES, URGENCY_LABELS } from '@/lib/utils'
import type { Job, JobPhoto } from '@/types'
import Link from 'next/link'
import { applyToJob, getApplicationId, withdrawApplication, getJobApplications } from '@/lib/applications'
import { hasReviewed, submitWorkerReview } from '@/lib/reviews/index'
import { db } from '@/lib/firebase'
import { getUserProfile } from '@/lib/users/getProfile'
import { hasWorkerAI } from '@/lib/subscriptions'
import AIWorkerMatches from '@/components/ai/AIWorkerMatches'

const MOCK_JOBS: Record<string, Job & { employerRating?: number; employerJobs?: number }> = {
  '1': {
    id: '1',
    title: 'Fix Leaking Bathroom Pipe',
    description: `I have a leaking pipe under the bathroom sink. Water is dripping consistently and needs to be fixed ASAP. The pipe appears to be cracked near the joint.

**What needs to be done:**
- Inspect the pipe and identify the issue
- Replace the damaged section
- Ensure no other leaks exist
- Clean up after the work is done

**Access:** Easy access under the sink cabinet. No need to break any walls.

**Timeline:** Needs to be done within 48 hours ideally.`,
    category: 'plumbing',
    employerId: 'emp1',
    employerName: 'John Smith',
    location: 'New York, NY',
    budget: 150,
    budgetType: 'fixed',
    urgency: 'high',
    status: 'completed',
    skills: ['Plumbing', 'Pipe Repair', 'Fixture Installation'],
    applicantsCount: 4,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    employerRating: 4.7,
    employerJobs: 12,
  },
}

const MOCK_JOB_PHOTOS: JobPhoto[] = [
  {
    id: 'p1',
    jobId: '1',
    workerId: 'w1',
    workerName: 'Marcus Johnson',
    url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600',
    storagePath: '',
    type: 'before',
    caption: 'Leaking pipe under sink — before repair',
    approvalStatus: 'approved',
    uploadedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'p2',
    jobId: '1',
    workerId: 'w1',
    workerName: 'Marcus Johnson',
    url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600',
    storagePath: '',
    type: 'after',
    caption: 'New pipe installed and fully sealed',
    approvalStatus: 'approved',
    uploadedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
]

const RATING_LABELS: Record<number, string> = {
  5: 'Excellent',
  4: 'Very Good',
  3: 'Good',
  2: 'Fair',
  1: 'Poor',
}

export default function JobDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user, profile } = useAuth()
  const [applying, setApplying] = useState(false)
  const [showApplyForm, setShowApplyForm] = useState(false)
  const [coverLetter, setCoverLetter] = useState('')
  const [coverLetterAILoading, setCoverLetterAILoading] = useState(false)
  const [alreadyApplied, setAlreadyApplied] = useState(false)
  const [withdrawing, setWithdrawing] = useState(false)
  const [appliedAppId, setAppliedAppId] = useState<string | null>(null)
  const [applicantsCount, setApplicantsCount] = useState<number | null>(null)

  // Review state
  const [alreadyReviewed, setAlreadyReviewed] = useState(false)
  const [checkingReview, setCheckingReview] = useState(false)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviewRating, setReviewRating] = useState(0)
  const [reviewComment, setReviewComment] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)
  const [assignedWorkerName, setAssignedWorkerName] = useState<string>('Worker')

  const job = MOCK_JOBS[params.id as string] || MOCK_JOBS['1']
  const jobPhotos = MOCK_JOB_PHOTOS.filter((p) => p.jobId === (params.id as string) || p.jobId === '1')
  const category = JOB_CATEGORIES.find((c) => c.id === job.category)
  const urgency = URGENCY_LABELS[job.urgency]
  const isEmployer = user?.uid === job.employerId

  useEffect(() => {
    if (!isEmployer) return
    const jobId = params.id as string
    getJobApplications(jobId)
      .then((apps) => setApplicantsCount(apps.length))
      .catch(() => setApplicantsCount(job.applicantsCount ?? 0))
  }, [isEmployer, params.id, job.applicantsCount])

  // Check if the worker has already applied
  useEffect(() => {
    if (!user?.uid || profile?.role !== 'worker' || !db) return
    getApplicationId(params.id as string, user.uid).then((appId) => {
      if (appId) {
        setAlreadyApplied(true)
        setAppliedAppId(appId)
      }
    })
  }, [user, profile, params.id])

  // Check if the employer has already reviewed this job
  useEffect(() => {
    if (!user?.uid || profile?.role !== 'employer') return
    if (!isEmployer) return
    setCheckingReview(true)
    hasReviewed(params.id as string, user.uid)
      .then((reviewed) => setAlreadyReviewed(reviewed))
      .catch(() => {})
      .finally(() => setCheckingReview(false))
  }, [user, profile, params.id, isEmployer])

  // Fetch assigned worker's display name for use in the review
  useEffect(() => {
    if (!job.assignedWorkerId) return
    getUserProfile(job.assignedWorkerId)
      .then((workerProfile) => {
        if (workerProfile?.displayName) {
          setAssignedWorkerName(workerProfile.displayName)
        }
      })
      .catch(() => {})
  }, [job.assignedWorkerId])

  const handleSubmitReview = async () => {
    if (!user || !profile) return
    if (reviewRating === 0) {
      toast.error('Please select a star rating')
      return
    }
    if (reviewComment.trim().length < 10) {
      toast.error('Comment must be at least 10 characters')
      return
    }
    setSubmittingReview(true)
    try {
      await submitWorkerReview({
        jobId: params.id as string,
        jobTitle: job.title,
        workerId: job.assignedWorkerId!,
        workerName: assignedWorkerName,
        employerId: user.uid,
        employerName: profile.displayName ?? user.displayName ?? 'Employer',
        employerPhotoURL: profile.photoURL ?? user.photoURL ?? undefined,
        rating: reviewRating,
        comment: reviewComment,
      })
      setAlreadyReviewed(true)
      setShowReviewForm(false)
      toast.success('Review submitted!')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to submit review')
    } finally {
      setSubmittingReview(false)
    }
  }

  const handleCancelReview = () => {
    setShowReviewForm(false)
    setReviewRating(0)
    setReviewComment('')
  }

  const handleApply = async () => {
    if (!user) {
      toast.error('Please sign in to apply')
      router.push('/auth/login')
      return
    }
    if (profile?.role !== 'worker') {
      toast.error('Only workers can apply to jobs')
      return
    }
    if (!db) {
      toast.error('Feature not available')
      return
    }

    setApplying(true)
    try {
      const appId = await applyToJob(
        params.id as string,
        {
          title: job.title,
          employerId: job.employerId,
          employerName: job.employerName,
        },
        {
          uid: user.uid,
          displayName: profile?.displayName ?? user.displayName ?? 'Worker',
          photoURL: profile?.photoURL ?? user.photoURL ?? undefined,
          rating: profile?.rating,
        },
        coverLetter || undefined
      )
      setAppliedAppId(appId)
      setAlreadyApplied(true)
      toast.success('Application submitted successfully!')
      setShowApplyForm(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to submit application')
    } finally {
      setApplying(false)
    }
  }

  const handleWithdraw = async () => {
    if (!appliedAppId) return
    setWithdrawing(true)
    try {
      await withdrawApplication(appliedAppId)
      setAlreadyApplied(false)
      setAppliedAppId(null)
      toast.success('Application withdrawn')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to withdraw application')
    } finally {
      setWithdrawing(false)
    }
  }

  const handleAICoverLetter = async () => {
    if (!user || !job) return
    setCoverLetterAILoading(true)
    try {
      const res = await fetch('/api/ai/write', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'cover_letter',
          userId: user.uid,
          userRole: 'worker',
          inputs: {
            workerName: profile?.displayName ?? user.displayName ?? 'Worker',
            skills: profile?.skills?.join(', ') ?? '',
            experience: profile?.bio ?? '',
            jobTitle: job.title,
            jobDescription: job.description,
          },
        }),
      })
      const data = await res.json() as { text?: string; error?: string }
      if (!res.ok || !data.text) {
        toast.error(data.error ?? 'AI generation failed')
        return
      }
      setCoverLetter(data.text)
      toast.success('Cover letter generated!')
    } catch {
      toast.error('Failed to generate cover letter')
    } finally {
      setCoverLetterAILoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link href="/jobs" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mb-6 text-sm transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Jobs
          </Link>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-start gap-4 mb-4">
                  <span className="text-4xl">{category?.icon || '🛠️'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <Badge variant={job.status === 'open' ? 'success' : 'default'}>
                        {job.status === 'open' ? 'Open' : job.status}
                      </Badge>
                      {job.urgency === 'emergency' && (
                        <Badge variant="danger" className="flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          Emergency
                        </Badge>
                      )}
                      {job.urgency !== 'emergency' && (
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${urgency?.color}`}>
                          {urgency?.label}
                        </span>
                      )}
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{job.title}</h1>
                    <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="h-4 w-4 text-red-400" />
                        {job.location}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4 text-orange-400" />
                        {formatRelativeDate(job.createdAt)}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Users className="h-4 w-4 text-blue-400" />
                        {job.applicantsCount} applicants
                      </span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
                  <h2 className="font-semibold text-gray-900 dark:text-white mb-3">Job Description</h2>
                  <div className="prose prose-sm dark:prose-invert max-w-none text-gray-600 dark:text-gray-400 whitespace-pre-line">
                    {job.description}
                  </div>
                </div>
              </div>

              {/* Skills Required */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="font-semibold text-gray-900 dark:text-white mb-3">Skills Required</h2>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill) => (
                    <span key={skill} className="bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 px-3 py-1 rounded-full text-sm font-medium">
                      <CheckCircle className="h-3.5 w-3.5 inline mr-1" />
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* AI Suggested Workers — only visible to the job's employer */}
              {isEmployer && profile?.role === 'employer' && (
                <AIWorkerMatches
                  jobId={job.id}
                  jobTitle={job.title}
                  jobDescription={job.description}
                  jobCategory={job.category}
                  jobLocation={job.location}
                  userRole="employer"
                />
              )}

              {/* Photo Gallery — shown when job is completed */}
              {job.status === 'completed' && (
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Camera className="h-5 w-5 text-primary-600" />
                      <h2 className="font-semibold text-gray-900 dark:text-white">
                        Job Photos
                        {jobPhotos.length > 0 && (
                          <span className="ml-2 text-sm font-normal text-gray-500">({jobPhotos.length})</span>
                        )}
                      </h2>
                    </div>
                    {profile?.role === 'worker' && (
                      <Link href={`/jobs/${job.id}/upload-photos`}>
                        <Button size="sm" variant="outline" className="flex items-center gap-1.5">
                          <Camera className="h-3.5 w-3.5" />
                          Add Photos
                        </Button>
                      </Link>
                    )}
                  </div>
                  <PhotoGallery photos={jobPhotos} />
                </div>
              )}

              {/* Apply Form */}
              {showApplyForm && (
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                  <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Submit Application</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Cover Letter <span className="text-gray-400 font-normal">(optional)</span>
                      </label>
                      <textarea
                        rows={4}
                        value={coverLetter}
                        onChange={(e) => setCoverLetter(e.target.value)}
                        placeholder="Introduce yourself, describe your relevant experience, and explain why you're the best fit for this job..."
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                      {profile?.role === 'worker' && hasWorkerAI(profile) && (
                        <button
                          type="button"
                          disabled={coverLetterAILoading}
                          onClick={handleAICoverLetter}
                          className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 border border-indigo-200 dark:border-indigo-800 rounded-lg px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 transition-colors disabled:opacity-50"
                        >
                          {coverLetterAILoading
                            ? <><div className="h-3 w-3 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" /> Generating...</>
                            : <><Sparkles className="h-3.5 w-3.5" /> Write cover letter with AI</>
                          }
                        </button>
                      )}
                    </div>
                    <div className="flex gap-3">
                      <Button variant="outline" onClick={() => setShowApplyForm(false)} className="flex-1">
                        Cancel
                      </Button>
                      <Button
                        onClick={handleApply}
                        loading={applying}
                        className="flex-1"
                      >
                        <Send className="h-4 w-4" />
                        Submit Application
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Leave a Review — shown to employer when job has an assigned worker */}
              {isEmployer && job.assignedWorkerId && (job.status === 'in_progress' || job.status === 'completed') && !checkingReview && (
                <div id="review" className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Star className="h-5 w-5 text-yellow-500 fill-yellow-400" />
                    <h2 className="font-semibold text-gray-900 dark:text-white">Leave a Review</h2>
                  </div>

                  {alreadyReviewed ? (
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm font-medium">
                      <CheckCircle className="h-4 w-4" />
                      You&apos;ve reviewed this job ✓
                    </div>
                  ) : !showReviewForm ? (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        How did the worker do? Your feedback helps build trust in the community.
                      </p>
                      <Button
                        size="sm"
                        onClick={() => setShowReviewForm(true)}
                        className="flex items-center gap-2"
                      >
                        <MessageSquare className="h-4 w-4" />
                        Write a Review
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Star Rating
                        </label>
                        <RatingStars
                          rating={reviewRating}
                          interactive
                          size="lg"
                          onRate={setReviewRating}
                        />
                        {reviewRating > 0 && (
                          <p className="mt-1 text-xs text-gray-500">
                            {RATING_LABELS[reviewRating] ?? ''}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Your Review
                          <span className="text-gray-400 font-normal"> (10–500 characters)</span>
                        </label>
                        <textarea
                          rows={4}
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          placeholder="Describe your experience working with this worker..."
                          maxLength={500}
                          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                        <p className="text-xs text-gray-400 mt-1 text-right">{reviewComment.length}/500</p>
                      </div>
                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          onClick={handleCancelReview}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleSubmitReview}
                          loading={submittingReview}
                          className="flex-1"
                        >
                          <Send className="h-4 w-4" />
                          Submit Review
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Budget Card */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <DollarSign className="h-5 w-5 text-green-500" />
                  <span className="font-semibold text-gray-900 dark:text-white">Budget</span>
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(job.budget)}
                  {job.budgetType === 'hourly' && <span className="text-base font-normal text-gray-500">/hr</span>}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {job.budgetType === 'fixed' ? 'Fixed price project' : 'Hourly rate'}
                </p>

                {job.deadline && (
                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Calendar className="h-4 w-4" />
                      <span>Deadline: {new Date(job.deadline).toLocaleDateString()}</span>
                    </div>
                  </div>
                )}

                {job.status === 'open' && profile?.role !== 'employer' && !showApplyForm && !alreadyApplied && (
                  <Button
                    className="w-full mt-4"
                    onClick={() => {
                      if (!user) {
                        router.push('/auth/login')
                        return
                      }
                      if (!db) {
                        toast.error('Feature not available')
                        return
                      }
                      setShowApplyForm(true)
                    }}
                  >
                    Apply Now
                  </Button>
                )}

                {job.status === 'open' && profile?.role === 'worker' && alreadyApplied && (
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm font-medium">
                      <CheckCircle className="h-4 w-4" />
                      Applied ✓
                    </div>
                    {appliedAppId && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={handleWithdraw}
                        loading={withdrawing}
                      >
                        Withdraw Application
                      </Button>
                    )}
                  </div>
                )}

                {profile?.role === 'worker' && (job.status === 'in_progress' || job.status === 'completed') && (
                  <Link href={`/timesheets/${job.id}`} className="block mt-4">
                    <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                      <ClipboardList className="h-4 w-4" />
                      Track Time
                    </Button>
                  </Link>
                )}

                {/* View Applicants — only shown to the job's employer */}
                {isEmployer && (
                  <Link href={`/jobs/${job.id}/applicants`} className="block mt-4">
                    <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                      <Eye className="h-4 w-4" />
                      View Applicants ({applicantsCount ?? job.applicantsCount})
                    </Button>
                  </Link>
                )}
              </div>

              {/* Employer Card */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">About the Employer</h3>
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center font-semibold text-primary-700 dark:text-primary-400">
                    {job.employerName.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">{job.employerName}</p>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span>{(job as { employerRating?: number }).employerRating || 'New'}</span>
                      {(job as { employerJobs?: number }).employerJobs && (
                        <span>· {(job as { employerJobs?: number }).employerJobs} jobs posted</span>
                      )}
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  View Profile
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
