/**
 * Payment & Billing type definitions.
 * Core Payment, Invoice, Payout, and Dispute types live in types/index.ts.
 * This file adds Subscription, analytics, Mover Mode, and bundle pricing types.
 */

// ---------------------------------------------------------------------------
// Bundle / Price-Anchoring types
// ---------------------------------------------------------------------------

/** Job bundle options for price-anchored purchasing. */
export type BundleType = 'single' | '3pack' | '10pack'

export interface BundlePricing {
  bundleType: BundleType
  jobCount: number
  pricePerJob: number
  totalPrice: number
  savingsPerJob: number
  savingsPercent: number
}

/** Pre-calculated pricing tiers for the UI. */
export const BUNDLE_PRICING: BundlePricing[] = [
  { bundleType: 'single', jobCount: 1,  pricePerJob: 100, totalPrice: 100, savingsPerJob: 0,  savingsPercent: 0  },
  { bundleType: '3pack',  jobCount: 3,  pricePerJob: 95,  totalPrice: 285, savingsPerJob: 5,  savingsPercent: 5  },
  { bundleType: '10pack', jobCount: 10, pricePerJob: 90,  totalPrice: 900, savingsPerJob: 10, savingsPercent: 10 },
]

// ---------------------------------------------------------------------------
// Mover Mode types
// ---------------------------------------------------------------------------

/** Worker relocation intent stored on the worker profile. */
export interface MoverProfile {
  workerId: string
  targetRelocationCity: string
  completionRate: number
  isRelocationReady: boolean  // completionRate >= 80
  createdAt: string
  updatedAt: string
}

/** A mover opportunity is a job that targets specific cities with a bonus. */
export interface MoverOpportunity {
  jobId: string
  title: string
  city: string
  targetCities: string[]
  moverBonusPercentage: number  // 5–20 %
  baseAmount: number
  bonusAmount: number
  totalAmount: number
  employerId: string
  createdAt: string
}

/** Mover Mode analytics returned by the admin analytics endpoint. */
export interface MoverModeAnalytics {
  totalMoverProfiles: number
  relocationReadyWorkers: number
  moverOpportunitiesPosted: number
  moverJobsAccepted: number
  moverRevenueBonus: number
  topRelocationCities: { city: string; workerCount: number }[]
  moverSuccessRate: number
}

// ---------------------------------------------------------------------------
// Subscription types
// ---------------------------------------------------------------------------

export type SubscriptionPlan = 'free' | 'pro' | 'enterprise'
export type SubscriptionStatus = 'active' | 'canceled' | 'paused' | 'trialing' | 'past_due'

export interface Subscription {
  id: string
  userId: string
  plan: SubscriptionPlan
  status: SubscriptionStatus
  stripeSubscriptionId?: string
  stripeCustomerId?: string
  currentPeriodStart: string
  currentPeriodEnd: string
  cancelAtPeriodEnd: boolean
  billingInterval: 'month' | 'year'
  amount: number
  currency: string
  createdAt: string
  updatedAt: string
  canceledAt?: string
  trialEnd?: string
}

export interface SubscriptionPlanConfig {
  id: SubscriptionPlan
  name: string
  description: string
  /** Monthly price in USD when billed monthly */
  monthlyPrice: number
  /** Monthly price in USD when billed annually (discounted rate per month) */
  yearlyPricePerMonth: number
  features: string[]
  jobLimit: number | null
  highlighted?: boolean
}

export const SUBSCRIPTION_PLANS: SubscriptionPlanConfig[] = [
  {
    id: 'free',
    name: 'Free',
    description: 'Perfect for getting started',
    monthlyPrice: 0,
    yearlyPricePerMonth: 0,
    jobLimit: 3,
    features: [
      'Up to 3 active jobs',
      'Basic worker profiles',
      'Standard support',
      'Payment processing',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'For growing businesses',
    monthlyPrice: 29,
    yearlyPricePerMonth: 26,
    jobLimit: null,
    highlighted: true,
    features: [
      'Unlimited active jobs',
      'Priority worker matching',
      'Priority support',
      'Advanced analytics',
      'Custom invoicing',
      'Dedicated account manager',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For large organisations',
    monthlyPrice: 99,
    yearlyPricePerMonth: 89,
    jobLimit: null,
    features: [
      'Everything in Pro',
      'API access',
      'Custom integrations',
      'SLA guarantee',
      'Multi-seat management',
      'White-label options',
    ],
  },
]
