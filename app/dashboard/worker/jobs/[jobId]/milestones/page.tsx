'use client'
import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { useAuth } from '@/components/providers/AuthProvider'
import { Card, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import MilestoneList from '@/components/milestones/MilestoneList'
import ProgressTimeline from '@/components/milestones/ProgressTimeline'
import SubmitMilestoneModal from '@/components/milestones/SubmitMilestoneModal'
import { ArrowLeft, ListChecks, MessageSquare, Send } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import type { Job, JobMilestone, JobProgressUpdate } from '@/types'

export default function WorkerJobMilestonesPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const jobId = params.jobId as string

  const [job, setJob] = useState<Job | null>(null)
  const [milestones, setMilestones] = useState<JobMilestone[]>([])
  const [updates, setUpdates] = useState<JobProgressUpdate[]>([])
  const [fetching, setFetching] = useState(true)
  const [activeTab, setActiveTab] = useState<'milestones' | 'progress'>('milestones')
  const [submitTarget, setSubmitTarget] = useState<JobMilestone | null>(null)
  const [updateMsg, setUpdateMsg] = useState('')
  const [postingUpdate, setPostingUpdate] = useState(false)

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

  async function postUpdate() {
    if (!updateMsg.trim() || !user?.uid) return
    setPostingUpdate(true)
    try {
      const res = await fetch(`/api/jobs/${jobId}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': user.uid },
        body: JSON.stringify({ message: updateMsg.trim() }),
      })
      if (!res.ok) throw new Error('Failed to post update')
      setUpdateMsg('')
      toast.success('Progress update posted')
      await fetchData()
    } catch {
      toast.error('Failed to post update')
    } finally {
      setPostingUpdate(false)
    }
  }

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
        <Link href="/dashboard/worker" className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to dashboard
        </Link>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">
            {job?.title ?? 'Job Milestones'}
          </h1>
          <p className="text-sm text-slate-400 mt-1">Track your progress and submit milestones for payment</p>
        </div>

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
                isEmployer={false}
                isWorker={true}
                totalBudget={job?.budget}
                onSubmit={(id) => {
                  const m = milestones.find((x) => x.id === id)
                  if (m) setSubmitTarget(m)
                }}
              />
            </CardContent>
          </Card>
        )}

        {activeTab === 'progress' && (
          <div className="space-y-4">
            {/* Post update */}
            <Card>
              <CardContent className="p-4">
                <h3 className="text-sm font-medium text-white mb-3">Post a progress update</h3>
                <textarea
                  value={updateMsg}
                  onChange={(e) => setUpdateMsg(e.target.value)}
                  placeholder="Describe what you've done today…"
                  rows={3}
                  className="w-full rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none mb-3"
                />
                <Button
                  size="sm"
                  onClick={postUpdate}
                  disabled={postingUpdate || !updateMsg.trim()}
                  className="flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  {postingUpdate ? 'Posting…' : 'Post Update'}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <h3 className="text-sm font-medium text-slate-400 mb-4">Progress history</h3>
                <ProgressTimeline updates={updates} />
              </CardContent>
            </Card>
          </div>
        )}
      </main>
      <Footer />

      {/* Modals */}
      {submitTarget && user && (
        <SubmitMilestoneModal
          jobId={jobId}
          milestoneId={submitTarget.id}
          milestoneTitle={submitTarget.title}
          userId={user.uid}
          onSubmitted={fetchData}
          onClose={() => setSubmitTarget(null)}
        />
      )}
    </div>
  )
}
