import { beforeEach, describe, expect, it, vi } from 'vitest'

const { collectionMock } = vi.hoisted(() => ({
  collectionMock: vi.fn(),
}))

vi.mock('@/lib/firebase', () => ({
  db: null,
}))

vi.mock('@/lib/firebase-admin', () => ({
  adminDb: {
    collection: collectionMock,
  },
}))

vi.mock('firebase/firestore', () => ({
  Timestamp: class {
    toDate() {
      return new Date()
    }
  },
  collection: vi.fn(),
  doc: vi.fn(),
  addDoc: vi.fn(),
  updateDoc: vi.fn(),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
  serverTimestamp: vi.fn(),
}))

import { calculateCommission, createEscrowRecord, resolveDispute } from '@/lib/services/escrowService'

describe('escrowService', () => {
  beforeEach(() => {
    collectionMock.mockReset()
  })

  it('creates an escrow record through Firestore and returns the id', async () => {
    const addMock = vi.fn().mockResolvedValue({ id: 'escrow_123' })
    collectionMock.mockReturnValue({
      add: addMock,
    })

    const id = await createEscrowRecord({
      jobId: 'job_1',
      quoteId: 'quote_1',
      employerId: 'employer_1',
      workerId: 'worker_1',
      amount: 500,
      currency: 'nzd',
      status: 'held',
      stripePaymentIntentId: 'pi_123',
      commissionRate: 0.18,
      commissionAmount: 90,
      workerAmount: 410,
    })

    expect(id).toBe('escrow_123')
    expect(collectionMock).toHaveBeenCalledWith('escrowPayments')
    expect(addMock).toHaveBeenCalledTimes(1)
    expect(addMock.mock.calls[0][0]).toEqual(expect.objectContaining({
      jobId: 'job_1',
      workerId: 'worker_1',
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    }))
  })

  it('calculates commission and worker payout math', () => {
    const result = calculateCommission(199.99, 0)

    expect(result).toEqual({
      commissionRate: 0.18,
      commissionAmount: 36,
      workerAmount: 163.99,
      tier: 'new',
    })
  })

  it('resolves disputes with refund path updates', async () => {
    const escrowUpdateMock = vi.fn().mockResolvedValue(undefined)
    const jobUpdateMock = vi.fn().mockResolvedValue(undefined)

    collectionMock.mockImplementation((name: string) => {
      if (name === 'escrowPayments') {
        return {
          doc: () => ({
            update: escrowUpdateMock,
          }),
        }
      }

      if (name === 'jobs') {
        return {
          doc: () => ({
            update: jobUpdateMock,
          }),
        }
      }

      return {
        doc: () => ({
          update: vi.fn(),
        }),
      }
    })

    await resolveDispute('escrow_1', 'job_1', 'refund_to_employer', 'admin_1')

    expect(escrowUpdateMock).toHaveBeenCalledWith(expect.objectContaining({
      status: 'refunded',
      disputeResolution: 'refund_to_employer',
      disputeResolvedBy: 'admin_1',
      refundedAt: expect.any(String),
    }))
    expect(jobUpdateMock).toHaveBeenCalledWith(expect.objectContaining({
      status: 'cancelled',
      workflowStage: 'posted',
      escrowStatus: 'refunded',
      updatedAt: expect.any(String),
    }))
  })
})
