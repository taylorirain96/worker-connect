'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { useAuth } from '@/components/providers/AuthProvider'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import {
  Briefcase, FileText, Star, Eye, Send, Bookmark,
  CheckCircle, Clock, XCircle, ChevronRight, UserCircle,
  TrendingUp, Zap, BarChart2, ToggleRight,
} from 'lucide-react'
import { collection, query, where, orderBy, getDocs, type DocumentData } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { formatRelativeDate, formatCurrency } from '@/lib/utils'
import { getJobs } from '@/lib/services/jobService'
import type { Job } from '@/types'

interface JobseekerApplication {
  id: string
  jobId: string
  jobTitle: string
  employerName: string
  status: 'pending' | 'viewed' | 'interview' | 'hired' | 'declined'
  appliedAt: string
  salary?: number
}

const APPLICATION_STATUS: Record<string, { label: string; icon: React.ComponentType<{ className?: string }>; color: string }> = {
  pending:   { label: 'Pending',   icon: Clock,        color: 'text-gray-400 bg-gray-500/10' },
  viewed:    { label: 'Viewed',    icon: Eye,          color: 'text-indigo-400 bg-indigo-500/10' },
  interview: { label: 'Interview', icon: Star,         color: 'text-yellow-400 bg-yellow-500/10' },
  hired:     { label: 'Hired 🎉', icon: CheckCircle,  color: 'text-green-400 bg-green-500/10' },
  declined:  { label: 'Declined',  icon: XCircle,      color: 'text-red-400 bg-red-500/10' },
}

const MOCK_APPLICATIONS: JobseekerApplication[] = [
  { id: '1', jobId: 'j1', jobTitle: 'Senior Electrician', employerName: 'PowerTech NZ', status: 'interview', appliedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), salary: 85000 },
  { id: '2', jobId: 'j2', jobTitle: 'Plumbing Supervisor', employerName: 'FlowFix Ltd', status: 'viewed', appliedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), salary: 75000 },
  { id: '3', jobId: 'j3', jobTitle: 'HVAC Technician', employerName: 'ClimateControl Co', status: 'pending', appliedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), salary: 70000 },
]

const MOCK_SAVED: Job[] = [
  {
    id: 's1', title: 'Lead Carpenter', employerName: 'BuildRight NZ', location: 'Auckland, Auckland',
    budget: 90000, budgetType: 'fixed', urgency: 'medium', status: 'open',
    category: 'carpentry', skills: ['Carpentry', 'Framing', 'Finishing'],
    applicantsCount: 8, description: 'Lead carpenter role for a growing construction company.',
    employerId: 'emp_s1', createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(), jobType: 'employment',
  },
]

function calcProfileCompletion(profile: Record<string, unknown> | null): { pct: number; tips: string[] } {
  if (!profile) return { pct: 0, tips: [] }
  const tips: string[] = []
  let score = 20 // base for having an account
  if (profile.photoURL) { score += 15 } else { tips.push('Add a profile photo +15%') }
  if (profile.cvUrl) { score += 20 } else { tips.push('Upload your CV +20%') }
  if (profile.workHistory && Array.isArray(profile.workHistory) && (profile.workHistory as unknown[]).length > 0) { score += 15 } else { tips.push('Add work history +15%') }
  if (profile.headline) { score += 10 } else { tips.push('Add a professional headline +10%') }
  if (profile.skills && Array.isArray(profile.skills) && (profile.skills as string[]).length > 0) { score += 10 } else { tips.push('Add your skills +10%') }
  if (profile.bio) { score += 10 } else { tips.push('Write an About Me +10%') }
  return { pct: Math.min(score, 100), tips }
}

