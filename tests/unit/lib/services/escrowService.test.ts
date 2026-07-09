import { beforeEach, describe, expect, it, vi } from 'vitest'

const addDocCalls: Array<{ col: unknown; data: Record<string, unknown> }> = []
const updateDocCalls: Array<{ ref: unknown; data: Record<string, unknown> }> = []
const adminUpdates: Array<{ collection: string; id: string; data: Record<string, unknown> }> = []
const adminAdds: Array<{ collection: string; data: Record<string, unknown> }> = []

const { adminDbMock } = vi.hoisted(() => {
  const adminUpdates: Array<{ collection: string; id: string; data: Record<string, unknown> }> = []
  const adminAdds: Array<{ collection: string; data: Record<string, unknown> }> = []

  const adminDbMock = {
    collection: (name: string) => ({
      doc: (id: string) => ({
        update: async (data: Record<string, unknown>) => {
          adminUpdates.push({ collection: name, id, data })
        },
      }),
      add: async (data: Record<string, unknown>) => {
        adminAdds.push({ collection: name, data })
        return { id: 'admin_escrow_1' }
      },
    }),
    _adminUpdates: adminUpdates,
    _adminAdds: adminAdds,
  }
  return { adminDbMock }
})

vi.mock('@/lib/firebase', () => ({
  db: null,
}))

vi.mock('@/lib/firebase-admin', () => ({
  adminDb: adminDbMock,
}))

vi.mock('firebase/firestore', () => ({
  Timestamp: class {
    toDate() {
      return new Date('2025-01-01T00:00:00.000Z')
    }
  },
  collection: (db: unknown, name: string) => ({ db, name }),
  doc: (db: unknown, name: string, id: string) => ({ db, name, id }),
  addDoc: async (col: unknown, data: Record<string, unknown>) => {
    addDocCalls.push({ col, data })
    return { id: 'escrow_1' }
  },
  updateDoc: async (ref: unknown, data: Record<string, unknown>) => {
    updateDocCalls.push({ ref, data })
  },
  getDoc: async () => ({ exists: () => false, id: '', data: () => ({}) }),
  getDocs: async () => ({ empty: true, docs: [] }),
  query: (...parts: unknown[]) => parts,
  where: (...parts: unknown[]) => parts,
  orderBy: (...parts: unknown[]) => parts,
  limit: (value: number) => value,
  serverTimestamp: () => 'SERVER_TIMESTAMP',
}))

import { calculateCommission, createEscrowRecord, openDispute, resolveDispute } from '@/lib/services/escrowService'

describe('escrowService', () => {
  beforeEach(() => {
    addDocCalls.length = 0
    updateDocCalls.length = 0
    adminDbMock._adminUpdates.length = 0
    adminDbMock._adminAdds.length = 0
  })

  it('creates an escrow record with server timestamps', async () => {
    const escrowId = await createEscrowRecord({
      jobId: 'job_1',
      quoteId: 'quote_1',
      employerId: 'employer_1',
      workerId: 'worker_1',
      amount: 125,
      currency: 'nzd',
      status: 'held',
      stripePaymentIntentId: 'pi_123',
      commissionRate: 0.15,
      commissionAmount: 18.75,
      workerAmount: 106.25,
    })

    expect(escrowId).toBe('admin_escrow_1')
    expect(adminDbMock._adminAdds.length).toBe(1)
    expect(adminDbMock._adminAdds[0].collection).toBe('escrowPayments')
    expect(adminDbMock._adminAdds[0].data).toEqual(expect.objectContaining({
      jobId: 'job_1',
      quoteId: 'quote_1',
      employerId: 'employer_1',
      workerId: 'worker_1',
      amount: 125,
      currency: 'nzd',
      status: 'held',
      stripePaymentIntentId: 'pi_123',
      commissionRate: 0.15,
      commissionAmount: 18.75,
      workerAmount: 106.25,
    }))
    expect(typeof adminDbMock._adminAdds[0].data.createdAt).toBe('string')
    expect(typeof adminDbMock._adminAdds[0].data.updatedAt).toBe('string')
  })

  it('calculates commission/platform fee math with tier rounding', () => {
    const result = calculateCommission(123.45, 0)

    expect(result).toEqual({
      commissionRate: 0.18,
      commissionAmount: 22.22,
      workerAmount: 101.23,
      tier: 'new',
    })
  })

  it('opens a dispute then resolves it to a refund', async () => {
    await openDispute('escrow_1', 'job_1', 'worker_1', 'Work not completed')
    await resolveDispute('escrow_1', 'job_1', 'refund_to_employer', 'admin_1')

    const updates = adminDbMock._adminUpdates
    expect(updates.length).toBe(4)

    const [openEscrowUpdate, openJobUpdate, resolveEscrowUpdate, resolveJobUpdate] = updates

    expect(openEscrowUpdate.collection).toBe('escrowPayments')
    expect(openEscrowUpdate.id).toBe('escrow_1')
    expect(openEscrowUpdate.data.status).toBe('disputed')
    expect(openEscrowUpdate.data.disputeReason).toBe('Work not completed')

    expect(openJobUpdate.collection).toBe('jobs')
    expect(openJobUpdate.id).toBe('job_1')
    expect(openJobUpdate.data.status).toBe('disputed')
    expect(openJobUpdate.data.workflowStage).toBe('in_dispute')

    expect(resolveEscrowUpdate.collection).toBe('escrowPayments')
    expect(resolveEscrowUpdate.id).toBe('escrow_1')
    expect(resolveEscrowUpdate.data.status).toBe('refunded')
    expect(resolveEscrowUpdate.data.disputeResolution).toBe('refund_to_employer')
    expect(resolveEscrowUpdate.data.disputeResolvedBy).toBe('admin_1')
    expect(typeof resolveEscrowUpdate.data.refundedAt).toBe('string')

    expect(resolveJobUpdate.collection).toBe('jobs')
    expect(resolveJobUpdate.id).toBe('job_1')
    expect(resolveJobUpdate.data.status).toBe('cancelled')
    expect(resolveJobUpdate.data.workflowStage).toBe('posted')
    expect(resolveJobUpdate.data.escrowStatus).toBe('refunded')
  })
})
