import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

const {
  calculateCommissionMock,
  createEscrowRecordMock,
  getJobCountryByIdMock,
  getCurrencyForJobCountryMock,
  isStripeConfiguredMock,
  paymentIntentCreateMock,
  getStripeMock,
  toCentsMock,
  rateLimitMock,
  jobUpdateMock,
  quoteUpdateMock,
  adminCollectionMock,
} = vi.hoisted(() => ({
  calculateCommissionMock: vi.fn(),
  createEscrowRecordMock: vi.fn(),
  getJobCountryByIdMock: vi.fn(),
  getCurrencyForJobCountryMock: vi.fn(),
  isStripeConfiguredMock: vi.fn(),
  paymentIntentCreateMock: vi.fn(),
  getStripeMock: vi.fn(),
  toCentsMock: vi.fn((value: number) => Math.round(value * 100)),
  rateLimitMock: vi.fn().mockReturnValue(false),
  jobUpdateMock: vi.fn().mockResolvedValue(undefined),
  quoteUpdateMock: vi.fn().mockResolvedValue(undefined),
  adminCollectionMock: vi.fn(),
}))

vi.mock('@/lib/services/escrowService', () => ({
  calculateCommission: calculateCommissionMock,
  createEscrowRecord: createEscrowRecordMock,
}))

vi.mock('@/lib/services/jobCountryService', () => ({
  getJobCountryById: getJobCountryByIdMock,
  getCurrencyForJobCountry: getCurrencyForJobCountryMock,
}))

vi.mock('@/lib/stripe', () => ({
  getStripe: getStripeMock,
  isStripeConfigured: isStripeConfiguredMock,
  toCents: toCentsMock,
}))

vi.mock('@/lib/rateLimit', () => ({
  rateLimit: rateLimitMock,
}))

vi.mock('@/lib/firebase-admin', () => ({
  adminDb: {
    collection: adminCollectionMock,
  },
}))

import { POST } from '@/app/api/payments/escrow/create/route'

describe('POST /api/payments/escrow/create', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    calculateCommissionMock.mockReturnValue({
      commissionRate: 0.18,
      commissionAmount: 90,
      workerAmount: 410,
      tier: 'new',
    })
    getJobCountryByIdMock.mockResolvedValue('AU')
    getCurrencyForJobCountryMock.mockReturnValue('aud')
    isStripeConfiguredMock.mockReturnValue(true)
    getStripeMock.mockReturnValue({
      paymentIntents: {
        create: paymentIntentCreateMock,
      },
    })
    adminCollectionMock.mockImplementation((name: string) => {
      if (name === 'jobs') {
        return {
          doc: () => ({
            update: jobUpdateMock,
          }),
        }
      }

      if (name === 'quotes') {
        return {
          doc: () => ({
            update: quoteUpdateMock,
          }),
        }
      }

      return {
        doc: () => ({
          update: vi.fn(),
        }),
      }
    })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('creates a Stripe payment intent, escrow record, and linked job updates', async () => {
    paymentIntentCreateMock.mockResolvedValue({
      id: 'pi_live_123',
      client_secret: 'pi_live_123_secret_abc',
    })
    createEscrowRecordMock.mockResolvedValue('escrow_1')

    const response = await POST(
      new NextRequest('http://localhost/api/payments/escrow/create', {
        method: 'POST',
        body: JSON.stringify({
          jobId: 'job_1',
          quoteId: 'quote_1',
          employerId: 'employer_1',
          workerId: 'worker_1',
          amount: 500,
          completedJobs: 3,
        }),
      })
    )
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(calculateCommissionMock).toHaveBeenCalledWith(500, 3)
    expect(getJobCountryByIdMock).toHaveBeenCalledWith('job_1')
    expect(paymentIntentCreateMock).toHaveBeenCalledWith(expect.objectContaining({
      amount: 50000,
      currency: 'aud',
      capture_method: 'manual',
      metadata: expect.objectContaining({
        jobId: 'job_1',
        quoteId: 'quote_1',
        employerId: 'employer_1',
        workerId: 'worker_1',
        country: 'AU',
      }),
    }))
    expect(createEscrowRecordMock).toHaveBeenCalledWith({
      jobId: 'job_1',
      quoteId: 'quote_1',
      employerId: 'employer_1',
      workerId: 'worker_1',
      amount: 500,
      currency: 'aud',
      status: 'pending',
      stripePaymentIntentId: 'pi_live_123',
      commissionRate: 0.18,
      commissionAmount: 90,
      workerAmount: 410,
    })
    expect(jobUpdateMock).toHaveBeenCalledWith(expect.objectContaining({
      escrowId: 'escrow_1',
      escrowStatus: 'pending',
      workflowStage: 'accepted',
    }))
    expect(quoteUpdateMock).toHaveBeenCalledWith(expect.objectContaining({
      escrowId: 'escrow_1',
      escrowStatus: 'pending',
    }))
    expect(json).toEqual({
      escrowId: 'escrow_1',
      clientSecret: 'pi_live_123_secret_abc',
      paymentIntentId: 'pi_live_123',
      amount: 500,
      commissionRate: 0.18,
      commissionAmount: 90,
      workerAmount: 410,
      currency: 'aud',
    })
  })

  it('creates a held mock escrow record when Stripe is not configured', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-02T03:04:05.000Z'))
    isStripeConfiguredMock.mockReturnValue(false)
    createEscrowRecordMock.mockResolvedValue('escrow_mock_1')

    const response = await POST(
      new NextRequest('http://localhost/api/payments/escrow/create', {
        method: 'POST',
        body: JSON.stringify({
          jobId: 'job_1',
          quoteId: 'quote_1',
          employerId: 'employer_1',
          workerId: 'worker_1',
          amount: 500,
        }),
      })
    )
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(paymentIntentCreateMock).not.toHaveBeenCalled()
    expect(createEscrowRecordMock).toHaveBeenCalledWith({
      jobId: 'job_1',
      quoteId: 'quote_1',
      employerId: 'employer_1',
      workerId: 'worker_1',
      amount: 500,
      currency: 'aud',
      status: 'held',
      stripePaymentIntentId: 'pi_mock_1767323045000',
      commissionRate: 0.18,
      commissionAmount: 90,
      workerAmount: 410,
    })
    expect(jobUpdateMock).toHaveBeenCalledWith(expect.objectContaining({
      escrowId: 'escrow_mock_1',
      escrowStatus: 'held',
      workflowStage: 'deposit_secure',
    }))
    expect(quoteUpdateMock).toHaveBeenCalledWith(expect.objectContaining({
      escrowId: 'escrow_mock_1',
      escrowStatus: 'held',
    }))
    expect(json).toEqual({
      escrowId: 'escrow_mock_1',
      clientSecret: 'pi_mock_1767323045000_secret_mock',
      paymentIntentId: 'pi_mock_1767323045000',
      amount: 500,
      commissionRate: 0.18,
      commissionAmount: 90,
      workerAmount: 410,
      currency: 'aud',
      mockMode: true,
    })
  })
})