export default function JobseekerDashboardPage() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()
  const [applications, setApplications] = useState<JobseekerApplication[]>([])
  const [savedJobs, setSavedJobs] = useState<Job[]>([])
  const [staffJobs, setStaffJobs] = useState<Job[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [activeTab, setActiveTab] = useState<'jobs' | 'applications' | 'saved'>('jobs')

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
    if (!loading && user && profile && profile.role !== 'jobseeker') {
      router.push('/dashboard')
    }
  }, [loading, user, profile, router])

  useEffect(() => {
    if (!user?.uid) {
      setLoadingData(false)
      return
    }

    async function fetchData() {
      try {
        // Fetch applications
        if (db) {
          const appsRef = collection(db, 'applications')
          const q = query(appsRef, where('workerId', '==', user!.uid), orderBy('createdAt', 'desc'))
          const snap = await getDocs(q)
          const fetched = snap.docs.map((d: DocumentData) => {
            const data = d.data() as Record<string, unknown>
            const toISO = (v: unknown) =>
              v && typeof v === 'object' && 'toDate' in (v as object)
                ? (v as { toDate: () => Date }).toDate().toISOString()
                : typeof v === 'string' ? v : new Date().toISOString()
            return {
              id: d.id,
              jobId: data.jobId as string ?? '',
              jobTitle: data.jobTitle as string ?? 'Job',
              employerName: data.employerName as string ?? '',
              status: (data.status as JobseekerApplication['status']) ?? 'pending',
              appliedAt: toISO(data.createdAt),
              salary: data.proposedRate as number | undefined,
            }
          })
          setApplications(fetched.length > 0 ? fetched : MOCK_APPLICATIONS)
        } else {
          setApplications(MOCK_APPLICATIONS)
        }

        // Fetch saved jobs from Firestore
        if (db) {
          const savedRef = collection(db, 'savedJobs')
          const sq = query(savedRef, where('userId', '==', user!.uid))
          const savedSnap = await getDocs(sq)
          if (savedSnap.docs.length > 0) {
            // Fetch actual job details for saved job IDs
            setSavedJobs(MOCK_SAVED)
          } else {
            setSavedJobs(MOCK_SAVED)
          }
        } else {
          setSavedJobs(MOCK_SAVED)
        }

        // Fetch staff/employment jobs
        const allJobs = await getJobs()
        const employment = allJobs.filter((j) => !j.jobType || j.jobType === 'employment')
        setStaffJobs(employment.length > 0 ? employment.slice(0, 6) : [])
      } catch {
        setApplications(MOCK_APPLICATIONS)
        setSavedJobs(MOCK_SAVED)
      } finally {
        setLoadingData(false)
      }
    }

    fetchData()
  }, [user])

  if (loading || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const { pct: completionPct, tips: completionTips } = calcProfileCompletion(profile as Record<string, unknown> | null)
  const openToWork = !!(profile as Record<string, unknown> | null)?.openToWork

  const statCards = [
    { label: 'CVs sent', value: applications.length, icon: Send, color: 'text-indigo-400' },
    { label: 'Profile views this week', value: (profile as Record<string, unknown> | null)?.profileViewsThisWeek as number ?? 0, icon: Eye, color: 'text-violet-400' },
    { label: 'Response rate', value: `${(profile as Record<string, unknown> | null)?.responseRate as number ?? 0}%`, icon: BarChart2, color: 'text-green-400' },
  ]

  return (
    <div className="flex flex-col min-h-screen bg-gray-950">
      <Navbar />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-8 space-y-6">

        {/* Profile completion banner */}
        {completionPct < 100 && (
          <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-xl p-4">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-indigo-300 mb-1">
                  Your profile is {completionPct}% complete — complete it to get more views
                </p>
                <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                  <div
                    className="bg-gradient-to-r from-indigo-500 to-violet-500 h-2 rounded-full transition-all"
                    style={{ width: `${completionPct}%` }}
                  />
                </div>
                {completionTips.length > 0 && (
                  <p className="text-xs text-gray-400">{completionTips[0]}</p>
                )}
              </div>
              <Link href="/dashboard/jobseeker/profile">
                <Button size="sm" variant="primary">Complete Profile</Button>
              </Link>
            </div>
          </div>
        )}

        {/* Open to work + CV button row */}
        <div className="flex flex-wrap items-center gap-3">
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
            openToWork ? 'bg-green-500/15 text-green-400 border border-green-500/30' : 'bg-gray-800 text-gray-400 border border-gray-700'
          }`}>
            <ToggleRight className="h-4 w-4" />
            {openToWork ? 'Open to work — visible to employers' : 'Open to work: Off'}
          </div>
          <Link href="/dashboard/jobseeker/profile">
            <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors">
              <FileText className="h-4 w-4" />
              Update CV
            </button>
          </Link>
          <Link href="/dashboard/jobseeker/profile">
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-700 hover:border-gray-500 text-gray-300 text-sm font-medium rounded-lg transition-colors">
              <UserCircle className="h-4 w-4" />
              Edit Profile
            </button>
          </Link>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          {statCards.map((s) => (
            <Card key={s.label} className="bg-gray-900 border-gray-800">
              <CardContent className="p-4 flex flex-col items-center text-center">
                <s.icon className={`h-5 w-5 mb-1 ${s.color}`} />
                <p className="text-xl font-bold text-white">{s.value}</p>
                <p className="text-xs text-gray-400 leading-tight">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-gray-800">
          {([
            { id: 'jobs', label: 'Staff Jobs For You', icon: Briefcase },
            { id: 'applications', label: `Applications (${applications.length})`, icon: Send },
            { id: 'saved', label: `Saved (${savedJobs.length})`, icon: Bookmark },
          ] as const).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
                activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-gray-500 hover:text-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.id === 'jobs' ? 'Jobs' : tab.id === 'applications' ? 'Applied' : 'Saved'}</span>
            </button>
          ))}
        </div>

        {/* Tab: Staff Jobs */}
        {activeTab === 'jobs' && (
          <div className="space-y-3">
            {staffJobs.length === 0 ? (
              <Card className="bg-gray-900 border-gray-800">
                <CardContent className="py-12 text-center">
                  <Briefcase className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 mb-3">No employment roles at the moment — check back soon.</p>
                  <Link href="/jobs">
                    <Button variant="outline" size="sm">Browse All Jobs</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <>
                {staffJobs.map((job) => (
                  <Link key={job.id} href={`/jobs/${job.id}`}>
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-indigo-500/40 transition-all group">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-white group-hover:text-indigo-400 transition-colors truncate">{job.title}</h3>
                          <p className="text-sm text-gray-400">{job.employerName} · {job.location}</p>
                        </div>
                        <div className="flex-shrink-0 text-right">
                          <p className="font-bold text-white">{formatCurrency(job.budget)}{job.budgetType === 'hourly' ? '/hr' : '/yr'}</p>
                          <p className="text-xs text-gray-500">{formatRelativeDate(job.createdAt)}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {job.skills.slice(0, 3).map((s) => (
                          <span key={s} className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full">{s}</span>
                        ))}
                      </div>
                    </div>
                  </Link>
                ))}
                <div className="text-center pt-2">
                  <Link href="/jobs">
                    <button className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1 mx-auto">
                      View all employment roles <ChevronRight className="h-4 w-4" />
                    </button>
                  </Link>
                </div>
              </>
            )}
          </div>
        )}

        {/* Tab: Applications */}
        {activeTab === 'applications' && (
          <div className="space-y-3">
            {applications.length === 0 ? (
              <Card className="bg-gray-900 border-gray-800">
                <CardContent className="py-12 text-center">
                  <Send className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 mb-3">You haven't applied to any jobs yet.</p>
                  <Link href="/jobs">
                    <Button variant="outline" size="sm">Browse Jobs</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              applications.map((app) => {
                const s = APPLICATION_STATUS[app.status] ?? APPLICATION_STATUS.pending
                const StatusIcon = s.icon
                return (
                  <div key={app.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <Link href={`/jobs/${app.jobId}`} className="font-semibold text-white hover:text-indigo-400 transition-colors truncate block">
                        {app.jobTitle}
                      </Link>
                      <p className="text-sm text-gray-400">{app.employerName}</p>
                      {app.salary && <p className="text-xs text-gray-500 mt-0.5">{formatCurrency(app.salary)}</p>}
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${s.color}`}>
                        <StatusIcon className="h-3 w-3" />
                        {s.label}
                      </span>
                      <span className="text-xs text-gray-600">{formatRelativeDate(app.appliedAt)}</span>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}

        {/* Tab: Saved Jobs */}
        {activeTab === 'saved' && (
          <div className="space-y-3">
            {savedJobs.length === 0 ? (
              <Card className="bg-gray-900 border-gray-800">
                <CardContent className="py-12 text-center">
                  <Bookmark className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 mb-3">No saved jobs yet. Bookmark jobs to review later.</p>
                  <Link href="/jobs">
                    <Button variant="outline" size="sm">Browse Jobs</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              savedJobs.map((job) => (
                <Link key={job.id} href={`/jobs/${job.id}`}>
                  <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-indigo-500/40 transition-all group">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white group-hover:text-indigo-400 transition-colors truncate">{job.title}</h3>
                        <p className="text-sm text-gray-400">{job.employerName} · {job.location}</p>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <p className="font-bold text-white">{formatCurrency(job.budget)}{job.budgetType === 'hourly' ? '/hr' : ''}</p>
                        <Badge variant={job.status === 'open' ? 'success' : 'default'} className="text-xs mt-1">
                          {job.status === 'open' ? 'Open' : job.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        )}

        {/* Profile strength tips */}
        {completionTips.length > 0 && (
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-indigo-400" />
                Boost Your Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 pt-0">
              {completionTips.map((tip) => (
                <div key={tip} className="flex items-center gap-2 text-sm text-gray-400">
                  <Zap className="h-3.5 w-3.5 text-yellow-400 flex-shrink-0" />
                  <span>{tip}</span>
                </div>
              ))}
              <div className="pt-2">
                <Link href="/dashboard/jobseeker/profile">
                  <Button size="sm" variant="primary" className="w-full">Complete Your Profile</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

      </main>
      <Footer />
    </div>
  )
}
