import assert from 'node:assert/strict'
import { beforeEach, describe, it, mock } from 'node:test'

const addDocCalls: Array<{ col: unknown; data: Record<string, unknown> }> = []
const updateDocCalls: Array<{ ref: unknown; data: Record<string, unknown> }> = []
const adminUpdates: Array<{ collection: string; id: string; data: Record<string, unknown> }> = []

const dbMock = { _db: true }

const serverTimestamp = () => 'SERVER_TIMESTAMP'

const adminDbMock = {
  collection: (name: string) => ({
    doc: (id: string) => ({
      update: async (data: Record<string, unknown>) => {
        adminUpdates.push({ collection: name, id, data })
      },
    }),
    add: async () => ({ id: 'admin_escrow_1' }),
  }),
}

mock.module('firebase/firestore', {
  namedExports: {
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
    serverTimestamp,
    Timestamp: class MockTimestamp {
      toDate() {
        return new Date('2025-01-01T00:00:00.000Z')
      }
    },
  },
})

mock.module('@/lib/firebase', {
  namedExports: {
    db: dbMock,
  },
})

mock.module('@/lib/firebase-admin', {
  namedExports: {
    adminDb: adminDbMock,
  },
})

const escrowService = await import('@/lib/services/escrowService')

beforeEach(() => {
  addDocCalls.length = 0
  updateDocCalls.length = 0
  adminUpdates.length = 0
})

describe('escrowService', () => {
  it('creates an escrow record with server timestamps', async () => {
    const escrowId = await escrowService.createEscrowRecord({
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

    assert.equal(escrowId, 'escrow_1')
    assert.equal(addDocCalls.length, 1)
    assert.deepEqual(addDocCalls[0], {
      col: { db: dbMock, name: 'escrowPayments' },
      data: {
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
        createdAt: 'SERVER_TIMESTAMP',
        updatedAt: 'SERVER_TIMESTAMP',
      },
    })
  })

  it('calculates commission/platform fee math with tier rounding', () => {
    const result = escrowService.calculateCommission(123.45, 0)

    assert.deepEqual(result, {
      commissionRate: 0.18,
      commissionAmount: 22.22,
      workerAmount: 101.23,
      tier: 'new',
    })
  })

  it('opens a dispute then resolves it to a refund', async () => {
    await escrowService.openDispute('escrow_1', 'job_1', 'worker_1', 'Work not completed')
    await escrowService.resolveDispute('escrow_1', 'job_1', 'refund_to_employer', 'admin_1')

    assert.equal(adminUpdates.length, 4)

    const [openEscrowUpdate, openJobUpdate, resolveEscrowUpdate, resolveJobUpdate] = adminUpdates

    assert.equal(openEscrowUpdate.collection, 'escrowPayments')
    assert.equal(openEscrowUpdate.id, 'escrow_1')
    assert.equal(openEscrowUpdate.data.status, 'disputed')
    assert.equal(openEscrowUpdate.data.disputeReason, 'Work not completed')

    assert.equal(openJobUpdate.collection, 'jobs')
    assert.equal(openJobUpdate.id, 'job_1')
    assert.equal(openJobUpdate.data.status, 'disputed')
    assert.equal(openJobUpdate.data.workflowStage, 'in_dispute')

    assert.equal(resolveEscrowUpdate.collection, 'escrowPayments')
    assert.equal(resolveEscrowUpdate.id, 'escrow_1')
    assert.equal(resolveEscrowUpdate.data.status, 'refunded')
    assert.equal(resolveEscrowUpdate.data.disputeResolution, 'refund_to_employer')
    assert.equal(resolveEscrowUpdate.data.disputeResolvedBy, 'admin_1')
    assert.ok(typeof resolveEscrowUpdate.data.refundedAt === 'string')

    assert.equal(resolveJobUpdate.collection, 'jobs')
    assert.equal(resolveJobUpdate.id, 'job_1')
    assert.equal(resolveJobUpdate.data.status, 'cancelled')
    assert.equal(resolveJobUpdate.data.workflowStage, 'posted')
    assert.equal(resolveJobUpdate.data.escrowStatus, 'refunded')
  })
})
