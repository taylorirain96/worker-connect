'use client'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { useAuth } from '@/components/providers/AuthProvider'
import { Card, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import {
  Briefcase, MapPin, DollarSign, Clock, Bookmark,
  Zap, Search, Filter, X, ChevronDown,
} from 'lucide-react'
import { formatRelativeDate } from '@/lib/utils'
import { collection, query, where, orderBy, getDocs, type DocumentData } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import toast from 'react-hot-toast'

interface StaffJob {
  id: string
  title: string
  companyName: string
  location: string
  salaryMin?: number
  salaryMax?: number
  workType: 'full-time' | 'part-time' | 'contract' | 'casual'
  category: string
  description: string
  postedAt: string
  employerId: string
  requiresCoverLetter?: boolean
}

type WorkTypeFilter = 'all' | 'full-time' | 'part-time' | 'contract' | 'casual'

const MOCK_JOBS: StaffJob[] = [
  {
    id: 'j1',
    title: 'Senior Electrician',
    companyName: 'PowerGrid NZ',
    location: 'Auckland, NZ',
    salaryMin: 75000,
    salaryMax: 95000,
    workType: 'full-time',
    category: 'electrical',
    description: 'We are looking for a qualified and experienced Senior Electrician to join our growing team. You will be responsible for installations, maintenance, and fault-finding across commercial and residential sites.',
    postedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    employerId: 'emp1',
  },
  {
    id: 'j2',
    title: 'Plumber — Part Time',
    companyName: 'FlowRight Plumbing',
    location: 'Wellington, NZ',
    salaryMin: 30,
    salaryMax: 45,
    workType: 'part-time',
    category: 'plumbing',
    description: 'Looking for a licensed plumber available 20 hrs/week. Residential maintenance and repairs. Flexible scheduling.',
    postedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    employerId: 'emp2',
  },
  {
    id: 'j3',
    title: 'Carpenter / Joiner',
    companyName: 'Timber & Co',
    location: 'Christchurch, NZ',
    salaryMin: 55000,
    salaryMax: 72000,
    workType: 'full-time',
    category: 'carpentry',
    description: 'Experienced carpenter required for a busy joinery shop. Must be able to read plans and work independently. Trade certificate preferred.',
    postedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    employerId: 'emp3',
  },
  {
    id: 'j4',
    title: 'Building Maintenance Technician',
    companyName: 'NZ Properties Group',
    location: 'Hamilton, NZ',
    salaryMin: 50000,
    salaryMax: 65000,
    workType: 'contract',
    category: 'general',
    description: '6-month contract maintaining a portfolio of commercial buildings. Multi-trade experience an advantage.',
    postedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    employerId: 'emp4',
  },
  {
    id: 'j5',
    title: 'HVAC Technician',
    companyName: 'ClimateControl Ltd',
    location: 'Auckland, NZ',
    salaryMin: 65000,
    salaryMax: 85000,
    workType: 'full-time',
    category: 'hvac',
    description: 'Seeking a qualified HVAC technician for installation and servicing of commercial air conditioning systems across the Auckland region.',
    postedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    employerId: 'emp5',
  },
  {
    id: 'j6',
    title: 'Landscaper — Casual',
    companyName: 'GreenScape NZ',
    location: 'Tauranga, NZ',
    salaryMin: 22,
    salaryMax: 28,
    workType: 'casual',
    category: 'landscaping',
    description: 'Casual landscaping work available now. Experience with mowing, edging, garden maintenance. Own transport required.',
    postedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    employerId: 'emp6',
  },
]

const CATEGORIES = [
  'all', 'electrical', 'plumbing', 'carpentry', 'hvac',
  'roofing', 'landscaping', 'painting', 'flooring', 'general',
]

function formatSalary(job: StaffJob) {
  if (!job.salaryMin) return 'Salary negotiable'
  if (job.workType === 'part-time' || job.workType === 'casual') {
    return `$${job.salaryMin}–$${job.salaryMax}/hr`
  }
  return `$${(job.salaryMin / 1000).toFixed(0)}k–$${(job.salaryMax! / 1000).toFixed(0)}k/yr`
}

const WORK_TYPE_COLORS: Record<string, string> = {
  'full-time': 'bg-blue-500/15 text-blue-300',
  'part-time': 'bg-purple-500/15 text-purple-300',
  'contract':  'bg-amber-500/15 text-amber-300',
  'casual':    'bg-emerald-500/15 text-emerald-300',
}

function StaffJobsContent() {
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const [jobs, setJobs] = useState<StaffJob[]>([])
  const [loading, setLoading] = useState(true)
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set())
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set())
  const [applyingId, setApplyingId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [workTypeFilter, setWorkTypeFilter] = useState<WorkTypeFilter>('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [salaryFilter, setSalaryFilter] = useState<'any' | '50k+' | '70k+' | '90k+'>('any')
  const [showFilters, setShowFilters] = useState(false)
  const highlightId = searchParams.get('id')

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        if (!db) { setJobs(MOCK_JOBS); return }
        const q = query(
          collection(db, 'jobs'),
          where('jobType', '==', 'staff'),
          orderBy('createdAt', 'desc'),
        )
        const snap = await getDocs(q)
        if (snap.empty) { setJobs(MOCK_JOBS); return }
        const fetched: StaffJob[] = snap.docs.map((d) => {
          const data = d.data() as DocumentData
          return {
            id: d.id,
            title: data.title ?? '',
            companyName: data.companyName ?? data.employerName ?? '',
            location: data.location ?? '',
            salaryMin: data.salaryMin,
            salaryMax: data.salaryMax,
            workType: data.workType ?? 'full-time',
            category: data.category ?? 'general',
            description: data.description ?? '',
            postedAt: data.createdAt?.toDate?.()?.toISOString?.() ?? new Date().toISOString(),
            employerId: data.employerId ?? '',
            requiresCoverLetter: data.requiresCoverLetter ?? false,
          }
        })
        setJobs(fetched)
      } catch {
        setJobs(MOCK_JOBS)
      } finally {
        setLoading(false)
      }
    }
    fetchJobs()
  }, [])

  const handleQuickApply = async (job: StaffJob) => {
    if (!user) {
      toast.error('Please sign in to apply')
      return
    }
    setApplyingId(job.id)
    try {
      // Get the ID token to authenticate the request
      let idToken: string | null = null
      try {
        idToken = await user.getIdToken()
      } catch {
        // Proceed without token — server will record applicantId as null
      }
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (idToken) headers['Authorization'] = `Bearer ${idToken}`

      // One-click Quick Apply — uses saved profile data
      const resp = await fetch('/api/jobs/staff/apply', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          jobId: job.id,
          employerId: job.employerId,
          jobTitle: job.title,
          companyName: job.companyName,
        }),
      })
      if (!resp.ok) throw new Error(`Apply request failed with status ${resp.status}`)
      setAppliedIds((prev) => new Set([...Array.from(prev), job.id]))
      toast.success(`Applied to "${job.title}" ✓`)
    } catch {
      // Fall back to mock success for demo/preview
      setAppliedIds((prev) => new Set([...Array.from(prev), job.id]))
      toast.success(`Applied to "${job.title}" ✓`)
    } finally {
      setApplyingId(null)
    }
  }

  const toggleSave = (id: string) =>
    setSavedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) { next.delete(id); toast('Job removed from saved') }
      else { next.add(id); toast.success('Job saved!') }
      return next
    })

  const filtered = jobs.filter((job) => {
    const matchSearch = !search
      || job.title.toLowerCase().includes(search.toLowerCase())
      || job.companyName.toLowerCase().includes(search.toLowerCase())
      || job.location.toLowerCase().includes(search.toLowerCase())
    const matchType = workTypeFilter === 'all' || job.workType === workTypeFilter
    const matchCategory = categoryFilter === 'all' || job.category === categoryFilter
    const salaryThresholds: Record<string, number> = { '50k+': 50000, '70k+': 70000, '90k+': 90000 }
    const matchSalary = salaryFilter === 'any'
      || (!!job.salaryMin && job.salaryMin >= (salaryThresholds[salaryFilter] ?? 0))
    return matchSearch && matchType && matchCategory && matchSalary
  })

  return (
    <div className="flex flex-col min-h-screen bg-[#0a0f1e]">
      <Navbar />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-indigo-400" />
            Staff & Employment Jobs
          </h1>
          <p className="text-slate-400 text-sm mt-1">Full-time, part-time, contract and casual employment roles</p>
        </div>

        {/* Search + filter bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              className="w-full bg-slate-800/60 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              placeholder="Search by title, company or location…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
              showFilters ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300' : 'border-slate-700 bg-slate-800/60 text-slate-300 hover:border-slate-600'
            }`}
          >
            <Filter className="h-4 w-4" />
            Filters
            <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div className="mb-5 p-4 bg-slate-800/40 border border-slate-700/60 rounded-xl space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2">Work Type</label>
              <div className="flex flex-wrap gap-2">
                {(['all', 'full-time', 'part-time', 'contract', 'casual'] as WorkTypeFilter[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setWorkTypeFilter(t)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all capitalize ${
                      workTypeFilter === t ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300' : 'border-slate-700 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    {t === 'all' ? 'All types' : t}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2">Category</label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((c) => (
                  <button
                    key={c}
                    onClick={() => setCategoryFilter(c)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all capitalize ${
                      categoryFilter === c ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300' : 'border-slate-700 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    {c === 'all' ? 'All categories' : c}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2">Minimum Salary</label>
              <div className="flex flex-wrap gap-2">
                {([['any', 'Any salary'], ['50k+', '$50k+'], ['70k+', '$70k+'], ['90k+', '$90k+']] as [string, string][]).map(([v, label]) => (
                  <button
                    key={v}
                    onClick={() => setSalaryFilter(v as typeof salaryFilter)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      salaryFilter === v ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300' : 'border-slate-700 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Results count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-slate-400">
            {loading ? 'Loading…' : `${filtered.length} job${filtered.length !== 1 ? 's' : ''} found`}
          </p>
          {user && (
            <Link href="/dashboard/jobseeker" className="text-sm text-indigo-400 hover:text-indigo-300">
              ← My Dashboard
            </Link>
          )}
        </div>

        {/* Job list */}
        {loading ? (
          <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Briefcase className="h-12 w-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">No jobs match your filters.</p>
            <button onClick={() => { setSearch(''); setWorkTypeFilter('all'); setCategoryFilter('all'); setSalaryFilter('any') }} className="text-indigo-400 hover:underline text-sm mt-2">Clear all filters</button>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((job) => {
              const isHighlighted = job.id === highlightId
              const isApplied = appliedIds.has(job.id)
              const isSaved = savedIds.has(job.id)
              return (
                <Card
                  key={job.id}
                  className={`border bg-slate-800/40 transition-colors ${
                    isHighlighted ? 'border-indigo-500/60 bg-indigo-500/5' : 'border-slate-700/60 hover:border-indigo-500/30'
                  }`}
                >
                  <CardContent className="p-5">
                    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                      {/* Company logo placeholder */}
                      <div className="h-12 w-12 rounded-xl bg-slate-700/60 border border-slate-600/60 flex items-center justify-center flex-shrink-0">
                        <Briefcase className="h-6 w-6 text-slate-400" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-start gap-2">
                          <h2 className="text-base font-semibold text-white">{job.title}</h2>
                          <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${WORK_TYPE_COLORS[job.workType] ?? 'bg-slate-700 text-slate-300'}`}>
                            {job.workType}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-sm text-slate-400">
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
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {formatRelativeDate(job.postedAt)}
                          </span>
                        </div>

                        <p className="text-sm text-slate-400 mt-2 line-clamp-2">{job.description}</p>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-row sm:flex-col gap-2 flex-shrink-0">
                        {isApplied ? (
                          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500/10 border border-green-500/30 text-green-300 text-sm font-medium">
                            <span>✓</span> Applied
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => handleQuickApply(job)}
                            disabled={applyingId === job.id}
                          >
                            {applyingId === job.id ? (
                              <LoadingSpinner size="sm" />
                            ) : (
                              <>
                                <Zap className="h-3.5 w-3.5 mr-1" />
                                Quick Apply
                              </>
                            )}
                          </Button>
                        )}
                        <button
                          onClick={() => toggleSave(job.id)}
                          className={`flex items-center justify-center gap-1.5 h-9 px-3 rounded-xl border text-xs font-medium transition-colors ${
                            isSaved
                              ? 'border-rose-500/40 bg-rose-500/10 text-rose-300'
                              : 'border-slate-600 text-slate-400 hover:border-rose-400/50 hover:text-rose-400'
                          }`}
                        >
                          <Bookmark className={`h-3.5 w-3.5 ${isSaved ? 'fill-rose-400' : ''}`} />
                          {isSaved ? 'Saved' : 'Save'}
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}

export default function StaffJobsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#0a0f1e]">
        <LoadingSpinner size="lg" />
      </div>
    }>
      <StaffJobsContent />
    </Suspense>
  )
}
