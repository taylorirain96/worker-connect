/**
 * Payment & Billing type definitions.
 * Core Payment, Invoice, Payout, and Dispute types live in types/index.ts.
 * This file adds Subscription, Bundle Pricing, Mover Mode, and analytics-related types.
 */

// ---------------------------------------------------------------------------
// Bundle / Price-Anchoring types
// ---------------------------------------------------------------------------

export type BundleType = 'single' | '3pack' | '10pack'

export interface BundlePricing {
  type: BundleType
  jobCount: number
  totalPrice: number
  pricePerJob: number
  savingsPerJob: number
  savingsPercent: number
  label: string
}

/** Job-bundle price anchoring: single $100 baseline, 5% and 10% discounts. */
export const BUNDLE_PRICING: BundlePricing[] = [
  {
    type: 'single',
    jobCount: 1,
    totalPrice: 100,
    pricePerJob: 100,
    savingsPerJob: 0,
    savingsPercent: 0,
    label: 'Single Job',
  },
  {
    type: '3pack',
    jobCount: 3,
    totalPrice: 285,
    pricePerJob: 95,
    savingsPerJob: 5,
    savingsPercent: 5,
    label: '3-Job Bundle',
  },
  {
    type: '10pack',
    jobCount: 10,
    totalPrice: 900,
    pricePerJob: 90,
    savingsPerJob: 10,
    savingsPercent: 10,
    label: '10-Job Bundle',
  },
]

// ---------------------------------------------------------------------------
// Mover Mode types
// ---------------------------------------------------------------------------

export interface MoverProfile {
  workerId: string
  targetRelocationCity: string
  isActive: boolean
  hasRelocationBadge: boolean
  relocationSuccessRate: number
  completionRate: number
}

export interface MoverModeAnalytics {
  activeMoverWorkers: number
  moverJobsPosted: number
  moverJobsAccepted: number
  moverAcceptanceRate: number
  avgMoverPremiumFee: number
  topRelocationCities: { city: string; workerCount: number; jobCount: number }[]
}

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

// Reputation-tier earnings integration
import type { ReputationTier } from '@/types/reputation'
export type ReputationTierPayment = ReputationTier
export interface EarningsByReputationTier {
  tier: ReputationTier
  avgEarningsPerJob: number
  avgMonthlyEarnings: number
  premiumJobAccess: boolean
  subscriptionRecommendation: 'free' | 'pro' | 'enterprise'
}
export const EARNINGS_BY_REPUTATION_TIER: EarningsByReputationTier[] = [
  { tier: 'rookie', avgEarningsPerJob: 75, avgMonthlyEarnings: 600, premiumJobAccess: false, subscriptionRecommendation: 'free' },
  { tier: 'professional', avgEarningsPerJob: 125, avgMonthlyEarnings: 1500, premiumJobAccess: false, subscriptionRecommendation: 'pro' },
  { tier: 'expert', avgEarningsPerJob: 200, avgMonthlyEarnings: 3000, premiumJobAccess: true, subscriptionRecommendation: 'pro' },
  { tier: 'master', avgEarningsPerJob: 350, avgMonthlyEarnings: 6000, premiumJobAccess: true, subscriptionRecommendation: 'enterprise' },
]
