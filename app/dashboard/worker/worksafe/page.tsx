'use client'
import { useState } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import {
  ShieldCheck, AlertTriangle, CheckCircle, ExternalLink,
  HardHat, FileText, Phone, BookOpen, ChevronDown, ChevronUp,
} from 'lucide-react'
import Link from 'next/link'

const CHECKLIST_ITEMS = [
  {
    category: 'Personal Protective Equipment (PPE)',
    items: [
      { id: 'ppe1', label: 'Hard hat (when working in construction zones or overhead hazards)' },
      { id: 'ppe2', label: 'Hi-visibility vest (required on roadsides and many sites)' },
      { id: 'ppe3', label: 'Safety boots with steel toecap' },
      { id: 'ppe4', label: 'Ear protection when using loud equipment' },
      { id: 'ppe5', label: 'Eye protection (safety glasses or goggles)' },
      { id: 'ppe6', label: 'Gloves appropriate to the task' },
    ],
  },
  {
    category: 'Health & Safety Plan',
    items: [
      { id: 'plan1', label: 'Site-specific Safety Plan (SSSP) completed for each new job site' },
      { id: 'plan2', label: 'Hazard and Risk Register maintained and reviewed' },
      { id: 'plan3', label: 'Emergency evacuation procedures documented and communicated' },
      { id: 'plan4', label: 'First aid kit available on site at all times' },
      { id: 'plan5', label: 'Incident reporting procedure known to all workers' },
    ],
  },
  {
    category: 'Licences & Certifications',
    items: [
      { id: 'cert1', label: 'Trade licence is current and valid (LBP, Electrical, Plumbing, etc.)' },
      { id: 'cert2', label: 'SiteSafe passport or equivalent (for construction sites)' },
      { id: 'cert3', label: 'First Aid Certificate (current within 3 years)' },
      { id: 'cert4', label: 'Working at Heights training (if applicable)' },
      { id: 'cert5', label: 'Forklift or Elevated Work Platform (EWP) certificate (if applicable)' },
    ],
  },
  {
    category: 'Hazardous Work',
    items: [
      { id: 'haz1', label: 'Asbestos awareness training completed (pre-1990 buildings)' },
      { id: 'haz2', label: 'Confined space entry procedures followed (if applicable)' },
      { id: 'haz3', label: 'Electrical isolation (lockout/tagout) procedures known' },
      { id: 'haz4', label: 'Hazardous substances register maintained' },
      { id: 'haz5', label: 'Safety Data Sheets (SDS) available for all hazardous products' },
    ],
  },
  {
    category: 'Employer/Contractor Obligations',
    items: [
      { id: 'emp1', label: 'All workers have signed an employment agreement or contractor agreement' },
      { id: 'emp2', label: "ACC Cover Plus or Cover Plus Extra is in place (sole traders must manage their own ACC)" },
      { id: 'emp3', label: "Workers are covered under the PCBU's (your) health and safety system" },
      { id: 'emp4', label: 'Regular toolbox meetings conducted' },
      { id: 'emp5', label: 'Notifiable work events reported to WorkSafe within required timeframes' },
    ],
  },
]

const RESOURCES = [
  {
    title: 'WorkSafe NZ',
    description: 'Official guidance, forms, and regulations for NZ workplaces.',
    href: 'https://www.worksafe.govt.nz',
    icon: ShieldCheck,
  },
  {
    title: 'Health and Safety at Work Act 2015',
    description: 'The primary legislation governing workplace health and safety.',
    href: 'https://www.legislation.govt.nz/act/public/2015/0070/latest/DLM5976660.html',
    icon: FileText,
  },
  {
    title: 'SiteSafe Passport',
    description: 'Industry-recognised health and safety passport for construction workers.',
    href: 'https://www.sitesafe.org.nz/training/site-safe-passport/',
    icon: HardHat,
  },
  {
    title: 'ACC for Self-Employed',
    description: 'Cover Plus and Cover Plus Extra options for sole traders and contractors.',
    href: 'https://www.acc.co.nz/im-a/business/sole-traders-and-contractors/',
    icon: BookOpen,
  },
  {
    title: 'WorkSafe Notifiable Events',
    description: 'Report serious injuries, illnesses, and near misses to WorkSafe.',
    href: 'https://www.worksafe.govt.nz/notifications/',
    icon: AlertTriangle,
  },
  {
    title: 'WorkSafe Helpline',
    description: 'Call 0800 030 040 for WorkSafe advice and guidance.',
    href: 'tel:0800030040',
    icon: Phone,
  },
]

type CheckState = Record<string, boolean>

