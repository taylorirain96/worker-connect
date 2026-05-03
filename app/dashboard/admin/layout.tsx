'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import {
  LayoutDashboard, Users, Briefcase, DollarSign,
  AlertTriangle, Mail, Shield, Menu, X, ChevronRight, ShieldCheck, Tag, BarChart2,
} from 'lucide-react'

const NAV_ITEMS = [
  { label: 'Overview',       href: '/dashboard/admin',                    icon: LayoutDashboard },
  { label: 'Analytics',      href: '/dashboard/admin/analytics',          icon: BarChart2 },
  { label: 'Users',          href: '/dashboard/admin/users',              icon: Users },
  { label: 'Jobs',           href: '/dashboard/admin/jobs',               icon: Briefcase },
  { label: 'Payments',       href: '/dashboard/admin/payments',           icon: DollarSign },
  { label: 'Disputes',       href: '/dashboard/admin/disputes',           icon: AlertTriangle },
  { label: 'Verification',   href: '/dashboard/admin/verification',       icon: ShieldCheck },
  { label: 'Promo Codes',    href: '/dashboard/admin/promos',             icon: Tag },
  { label: 'Email Logs',     href: '/dashboard/admin/emails',             icon: Mail },
]

function AdminSidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const pathname = usePathname()

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex flex-col bg-slate-900 text-white transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* Header */}
      <div className="flex items-center h-16 px-4 border-b border-slate-700 flex-shrink-0">
        {!collapsed && (
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Shield className="h-5 w-5 text-indigo-400 flex-shrink-0" />
            <span className="text-sm font-bold text-white truncate">Admin Panel</span>
          </div>
        )}
        <button
          onClick={onToggle}
          className="ml-auto h-8 w-8 flex items-center justify-center rounded-lg hover:bg-slate-700 transition-colors flex-shrink-0"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1" role="navigation" aria-label="Admin navigation">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <Icon className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
              {!collapsed && <span className="truncate">{label}</span>}
              {!collapsed && active && <ChevronRight className="h-3 w-3 ml-auto flex-shrink-0" />}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="px-4 py-3 border-t border-slate-700">
          <p className="text-xs text-slate-500">WorkerConnect Admin</p>
        </div>
      )}
    </aside>
  )
}

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    if (loading) return

    // Must be logged in
    if (!user) {
      router.replace('/')
      return
    }

    // Must have admin role in Firestore
    if (profile?.role !== 'admin') {
      router.replace('/')
      return
    }

    // Optional supplementary check: if NEXT_PUBLIC_ADMIN_UID is set, the UID
    // must also match. This is NOT the primary security mechanism — the primary
    // check is the Firestore role above. API routes enforce server-side checks.
    const adminUid = process.env.NEXT_PUBLIC_ADMIN_UID
    if (adminUid && user.uid !== adminUid) {
      router.replace('/')
    }
  }, [user, profile, loading, router])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  // While redirect is in flight, render nothing
  if (!user || profile?.role !== 'admin') {
    return null
  }

  const sidebarWidth = collapsed ? 64 : 240

  return (
    <div className="flex min-h-screen bg-slate-950">
      <AdminSidebar collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />
      <div className="flex flex-col flex-1 transition-all duration-300" style={{ marginLeft: sidebarWidth }}>
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex items-center h-14 px-6 bg-slate-900 border-b border-slate-800">
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-xs px-2 py-1 rounded-full bg-indigo-900/60 text-indigo-300 font-medium border border-indigo-700">
              Admin Panel
            </span>
            <span className="text-xs text-slate-400 hidden sm:block">{profile?.email ?? user.email}</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
