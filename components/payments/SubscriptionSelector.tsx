'use client'
import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { Check, Zap, Building2, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'
import type { SubscriptionPlan, SubscriptionPlanDetails } from '@/types/payment'

interface SubscriptionSelectorProps {
  userId: string
  currentPlan?: SubscriptionPlan
  onSelect?: (plan: SubscriptionPlan) => void
}

const PLAN_ICONS: Record<SubscriptionPlan, React.ReactNode> = {
  free: <span className="text-2xl">🌱</span>,
  pro: <Zap className="h-6 w-6 text-primary-500" />,
  enterprise: <Building2 className="h-6 w-6 text-purple-500" />,
}

export default function SubscriptionSelector({ userId, currentPlan = 'free', onSelect }: SubscriptionSelectorProps) {
  const [plans, setPlans] = useState<SubscriptionPlanDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [subscribing, setSubscribing] = useState<SubscriptionPlan | null>(null)
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly')
  const [selected, setSelected] = useState<SubscriptionPlan>(currentPlan)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/subscriptions/create')
        if (!res.ok) throw new Error('Failed to load plans')
        const data = await res.json() as { plans: SubscriptionPlanDetails[] }
        setPlans(data.plans ?? [])
      } catch {
        toast.error('Could not load subscription plans')
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [])

  const handleSelect = async (plan: SubscriptionPlan) => {
    if (plan === selected) return
    setSubscribing(plan)
    try {
      const res = await fetch('/api/subscriptions/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, plan, billingCycle: billing }),
      })
      if (!res.ok) {
        const data = await res.json() as { error?: string }
        throw new Error(data.error ?? 'Subscription failed')
      }
      setSelected(plan)
      onSelect?.(plan)
      toast.success(`Upgraded to ${plan.charAt(0).toUpperCase() + plan.slice(1)}!`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Subscription failed')
    } finally {
      setSubscribing(null)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-10"><LoadingSpinner /></div>
    )
  }

  const yearlyDiscount = 17 // percent saved on yearly billing

  return (
    <div className="space-y-6">
      {/* Billing toggle */}
      <div className="flex justify-center">
        <div className="inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-700 p-1 gap-1">
          {(['monthly', 'yearly'] as const).map((b) => (
            <button
              key={b}
              onClick={() => setBilling(b)}
              className={`px-5 py-1.5 rounded-full text-sm font-medium transition-colors ${
                billing === b
                  ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              {b.charAt(0).toUpperCase() + b.slice(1)}
              {b === 'yearly' && (
                <span className="ml-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  -{yearlyDiscount}%
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Plan cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {plans.map((plan) => {
          const price = billing === 'yearly' ? plan.priceYearly : plan.priceMonthly
          const monthlyEquiv = billing === 'yearly' ? Math.round(plan.priceYearly / 12) : plan.priceMonthly
          const isCurrent = selected === plan.id
          const isPro = plan.id === 'pro'

          return (
            <Card
              key={plan.id}
              padding="none"
              className={`relative overflow-hidden transition-all duration-200 ${
                isPro
                  ? 'border-primary-500 shadow-lg shadow-primary-100 dark:shadow-primary-900/20'
                  : isCurrent
                  ? 'border-gray-400 dark:border-gray-500'
                  : ''
              }`}
            >
              {isPro && (
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary-400 to-primary-600" />
              )}
              <div className="p-5 space-y-4">
                <div className="flex items-center gap-3">
                  {PLAN_ICONS[plan.id]}
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{plan.name}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{plan.description}</p>
                  </div>
                </div>

                <div>
                  {price === 0 ? (
                    <span className="text-3xl font-bold text-gray-900 dark:text-white">Free</span>
                  ) : (
                    <>
                      <span className="text-3xl font-bold text-gray-900 dark:text-white">
                        ${billing === 'yearly' ? monthlyEquiv : price}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">/mo</span>
                      {billing === 'yearly' && (
                        <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
                          Billed ${price}/yr
                        </p>
                      )}
                    </>
                  )}
                </div>

                <ul className="space-y-2">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <Check className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                      {feat}
                    </li>
                  ))}
                </ul>

                <Button
                  className="w-full"
                  variant={isCurrent ? 'secondary' : isPro ? 'primary' : 'outline'}
                  loading={subscribing === plan.id}
                  disabled={isCurrent || subscribing !== null}
                  onClick={() => void handleSelect(plan.id)}
                >
                  {isCurrent ? 'Current plan' : (
                    <>
                      {plan.id === 'free' ? 'Downgrade' : 'Upgrade'}
                      <ChevronRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </Card>
          )
        })}
      </div>

      <p className="text-center text-xs text-gray-400 dark:text-gray-500">
        All plans include a 14-day free trial. Cancel anytime.
      </p>
    </div>
  )
}
