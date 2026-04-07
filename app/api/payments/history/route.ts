import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * GET /api/payments/history?userId=xxx&role=worker|employer&limit=20&offset=0
 * Returns paginated payment history for a user.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')
    const role = searchParams.get('role') ?? 'worker'
    const limit = Math.min(Number(searchParams.get('limit') ?? '20'), 100)
    const offset = Number(searchParams.get('offset') ?? '0')
    const status = searchParams.get('status')

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
    }

    // In production: query Firestore with pagination
    // const paymentsRef = collection(db, 'payments')
    // const q = query(
    //   paymentsRef,
    //   where(role === 'worker' ? 'workerId' : 'employerId', '==', userId),
    //   ...(status ? [where('status', '==', status)] : []),
    //   orderBy('createdAt', 'desc'),
    //   startAfter(offset),
    //   firestoreLimit(limit)
    // )

    const mockHistory = [
      {
        id: 'pay_hist_1',
        jobId: 'job_1',
        jobTitle: 'Plumbing Repair — Kitchen Sink',
        employerId: role === 'employer' ? userId : 'emp_1',
        workerId: role === 'worker' ? userId : 'worker_1',
        amount: 320,
        currency: 'usd',
        status: 'completed',
        method: 'card',
        stripePaymentIntentId: 'pi_mock_1',
        createdAt: new Date(Date.now() - 8 * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 8 * 86400000).toISOString(),
      },
      {
        id: 'pay_hist_2',
        jobId: 'job_2',
        jobTitle: 'Electrical Panel Upgrade',
        employerId: role === 'employer' ? userId : 'emp_2',
        workerId: role === 'worker' ? userId : 'worker_1',
        amount: 850,
        currency: 'usd',
        status: 'processing',
        method: 'bank_transfer',
        stripePaymentIntentId: 'pi_mock_2',
        createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: 'pay_hist_3',
        jobId: 'job_3',
        jobTitle: 'HVAC Maintenance Service',
        employerId: role === 'employer' ? userId : 'emp_1',
        workerId: role === 'worker' ? userId : 'worker_2',
        amount: 200,
        currency: 'usd',
        status: 'failed',
        method: 'card',
        stripePaymentIntentId: 'pi_mock_3',
        createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 20 * 86400000).toISOString(),
      },
    ]

    const filtered = status
      ? mockHistory.filter((p) => p.status === status)
      : mockHistory

    const paginated = filtered.slice(offset, offset + limit)

    return NextResponse.json({
      payments: paginated,
      total: filtered.length,
      limit,
      offset,
    })
  } catch (error) {
    console.error('GET /api/payments/history error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
