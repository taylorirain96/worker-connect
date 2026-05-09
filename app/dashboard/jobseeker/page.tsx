'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { useAuth } from '@/components/providers/AuthProvider'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import {
  Briefcase, Eye, Send, Bookmark, TrendingUp, User, MapPin, DollarSign,
  ChevronRight, Zap, CalendarDays,
} from 'lucide-react'
import { formatRelativeDate } from '@/lib/utils'
import { collection, query, where, orderBy, getDocs, limit, type DocumentData } from 'firebase/firestore'
import { db } from '@/lib/firebase'

interface StaffJob {
  id: string
  title: string
  companyName: string
  location: string
  salaryMin?: number
  salaryMax?: number
  workType: string
  category: string
  postedAt: string
  saved?: boolean
}

interface MyApplication {
  id: string
  jobTitle: string
  companyName: string
  status: 'applied' | 'viewed' | 'shortlisted' | 'rejected' | 'hired'
  appliedAt: string
}

const APPLICATION_STATUS: Record<string, { label: string; color: string }> = {
  applied:     { label: 'Applied',     color: 'bg-blue-500/20 text-blue-300 border border-blue-500/30' },
  viewed:      { label: 'Viewed',      color: 'bg-purple-500/20 text-purple-300 border border-purple-500/30' },
  shortlisted: { label: 'Shortlisted', color: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' },
  rejected:    { label: 'Rejected',    color: 'bg-red-500/20 text-red-300 border border-red-500/30' },
  hired:       { label: 'Hired 🎉',    color: 'bg-green-500/20 text-green-300 border border-green-500/30' },
}

function formatSalary(job: StaffJob) {
  if (!job.salaryMin) return 'Salary negotiable'
  if (job.workType === 'part-time') return `$${job.salaryMin}–$${job.salaryMax}/hr`
  return `$${(job.salaryMin / 1000).toFixed(0)}k–$${(job.salaryMax! / 1000).toFixed(0)}k/yr`
}

function profileCompletionScore(profile: Record<string, unknown> | null): number {
  if (!profile) return 0
  // Fields a jobseeker can realistically fill in to show profile completeness
  const checks: [string, (v: unknown) => boolean][] = [
    ['displayName', (v) => typeof v === 'string' && v.trim().length > 0],
    ['bio', (v) => typeof v === 'string' && v.trim().length > 0],
    ['location', (v) => typeof v === 'string' && v.trim().length > 0],
    ['skills', (v) => Array.isArray(v) && v.length > 0],
    ['cvFileName', (v) => typeof v === 'string' && v.trim().length > 0],
    ['headline', (v) => typeof v === 'string' && v.trim().length > 0],
  ]
  const filled = checks.filter(([key, test]) => test(profile[key])).length
  return Math.round((filled / checks.length) * 100)
}

export default function JobseekerDashboardPage() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()
  const [jobs, setJobs] = useState<StaffJob[]>([])
  const [applications, setApplications] = useState<MyApplication[]>([])
  const [savedJobs, setSavedJobs] = useState<StaffJob[]>([])
  const [loadingJobs, setLoadingJobs] = useState(true)
  const [loadingApps, setLoadingApps] = useState(true)

  useEffect(() => {
    if (!loading && !user) router.push('/auth/login')
    if (!loading && user && profile?.role && profile.role !== 'jobseeker') router.push('/dashboard')
  }, [loading, user, profile, router])

  useEffect(() => {
    if (!user) return
    const fetchJobs = async () => {
      try {
        if (!db) { setJobs([]); return }
        const q = query(
          collection(db, 'jobs'),
          where('jobType', '==', 'staff'),
          orderBy('createdAt', 'desc'),
          limit(6),
        )
        const snap = await getDocs(q)
        if (snap.empty) { setJobs([]); return }
        const fetched: StaffJob[] = snap.docs.map((d) => {
          const data = d.data() as DocumentData
          return {
            id: d.id,
            title: data.title ?? '',
            companyName: data.companyName ?? data.employerName ?? 'Unknown',
            location: data.location ?? '',
            salaryMin: data.salaryMin,
            salaryMax: data.salaryMax,
            workType: data.workType ?? 'full-time',
            category: data.category ?? 'general',
            postedAt: data.createdAt?.toDate?.()?.toISOString?.() ?? new Date().toISOString(),
          }
        })
        setJobs(fetched)
      } catch {
        setJobs([])
      } finally {
        setLoadingJobs(false)
      }
    }
    fetchJobs()
  }, [user])

  useEffect(() => {
    if (!user) return
    const fetchApps = async () => {
      try {
        if (!db) { setApplications([]); return }
        const q = query(
          collection(db, 'jobApplications'),
          where('applicantId', '==', user.uid),
          orderBy('appliedAt', 'desc'),
          limit(10),
        )
        const snap = await getDocs(q)
        if (snap.empty) { setApplications([]); return }
        const fetched: MyApplication[] = snap.docs.map((d) => {
          const data = d.data() as DocumentData
          return {
            id: d.id,
            jobTitle: data.jobTitle ?? '',
            companyName: data.companyName ?? '',
            status: data.status ?? 'applied',
            appliedAt: data.appliedAt?.toDate?.()?.toISOString?.() ?? new Date().toISOString(),
          }
        })
        setApplications(fetched)
      } catch {
        setApplications([])
      } finally {
        setLoadingApps(false)
      }
    }
    fetchApps()
  }, [user])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0f1e]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const completionPct = profileCompletionScore(profile as Record<string, unknown> | null)
  const isProfileIncomplete = completionPct < 80

  const appStats = {
    sent: applications.length,
    views: '—' as number | string,
    responseRate: applications.length > 0
      ? Math.round((applications.filter((a) => a.status !== 'applied').length / applications.length) * 100)
      : 0,
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#0a0f1e]">
      <Navbar />
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8 space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Welcome back, {profile?.displayName?.split(' ')[0] ?? 'there'} 👋
            </h1>
            <p className="text-slate-400 text-sm mt-1">Your job search dashboard</p>
          </div>
          <div className="flex gap-3">
            <Link href="/jobs/staff">
              <Button variant="outline" size="sm">
                <Briefcase className="h-4 w-4 mr-2" />
                Browse Jobs
              </Button>
            </Link>
            <Link href="/profile/jobseeker">
              <Button size="sm">
                <User className="h-4 w-4 mr-2" />
                My Profile
              </Button>
            </Link>
          </div>
        </div>

        {/* Profile completion nudge */}
        {isProfileIncomplete && (
          <Card className="border-indigo-500/40 bg-indigo-500/5">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-white">Profile Completion</span>
                    <span className="text-sm font-bold text-indigo-400">{completionPct}%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-indigo-500 to-violet-500 h-2 rounded-full transition-all"
                      style={{ width: `${completionPct}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-2">
                    Complete your profile to get seen by more employers — profiles at 100% get <strong className="text-white">3× more views</strong>.
                  </p>
                </div>
                <Link href="/profile/jobseeker">
                  <Button size="sm">
                    Complete Profile
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[
            { label: 'Applications Sent', value: appStats.sent, icon: Send, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
            { label: 'Profile Views (week)', value: appStats.views, icon: Eye, color: 'text-purple-400', bg: 'bg-purple-500/10' },
            { label: 'Response Rate', value: `${appStats.responseRate}%`, icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <Card key={label} className="border-slate-700/60 bg-slate-800/40">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`h-10 w-10 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`h-5 w-5 ${color}`} />
                </div>
                <div>
                  <div className="text-xl font-bold text-white">{value}</div>
                  <div className="text-xs text-slate-400">{label}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Jobs For You */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-400" />
                Jobs For You
              </h2>
              <Link href="/jobs/staff" className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                See all <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            {loadingJobs ? (
              <div className="flex justify-center py-8"><LoadingSpinner /></div>
            ) : jobs.length === 0 ? (
              <Card className="border-slate-700/60 bg-slate-800/40">
                <CardContent className="p-8 text-center">
                  <Briefcase className="h-10 w-10 text-slate-500 mx-auto mb-3" />
                  <p className="text-slate-300 font-medium mb-1">No jobs to show right now</p>
                  <p className="text-sm text-slate-500 mb-4">New roles are posted daily — check back soon, or browse the full list.</p>
                  <Link href="/jobs/staff">
                    <Button size="sm">Browse all jobs</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {jobs.map((job) => (
                  <Card key={job.id} className="border-slate-700/60 bg-slate-800/40 hover:border-indigo-500/40 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-white truncate">{job.title}</div>
                          <div className="text-sm text-slate-400 flex items-center gap-3 mt-1 flex-wrap">
                            <span className="flex items-center gap-1">
                              <Briefcase className="h-3.5 w-3.5" />
                              {job.companyName}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5" />
                              {job.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <DollarSign className="h-3.5 w-3.5" />
                              {formatSalary(job)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700/60 text-slate-300 capitalize">{job.workType}</span>
                            <span className="text-xs text-slate-500">{formatRelativeDate(job.postedAt)}</span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 flex-shrink-0">
                          <Link href={`/jobs/staff?id=${job.id}`}>
                            <Button size="sm">
                              <Zap className="h-3.5 w-3.5 mr-1" />
                              Quick Apply
                            </Button>
                          </Link>
                          <button
                            onClick={() => setSavedJobs((prev) =>
                              prev.some((s) => s.id === job.id) ? prev.filter((s) => s.id !== job.id) : [...prev, job]
                            )}
                            className="flex items-center justify-center h-8 px-3 rounded-lg border border-slate-600 hover:border-rose-400/60 text-slate-400 hover:text-rose-400 transition-colors text-xs gap-1"
                          >
                            <Bookmark
                              className={`h-3.5 w-3.5 ${savedJobs.some((s) => s.id === job.id) ? 'fill-rose-400 text-rose-400' : ''}`}
                            />
                            {savedJobs.some((s) => s.id === job.id) ? 'Saved' : 'Save'}
                          </button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">

            {/* My Applications */}
            <Card className="border-slate-700/60 bg-slate-800/40">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Send className="h-4 w-4 text-indigo-400" />
                  My Applications
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                {loadingApps ? (
                  <div className="flex justify-center py-4"><LoadingSpinner size="sm" /></div>
                ) : applications.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-4">No applications yet. <Link href="/jobs/staff" className="text-indigo-400 hover:underline">Find jobs →</Link></p>
                ) : (
                  <div className="space-y-3">
                    {applications.slice(0, 5).map((app) => {
                      const cfg = APPLICATION_STATUS[app.status] ?? APPLICATION_STATUS.applied
                      return (
                        <div key={app.id} className="flex items-start gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-white truncate">{app.jobTitle}</div>
                            <div className="text-xs text-slate-500 truncate">{app.companyName}</div>
                            <div className="text-xs text-slate-500 mt-0.5">{formatRelativeDate(app.appliedAt)}</div>
                          </div>
                          <span className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${cfg.color}`}>{cfg.label}</span>
                        </div>
                      )
                    })}
                    {applications.length > 5 && (
                      <p className="text-xs text-slate-500 text-center pt-1">+ {applications.length - 5} more</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Saved Jobs */}
            <Card className="border-slate-700/60 bg-slate-800/40">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Bookmark className="h-4 w-4 text-rose-400" />
                  Saved Jobs
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                {savedJobs.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-4">Save jobs to review them later.</p>
                ) : (
                  <div className="space-y-3">
                    {savedJobs.map((job) => (
                      <div key={job.id} className="flex items-center justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-white truncate">{job.title}</div>
                          <div className="text-xs text-slate-500 truncate">{job.companyName}</div>
                        </div>
                        <Link href={`/jobs/staff?id=${job.id}`}>
                          <Button variant="outline" size="sm">Apply</Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Availability nudge */}
            <Card className="border-slate-700/60 bg-slate-800/40">
              <CardContent className="p-4 flex items-center gap-3">
                <CalendarDays className="h-8 w-8 text-green-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-white">Set your availability</div>
                  <div className="text-xs text-slate-400 mt-0.5">Let employers know when you can start</div>
                </div>
                <Link href="/profile/jobseeker#availability">
                  <Button variant="outline" size="sm">Update</Button>
                </Link>
              </CardContent>
            </Card>

          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
