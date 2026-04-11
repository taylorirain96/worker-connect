'use client'
import { Sparkles, Check, X } from 'lucide-react'
import Link from 'next/link'

interface AIAddonPromptProps {
  role: 'worker' | 'employer'
  context: 'bio' | 'cv' | 'cover_letter' | 'job_post'
  onClose: () => void
}

const CONTEXT_COPY: Record<string, { headline: string; sub: string }> = {
  bio: {
    headline: 'Let AI write your profile bio',
    sub: 'Answer 3 quick questions and get a professional bio in seconds. Workers with strong bios get hired more often.',
  },
  cv: {
    headline: 'Build your CV with AI',
    sub: 'Get a professional, ready-to-send CV based on your skills and experience — no writing needed.',
  },
  cover_letter: {
    headline: 'Write a tailored cover letter with AI',
    sub: 'AI reads the job description and writes a cover letter that actually fits — in seconds.',
  },
  job_post: {
    headline: 'Write your job post with AI',
    sub: 'Answer 2 quick questions and get a professional job description that attracts the right workers.',
  },
}

const WORKER_FEATURES = [
  'Profile bio writer',
  'AI CV builder',
  'Cover letter on every job application',
  'Never expires — yours to keep',
]

const EMPLOYER_FEATURES = [
  'Unlimited AI job post writing',
  'Better job posts = better applicants',
  'Never expires — yours to keep',
]

export default function AIAddonPrompt({ role, context, onClose }: AIAddonPromptProps) {
  const copy = CONTEXT_COPY[context]
  const features = role === 'worker' ? WORKER_FEATURES : EMPLOYER_FEATURES

  return (
    <div className="bg-indigo-950/60 border border-indigo-500/40 rounded-xl p-5 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-indigo-200 flex items-center gap-1.5 mb-1">
            <Sparkles className="h-4 w-4" /> {copy.headline}
          </p>
          <p className="text-xs text-slate-400 leading-relaxed">{copy.sub}</p>
        </div>
        <button onClick={onClose} className="text-slate-500 hover:text-slate-300 flex-shrink-0 mt-0.5">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Pricing box */}
      <div className="rounded-lg bg-indigo-900/40 border border-indigo-500/30 p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-white font-semibold text-sm flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            AI Writing Add-on
          </p>
          <p className="text-white font-bold">$9.99 <span className="text-slate-400 font-normal text-xs">one-off</span></p>
        </div>
        <ul className="space-y-1.5 mb-1">
          {features.map(f => (
            <li key={f} className="flex items-center gap-2 text-xs text-slate-300">
              <Check className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
              {f}
            </li>
          ))}
        </ul>
      </div>

      {/* CTA */}
      <div className="space-y-2">
        <Link
          href="/pricing#addons"
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors"
        >
          <Sparkles className="h-4 w-4" />
          Unlock AI Writing — $9.99
        </Link>
        <p className="text-center text-xs text-slate-500">
          Instant access · One-off payment · No subscription needed
        </p>
        {/* Subtle Pro upsell */}
        <p className="text-center text-xs text-slate-600">
          Or get AI + everything else with{' '}
          <Link href="/pricing#workers" className="text-indigo-400 hover:text-indigo-300 underline">
            {role === 'worker' ? 'Worker Pro ($19/mo)' : 'Employer Pro ($49/mo)'}
          </Link>
        </p>
      </div>
    </div>
  )
}
