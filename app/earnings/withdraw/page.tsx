'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Card, CardContent } from '@/components/ui/Card'
import WithdrawalForm from '@/components/withdrawals/WithdrawalForm'
import type { BankAccount } from '@/types'
import { ArrowLeft, ShieldCheck } from 'lucide-react'
import { useAuth } from '@/components/providers/AuthProvider'
import { formatCurrency } from '@/lib/utils'
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export default function WithdrawPage() {
  const { user, profile } = useAuth()
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([])
  const [loading, setLoading] = useState(true)

  const availableBalance: number = typeof profile?.availableBalance === 'number'
    ? profile.availableBalance
    : 0

  useEffect(() => {
    if (!user || !db) {
      setLoading(false)
      return
    }
    getDocs(query(
      collection(db, 'bankAccounts'),
      where('workerId', '==', user.uid),
      orderBy('createdAt', 'desc'),
    ))
      .then((snap) => {
        setBankAccounts(snap.docs.map((d) => ({ id: d.id, ...d.data() } as BankAccount)))
      })
      .catch(() => setBankAccounts([]))
      .finally(() => setLoading(false))
  }, [user])

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-xl mx-auto px-4 sm:px-6 py-8 space-y-6">

          {/* Back link */}
          <Link
            href="/earnings"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Earnings
          </Link>

          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Withdraw Funds</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Transfer your earnings directly to your bank account.
            </p>
          </div>

          {/* Available balance summary */}
          <div className="flex items-center justify-between px-4 py-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl">
            <span className="text-sm text-emerald-700 dark:text-emerald-300 font-medium">Available to withdraw</span>
            <span className="text-lg font-bold text-emerald-700 dark:text-emerald-300">
              {formatCurrency(availableBalance)}
            </span>
          </div>

          {/* Form */}
          <Card>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="h-8 w-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <WithdrawalForm
                  availableBalance={availableBalance}
                  bankAccounts={bankAccounts}
                />
              )}
            </CardContent>
          </Card>

          {/* Security note */}
          <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl text-sm text-blue-800 dark:text-blue-300">
            <ShieldCheck className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold mb-0.5">Secure Transfer</p>
              <p>Withdrawals over $500 require two-factor verification. All transfers are processed via Stripe and fully encrypted.</p>
            </div>
          </div>

          {/* History link */}
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            View past withdrawals in{' '}
            <Link href="/earnings/history" className="text-primary-600 hover:underline dark:text-primary-400">
              Transaction History
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  )
}
