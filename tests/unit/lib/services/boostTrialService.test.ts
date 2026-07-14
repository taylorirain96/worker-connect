import { describe, expect, it } from 'vitest'
import type { ActiveTrial, UserProfile } from '@/types'
import {
  getAvailableTrialDefinitions,
  getTrialAvailability,
} from '@/lib/services/boostTrialService'
import { getTrialCommissionRate } from '@/lib/subscriptions'

function createWorkerProfile(
  workerSubscriptionTier: UserProfile['workerSubscriptionTier'],
  overrides: Partial<UserProfile> = {}
): UserProfile {
  return {
    uid: 'worker-1',
    email: null,
    displayName: null,
    photoURL: null,
    role: 'worker',
    createdAt: new Date(0).toISOString(),
    profileComplete: true,
    workerSubscriptionTier,
    completedJobs: 0,
    ...overrides,
  }
}

function createActiveTrial(type: ActiveTrial['type']): ActiveTrial {
  return {
    type,
    activatedAt: new Date(0).toISOString(),
    expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
  }
}

describe('Boost trial availability', () => {
  it("excludes Elite workers' redundant or worse trial options", () => {
    const trialTypes = getAvailableTrialDefinitions(createWorkerProfile('elite')).map(
      (trial) => trial.type
    )

    expect(trialTypes).not.toContain('featured_profile')
    expect(trialTypes).not.toContain('commission_8pct')
    expect(trialTypes).toContain('commission_discount_stack')
  })

  it('keeps the commission discount stack trial available to every worker tier', () => {
    const tiers: Array<UserProfile['workerSubscriptionTier']> = ['free', 'pro', 'elite']

    for (const tier of tiers) {
      const availability = getTrialAvailability(createWorkerProfile(tier)).find(
        (trial) => trial.definition.type === 'commission_discount_stack'
      )

      expect(availability?.available).toBe(true)
    }
  })

  it('applies the commission discount stack on top of subscription rates', () => {
    const eliteProfile = createWorkerProfile('elite', {
      activeTrials: [createActiveTrial('commission_discount_stack')],
    })
    const proProfile = createWorkerProfile('pro', {
      activeTrials: [createActiveTrial('commission_discount_stack')],
    })

    expect(getTrialCommissionRate(eliteProfile)).toBe(0.04)
    expect(getTrialCommissionRate(proProfile)).toBe(0.06)
  })
})
