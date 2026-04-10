'use client'
import { useState, useCallback } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import {
  LayoutDashboard, DollarSign, AlertTriangle, Users, Briefcase,
  Activity, Settings, BarChart2, FileText, Menu, X,
  BookOpen, CheckSquare, Square, Copy, Check, ChevronDown, ChevronRight,
} from 'lucide-react'
import { MASTER_PLAYBOOK, type PlaybookSection, type PlaybookSubsection, type PlaybookTemplate } from '@/lib/playbook/masterPlaybook'

// ─── Sidebar (mirrors admin dashboard) ───────────────────────────────────────

const NAV_ITEMS = [
  { label: 'Overview',             href: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Payments & Billing',   href: '/admin/payments',  icon: DollarSign },
  { label: 'Disputes & Refunds',   href: '/admin/disputes',  icon: AlertTriangle },
  { label: 'Workers Management',   href: '/admin/workers',   icon: Users },
  { label: 'Employers Management', href: '/admin/employers', icon: Briefcase },
  { label: 'System Health',        href: '/admin/monitoring',icon: Activity },
  { label: 'Analytics',            href: '/admin/analytics', icon: BarChart2 },
  { label: 'Tax & 1099s',          href: '/admin/tax',       icon: FileText },
  { label: 'Master Playbook',      href: '/admin/playbook',  icon: BookOpen },
  { label: 'Settings',             href: '/admin',           icon: Settings },
]

function AdminSidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const pathname = usePathname()
  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex flex-col bg-gray-900 dark:bg-gray-950 text-white transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'}`}
    >
      <div className="flex items-center h-16 px-4 border-b border-gray-700 flex-shrink-0">
        {!collapsed && <span className="text-lg font-bold text-white truncate">Admin Panel</span>}
        <button
          onClick={onToggle}
          className="ml-auto h-8 w-8 flex items-center justify-center rounded-lg hover:bg-gray-700 transition-colors"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1" role="navigation" aria-label="Admin navigation">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active ? 'bg-primary-600 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
              title={collapsed ? label : undefined}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && <span className="truncate">{label}</span>}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}

// ─── Copy button ─────────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback: select text
    }
  }, [text])

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 hover:bg-primary-200 dark:hover:bg-primary-900/50 transition-colors"
      aria-label="Copy to clipboard"
    >
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5" />
          Copied!
        </>
      ) : (
        <>
          <Copy className="h-3.5 w-3.5" />
          Copy
        </>
      )}
    </button>
  )
}

// ─── Template card ────────────────────────────────────────────────────────────

function TemplateCard({ template }: { template: PlaybookTemplate }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <Card className="mb-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <button
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center gap-2 text-left text-gray-900 dark:text-white font-semibold hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
          >
            {expanded ? <ChevronDown className="h-4 w-4 flex-shrink-0" /> : <ChevronRight className="h-4 w-4 flex-shrink-0" />}
            {template.title}
          </button>
          <CopyButton text={template.content} />
        </div>
      </CardHeader>
      {expanded && (
        <CardContent>
          <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700 font-mono leading-relaxed">
            {template.content}
          </pre>
        </CardContent>
      )}
    </Card>
  )
}

// ─── Checklist ────────────────────────────────────────────────────────────────

function Checklist({ items }: { items: { id: string; text: string }[] }) {
  const [checked, setChecked] = useState<Record<string, boolean>>({})

  const toggle = (id: string) => setChecked((prev) => ({ ...prev, [id]: !prev[id] }))

  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item.id}>
          <button
            onClick={() => toggle(item.id)}
            className="flex items-start gap-3 w-full text-left group"
          >
            <span className="mt-0.5 flex-shrink-0">
              {checked[item.id] ? (
                <CheckSquare className="h-4 w-4 text-primary-600" />
              ) : (
                <Square className="h-4 w-4 text-gray-400 group-hover:text-primary-400 transition-colors" />
              )}
            </span>
            <span
              className={`text-sm leading-relaxed ${
                checked[item.id]
                  ? 'line-through text-gray-400 dark:text-gray-500'
                  : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              {item.text}
            </span>
          </button>
        </li>
      ))}
    </ul>
  )
}

// ─── Subsection renderer ──────────────────────────────────────────────────────

function SubsectionBlock({ sub }: { sub: PlaybookSubsection }) {
  return (
    <div className="mb-6">
      <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">{sub.title}</h4>
      {sub.note && (
        <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded-lg px-3 py-2 mb-3 border border-amber-200 dark:border-amber-800">
          ⚠️ {sub.note}
        </p>
      )}
      {sub.items && <Checklist items={sub.items} />}
      {sub.subsections && sub.subsections.map((s) => (
        <div key={s.id} className="mt-4 ml-4 pl-4 border-l-2 border-gray-200 dark:border-gray-700">
          <SubsectionBlock sub={s} />
        </div>
      ))}
    </div>
  )
}

// ─── Section card ─────────────────────────────────────────────────────────────

function SectionCard({ section }: { section: PlaybookSection }) {
  const [collapsed, setSectionCollapsed] = useState(false)

  return (
    <Card className="mb-6">
      <CardHeader>
        <button
          onClick={() => setSectionCollapsed((v) => !v)}
          className="flex items-center gap-3 w-full text-left group"
        >
          <span className="h-8 w-8 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
            <BookOpen className="h-4 w-4 text-primary-600" />
          </span>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
              {section.title}
            </h3>
            {section.description && !collapsed && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{section.description}</p>
            )}
          </div>
          {collapsed ? (
            <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0" />
          )}
        </button>
      </CardHeader>

      {!collapsed && (
        <CardContent>
          {section.items && (
            <div className="mb-4">
              <Checklist items={section.items} />
            </div>
          )}
          {section.subsections && section.subsections.map((sub) => (
            <SubsectionBlock key={sub.id} sub={sub} />
          ))}
          {section.templates && section.templates.map((tpl) => (
            <TemplateCard key={tpl.id} template={tpl} />
          ))}
        </CardContent>
      )}
    </Card>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MasterPlaybookPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const sidebarWidth = sidebarCollapsed ? 64 : 256

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex flex-1">
        <AdminSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed((v) => !v)} />

        <main
          className="flex-1 bg-gray-50 dark:bg-gray-900 transition-all duration-300"
          style={{ marginLeft: sidebarWidth }}
        >
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="flex items-center gap-3 mb-8">
              <div className="h-10 w-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-primary-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Master Playbook</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  SEO &amp; authority strategy — click any section to expand, check items as you complete them
                </p>
              </div>
            </div>

            {/* Sections */}
            {MASTER_PLAYBOOK.map((section) => (
              <SectionCard key={section.id} section={section} />
            ))}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  )
}
