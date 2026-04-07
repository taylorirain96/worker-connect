/**
 * Payment & Billing System — TypeScript interfaces
 */

// ─── Enums & Unions ────────────────────────────────────────────────────────────

export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'refunded' | 'failed'
export type PaymentMethod = 'card' | 'wallet' | 'bank_transfer'
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'void'
export type SubscriptionStatus = 'active' | 'past_due' | 'canceled' | 'trialing' | 'unpaid'
export type SubscriptionPlan = 'free' | 'pro' | 'enterprise'
export type PayoutStatus = 'pending' | 'in_transit' | 'paid' | 'failed' | 'canceled'
export type PayoutMethod = 'bank_account' | 'debit_card'
export type DisputeStatus =
  | 'needs_response'
  | 'under_review'
  | 'charge_refunded'
  | 'won'
  | 'lost'
  | 'warning_closed'
export type DisputeReason =
  | 'bank_cannot_process'
  | 'check_returned'
  | 'credit_not_processed'
  | 'customer_initiated'
  | 'debit_not_authorized'
  | 'duplicate'
  | 'fraudulent'
  | 'general'
  | 'incorrect_account_details'
  | 'insufficient_funds'
  | 'product_not_received'
  | 'product_unacceptable'
  | 'subscription_canceled'
  | 'unrecognized'
export type Currency = 'usd' | 'eur' | 'gbp' | 'cad' | 'aud'

// ─── Payment ───────────────────────────────────────────────────────────────────

export interface PaymentItem {
  id: string
  jobId: string
  jobTitle: string
  employerId: string
  workerId: string
  amount: number
  currency: Currency
  status: PaymentStatus
  method: PaymentMethod
  stripePaymentIntentId: string
  stripeCustomerId?: string
  description?: string
  metadata?: Record<string, string>
  refundedAt?: string
  failureReason?: string
  createdAt: string
  updatedAt: string
}

export interface CreatePaymentIntentRequest {
  amount: number
  currency?: Currency
  jobId: string
  employerId: string
  workerId: string
  method?: PaymentMethod
  description?: string
  metadata?: Record<string, string>
}

export interface CreatePaymentIntentResponse {
  clientSecret: string
  paymentIntentId: string
  amount: number
  currency: string
}

export interface ConfirmPaymentRequest {
  paymentIntentId: string
  paymentMethodId: string
  jobId: string
  employerId: string
  workerId: string
  amount: number
  currency?: Currency
}

export interface ConfirmPaymentResponse {
  id: string
  status: PaymentStatus
  amount: number
  currency: string
}

// ─── Invoice ───────────────────────────────────────────────────────────────────

export interface InvoiceLineItem {
  description: string
  quantity: number
  unitPrice: number
  amount: number
}

export interface InvoiceItem {
  id: string
  invoiceNumber: string
  jobId: string
  jobTitle: string
  employerId: string
  employerName: string
  workerId: string
  workerName: string
  lineItems: InvoiceLineItem[]
  subtotal: number
  taxRate: number
  tax: number
  total: number
  currency: Currency
  status: InvoiceStatus
  dueDate: string
  notes?: string
  stripeInvoiceId?: string
  createdAt: string
  paidAt?: string
  voidedAt?: string
}

export interface GenerateInvoiceRequest {
  jobId: string
  jobTitle: string
  employerId: string
  employerName: string
  workerId: string
  workerName: string
  lineItems: InvoiceLineItem[]
  taxRate?: number
  currency?: Currency
  dueDate?: string
  notes?: string
}

// ─── Subscription ──────────────────────────────────────────────────────────────

export interface SubscriptionPlanDetails {
  id: SubscriptionPlan
  name: string
  description: string
  priceMonthly: number
  priceYearly: number
  currency: Currency
  features: string[]
  maxJobs: number | null
  maxApplications: number | null
  analyticsAccess: boolean
  prioritySupport: boolean
  apiAccess: boolean
}

export interface SubscriptionItem {
  id: string
  userId: string
  plan: SubscriptionPlan
  status: SubscriptionStatus
  stripeSubscriptionId?: string
  stripeCustomerId?: string
  currentPeriodStart: string
  currentPeriodEnd: string
  cancelAtPeriodEnd: boolean
  trialEnd?: string
  priceMonthly: number
  currency: Currency
  createdAt: string
  updatedAt: string
  canceledAt?: string
}

export interface CreateSubscriptionRequest {
  userId: string
  plan: SubscriptionPlan
  paymentMethodId?: string
  billingCycle?: 'monthly' | 'yearly'
}

export interface UpdateSubscriptionRequest {
  plan?: SubscriptionPlan
  cancelAtPeriodEnd?: boolean
  paymentMethodId?: string
}

// ─── Payout ────────────────────────────────────────────────────────────────────

export interface PayoutItem {
  id: string
  workerId: string
  amount: number
  currency: Currency
  method: PayoutMethod
  status: PayoutStatus
  stripePayoutId?: string
  stripeConnectAccountId?: string
  bankAccountLast4?: string
  bankName?: string
  estimatedArrival?: string
  failureMessage?: string
  description?: string
  createdAt: string
  updatedAt: string
  paidAt?: string
}

export interface RequestPayoutRequest {
  workerId: string
  amount: number
  currency?: Currency
  stripeConnectAccountId: string
  description?: string
}

// ─── Dispute ───────────────────────────────────────────────────────────────────

export interface DisputeItem {
  id: string
  paymentId: string
  jobId: string
  jobTitle?: string
  workerId: string
  employerId: string
  amount: number
  currency: Currency
  reason: DisputeReason
  status: DisputeStatus
  description: string
  evidence?: string
  stripeDisputeId?: string
  dueBy?: string
  resolvedAt?: string
  resolutionNote?: string
  createdAt: string
  updatedAt: string
}

export interface CreateDisputeRequest {
  paymentId: string
  jobId: string
  workerId: string
  employerId: string
  amount: number
  currency?: Currency
  reason: DisputeReason
  description: string
  evidence?: string
}

// ─── Analytics ─────────────────────────────────────────────────────────────────

export interface RevenueDataPoint {
  month: string
  label: string
  revenue: number
  payouts: number
  refunds: number
  disputes: number
}

export interface PaymentAnalyticsSummary {
  totalRevenue: number
  totalPayouts: number
  pendingPayouts: number
  successfulPayments: number
  failedPayments: number
  refundedPayments: number
  disputeCount: number
  averagePaymentValue: number
  revenueGrowthPct: number
  currency: Currency
  revenueByMonth: RevenueDataPoint[]
  paymentMethodBreakdown: { method: PaymentMethod; count: number; total: number }[]
  topWorkers: { workerId: string; workerName: string; total: number; count: number }[]
}

// ─── Webhook ───────────────────────────────────────────────────────────────────

export interface StripeWebhookEvent {
  id: string
  type: string
  created: number
  data: {
    object: Record<string, unknown>
  }
  livemode: boolean
}
