'use client'
import { useState } from 'react'
import Button from '@/components/ui/Button'
import { SUBSCRIPTION_PLANS, BUNDLE_OPTIONS } from '@/types/payment'
import type { SubscriptionPlan, Subscription, BundleType } from '@/types/payment'
import { Check, Zap, Building2, Star, Package, Tag } from 'lucide-react'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

const PLAN_ICONS: Record<SubscriptionPlan, React.ReactNode> = {
  free: <Star className="h-5 w-5 text-gray-400" />,
  pro: <Zap className="h-5 w-5 text-primary-600" />,
  enterprise: <Building2 className="h-5 w-5 text-purple-600" />,
}

interface SubscriptionSelectorProps {
  currentSubscription?: Subscription | null
  userId: string
  onSubscribed?: (subscription: Subscription) => void
  onBundleSelect?: (bundleType: BundleType) => void
}

export default function SubscriptionSelector({
  currentSubscription,
  userId,
  onSubscribed,
  onBundleSelect,
}: SubscriptionSelectorProps) {
  const [billingInterval, setBillingInterval] = useState<'month' | 'year'>('month')
  const [loading, setLoading] = useState<SubscriptionPlan | null>(null)
  const [selectedBundle, setSelectedBundle] = useState<BundleType>('single')

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

  return (
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

      {/* Price Anchoring – Job Bundle Options */}
      <div className="mt-6">
        <div className="flex items-center gap-2 mb-3">
          <Package className="h-4 w-4 text-primary-600" />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Job Bundle Pricing</h3>
          <span className="rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs px-2 py-0.5 font-medium ml-1">
            Save up to 10%
          </span>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {BUNDLE_OPTIONS.map((bundle) => {
            const isSelected = selectedBundle === bundle.type
            const perJob = (bundle.perJobCents / 100).toFixed(0)
            const total = (bundle.totalCents / 100).toFixed(0)
            const savings = bundle.savingsPerJobCents > 0
              ? `Save $${(bundle.savingsPerJobCents / 100).toFixed(0)}/job`
              : null

            return (
              <button
                key={bundle.type}
                type="button"
                onClick={() => {
                  setSelectedBundle(bundle.type)
                  onBundleSelect?.(bundle.type)
                }}
                aria-pressed={isSelected}
                aria-label={`${bundle.label}: $${total} total, $${perJob} per job. ${savings ?? 'No discount'}`}
                className={cn(
                  'relative flex flex-col rounded-xl border p-4 text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
                  isSelected
                    ? 'border-primary-500 ring-2 ring-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
                )}
              >
                {bundle.type === '3pack' && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-emerald-500 px-2.5 py-0.5 text-[10px] font-bold text-white flex items-center gap-1">
                    <Tag className="h-2.5 w-2.5" />
                    {bundle.discountLabel}
                  </span>
                )}
                {bundle.type === '10pack' && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-primary-600 px-2.5 py-0.5 text-[10px] font-bold text-white flex items-center gap-1">
                    <Tag className="h-2.5 w-2.5" />
                    {bundle.discountLabel}
                  </span>
                )}

                <span className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                  {bundle.label}
                </span>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${perJob}
                  <span className="text-sm font-normal text-gray-500">/job</span>
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  ${total} total
                </span>
                {savings && (
                  <span className="mt-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    {savings}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
