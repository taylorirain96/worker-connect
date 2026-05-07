'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Button from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { useAuth } from '@/components/providers/AuthProvider'
import ServicePackageCard from '@/components/servicePackages/ServicePackageCard'
import ServicePackageForm from '@/components/servicePackages/ServicePackageForm'
import { ArrowLeft, Plus, Package, ToggleLeft, ToggleRight, Pencil, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import type { ServicePackage } from '@/types'

export default function WorkerServicePackagesPage() {
  const { user, profile, loading: authLoading } = useAuth()
  const router = useRouter()

  const [packages, setPackages] = useState<ServicePackage[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editTarget, setEditTarget] = useState<ServicePackage | null>(null)

  useEffect(() => {
    if (!authLoading && (!user || (profile && profile.role !== 'worker'))) {
      router.replace('/dashboard')
    }
  }, [authLoading, user, profile, router])

  const fetchPackages = useCallback(async () => {
    if (!user?.uid) return
    setLoading(true)
    try {
      const res = await fetch(`/api/service-packages?workerId=${user.uid}&includeInactive=true`, {
        headers: { 'x-user-id': user.uid },
      })
      if (res.ok) {
        const data = await res.json() as { packages: ServicePackage[] }
        setPackages(data.packages ?? [])
      }
    } finally {
      setLoading(false)
    }
  }, [user?.uid])

  useEffect(() => {
    if (user?.uid) fetchPackages()
  }, [user?.uid, fetchPackages])

  const handleToggleActive = async (pkg: ServicePackage) => {
    if (!user?.uid) return
    const next = !pkg.active
    // Optimistic update
    setPackages((prev) => prev.map((p) => (p.id === pkg.id ? { ...p, active: next } : p)))
    try {
      const res = await fetch(`/api/service-packages/${pkg.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-user-id': user.uid },
        body: JSON.stringify({ active: next }),
      })
      if (!res.ok) throw new Error('Failed to update')
      toast.success(next ? 'Package is now live' : 'Package hidden from browse')
    } catch {
      // Revert
      setPackages((prev) => prev.map((p) => (p.id === pkg.id ? { ...p, active: !next } : p)))
      toast.error('Failed to update package')
    }
  }

  const handleDelete = async (pkg: ServicePackage) => {
    if (!user?.uid) return
    if (!confirm(`Delete "${pkg.title}"? This cannot be undone.`)) return
    try {
      const res = await fetch(`/api/service-packages/${pkg.id}`, {
        method: 'DELETE',
        headers: { 'x-user-id': user.uid },
      })
      if (!res.ok) throw new Error('Failed to delete')
      setPackages((prev) => prev.filter((p) => p.id !== pkg.id))
      toast.success('Package deleted')
    } catch {
      toast.error('Failed to delete package')
    }
  }

  const handleSaved = (saved: ServicePackage) => {
    setPackages((prev) => {
      const idx = prev.findIndex((p) => p.id === saved.id)
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = saved
        return next
      }
      return [saved, ...prev]
    })
    setEditTarget(null)
  }

  const activeCount = packages.filter((p) => p.active).length

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 bg-gray-50 dark:bg-gray-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back link */}
          <Link
            href="/dashboard/worker"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mb-6 text-sm transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>

          {/* Page header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Package className="h-6 w-6 text-primary-500" />
                Service Packages
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Create fixed-price packages homeowners can instantly book — no quoting required.
              </p>
            </div>
            <Button onClick={() => { setEditTarget(null); setShowForm(true) }} size="sm">
              <Plus className="h-4 w-4" />
              New Package
            </Button>
          </div>

          {/* Stats strip */}
          {packages.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
              <Card padding="sm" className="text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{packages.length}</p>
                <p className="text-xs text-gray-500 mt-0.5">Total packages</p>
              </Card>
              <Card padding="sm" className="text-center">
                <p className="text-2xl font-bold text-green-600">{activeCount}</p>
                <p className="text-xs text-gray-500 mt-0.5">Live</p>
              </Card>
              <Card padding="sm" className="text-center">
                <p className="text-2xl font-bold text-gray-400">{packages.length - activeCount}</p>
                <p className="text-xs text-gray-500 mt-0.5">Hidden</p>
              </Card>
            </div>
          )}

          {loading ? (
            <div className="grid sm:grid-cols-2 gap-4">
              {[1, 2].map((i) => (
                <div key={i} className="animate-pulse bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 h-56" />
              ))}
            </div>
          ) : packages.length === 0 ? (
            <Card>
              <CardContent>
                <div className="text-center py-12">
                  <Package className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">No packages yet</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Create your first fixed-price service package so homeowners can book you instantly.
                  </p>
                  <Button onClick={() => { setEditTarget(null); setShowForm(true) }}>
                    <Plus className="h-4 w-4" />
                    Create Your First Package
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {packages.map((pkg) => (
                <div key={pkg.id} className="relative">
                  {/* Action bar above the card */}
                  <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-800/50 rounded-t-xl px-4 py-2 border border-b-0 border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-medium ${pkg.active ? 'text-green-600' : 'text-gray-400'}`}>
                        {pkg.active ? '● Live' : '○ Hidden'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(pkg)}
                        className="p-1.5 rounded text-gray-500 hover:text-primary-600 transition-colors"
                        title={pkg.active ? 'Hide package' : 'Make live'}
                      >
                        {pkg.active ? <ToggleRight className="h-5 w-5 text-green-500" /> : <ToggleLeft className="h-5 w-5" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => { setEditTarget(pkg); setShowForm(true) }}
                        className="p-1.5 rounded text-gray-500 hover:text-primary-600 transition-colors"
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(pkg)}
                        className="p-1.5 rounded text-gray-500 hover:text-red-500 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  {/* The card itself (no book button for own packages) */}
                  <div className="rounded-t-none rounded-b-xl overflow-hidden border border-t-0 border-gray-200 dark:border-gray-700">
                    <ServicePackageCard pkg={pkg} hideBook />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Browse link */}
          {packages.length > 0 && activeCount > 0 && (
            <p className="text-center text-sm text-gray-500 mt-6">
              Your active packages are visible at{' '}
              <Link href="/packages" className="text-primary-600 hover:underline">
                /packages
              </Link>
              {' '}and on your{' '}
              <Link href={`/workers/${user?.uid}`} className="text-primary-600 hover:underline">
                public profile
              </Link>
              .
            </p>
          )}
        </div>
      </main>
      <Footer />

      {/* Create / edit form modal */}
      {showForm && (
        <ServicePackageForm
          userId={user!.uid}
          initial={editTarget ?? undefined}
          onSaved={handleSaved}
          onClose={() => { setShowForm(false); setEditTarget(null) }}
        />
      )}
    </div>
  )
}
