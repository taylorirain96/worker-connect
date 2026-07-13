import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

const {
  adminCollectionMock,
  getQuoteFeePaymentByIntentMock,
  updateQuoteFeePaymentMock,
  isStripeConfiguredMock,
  sendDirectJobRequestEmailMock,
  sendAdminNotificationMock,
} = vi.hoisted(() => ({
  adminCollectionMock: vi.fn(),
  getQuoteFeePaymentByIntentMock: vi.fn(),
  updateQuoteFeePaymentMock: vi.fn(),
  isStripeConfiguredMock: vi.fn(),
  sendDirectJobRequestEmailMock: vi.fn().mockResolvedValue(undefined),
  sendAdminNotificationMock: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@/lib/firebase-admin', () => ({
  adminDb: {
    collection: adminCollectionMock,
  },
}))

vi.mock('@/lib/email/transactional', () => ({
  sendDirectJobRequestEmail: sendDirectJobRequestEmailMock,
}))

vi.mock('@/lib/notifications/admin', () => ({
  sendAdminNotification: sendAdminNotificationMock,
}))

vi.mock('@/lib/stripe', () => ({
  getStripe: vi.fn(),
  isStripeConfigured: isStripeConfiguredMock,
}))

vi.mock('@/lib/services/quoteFeeService', () => ({
  getQuoteFeePaymentByIntent: getQuoteFeePaymentByIntentMock,
  updateQuoteFeePayment: updateQuoteFeePaymentMock,
}))

import { POST } from '@/app/api/jobs/direct/route'

describe('POST /api/jobs/direct', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    isStripeConfiguredMock.mockReturnValue(false)
  })

  it('rejects direct requests from non-homeowner users', async () => {
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
                    displayName: 'Worker One',
                    email: 'worker@example.com',
                    chargesQuoteFee: false,
                  }),
                }
              : {
                  exists: true,
                  data: () => ({
                    displayName: 'Worker Acting As Buyer',
                    email: 'not-homeowner@example.com',
                    role: 'worker',
                  }),
                }
          ),
        }),
      }
    })

    const response = await POST(
      new NextRequest('http://localhost/api/jobs/direct', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 'user_1',
        },
        body: JSON.stringify({
          workerId: 'worker_1',
          description: 'Need a quote',
          date: '2026-07-20',
          address: '1 Test Street',
        }),
      })
    )
    const json = await response.json()

    expect(response.status).toBe(403)
    expect(json).toEqual({ error: 'Only homeowners can send direct requests.' })
  })

  it('rejects failed mock quote-fee payments before creating the request', async () => {
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
                    displayName: 'Worker One',
                    email: 'worker@example.com',
                    chargesQuoteFee: true,
                    quoteFeeAmount: 25,
                  }),
                }
              : {
                  exists: true,
                  data: () => ({
                    displayName: 'Homeowner One',
                    email: 'homeowner@example.com',
                    role: 'homeowner',
                  }),
                }
          ),
        }),
      }
    })

    getQuoteFeePaymentByIntentMock.mockResolvedValue({
      id: 'quote_payment_1',
      employerId: 'user_1',
      workerId: 'worker_1',
      workerName: 'Worker One',
      amount: 25,
      currency: 'nzd',
      status: 'failed',
      stripePaymentIntentId: 'pi_mock_123',
      commissionRate: 0.1,
      commissionAmount: 2.5,
      workerAmount: 22.5,
      paymentType: 'quote_fee',
      createdAt: '2026-07-12T14:00:00.000Z',
      updatedAt: '2026-07-12T14:00:00.000Z',
    })

    const response = await POST(
      new NextRequest('http://localhost/api/jobs/direct', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 'user_1',
        },
        body: JSON.stringify({
          workerId: 'worker_1',
          description: 'Need a quote',
          date: '2026-07-20',
          address: '1 Test Street',
          paymentIntentId: 'pi_mock_123',
        }),
      })
    )
    const json = await response.json()

    expect(response.status).toBe(400)
    expect(json).toEqual({ error: 'Quote-fee payment is not valid.' })
    expect(updateQuoteFeePaymentMock).not.toHaveBeenCalled()
    expect(sendDirectJobRequestEmailMock).not.toHaveBeenCalled()
    expect(sendAdminNotificationMock).not.toHaveBeenCalled()
  })
})
