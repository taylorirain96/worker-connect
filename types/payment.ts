/**
 * Payment & Billing type definitions.
 * Core Payment, Invoice, Payout, and Dispute types live in types/index.ts.
 * This file adds Subscription and analytics-related types.
 */

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
  monthlyPrice: number
  yearlyPrice: number
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
    yearlyPrice: 0,
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
    yearlyPrice: 26,
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
    yearlyPrice: 89,
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
