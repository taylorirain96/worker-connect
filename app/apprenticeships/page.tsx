import type { Metadata } from 'next'
import { collection, query, where, orderBy, getDocs, type DocumentData } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'
import { GraduationCap, MapPin, DollarSign, Clock, Briefcase } from 'lucide-react'
import { SITE_URL } from '@/lib/seo/config'
import type { Job } from '@/types'
import { formatRelativeDate } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Apprenticeships in NZ — Start Your Trade Career | QuickTrade',
  description:
    'Browse apprenticeship opportunities across New Zealand. Find entry-level trade roles in plumbing, electrical, carpentry, and more. Start your trade career today.',
  alternates: { canonical: `${SITE_URL}/apprenticeships` },
  openGraph: {
    title: 'Apprenticeships in NZ — Start Your Trade Career | QuickTrade',
    description: 'Browse apprenticeship opportunities across New Zealand.',
    url: `${SITE_URL}/apprenticeships`,
    type: 'website',
  },
}

function toISO(v: unknown): string {
  if (v && typeof v === 'object' && 'toDate' in v) {
    return (v as { toDate: () => Date }).toDate().toISOString()
  }
  return typeof v === 'string' ? v : new Date().toISOString()
}

function docToJob(id: string, data: DocumentData): Job {
  return {
    ...data,
    id,
    createdAt: toISO(data.createdAt),
    updatedAt: toISO(data.updatedAt),
  } as Job
}

async function getApprenticeships(): Promise<Job[]> {
  if (!db) return []
  try {
    const q = query(
      collection(db, 'jobs'),
      where('category', '==', 'apprenticeship'),
      where('status', '==', 'open'),
      orderBy('createdAt', 'desc'),
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map((d) => docToJob(d.id, d.data()))
  } catch {
    return []
  }
}

export default async function ApprenticeshipsPage() {
  const jobs = await getApprenticeships()

  return (
    <div className="flex flex-col min-h-screen luxury-bg">
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <section
          className="relative overflow-hidden py-20 px-4"
          style={{ background: 'linear-gradient(135deg, #0a0f1e 0%, #111827 60%, #0a0f1e 100%)' }}
        >
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-sm font-medium mb-6">
              <GraduationCap className="h-4 w-4" />
              Trade Apprenticeships NZ
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-5 tracking-tight">
              Start Your{' '}
              <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                Trade Career in NZ
              </span>
            </h1>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-8">
              Discover apprenticeship opportunities across New Zealand. Learn a trade, earn a wage,
              and build a career that lasts a lifetime.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth/register"
                className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold transition-all"
              >
                Register to Apply
              </Link>
              <Link
                href="/jobs/create"
                className="px-8 py-3.5 rounded-xl border border-slate-600 hover:border-slate-500 text-slate-300 hover:text-white font-semibold transition-all"
              >
                Post an Apprenticeship
              </Link>
            </div>
          </div>
        </section>

        {/* Info callouts */}
        <section className="py-12 px-4 border-b border-slate-800">
          <div className="max-w-5xl mx-auto grid sm:grid-cols-3 gap-6">
            {[
              {
                icon: GraduationCap,
                title: 'Earn While You Learn',
                desc: 'Apprentices are paid employees from day one. No student debt required.',
              },
              {
                icon: Briefcase,
                title: 'Industry-Recognised',
                desc: 'NZ Apprenticeship qualifications are recognised across Australia and beyond.',
              },
              {
                icon: Clock,
                title: '3–4 Year Programme',
                desc: 'Most trade apprenticeships take 3–4 years to complete to journeyman level.',
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-4 p-5 rounded-xl bg-slate-900/60 border border-slate-700/50">
                <div className="h-10 w-10 rounded-xl bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
                  <Icon className="h-5 w-5 text-indigo-400" />
                </div>
                <div>
                  <p className="font-semibold text-white text-sm mb-1">{title}</p>
                  <p className="text-xs text-slate-400 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Job Listings */}
        <section className="py-14 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">
                {jobs.length > 0 ? `${jobs.length} Apprenticeship${jobs.length !== 1 ? 's' : ''} Available` : 'No Apprenticeships Yet'}
              </h2>
            </div>

            {jobs.length === 0 ? (
              <div className="text-center py-16 rounded-xl border border-slate-700/50 bg-slate-900/40">
                <GraduationCap className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400 font-medium mb-2">No apprenticeships listed yet</p>
                <p className="text-slate-500 text-sm mb-6">Be the first to post an apprenticeship opportunity.</p>
                <Link
                  href="/jobs/create"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-colors"
                >
                  Post an Apprenticeship
                </Link>
              </div>
            ) : (
              <div className="grid gap-4">
                {jobs.map((job) => (
                  <Link
                    key={job.id}
                    href={`/apprenticeships/${job.id}`}
                    className="block p-5 rounded-xl bg-slate-900/60 border border-slate-700/50 hover:border-indigo-500/40 hover:shadow-[0_0_16px_rgba(99,102,241,0.1)] transition-all duration-200"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/20 font-medium">
                            🎓 Apprenticeship
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            job.urgency === 'emergency' ? 'bg-red-900/30 text-red-300' :
                            job.urgency === 'high' ? 'bg-amber-900/30 text-amber-300' :
                            'bg-slate-700 text-slate-400'
                          }`}>
                            {job.urgency === 'emergency' ? '🚨 Urgent' : job.urgency === 'high' ? '⚡ High Priority' : '📅 Standard'}
                          </span>
                        </div>
                        <h3 className="font-semibold text-white text-lg mb-1">{job.title}</h3>
                        <p className="text-slate-400 text-sm line-clamp-2 mb-3">{job.description}</p>
                        <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                          {job.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5" />
                              {job.location}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-3.5 w-3.5" />
                            ${job.budget}{job.budgetType === 'hourly' ? '/hr' : ' fixed'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {formatRelativeDate(job.createdAt)}
                          </span>
                        </div>
                      </div>
                      <div className="text-indigo-400 text-sm font-medium shrink-0">View →</div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
