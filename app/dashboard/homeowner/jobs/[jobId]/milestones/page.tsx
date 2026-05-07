'use client'
import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { useAuth } from '@/components/providers/AuthProvider'
import { Card, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import MilestoneList from '@/components/milestones/MilestoneList'
import MilestoneForm from '@/components/milestones/MilestoneForm'
import ProgressTimeline from '@/components/milestones/ProgressTimeline'
import ReviewMilestoneModal from '@/components/milestones/ReviewMilestoneModal'
import { ArrowLeft, ListChecks, MessageSquare, PlusCircle } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import type { Job, JobMilestone, JobProgressUpdate } from '@/types'

export default function HomeownerJobMilestonesPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const jobId = params.jobId as string

  const [job, setJob] = useState<Job | null>(null)
  const [milestones, setMilestones] = useState<JobMilestone[]>([])
  const [updates, setUpdates] = useState<JobProgressUpdate[]>([])
  const [fetching, setFetching] = useState(true)
  const [activeTab, setActiveTab] = useState<'milestones' | 'progress'>('milestones')
  const [showForm, setShowForm] = useState(false)
  const [reviewTarget, setReviewTarget] = useState<JobMilestone | null>(null)

  useEffect(() => {
    if (!loading && !user) router.push('/auth/login')
  }, [loading, user, router])

  const fetchData = useCallback(async () => {
    if (!user?.uid || !jobId) return
    setFetching(true)
    try {
      const [jobRes, mRes, pRes] = await Promise.all([
        fetch(`/api/jobs/${jobId}`, { headers: { 'x-user-id': user.uid } }),
        fetch(`/api/jobs/${jobId}/milestones`, { headers: { 'x-user-id': user.uid } }),
        fetch(`/api/jobs/${jobId}/progress`, { headers: { 'x-user-id': user.uid } }),
      ])
      if (jobRes.ok) {
        const d = await jobRes.json() as { job: Job }
        setJob(d.job)
      }
      if (mRes.ok) {
        const d = await mRes.json() as { milestones: JobMilestone[] }
        setMilestones(d.milestones)
      }
      if (pRes.ok) {
        const d = await pRes.json() as { updates: JobProgressUpdate[] }
        setUpdates(d.updates)
      }
    } catch {
      toast.error('Failed to load data')
    } finally {
      setFetching(false)
    }
  }, [user?.uid, jobId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const allocatedPct = milestones.reduce((sum, m) => sum + m.percentage, 0)
  const pendingReviewCount = milestones.filter((m) => m.status === 'submitted').length

  if (loading || fetching) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Back */}
        <Link href="/dashboard/homeowner" className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to dashboard
        </Link>

        <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-white">
              {job?.title ?? 'Job Milestones'}
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Manage payment milestones and review worker progress
            </p>
          </div>
          {activeTab === 'milestones' && allocatedPct < 100 && (
            <Button onClick={() => setShowForm(true)} className="flex items-center gap-2 shrink-0">
              <PlusCircle className="w-4 h-4" />
              Add Milestone
            </Button>
          )}
        </div>

        {/* Pending review banner */}
        {pendingReviewCount > 0 && (
          <div className="mb-5 rounded-xl bg-yellow-500/10 border border-yellow-500/30 p-4 flex items-center gap-3">
            <span className="text-2xl">⏳</span>
            <div>
              <p className="text-sm font-semibold text-yellow-300">
                {pendingReviewCount} milestone{pendingReviewCount > 1 ? 's' : ''} waiting for your approval
              </p>
              <p className="text-xs text-yellow-400/70">
                Review and approve to release payment to the worker.
              </p>
            </div>
          </div>
        )}

        {/* Tab switcher */}
        <div className="flex gap-1 p-1 rounded-xl bg-white/5 mb-6 w-fit">
          {([['milestones', 'Milestones', ListChecks], ['progress', 'Progress Log', MessageSquare]] as const).map(([tab, label, Icon]) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {activeTab === 'milestones' && (
          <Card>
            <CardContent className="p-5">
              <MilestoneList
                milestones={milestones}
                isEmployer={true}
                isWorker={false}
                totalBudget={job?.budget}
                onApprove={(id) => {
                  const m = milestones.find((x) => x.id === id)
                  if (m) setReviewTarget(m)
                }}
                onReject={(id) => {
                  const m = milestones.find((x) => x.id === id)
                  if (m) setReviewTarget(m)
                }}
              />
            </CardContent>
          </Card>
        )}

        {activeTab === 'progress' && (
          <Card>
            <CardContent className="p-5">
              <h3 className="text-sm font-medium text-slate-400 mb-4">Worker progress updates</h3>
              <ProgressTimeline updates={updates} />
            </CardContent>
          </Card>
        )}
      </main>
      <Footer />

      {/* Modals */}
      {showForm && user && job && (
        <MilestoneForm
          jobId={jobId}
          userId={user.uid}
          totalBudget={job.budget}
          allocatedPct={allocatedPct}
          onCreated={fetchData}
          onClose={() => setShowForm(false)}
        />
      )}

      {reviewTarget && user && (
        <ReviewMilestoneModal
          jobId={jobId}
          milestoneId={reviewTarget.id}
          milestoneTitle={reviewTarget.title}
          milestoneAmount={reviewTarget.amount}
          userId={user.uid}
          onReviewed={fetchData}
          onClose={() => setReviewTarget(null)}
        />
      )}
    </div>
  )
}
