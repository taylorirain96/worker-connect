import { Timestamp } from 'firebase-admin/firestore'
import type { Subscription, SubscriptionPlan } from '@/types/payment'

const DEFAULT_CURRENCY = 'nzd'

export function toIsoTimestamp(value: unknown): string | undefined {
  if (value instanceof Timestamp) return value.toDate().toISOString()
  if (typeof value === 'string') return value
  return undefined
}

export function serializeSubscription(
  id: string,
  data: Record<string, unknown>,
): Subscription {
  const nowIso = new Date().toISOString()

  return {
    id,
    userId: typeof data.userId === 'string' ? data.userId : '',
    plan: (data.plan as SubscriptionPlan) ?? 'free',
    status: (data.status as Subscription['status']) ?? 'active',
    stripeSubscriptionId:
      typeof data.stripeSubscriptionId === 'string' ? data.stripeSubscriptionId : undefined,
    stripeCustomerId:
      typeof data.stripeCustomerId === 'string' ? data.stripeCustomerId : undefined,
    currentPeriodStart: toIsoTimestamp(data.currentPeriodStart) ?? nowIso,
    currentPeriodEnd: toIsoTimestamp(data.currentPeriodEnd) ?? nowIso,
    cancelAtPeriodEnd: Boolean(data.cancelAtPeriodEnd),
    billingInterval: data.billingInterval === 'year' ? 'year' : 'month',
    amount: typeof data.amount === 'number' ? data.amount : 0,
    currency: typeof data.currency === 'string' ? data.currency : DEFAULT_CURRENCY,
    createdAt: toIsoTimestamp(data.createdAt) ?? nowIso,
    updatedAt: toIsoTimestamp(data.updatedAt) ?? nowIso,
    canceledAt: toIsoTimestamp(data.canceledAt),
    trialEnd: toIsoTimestamp(data.trialEnd),
  }
}
