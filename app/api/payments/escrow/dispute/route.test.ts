import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

const {
  getEscrowByIdMock,
  updateEscrowStatusMock,
  sendNotificationMock,
  jobUpdateMock,
  disputeAddMock,
  adminCollectionMock,
} = vi.hoisted(() => ({
  getEscrowByIdMock: vi.fn(),
  updateEscrowStatusMock: vi.fn().mockResolvedValue(undefined),
  sendNotificationMock: vi.fn().mockResolvedValue(undefined),
  jobUpdateMock: vi.fn().mockResolvedValue(undefined),
  disputeAddMock: vi.fn().mockResolvedValue({ id: 'dispute_1' }),
  adminCollectionMock: vi.fn(),
}))

vi.mock('@/lib/services/escrowService', () => ({
  getEscrowById: getEscrowByIdMock,
  updateEscrowStatus: updateEscrowStatusMock,
}))

vi.mock('@/lib/notificationService', () => ({
  sendNotification: sendNotificationMock,
}))

vi.mock('@/lib/firebase-admin', () => ({
  adminDb: {
    collection: adminCollectionMock,
  },
}))

import { POST } from '@/app/api/payments/escrow/dispute/route'

describe('POST /api/payments/escrow/dispute', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-02T03:04:05.000Z'))
    adminCollectionMock.mockImplementation((name: string) => {
      if (name === 'jobs') {
        return {
          doc: () => ({
            update: jobUpdateMock,
          }),
        }
      }

      if (name === 'disputes') {
        return {
          add: disputeAddMock,
        }
      }

      return {
        doc: () => ({
          update: vi.fn(),
        }),
      }
    })
  })

  it('opens a dispute, freezes escrow, records admin review data, and notifies both parties', async () => {
    getEscrowByIdMock.mockResolvedValue({
      id: 'escrow_1',
      jobId: 'job_1',
      employerId: 'employer_1',
      workerId: 'worker_1',
      status: 'held',
      amount: 200,
      currency: 'nzd',
    })

    const response = await POST(
      new NextRequest('http://localhost/api/payments/escrow/dispute', {
        method: 'POST',
        body: JSON.stringify({
          escrowId: 'escrow_1',
          raisedBy: 'employer_1',
          reason: 'Work was not completed',
        }),
      })
    )
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(updateEscrowStatusMock).toHaveBeenCalledWith(
      'escrow_1',
      'disputed',
      expect.objectContaining({
        disputeReason: 'Work was not completed',
        disputedAt: '2026-01-02T03:04:05.000Z',
      })
    )
    expect(jobUpdateMock).toHaveBeenCalledWith({
      escrowStatus: 'disputed',
      updatedAt: '2026-01-02T03:04:05.000Z',
    })
    expect(disputeAddMock).toHaveBeenCalledWith({
      type: 'escrow',
      escrowId: 'escrow_1',
      jobId: 'job_1',
      employerId: 'employer_1',
      workerId: 'worker_1',
      raisedBy: 'employer_1',
      reason: 'Work was not completed',
      amount: 200,
      currency: 'nzd',
      status: 'open',
      notes: '',
      createdAt: '2026-01-02T03:04:05.000Z',
      updatedAt: '2026-01-02T03:04:05.000Z',
    })
    expect(sendNotificationMock).toHaveBeenCalledTimes(2)
    expect(sendNotificationMock).toHaveBeenCalledWith(expect.objectContaining({
      userId: 'employer_1',
      type: 'dispute_opened',
      metadata: { escrowId: 'escrow_1', jobId: 'job_1' },
    }))
    expect(sendNotificationMock).toHaveBeenCalledWith(expect.objectContaining({
      userId: 'worker_1',
      type: 'dispute_opened',
      metadata: { escrowId: 'escrow_1', jobId: 'job_1' },
    }))
    expect(json).toEqual({
      success: true,
      escrowId: 'escrow_1',
      jobId: 'job_1',
      status: 'disputed',
      disputedAt: '2026-01-02T03:04:05.000Z',
      message: 'Escrow funds frozen. QuickTrade will review and resolve the dispute.',
    })
  })

  it('rejects a dispute from a user unrelated to the escrow', async () => {
    getEscrowByIdMock.mockResolvedValue({
      id: 'escrow_1',
      jobId: 'job_1',
      employerId: 'employer_1',
      workerId: 'worker_1',
      status: 'held',
      amount: 200,
      currency: 'nzd',
    })

    const response = await POST(
      new NextRequest('http://localhost/api/payments/escrow/dispute', {
        method: 'POST',
        body: JSON.stringify({
          escrowId: 'escrow_1',
          raisedBy: 'intruder_1',
          reason: 'Not my job',
        }),
      })
    )
    const json = await response.json()

    expect(response.status).toBe(403)
    expect(json).toEqual({
      error: 'Only the employer or worker on this job can raise a dispute',
    })
    expect(updateEscrowStatusMock).not.toHaveBeenCalled()
    expect(jobUpdateMock).not.toHaveBeenCalled()
    expect(disputeAddMock).not.toHaveBeenCalled()
    expect(sendNotificationMock).not.toHaveBeenCalled()
  })
})
