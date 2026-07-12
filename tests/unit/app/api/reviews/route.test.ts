import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

// ---------------------------------------------------------------------------
// Hoisted mocks
// ---------------------------------------------------------------------------
const {
  jobsById,
  jobDocGetMock,
  jobDocUpdateMock,
  reviewsAddMock,
  reviewsWhereMock,
  usersDocGetMock,
  usersDocUpdateMock,
} = vi.hoisted(() => {
  const jobsById: Record<string, Record<string, unknown> | undefined> = {}

  const jobDocUpdateMock = vi.fn().mockResolvedValue(undefined)
  const jobDocGetMock = vi.fn(async (id: string) => ({
    exists: Boolean(jobsById[id]),
    data: () => jobsById[id],
  }))

  const reviewsAddMock = vi.fn().mockResolvedValue({ id: 'new-review-id' })

  // Default: empty snapshot (no duplicate)
  const emptySnap = { empty: true, docs: [], size: 0 }
  const reviewsWhereMock = vi.fn().mockReturnValue({
    where: vi.fn().mockReturnValue({
      limit: vi.fn().mockReturnValue({ get: vi.fn().mockResolvedValue(emptySnap) }),
      get: vi.fn().mockResolvedValue(emptySnap),
    }),
    limit: vi.fn().mockReturnValue({ get: vi.fn().mockResolvedValue(emptySnap) }),
    get: vi.fn().mockResolvedValue(emptySnap),
  })

  const usersDocGetMock = vi.fn().mockResolvedValue({ exists: false, data: () => undefined })
  const usersDocUpdateMock = vi.fn().mockResolvedValue(undefined)

  return {
    jobsById,
    jobDocGetMock,
    jobDocUpdateMock,
    reviewsAddMock,
    reviewsWhereMock,
    usersDocGetMock,
    usersDocUpdateMock,
  }
})

vi.mock('@/lib/firebase-admin', () => {
  const makeDoc = (getImpl: (id: string) => Promise<unknown>, updateImpl: () => Promise<unknown>) => (id: string) => ({
    get: () => getImpl(id),
    update: updateImpl,
  })

  return {
    adminDb: {
      collection: vi.fn((name: string) => {
        if (name === 'jobs') {
          return {
            doc: makeDoc(jobDocGetMock, jobDocUpdateMock),
            where: reviewsWhereMock,
            add: reviewsAddMock,
          }
        }
        if (name === 'reviews') {
          return {
            where: vi.fn().mockReturnValue({
              where: vi.fn().mockReturnValue({
                limit: vi.fn().mockReturnValue({
                  get: vi.fn().mockResolvedValue({ empty: true }),
                }),
              }),
              get: vi.fn().mockResolvedValue({ empty: true, docs: [], size: 0 }),
            }),
            add: reviewsAddMock,
          }
        }
        if (name === 'users') {
          return {
            doc: vi.fn(() => ({
              get: usersDocGetMock,
              update: usersDocUpdateMock,
            })),
          }
        }
        return {
          doc: vi.fn(() => ({ get: vi.fn().mockResolvedValue({ exists: false }), update: vi.fn() })),
          where: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockReturnValue({ get: vi.fn().mockResolvedValue({ empty: true }) }),
              get: vi.fn().mockResolvedValue({ empty: true, docs: [], size: 0 }),
            }),
            get: vi.fn().mockResolvedValue({ empty: true, docs: [], size: 0 }),
          }),
          add: reviewsAddMock,
        }
      }),
    },
  }
})

vi.mock('@/lib/reviews/firebase', () => ({
  getReviewsForEntity: vi.fn().mockResolvedValue({ reviews: [], lastDoc: null }),
}))

vi.mock('@/lib/email/transactional', () => ({
  sendReviewReceivedEmail: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@/lib/notifications/admin', () => ({
  sendAdminNotification: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('firebase-admin/firestore', () => ({
  FieldValue: { serverTimestamp: vi.fn(() => 'SERVER_TIMESTAMP') },
}))

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function makeRequest(body: Record<string, unknown>) {
  return new NextRequest('http://localhost/api/reviews', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

const BASE_BODY = {
  jobId: 'job1',
  reviewerId: 'employer1',
  revieweeId: 'worker1',
  rating: 5,
  comment: 'Great work, very professional and thorough.',
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('POST /api/reviews – job-completion guard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset jobs map
    for (const key of Object.keys(jobsById)) delete jobsById[key]
  })

  it('returns 403 when the job does not exist', async () => {
    const { POST } = await import('@/app/api/reviews/route')
    const res = await POST(makeRequest(BASE_BODY))
    expect(res.status).toBe(403)
    const json = await res.json()
    expect(json.error).toMatch(/completed jobs you were involved in/i)
  })

  it('returns 403 when the job is not completed', async () => {
    jobsById['job1'] = { status: 'in_progress', employerId: 'employer1', assignedWorkerId: 'worker1' }
    const { POST } = await import('@/app/api/reviews/route')
    const res = await POST(makeRequest(BASE_BODY))
    expect(res.status).toBe(403)
    const json = await res.json()
    expect(json.error).toMatch(/completed jobs you were involved in/i)
  })

  it('returns 403 when reviewer is not a party to the job', async () => {
    jobsById['job1'] = { status: 'completed', employerId: 'employer1', assignedWorkerId: 'worker1' }
    const body = { ...BASE_BODY, reviewerId: 'stranger' }
    const { POST } = await import('@/app/api/reviews/route')
    const res = await POST(makeRequest(body))
    expect(res.status).toBe(403)
    const json = await res.json()
    expect(json.error).toMatch(/completed jobs you were involved in/i)
  })

  it('proceeds (201) when reviewer is the employer on a completed job', async () => {
    jobsById['job1'] = { status: 'completed', employerId: 'employer1', assignedWorkerId: 'worker1' }
    const { POST } = await import('@/app/api/reviews/route')
    const res = await POST(makeRequest(BASE_BODY))
    expect(res.status).toBe(201)
  })

  it('proceeds (201) when reviewer is the assigned worker on a completed job', async () => {
    jobsById['job1'] = { status: 'completed', employerId: 'employer1', assignedWorkerId: 'worker1' }
    const body = { ...BASE_BODY, reviewerId: 'worker1', revieweeId: 'employer1', reviewType: 'employer_review' }
    const { POST } = await import('@/app/api/reviews/route')
    const res = await POST(makeRequest(body))
    expect(res.status).toBe(201)
  })
})
