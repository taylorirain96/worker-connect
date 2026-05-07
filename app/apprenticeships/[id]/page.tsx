'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { useAuth } from '@/components/providers/AuthProvider'
import Button from '@/components/ui/Button'
import toast from 'react-hot-toast'
import { MapPin, Clock, DollarSign, ArrowLeft, GraduationCap } from 'lucide-react'
import { formatCurrency, formatRelativeDate } from '@/lib/utils'
import type { Job } from '@/types'
import Link from 'next/link'
import { db } from '@/lib/firebase'
import { doc, getDoc, type DocumentData } from 'firebase/firestore'
import { applyToJob, getApplicationId } from '@/lib/applications'

function toISO(v: unknown): string {
  if (v && typeof v === 'object' && 'toDate' in v) {
    return (v as { toDate: () => Date }).toDate().toISOString()
  }
  return typeof v === 'string' ? v : new Date().toISOString()
}

function docToJob(id: string, data: DocumentData): Job {
  return { ...data, id, createdAt: toISO(data.createdAt), updatedAt: toISO(data.updatedAt) } as Job
}

export default function ApprenticeshipDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { user, profile } = useAuth()
  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [applying, setApplying] = useState(false)
  const [applicationId, setApplicationId] = useState<string | null>(null)

  useEffect(() => {
    if (!db || !id) { setLoading(false); return }
    async function fetchJob() {
      const snap = await getDoc(doc(db!, 'jobs', id))
      if (!snap.exists() || snap.data()?.category !== 'apprenticeship') {
        setNotFound(true)
      } else {
        const j = docToJob(snap.id, snap.data() as DocumentData)
        setJob(j)
        if (user) {
          const appId = await getApplicationId(j.id, user.uid)
          setApplicationId(appId)
        }
      }
      setLoading(false)
    }
    fetchJob().catch(() => { setNotFound(true); setLoading(false) })
  }, [id, user])

  const handleApply = async () => {
    if (!user || !job) {
      router.push('/auth/login?redirect=/apprenticeships/' + id)
      return
    }
    setApplying(true)
    try {
      const appId = await applyToJob(
        job.id,
        {
          title: job.title,
          employerId: job.employerId,
          employerName: job.employerName,
        },
        {
          uid: user.uid,
          displayName: profile?.displayName ?? user.displayName ?? 'Applicant',
          photoURL: profile?.photoURL ?? user.photoURL ?? undefined,
          rating: profile?.rating,
        },
        'I am interested in this apprenticeship opportunity.',
      )
      setApplicationId(appId)
      toast.success('Application submitted!')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to apply')
    } finally {
      setApplying(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen luxury-bg">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="h-8 w-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </main>
        <Footer />
      </div>
    )
  }

  if (notFound || !job) {
    return (
      <div className="flex flex-col min-h-screen luxury-bg">
        <Navbar />
        <main className="flex-1">
          <div className="max-w-3xl mx-auto px-4 py-10">
            <Link href="/apprenticeships" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 text-sm">
              <ArrowLeft className="h-4 w-4" />
              Back to Apprenticeships
            </Link>
            <div className="rounded-xl border border-slate-700 bg-slate-900 p-12 text-center">
              <p className="text-lg font-semibold text-white mb-2">Listing not found</p>
              <p className="text-slate-400 text-sm">This apprenticeship listing does not exist or has been closed.</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen luxury-bg">
      <Navbar />
      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <Link href="/apprenticeships" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 text-sm transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Apprenticeships
          </Link>

          <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-6 mb-6">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-3">
                  <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/20 font-medium">
                    <GraduationCap className="h-3.5 w-3.5" />
                    Apprenticeship
                  </span>
                  {job.status === 'open' && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-green-900/30 text-green-400 border border-green-500/20">
                      Open
                    </span>
                  )}
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">{job.title}</h1>
                <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                  {job.location && (
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4" />
                      {job.location}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <DollarSign className="h-4 w-4" />
                    {formatCurrency(job.budget, 'NZD')}{job.budgetType === 'hourly' ? '/hr' : ' fixed'}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    {formatRelativeDate(job.createdAt)}
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="border-t border-slate-700/50 pt-5">
              <h2 className="font-semibold text-white mb-3">About this Opportunity</h2>
              <p className="text-slate-400 text-sm leading-relaxed whitespace-pre-wrap">{job.description}</p>
            </div>

            {/* Skills */}
            {job.skills && job.skills.length > 0 && (
              <div className="border-t border-slate-700/50 pt-5 mt-5">
                <h2 className="font-semibold text-white mb-3">Required Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill) => (
                    <span key={skill} className="text-xs px-3 py-1.5 rounded-full bg-indigo-900/30 border border-indigo-500/20 text-indigo-300">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Apply */}
            <div className="border-t border-slate-700/50 pt-5 mt-5">
              {applicationId ? (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-green-900/20 border border-green-500/30">
                  <span className="text-green-400">✓</span>
                  <p className="text-sm text-green-300 font-medium">You have applied for this apprenticeship.</p>
                </div>
              ) : (
                <Button
                  onClick={handleApply}
                  loading={applying}
                  disabled={applying || job.status !== 'open'}
                  className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold py-3"
                >
                  <GraduationCap className="h-4 w-4 mr-2" />
                  Apply for this Apprenticeship
                </Button>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
