'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { useAuth } from '@/components/providers/AuthProvider'
import { Building2, Briefcase, Plus, MapPin, ExternalLink } from 'lucide-react'
import toast from 'react-hot-toast'
import type { Property } from '@/types'

const PROPERTY_TYPE_COLORS: Record<string, string> = {
  residential: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
  commercial: 'bg-blue-500/10 border-blue-500/30 text-blue-300',
  industrial: 'bg-amber-500/10 border-amber-500/30 text-amber-300',
}

export default function PropertyManagerDashboard() {
  const router = useRouter()
  const { user, profile, loading: authLoading } = useAuth()
  const [properties, setProperties] = useState<Property[]>([])
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    if (!authLoading && (!user || (profile && profile.role !== 'property_manager'))) {
      router.replace('/dashboard')
    }
  }, [authLoading, user, profile, router])

  const fetchProperties = useCallback(async () => {
    if (!user) return
    setFetching(true)
    try {
      const res = await fetch('/api/properties', {
        headers: { 'x-user-id': user.uid },
      })
      if (res.ok) {
        const data = await res.json() as { properties: Property[] }
        setProperties(data.properties ?? [])
      }
    } catch {
      toast.error('Could not load properties')
    } finally {
      setFetching(false)
    }
  }, [user])

  useEffect(() => { fetchProperties() }, [fetchProperties])

  if (authLoading || !user) return null

  const totalActiveJobs = properties.reduce((sum, p) => sum + (p.activeJobCount ?? 0), 0)
  const totalJobsPosted = properties.reduce((sum, p) => sum + (p.totalJobsPosted ?? 0), 0)

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="border-b border-slate-800/60 bg-slate-900/40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-indigo-400" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Property Manager Dashboard</h1>
                  <p className="text-sm text-slate-400 mt-0.5">Manage your portfolio of properties</p>
                </div>
              </div>
              <Link
                href="/dashboard/property-manager/properties/new"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors"
              >
                <Plus className="h-4 w-4" />
                Add Property
              </Link>
            </div>

            {/* Nav */}
            <div className="mt-5 flex items-center gap-2 flex-wrap">
              {[
                { label: 'Properties', href: '/dashboard/property-manager' },
                { label: 'Jobs', href: '/dashboard/homeowner' },
                { label: 'Schedule', href: '/dashboard/calendar' },
                { label: 'Invoices', href: '/invoices' },
                { label: 'Reports', href: '/dashboard/homeowner/spending' },
              ].map(({ label, href }) => (
                <Link
                  key={label}
                  href={href}
                  className="py-2 px-3 border border-slate-700 text-slate-300 text-sm font-medium rounded-xl hover:bg-slate-800 hover:text-white transition-colors"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {[
              { label: 'Total Properties', value: properties.length, icon: Building2 },
              { label: 'Active Jobs', value: totalActiveJobs, icon: Briefcase },
              { label: 'Total Jobs Posted', value: totalJobsPosted, icon: ExternalLink },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-5 flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                  <Icon className="h-5 w-5 text-indigo-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{value}</p>
                  <p className="text-sm text-slate-400">{label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Properties list */}
          {fetching ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 rounded-xl bg-slate-800/60 animate-pulse" />
              ))}
            </div>
          ) : properties.length === 0 ? (
            <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-12 text-center">
              <Building2 className="h-10 w-10 text-slate-600 mx-auto mb-3" />
              <p className="font-semibold text-white mb-1">No properties yet</p>
              <p className="text-sm text-slate-400 mb-4">Add your first property to get started.</p>
              <Link
                href="/dashboard/property-manager/properties/new"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors"
              >
                <Plus className="h-4 w-4" />
                Add Property
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {properties.map((prop) => (
                <div
                  key={prop.id}
                  className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-5"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-white truncate">{prop.address}</p>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full border capitalize ${PROPERTY_TYPE_COLORS[prop.propertyType] ?? PROPERTY_TYPE_COLORS.residential}`}>
                          {prop.propertyType}
                        </span>
                      </div>
                      <p className="text-sm text-slate-400 flex items-center gap-1 mt-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {prop.suburb}, {prop.city} {prop.postcode}
                      </p>
                    </div>
                  </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <Briefcase className="h-3.5 w-3.5" />
                          {prop.activeJobCount} active job{prop.activeJobCount !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/dashboard/homeowner?propertyId=${encodeURIComponent(prop.id)}&propertyLabel=${encodeURIComponent(prop.address)}`}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-600/80 text-slate-200 text-xs font-semibold transition-colors hover:bg-slate-800"
                        >
                          <Briefcase className="h-3.5 w-3.5" />
                          View Jobs
                        </Link>
                        <Link
                          href={`/post/homeowner?propertyId=${encodeURIComponent(prop.id)}&address=${encodeURIComponent(prop.address + ', ' + prop.city)}`}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/80 hover:bg-indigo-600 text-white text-xs font-semibold transition-colors"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          Post Job
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
