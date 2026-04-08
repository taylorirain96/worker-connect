'use client'
import { useState } from 'react'
import Button from '@/components/ui/Button'
import { SUBSCRIPTION_PLANS, BUNDLE_PRICING } from '@/types/payment'
import type { SubscriptionPlan, Subscription, BundleType } from '@/types/payment'
import { Check, Zap, Building2, Star, Package, Briefcase, Layers } from 'lucide-react'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

const PLAN_ICONS: Record<SubscriptionPlan, React.ReactNode> = {
  free: <Star className="h-5 w-5 text-gray-400" />,
  pro: <Zap className="h-5 w-5 text-primary-600" />,
  enterprise: <Building2 className="h-5 w-5 text-purple-600" />,
}

const BUNDLE_ICONS: Record<BundleType, React.ReactNode> = {
  single: <Briefcase className="h-5 w-5 text-gray-500" />,
  '3pack': <Package className="h-5 w-5 text-primary-600" />,
  '10pack': <Layers className="h-5 w-5 text-purple-600" />,
}

interface SubscriptionSelectorProps {
  currentSubscription?: Subscription | null
  userId: string
  onSubscribed?: (subscription: Subscription) => void
}

export default function SubscriptionSelector({
  currentSubscription,
  userId,
  onSubscribed,
}: SubscriptionSelectorProps) {
  const [billingInterval, setBillingInterval] = useState<'month' | 'year'>('month')
  const [loading, setLoading] = useState<SubscriptionPlan | null>(null)
  const [bundleLoading, setBundleLoading] = useState<BundleType | null>(null)
  const [selectedBundle, setSelectedBundle] = useState<BundleType | null>(null)

  const currentPlan = currentSubscription?.plan ?? 'free'

  const handleSelect = async (plan: SubscriptionPlan) => {
    if (plan === currentPlan) return
    setLoading(plan)
    try {
      const res = await fetch('/api/subscriptions/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, plan, billingInterval }),
      })

      if (!res.ok) {
        const err = (await res.json()) as { error?: string }
        throw new Error(err.error ?? 'Subscription failed')
      }

      const data = (await res.json()) as Subscription
      toast.success(`Switched to ${plan.charAt(0).toUpperCase() + plan.slice(1)} plan!`)
      onSubscribed?.(data)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(null)
    }
  }

  const handleBundlePurchase = async (bundleType: BundleType) => {
    setBundleLoading(bundleType)
    try {
      // Generate a unique jobId for the bundle credit purchase.
      const uniqueId = `bundle_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
      const res = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: uniqueId,
          employerId: userId,
          // 'platform' is the reserved workerId for platform-level credit purchases
          workerId: 'platform',
          bundleType,
          currency: 'usd',
        }),
      })

      if (!res.ok) {
        const err = (await res.json()) as { error?: string }
        throw new Error(err.error ?? 'Bundle purchase failed')
      }

      const bundle = BUNDLE_PRICING.find((b) => b.type === bundleType)
      setSelectedBundle(bundleType)
      toast.success(
        `${bundle?.label ?? bundleType} added! Complete payment to activate your job credits.`
      )
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setBundleLoading(null)
    }
  }

  return (
    <div className="space-y-10">
      {/* ---------------------------------------------------------------- */}
      {/* Subscription plans                                               */}
      {/* ---------------------------------------------------------------- */}
      <div className="space-y-6">
        {/* Billing interval toggle */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setBillingInterval('month')}
            className={cn(
              'text-sm font-medium px-3 py-1 rounded-full transition-colors',
              billingInterval === 'month'
                ? 'bg-primary-600 text-white'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            )}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingInterval('year')}
            className={cn(
              'text-sm font-medium px-3 py-1 rounded-full transition-colors',
              billingInterval === 'year'
                ? 'bg-primary-600 text-white'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            )}
          >
            Yearly
            <span className="ml-1 text-xs text-emerald-600 dark:text-emerald-400">–10%</span>
          </button>
        </div>

        {/* Plan cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          {SUBSCRIPTION_PLANS.map((plan) => {
            const price =
              billingInterval === 'year' ? plan.yearlyPricePerMonth : plan.monthlyPrice
            const isCurrent = plan.id === currentPlan
            const isLoading = loading === plan.id

            return (
              <div
                key={plan.id}
                className={cn(
                  'relative flex flex-col rounded-2xl border p-5 transition-shadow',
                  plan.highlighted
                    ? 'border-primary-500 shadow-lg shadow-primary-100 dark:shadow-none bg-white dark:bg-gray-800'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800',
                  isCurrent && 'ring-2 ring-primary-500'
                )}
              >
                {plan.highlighted && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary-600 px-3 py-0.5 text-xs font-semibold text-white">
                    Most popular
                  </span>
                )}

                <div className="flex items-center gap-2 mb-3">
                  {PLAN_ICONS[plan.id]}
                  <span className="font-semibold text-gray-900 dark:text-white">{plan.name}</span>
                  {isCurrent && (
                    <span className="ml-auto rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 text-xs px-2 py-0.5 font-medium">
                      Current
                    </span>
                  )}
                </div>

                <div className="mb-1">
                  {price === 0 ? (
                    <span className="text-3xl font-bold text-gray-900 dark:text-white">Free</span>
                  ) : (
                    <>
                      <span className="text-3xl font-bold text-gray-900 dark:text-white">
                        ${price}
                      </span>
                      <span className="text-sm text-gray-500">/mo</span>
                    </>
                  )}
                </div>
                <p className="text-xs text-gray-400 mb-4">{plan.description}</p>

                <ul className="space-y-1.5 mb-5 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Check className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>

                <Button
                  variant={isCurrent ? 'outline' : plan.highlighted ? 'primary' : 'secondary'}
                  size="sm"
                  className="w-full"
                  disabled={isCurrent}
                  loading={isLoading}
                  title={isCurrent ? 'Already subscribed to this plan' : undefined}
                  aria-label={isCurrent ? `Already subscribed to ${plan.name}` : `Subscribe to ${plan.name}`}
                  onClick={() => void handleSelect(plan.id)}
                >
                  {isCurrent ? 'Current plan' : plan.monthlyPrice === 0 ? 'Downgrade' : 'Upgrade'}
                </Button>
              </div>
            )
          })}
        </div>
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* Job Bundle pricing (Price Anchoring)                             */}
      {/* ---------------------------------------------------------------- */}
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">Job Bundles</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Buy job credits in bulk and save. Baseline: <strong>$100 / job</strong>.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {BUNDLE_PRICING.map((bundle) => {
            const isSelected = selectedBundle === bundle.type
            const isLoading = bundleLoading === bundle.type
            const hasSavings = bundle.savingsPercent > 0

            return (
              <div
                key={bundle.type}
                className={cn(
                  'relative flex flex-col rounded-2xl border p-5 transition-shadow',
                  bundle.type === '3pack'
                    ? 'border-primary-500 shadow-lg shadow-primary-100 dark:shadow-none bg-white dark:bg-gray-800'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800',
                  isSelected && 'ring-2 ring-emerald-500'
                )}
              >
                {bundle.type === '3pack' && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary-600 px-3 py-0.5 text-xs font-semibold text-white">
                    Best value
                  </span>
                )}

                <div className="flex items-center gap-2 mb-3">
                  {BUNDLE_ICONS[bundle.type]}
                  <span className="font-semibold text-gray-900 dark:text-white">{bundle.label}</span>
                  {hasSavings && (
                    <span className="ml-auto rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs px-2 py-0.5 font-medium">
                      –{bundle.savingsPercent}%
                    </span>
                  )}
                </div>

                <div className="mb-1">
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">
                    ${bundle.totalPrice}
                  </span>
                  {bundle.jobCount > 1 && (
                    <span className="text-sm text-gray-500 ml-1">
                      ({bundle.jobCount} jobs)
                    </span>
                  )}
                </div>

                <p className="text-xs text-gray-400 mb-1">
                  ${bundle.pricePerJob} per job
                  {bundle.savingsPerJob > 0 && (
                    <span className="ml-1 text-emerald-600 dark:text-emerald-400">
                      (save ${bundle.savingsPerJob}/job)
                    </span>
                  )}
                </p>

                {bundle.type === 'single' && (
                  <p className="text-xs text-gray-400 mb-4">Standard rate — no commitment</p>
                )}
                {bundle.type === '3pack' && (
                  <p className="text-xs text-gray-400 mb-4">5% savings vs. single job rate</p>
                )}
                {bundle.type === '10pack' && (
                  <p className="text-xs text-gray-400 mb-4">10% savings vs. single job rate</p>
                )}

                <div className="mt-auto">
                  <Button
                    variant={bundle.type === '3pack' ? 'primary' : 'secondary'}
                    size="sm"
                    className="w-full"
                    loading={isLoading}
                    aria-label={`Purchase ${bundle.label} for $${bundle.totalPrice}`}
                    onClick={() => void handleBundlePurchase(bundle.type)}
                  >
                    {isSelected ? 'Added ✓' : `Buy ${bundle.label}`}
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

