'use client'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Card, CardContent } from '@/components/ui/Card'
import WithdrawalForm from '@/components/withdrawals/WithdrawalForm'
import type { BankAccount } from '@/types'
import { ArrowLeft, ShieldCheck } from 'lucide-react'

// ─── Mock data (replace with Firestore/Stripe calls) ─────────────────────────
const MOCK_BALANCE = 312.50

const MOCK_BANK_ACCOUNTS: BankAccount[] = [
  {
    id: 'ba_1',
    workerId: 'worker1',
    bankName: 'Chase',
    last4: '4242',
    accountType: 'checking',
    isDefault: true,
    verified: true,
    createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
  },
  {
    id: 'ba_2',
    workerId: 'worker1',
    bankName: 'Wells Fargo',
    last4: '8888',
    accountType: 'savings',
    isDefault: false,
    verified: true,
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
]

export default function WithdrawPage() {
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

          {/* Form */}
          <Card>
            <CardContent>
              <WithdrawalForm
                availableBalance={MOCK_BALANCE}
                bankAccounts={MOCK_BANK_ACCOUNTS}
              />
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
