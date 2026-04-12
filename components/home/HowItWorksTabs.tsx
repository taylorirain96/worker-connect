'use client'

import { useState } from 'react'
import { ArrowRight, FileText, Users, CheckCircle, Crown, Search, Zap, UserCheck, Briefcase } from 'lucide-react'
import GlowButton from '@/components/luxury/GlowButton'

const PATHS = [
  {
    id: 'tradie',
    label: '🔨 I\'m a Tradie',
    color: 'from-orange-500 to-orange-600',
    accentColor: 'text-orange-400',
    borderColor: 'border-orange-500/30',
    bgColor: 'bg-orange-500/10',
    steps: [
      {
        step: '01',
        title: 'Create Your Profile',
        description: 'Showcase your skills, trade, and location so clients can find you.',
        icon: Crown,
      },
      {
        step: '02',
        title: 'Browse Jobs & Quote',
        description: 'See trade jobs near you, send your quote, and chat with the client.',
        icon: Search,
      },
      {
        step: '03',
        title: 'Get Hired & Get Paid',
        description: 'Client accepts your quote, you do the work, and get paid safely through escrow.',
        icon: Zap,
      },
    ],
    cta: { label: 'Find Jobs Near Me', href: '/jobs' },
    ctaVariant: 'indigo' as const,
  },
  {
    id: 'client',
    label: '🏠 I Need a Tradie',
    color: 'from-sky-500 to-sky-600',
    accentColor: 'text-sky-400',
    borderColor: 'border-sky-500/30',
    bgColor: 'bg-sky-500/10',
    steps: [
      {
        step: '01',
        title: 'Post Your Job',
        description: 'Describe what you need done and where you\'re located — takes 2 minutes.',
        icon: FileText,
      },
      {
        step: '02',
        title: 'Review Quotes',
        description: 'Local tradies send you quotes — compare profiles, ratings, and prices.',
        icon: Users,
      },
      {
        step: '03',
        title: 'Pay Safely',
        description: 'Pay through escrow — funds are only released when you\'re happy with the work.',
        icon: CheckCircle,
      },
    ],
    cta: { label: 'Post a Job', href: '/jobs/create' },
    ctaVariant: 'violet' as const,
  },
  {
    id: 'jobseeker',
    label: '👷 I\'m Looking for Work',
    color: 'from-emerald-500 to-emerald-600',
    accentColor: 'text-emerald-400',
    borderColor: 'border-emerald-500/30',
    bgColor: 'bg-emerald-500/10',
    steps: [
      {
        step: '01',
        title: 'Create Your Profile',
        description: 'Add your skills, availability, and what kind of work you\'re after.',
        icon: Crown,
      },
      {
        step: '02',
        title: 'Browse Roles',
        description: 'Filter part-time, casual, and full-time roles by location and trade type.',
        icon: Search,
      },
      {
        step: '03',
        title: 'Apply & Get Hired',
        description: 'Apply directly, chat with employers, and get hired — all in one place.',
        icon: UserCheck,
      },
    ],
    cta: { label: 'Browse Jobs', href: '/jobs' },
    ctaVariant: 'indigo' as const,
  },
  {
    id: 'employer',
    label: '🏢 I Want to Hire',
    color: 'from-violet-500 to-violet-600',
    accentColor: 'text-violet-400',
    borderColor: 'border-violet-500/30',
    bgColor: 'bg-violet-500/10',
    steps: [
      {
        step: '01',
        title: 'Post a Role',
        description: 'Describe the job, hours, location, and pay — part-time, casual, or full-time.',
        icon: Briefcase,
      },
      {
        step: '02',
        title: 'Browse Applicants',
        description: 'Review worker profiles and applications — find the right fit for your team.',
        icon: Users,
      },
      {
        step: '03',
        title: 'Hire with Confidence',
        description: 'Escrow protection and contracts included — hire safely every time.',
        icon: CheckCircle,
      },
    ],
    cta: { label: 'Post a Role', href: '/jobs/create' },
    ctaVariant: 'violet' as const,
  },
]

export default function HowItWorksTabs() {
  const [activeTab, setActiveTab] = useState(0)
  const active = PATHS[activeTab]

  return (
    <div>
      {/* Tab buttons */}
      <div className="flex flex-wrap gap-2 justify-center mb-10">
        {PATHS.map((path, index) => (
          <button
            key={path.id}
            onClick={() => setActiveTab(index)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === index
                ? `bg-gradient-to-r ${path.color} text-white shadow-lg`
                : 'bg-gray-900 border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500'
            }`}
          >
            {path.label}
          </button>
        ))}
      </div>

      {/* Steps */}
      <div className="max-w-2xl mx-auto">
        <div className="space-y-6">
          {active.steps.map(({ step, title, description, icon: StepIcon }) => (
            <div key={step} className="flex gap-4">
              <div className="flex-shrink-0">
                <div className={`h-10 w-10 rounded-xl ${active.bgColor} border ${active.borderColor} flex items-center justify-center`}>
                  <StepIcon className={`h-5 w-5 ${active.accentColor}`} strokeWidth={1.5} />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-bold ${active.accentColor} opacity-70 uppercase tracking-wide`}>{step}</span>
                  <h4 className="font-semibold text-white">{title}</h4>
                </div>
                <p className="text-sm text-slate-400">{description}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-8">
          <GlowButton href={active.cta.href} variant={active.ctaVariant}>
            {active.cta.label} <ArrowRight className="h-4 w-4" />
          </GlowButton>
        </div>
      </div>
    </div>
  )
}
