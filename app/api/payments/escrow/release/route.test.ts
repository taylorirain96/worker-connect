import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

const getEscrowByIdMock = vi.fn()
const updateEscrowStatusMock = vi.fn()
const isStripeConfiguredMock = vi.fn()
const captureMock = vi.fn()
const transferCreateMock = vi.fn()
const getStripeMock = vi.fn()
const toCentsMock = vi.fn((value: number) => Math.round(value * 100))
const sendNotificationMock = vi.fn().mockResolvedValue(undefined)
const sendPaymentReleasedEmailMock = vi.fn().mockResolvedValue(undefined)
const rateLimitMock = vi.fn().mockReturnValue(false)
const usersById: Record<string, Record<string, unknown> | undefined> = {}
const jobsById: Record<string, Record<string, unknown> | undefined> = {}
const jobUpdateMock = vi.fn().mockResolvedValue(undefined)

const userDocGetMock = vi.fn(async (id: string) => ({
  exists: Boolean(usersById[id]),
  data: () => usersById[id],
}))

const jobDocGetMock = vi.fn(async (id: string) => ({
  exists: Boolean(jobsById[id]),
  data: () => jobsById[id],
}))

vi.mock('@/lib/services/escrowService', () => ({
  getCurrencyDisplay: vi.fn(() => ({ code: 'nzd', label: 'NZ$' })),
  getEscrowById: getEscrowByIdMock,
  updateEscrowStatus: updateEscrowStatusMock,
}))

vi.mock('@/lib/stripe', () => ({
  getStripe: getStripeMock,
  isStripeConfigured: isStripeConfiguredMock,
  toCents: toCentsMock,
}))

vi.mock('@/lib/firebase-admin', () => ({
  adminDb: {
    collection: vi.fn((name: string) => {
      if (name === 'users') {
        return {
          doc: (id: string) => ({
            get: () => userDocGetMock(id),
          }),
        }
      }

      if (name === 'jobs') {
        return {
          doc: (id: string) => ({
            update: jobUpdateMock,
            get: () => jobDocGetMock(id),
          }),
        }
      }

      return {
        doc: () => ({
          get: vi.fn(),
          update: vi.fn(),
        }),
      }
    }),
  },
}))

vi.mock('@/lib/notificationService', () => ({
  sendNotification: sendNotificationMock,
}))

vi.mock('@/lib/email/transactional', () => ({
  sendPaymentReleasedEmail: sendPaymentReleasedEmailMock,
}))

vi.mock('@/lib/rateLimit', () => ({
  rateLimit: rateLimitMock,
}))

import { POST } from '@/app/api/payments/escrow/release/route'

describe('POST /api/payments/escrow/release', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    usersById.worker_1 = undefined
    jobsById.job_1 = { title: 'Fix roof leak' }
    isStripeConfiguredMock.mockReturnValue(true)
    getStripeMock.mockReturnValue({
      paymentIntents: { capture: captureMock },
      transfers: { create: transferCreateMock },
    })
  })

  it('releases escrow and creates a Stripe Connect transfer when worker account exists', async () => {
    usersById.worker_1 = {
      stripeAccountId: 'acct_123',
      email: 'worker@example.com',
      displayName: 'Worker One',
    }

    getEscrowByIdMock.mockResolvedValue({
      id: 'escrow_1',
      jobId: 'job_1',
      employerId: 'employer_1',
      workerId: 'worker_1',
      amount: 500,
      commissionRate: 0.18,
      commissionAmount: 90,
      workerAmount: 410,
      status: 'held',
      currency: 'nzd',
      stripePaymentIntentId: 'pi_live_123',
    })
    transferCreateMock.mockResolvedValue({ id: 'tr_123' })

    const response = await POST(
      new NextRequest('http://localhost/api/payments/escrow/release', {
        method: 'POST',
        body: JSON.stringify({ escrowId: 'escrow_1', releasedBy: 'employer_1' }),
      })
    )
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(captureMock).toHaveBeenCalledWith('pi_live_123')
    expect(transferCreateMock).toHaveBeenCalledWith(expect.objectContaining({
      destination: 'acct_123',
      amount: 41000,
      transfer_group: 'job_1',
    }))
    expect(updateEscrowStatusMock).toHaveBeenCalledWith(
      'escrow_1',
      'released',
      expect.objectContaining({
        stripeTransferId: 'tr_123',
      })
    )
    expect(json).toEqual(expect.objectContaining({
      success: true,
      stripeTransferId: 'tr_123',
    }))
  })

  it('releases escrow without transfer when worker has no connected account', async () => {
    usersById.worker_1 = {
      email: 'worker@example.com',
      displayName: 'Worker One',
    }

    getEscrowByIdMock.mockResolvedValue({
      id: 'escrow_1',
      jobId: 'job_1',
      employerId: 'employer_1',
      workerId: 'worker_1',
      amount: 500,
      commissionRate: 0.18,
      commissionAmount: 90,
      workerAmount: 410,
      status: 'held',
      currency: 'nzd',
      stripePaymentIntentId: 'pi_live_123',
    })

    const response = await POST(
      new NextRequest('http://localhost/api/payments/escrow/release', {
        method: 'POST',
        body: JSON.stringify({ escrowId: 'escrow_1', releasedBy: 'employer_1' }),
      })
    )
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(captureMock).toHaveBeenCalledWith('pi_live_123')
    expect(transferCreateMock).not.toHaveBeenCalled()
    expect(updateEscrowStatusMock).toHaveBeenCalledWith(
      'escrow_1',
      'released',
      expect.objectContaining({
        stripeTransferId: undefined,
      })
    )
    expect(json).toEqual(expect.objectContaining({
      success: true,
      stripeTransferId: undefined,
    }))
  })
})
