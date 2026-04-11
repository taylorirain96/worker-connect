'use client'

import { useEffect, useState } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { useAuth } from '@/components/providers/AuthProvider'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Link from 'next/link'
import {
  DollarSign, Briefcase, Lock, CheckCircle,
} from 'lucide-react'
import { getEmployerJobPostingPayments, getEmployerEscrows } from '@/lib/services/escrowService'
import type { JobPostingPayment, EscrowPayment } from '@/types'

const ESCROW_STATUS_LABELS: Record<string, string> = {
  pending: 'Awaiting Deposit',
  held: 'In Escrow',
  released: 'Released to Worker',
  disputed: 'Disputed',
  refunded: 'Refunded',
}

const ESCROW_STATUS_VARIANTS: Record<string, 'success' | 'warning' | 'danger' | 'default' | 'info'> = {
  pending: 'warning',
  held: 'info',
  released: 'success',
  disputed: 'danger',
  refunded: 'default',
}

const POSTING_STATUS_VARIANTS: Record<string, 'success' | 'warning' | 'danger' | 'default'> = {
  pending: 'warning',
  completed: 'success',
  failed: 'danger',
}

export default function EmployerPaymentsPage() {
  const { user } = useAuth()
  const uid = user?.uid
  const [postingPayments, setPostingPayments] = useState<JobPostingPayment[]>([])
  const [escrows, setEscrows] = useState<EscrowPayment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!uid) {
      setLoading(false)
      return
    }
    async function load() {
      try {
        const [postings, escrowList] = await Promise.all([
          getEmployerJobPostingPayments(uid),
          getEmployerEscrows(uid),
        ])
        setPostingPayments(postings)
        setEscrows(escrowList)
      } catch (err) {
        console.error('Failed to load employer payments:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [uid])

  // Compute summary stats
  const totalPostingFees = postingPayments
    .filter((p) => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0)

  const activeJobs = postingPayments.filter((p) => p.status === 'completed').length

  const escrowHeld = escrows
    .filter((e) => e.status === 'held')
    .reduce((sum, e) => sum + e.amount, 0)

  const escrowReleased = escrows
    .filter((e) => e.status === 'released')
    .reduce((sum, e) => sum + e.amount, 0)

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      <Navbar />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Payment History</h1>
            <p className="mt-1 text-slate-500 dark:text-slate-400">
              All your posting fees, escrow deposits and released payments.
            </p>
          </div>
          <Link href="/jobs/post">
            <Button size="sm">Post a New Job</Button>
          </Link>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-5">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-indigo-100 dark:bg-indigo-900/40 p-2.5">
                  <DollarSign className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Posting Fees</p>
                  <p className="text-xl font-bold text-slate-900 dark:text-white">
                    {loading ? '…' : `NZ$${totalPostingFees.toFixed(2)}`}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-5">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-emerald-100 dark:bg-emerald-900/40 p-2.5">
                  <Briefcase className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Active Jobs</p>
                  <p className="text-xl font-bold text-slate-900 dark:text-white">
                    {loading ? '…' : activeJobs}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-5">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-amber-100 dark:bg-amber-900/40 p-2.5">
                  <Lock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Escrow Held</p>
                  <p className="text-xl font-bold text-slate-900 dark:text-white">
                    {loading ? '…' : `NZ$${escrowHeld.toFixed(2)}`}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-5">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-green-100 dark:bg-green-900/40 p-2.5">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Released</p>
                  <p className="text-xl font-bold text-slate-900 dark:text-white">
                    {loading ? '…' : `NZ$${escrowReleased.toFixed(2)}`}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Escrow Payments */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Lock className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              Escrow Payments
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-6 text-sm text-slate-500">Loading…</div>
            ) : escrows.length === 0 ? (
              <div className="text-center py-6">
                <Lock className="h-9 w-9 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
                <p className="text-sm text-slate-500 dark:text-slate-400">No escrow payments yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700">
                      <th className="text-left py-2 pr-4 font-medium text-slate-600 dark:text-slate-400">Job</th>
                      <th className="text-right py-2 pr-4 font-medium text-slate-600 dark:text-slate-400">Amount</th>
                      <th className="text-left py-2 pr-4 font-medium text-slate-600 dark:text-slate-400">Status</th>
                      <th className="text-left py-2 font-medium text-slate-600 dark:text-slate-400">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {escrows.map((e) => (
                      <tr key={e.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="py-3 pr-4">
                          <div className="font-medium text-slate-900 dark:text-white">
                            Job #{e.jobId.slice(-6)}
                          </div>
                          <div className="text-xs text-slate-400">Quote #{e.quoteId.slice(-6)}</div>
                        </td>
                        <td className="py-3 pr-4 text-right font-semibold text-slate-900 dark:text-white">
                          NZ${e.amount.toFixed(2)}
                        </td>
                        <td className="py-3 pr-4">
                          <Badge variant={ESCROW_STATUS_VARIANTS[e.status] ?? 'default'}>
                            {ESCROW_STATUS_LABELS[e.status] ?? e.status}
                          </Badge>
                        </td>
                        <td className="py-3 text-slate-500 dark:text-slate-400 text-xs">
                          {new Date(e.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Posting Fee History */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              Job Posting Fees
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-6 text-sm text-slate-500">Loading…</div>
            ) : postingPayments.length === 0 ? (
              <div className="text-center py-6">
                <Briefcase className="h-9 w-9 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
                <p className="text-sm text-slate-500 dark:text-slate-400">No posting fees yet.</p>
                <p className="text-xs text-slate-400 mt-1">Post a job to get started.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700">
                      <th className="text-left py-2 pr-4 font-medium text-slate-600 dark:text-slate-400">Job</th>
                      <th className="text-left py-2 pr-4 font-medium text-slate-600 dark:text-slate-400">Tier</th>
                      <th className="text-right py-2 pr-4 font-medium text-slate-600 dark:text-slate-400">Fee</th>
                      <th className="text-left py-2 pr-4 font-medium text-slate-600 dark:text-slate-400">Status</th>
                      <th className="text-left py-2 font-medium text-slate-600 dark:text-slate-400">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {postingPayments.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="py-3 pr-4">
                          <div className="font-medium text-slate-900 dark:text-white">
                            Job #{p.jobId.slice(-6)}
                          </div>
                          <div className="flex gap-1 mt-0.5">
                            {p.featuredListing && (
                              <span className="text-xs text-amber-600 dark:text-amber-400">★ Featured</span>
                            )}
                            {p.urgentBadge && (
                              <span className="text-xs text-red-600 dark:text-red-400">⚡ Urgent</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 pr-4 text-slate-600 dark:text-slate-400 capitalize">
                          {p.tier}
                        </td>
                        <td className="py-3 pr-4 text-right font-semibold text-slate-900 dark:text-white">
                          NZ${p.amount.toFixed(2)}
                        </td>
                        <td className="py-3 pr-4">
                          <Badge variant={POSTING_STATUS_VARIANTS[p.status] ?? 'default'}>
                            {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                          </Badge>
                        </td>
                        <td className="py-3 text-slate-500 dark:text-slate-400 text-xs">
                          {new Date(p.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  )
}
