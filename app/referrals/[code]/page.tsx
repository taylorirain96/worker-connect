import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Button from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Users, CheckCircle, ArrowRight } from 'lucide-react'
import { REFERRAL_BONUSES } from '@/lib/referrals/referralLogic'
import { formatCurrency } from '@/lib/utils'

interface ReferralLandingProps {
  params: { code: string }
}

export default function ReferralLandingPage({ params }: ReferralLandingProps) {
  const { code } = params

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 bg-gradient-to-br from-primary-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-lg mx-auto px-4 py-16 space-y-6">
          {/* Hero */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary-100 dark:bg-primary-900/40 mb-2">
              <Users className="h-8 w-8 text-primary-600 dark:text-primary-400" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              You&apos;ve Been Invited!
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Join QuickTrade and start earning money by completing skilled trades jobs.
            </p>
          </div>

          {/* Referral code badge */}
          <div className="flex justify-center">
            <div className="bg-white dark:bg-gray-800 border border-primary-200 dark:border-primary-800 rounded-xl px-6 py-3 text-center shadow-sm">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Your referral code</p>
              <p className="text-xl font-bold tracking-widest font-mono text-primary-600 dark:text-primary-400">
                {code}
              </p>
            </div>
          </div>

          {/* Benefits */}
          <Card>
            <CardContent>
              <h2 className="font-semibold text-gray-900 dark:text-white mb-4">What you get</h2>
              <ul className="space-y-3">
                {[
                  'Access to hundreds of local skilled-trade job listings',
                  'Get paid within 24–48 hours after job completion',
                  '2% cashback on every job you complete',
                  'Build your reputation and earn badges',
                ].map((benefit) => (
                  <li key={benefit} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{benefit}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* What referrer earns */}
          <Card padding="sm">
            <CardContent>
              <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                The person who invited you earns up to{' '}
                <strong className="text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(REFERRAL_BONUSES.trusted_pro)}
                </strong>{' '}
                when you succeed — so they want you to win!
              </p>
            </CardContent>
          </Card>

          {/* CTA */}
          <div className="space-y-3">
            <Link href={`/auth/register?ref=${code}`} className="block">
              <Button className="w-full" size="lg">
                Create Free Account
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <p className="text-xs text-center text-gray-400 dark:text-gray-600">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-primary-600 hover:underline dark:text-primary-400">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
