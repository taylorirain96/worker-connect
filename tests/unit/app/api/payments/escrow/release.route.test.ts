import assert from 'node:assert/strict'
import { beforeEach, describe, it, mock } from 'node:test'

const captureCalls: string[] = []
const transferCalls: Array<Record<string, unknown>> = []
const updateEscrowStatusCalls: Array<{ id: string; status: string; extra: Record<string, unknown> }> = []
const notificationCalls: Array<Record<string, unknown>> = []
const emailCalls: Array<Record<string, unknown>> = []

let currentEscrow: Record<string, unknown>
let workerUser: Record<string, unknown>
let jobData: Record<string, unknown>

mock.module('next/server', {
  namedExports: {
    NextResponse: {
      json: (body: unknown, init?: { status?: number }) => ({
        status: init?.status ?? 200,
        body,
      }),
    },
  },
})

mock.module('@/lib/stripe', {
  namedExports: {
    isStripeConfigured: () => true,
    toCents: (amount: number) => Math.round(amount * 100),
    getStripe: () => ({
      paymentIntents: {
        capture: async (id: string) => {
          captureCalls.push(id)
        },
      },
      transfers: {
        create: async (params: Record<string, unknown>) => {
          transferCalls.push(params)
          return { id: 'tr_123' }
        },
      },
    }),
  },
})

mock.module('@/lib/services/escrowService', {
  namedExports: {
    getCurrencyDisplay: () => ({ code: 'nzd', label: 'NZ$' }),
    getEscrowById: async () => currentEscrow,
    updateEscrowStatus: async (id: string, status: string, extra: Record<string, unknown>) => {
      updateEscrowStatusCalls.push({ id, status, extra })
    },
  },
})

mock.module('@/lib/firebase-admin', {
  namedExports: {
    adminDb: {
      collection: (name: string) => ({
        doc: (id: string) => ({
          get: async () => {
            if (name === 'users' && id === String(currentEscrow.workerId)) {
              return { exists: true, data: () => workerUser }
            }
            if (name === 'users' && id === String(currentEscrow.employerId)) {
              return { exists: true, data: () => ({ role: 'employer' }) }
            }
            if (name === 'jobs' && id === String(currentEscrow.jobId)) {
              return { exists: true, data: () => jobData }
            }
            return { exists: false, data: () => ({}) }
          },
          update: async () => undefined,
        }),
      }),
    },
  },
})

mock.module('@/lib/notificationService', {
  namedExports: {
    sendNotification: async (payload: Record<string, unknown>) => {
      notificationCalls.push(payload)
    },
  },
})

mock.module('@/lib/email/transactional', {
  namedExports: {
    sendPaymentReleasedEmail: async (payload: Record<string, unknown>) => {
      emailCalls.push(payload)
    },
  },
})

mock.module('@/lib/rateLimit', {
  namedExports: {
    rateLimit: () => false,
  },
})

const { POST } = await import('@/app/api/payments/escrow/release/route')

beforeEach(() => {
  captureCalls.length = 0
  transferCalls.length = 0
  updateEscrowStatusCalls.length = 0
  notificationCalls.length = 0
  emailCalls.length = 0

  currentEscrow = {
    id: 'escrow_1',
    jobId: 'job_1',
    employerId: 'employer_1',
    workerId: 'worker_1',
    status: 'held',
    currency: 'nzd',
    amount: 200,
    workerAmount: 170,
    commissionRate: 0.15,
    commissionAmount: 30,
    stripePaymentIntentId: 'pi_real_123',
  }

  workerUser = {
    stripeAccountId: 'acct_123',
    email: 'worker@example.com',
    displayName: 'Worker Name',
  }

  jobData = {
    title: 'Paint fence',
  }
})

describe('POST /api/payments/escrow/release', () => {
  it('releases escrow with Stripe capture + Connect transfer when worker has a connected account', async () => {
    const response = await POST({
      json: async () => ({ escrowId: 'escrow_1', releasedBy: 'employer_1' }),
    } as never)

    assert.equal(response.status, 200)
    assert.equal(captureCalls.length, 1)
    assert.equal(captureCalls[0], 'pi_real_123')

    assert.equal(transferCalls.length, 1)
    assert.equal(transferCalls[0].destination, 'acct_123')
    assert.equal(transferCalls[0].amount, 17000)

    assert.equal(updateEscrowStatusCalls.length, 1)
    assert.equal(updateEscrowStatusCalls[0].id, 'escrow_1')
    assert.equal(updateEscrowStatusCalls[0].status, 'released')
    assert.equal(updateEscrowStatusCalls[0].extra.stripeTransferId, 'tr_123')

    assert.equal(notificationCalls.length, 1)
    assert.equal(emailCalls.length, 1)
  })

  it('releases escrow without Stripe transfer when worker has no connected account (pending payout)', async () => {
    workerUser = {
      email: 'worker@example.com',
      displayName: 'Worker Name',
    }

    const response = await POST({
      json: async () => ({ escrowId: 'escrow_1', releasedBy: 'employer_1' }),
    } as never)

    assert.equal(response.status, 200)
    assert.equal(captureCalls.length, 1)
    assert.equal(transferCalls.length, 0)

    assert.equal(updateEscrowStatusCalls.length, 1)
    assert.equal(updateEscrowStatusCalls[0].status, 'released')
    assert.equal(updateEscrowStatusCalls[0].extra.stripeTransferId, undefined)

    const payload = response.body as Record<string, unknown>
    assert.equal(payload.stripeTransferId, undefined)
  })
})