export default function WorkSafePage() {
  const [checked, setChecked] = useState<CheckState>({})
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  const allItems = CHECKLIST_ITEMS.flatMap((c) => c.items)
  const totalChecked = allItems.filter((i) => checked[i.id]).length
  const totalItems = allItems.length
  const percent = Math.round((totalChecked / totalItems) * 100)

  function toggle(id: string) {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  function toggleCategory(cat: string) {
    setExpanded((prev) => ({ ...prev, [cat]: !prev[cat] }))
  }

  const scoreColor =
    percent >= 80 ? 'text-green-400' : percent >= 50 ? 'text-amber-400' : 'text-red-400'
  const barColor =
    percent >= 80 ? 'bg-green-500' : percent >= 50 ? 'bg-amber-500' : 'bg-red-500'

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <main className="mx-auto max-w-4xl px-4 py-10">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-sm text-indigo-300">
            <ShieldCheck className="h-4 w-4" />
            WorkSafe NZ Compliance
          </div>
          <h1 className="mb-2 text-3xl font-bold text-white">Health &amp; Safety Compliance</h1>
          <p className="text-slate-400">
            Use this checklist to make sure you&apos;re meeting your obligations under the Health and Safety at Work
            Act 2015 (HSWA). This is a guide only — always refer to official WorkSafe NZ guidance for your specific
            situation.
          </p>
        </div>

        {/* Score Card */}
        <div className="mb-8 rounded-2xl border border-white/5 bg-white/5 p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Compliance Score</p>
              <p className={`text-4xl font-bold ${scoreColor}`}>{percent}%</p>
              <p className="text-sm text-slate-400">
                {totalChecked} / {totalItems} items completed
              </p>
            </div>
            <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-white/10">
              {percent === 100 ? (
                <CheckCircle className="h-10 w-10 text-green-400" />
              ) : (
                <ShieldCheck className={`h-10 w-10 ${scoreColor}`} />
              )}
            </div>
          </div>
          <div className="h-2 w-full rounded-full bg-white/10">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${barColor}`}
              style={{ width: `${percent}%` }}
            />
          </div>
          {percent < 80 && (
            <div className="mt-4 flex items-start gap-2 rounded-xl bg-amber-500/10 p-3 text-sm text-amber-300">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                Your score is below 80%. Review the unchecked items and take action — you may have legal obligations
                under the HSWA.
              </span>
            </div>
          )}
        </div>

        {/* Checklist */}
        <div className="mb-10 space-y-4">
          {CHECKLIST_ITEMS.map((category) => {
            const catChecked = category.items.filter((i) => checked[i.id]).length
            const isOpen = expanded[category.category] !== false // default open
            return (
              <div key={category.category} className="rounded-2xl border border-white/5 bg-white/5">
                <button
                  type="button"
                  onClick={() => toggleCategory(category.category)}
                  className="flex w-full items-center justify-between px-5 py-4 text-left"
                >
                  <div>
                    <h2 className="font-semibold text-white">{category.category}</h2>
                    <p className="text-xs text-slate-400">
                      {catChecked}/{category.items.length} completed
                    </p>
                  </div>
                  {isOpen ? (
                    <ChevronUp className="h-5 w-5 text-slate-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-slate-400" />
                  )}
                </button>
                {isOpen && (
                  <div className="border-t border-white/5 px-5 py-4 space-y-3">
                    {category.items.map((item) => (
                      <label key={item.id} className="flex cursor-pointer items-start gap-3">
                        <input
                          type="checkbox"
                          checked={!!checked[item.id]}
                          onChange={() => toggle(item.id)}
                          className="mt-0.5 h-4 w-4 shrink-0 rounded accent-indigo-500"
                        />
                        <span className={`text-sm ${checked[item.id] ? 'text-slate-400 line-through' : 'text-slate-300'}`}>
                          {item.label}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Resources */}
        <div>
          <h2 className="mb-6 text-xl font-bold text-white">Official Resources</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {RESOURCES.map(({ title, description, href, icon: Icon }) => (
              <Link
                key={title}
                href={href}
                target={href.startsWith('http') ? '_blank' : undefined}
                rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                className="group flex flex-col gap-3 rounded-2xl border border-white/5 bg-white/5 p-5 transition hover:border-indigo-500/30 hover:bg-white/10"
              >
                <div className="inline-flex rounded-xl bg-indigo-500/10 p-2.5">
                  <Icon className="h-5 w-5 text-indigo-400" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 font-semibold text-white group-hover:text-indigo-300">
                    {title}
                    {href.startsWith('http') && <ExternalLink className="h-3.5 w-3.5" />}
                  </div>
                  <p className="mt-1 text-sm text-slate-400">{description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <p className="mt-10 text-center text-xs text-slate-500">
          This tool is for guidance only and does not constitute legal advice. Always consult official WorkSafe NZ
          resources and seek professional advice for your specific situation.
        </p>
      </main>

      <Footer />
    </div>
  )
}
