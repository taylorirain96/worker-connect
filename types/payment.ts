/**
 * Payment & Billing type definitions.
 * Core Payment, Invoice, Payout, and Dispute types live in types/index.ts.
 * This file adds Subscription and analytics-related types,
 * plus Price Anchoring (bundle pricing) and Mover Mode types.
 */

// ─── Price Anchoring ─────────────────────────────────────────────────────────

/** Job-bundle type used for price anchoring. */
export type BundleType = 'single' | '3pack' | '10pack'

export interface BundleOption {
  type: BundleType
  label: string
  /** Number of jobs in the bundle */
  jobCount: number
  /** Total price in USD (cents) */
  totalCents: number
  /** Price per job in USD (cents) */
  perJobCents: number
  /** Savings per job vs single price, in USD (cents) */
  savingsPerJobCents: number
  /** Discount percentage label, e.g. "5%" */
  discountLabel: string
}

/** Single-job base price in USD cents. */
export const SINGLE_JOB_PRICE_CENTS = 10000 // $100

export const BUNDLE_OPTIONS: BundleOption[] = [
  {
    type: 'single',
    label: 'Single Job',
    jobCount: 1,
    totalCents: 10000,
    perJobCents: 10000,
    savingsPerJobCents: 0,
    discountLabel: 'No discount',
  },
  {
    type: '3pack',
    label: '3-Job Bundle',
    jobCount: 3,
    totalCents: 28500, // $285
    perJobCents: 9500, // $95 per job
    savingsPerJobCents: 500, // $5 savings per job
    discountLabel: '5% off',
  },
  {
    type: '10pack',
    label: '10-Job Bundle',
    jobCount: 10,
    totalCents: 90000, // $900
    perJobCents: 9000, // $90 per job
    savingsPerJobCents: 1000, // $10 savings per job
    discountLabel: '10% off',
  },
]

// ─── Mover Mode ───────────────────────────────────────────────────────────────

/** A job opportunity surfaced for workers who have set a target relocation city. */
export interface MoverOpportunity {
  jobId: string
  title: string
  city: string
  state: string
  targetCities: string[]
  /** Premium bonus percentage (5–20 %) on top of base rate */
  moverBonusPercentage: number
  /** Base hourly rate in USD cents */
  baseRateCents: number
  /** Effective rate with mover bonus applied (cents) */
  effectiveRateCents: number
  employerName: string
  contractDurationWeeks: number
  createdAt: string
}

/** Aggregate Mover Mode performance stats (used in analytics). */
export interface MoverModeStats {
  totalMoverWorkers: number
  totalMoverOpportunities: number
  moverAcceptanceRate: number
  moverSuccessRate: number
  avgBonusPercentage: number
  totalMoverRevenue: number
  topRelocationCities: Array<{ city: string; count: number }>
}

// ─── Subscriptions ────────────────────────────────────────────────────────────

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
