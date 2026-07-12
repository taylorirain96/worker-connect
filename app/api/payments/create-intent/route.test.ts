import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

const {
  rateLimitMock,
  getJobCountryByIdMock,
  getCurrencyForJobCountryMock,
  adminCollectionMock,
  createQuoteFeePaymentRecordMock,
  calculateQuoteFeeCommissionMock,
} = vi.hoisted(() => ({
  rateLimitMock: vi.fn().mockReturnValue(false),
  getJobCountryByIdMock: vi.fn(),
  getCurrencyForJobCountryMock: vi.fn(),
  adminCollectionMock: vi.fn(),
  createQuoteFeePaymentRecordMock: vi.fn(),
  calculateQuoteFeeCommissionMock: vi.fn(),
}))

vi.mock('@sentry/nextjs', () => ({
  withScope: (callback: (scope: { setContext: () => void }) => void) => {
    callback({ setContext: () => {} })
  },
  captureException: vi.fn(),
}))

vi.mock('@/lib/rateLimit', () => ({
  rateLimit: rateLimitMock,
}))

vi.mock('@/lib/services/jobCountryService', () => ({
  getJobCountryById: getJobCountryByIdMock,
  getCurrencyForJobCountry: getCurrencyForJobCountryMock,
}))

vi.mock('@/lib/firebase-admin', () => ({
  adminDb: {
    collection: adminCollectionMock,
  },
}))

vi.mock('@/lib/services/quoteFeeService', () => ({
  calculateQuoteFeeCommission: calculateQuoteFeeCommissionMock,
  createQuoteFeePaymentRecord: createQuoteFeePaymentRecordMock,
}))

vi.mock('@/lib/stripe', () => ({
  createPaymentIntent: vi.fn(),
}))

import { POST } from '@/app/api/payments/create-intent/route'

describe('POST /api/payments/create-intent', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    delete process.env.STRIPE_SECRET_KEY
    getJobCountryByIdMock.mockResolvedValue('NZ')
    getCurrencyForJobCountryMock.mockReturnValue('nzd')
    calculateQuoteFeeCommissionMock.mockReturnValue({
      commissionRate: 0.1,
      commissionAmount: 2.5,
      workerAmount: 22.5,
    })
    createQuoteFeePaymentRecordMock.mockResolvedValue('quote_payment_1')
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('creates a mock quote-fee intent for an authenticated homeowner even without a Stripe account', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-07-12T14:00:00.000Z'))

    adminCollectionMock.mockImplementation((name: string) => {
      if (name !== 'users') {
        throw new Error(`Unexpected collection: ${name}`)
      }

      return {
        doc: (id: string) => ({
          get: vi.fn().mockResolvedValue(
            id === 'worker_1'
              ? {
                  exists: true,
                  data: () => ({
                    chargesQuoteFee: true,
                    quoteFeeAmount: 25,
                    displayName: 'Worker One',
                    country: 'NZ',
                  }),
                }
              : {
                  exists: true,
                  data: () => ({
                    role: 'homeowner',
                  }),
                }
          ),
        }),
      }
    })

    const response = await POST(
      new NextRequest('http://localhost/api/payments/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 'homeowner_1',
        },
        body: JSON.stringify({
          paymentType: 'quote_fee',
          employerId: 'homeowner_1',
          workerId: 'worker_1',
          requestDescription: 'Need a site visit',
          requestedDate: '2026-07-20',
          address: '1 Test Street',
        }),
      })
    )
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(createQuoteFeePaymentRecordMock).toHaveBeenCalledWith({
      employerId: 'homeowner_1',
      workerId: 'worker_1',
      workerName: 'Worker One',
      amount: 25,
      currency: 'nzd',
      status: 'pending',
      stripePaymentIntentId: expect.stringMatching(/^pi_mock_\d+$/),
      commissionRate: 0.1,
      commissionAmount: 2.5,
      workerAmount: 22.5,
      requestDescription: 'Need a site visit',
      requestedDate: '2026-07-20',
      address: '1 Test Street',
      paymentType: 'quote_fee',
    })
    expect(json).toEqual({
      clientSecret: expect.stringMatching(/^pi_mock_\d+_secret_mock$/),
      paymentIntentId: expect.stringMatching(/^pi_mock_\d+$/),
      amount: 2500,
      currency: 'nzd',
      quoteFeeAmount: 25,
      commissionRate: 0.1,
      commissionAmount: 2.5,
      workerAmount: 22.5,
    })
  })

  it('rejects quote-fee intents when the authenticated user does not match the employer', async () => {
    const response = await POST(
      new NextRequest('http://localhost/api/payments/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 'someone_else',
        },
        body: JSON.stringify({
          paymentType: 'quote_fee',
          employerId: 'homeowner_1',
          workerId: 'worker_1',
        }),
      })
    )
    const json = await response.json()

    expect(response.status).toBe(403)
    expect(json).toEqual({ error: 'Forbidden' })
    expect(createQuoteFeePaymentRecordMock).not.toHaveBeenCalled()
  })
})
