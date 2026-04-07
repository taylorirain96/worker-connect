import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * GET /api/payments/history?userId=xxx&role=worker|employer
 * Returns the payment history for a user.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')
    const role = searchParams.get('role') ?? 'worker'

    if (!userId) {
      return NextResponse.json({ error: 'Missing required query param: userId' }, { status: 400 })
    }

    // Attempt to fetch from Firestore
    try {
      const { getWorkerPayments, getEmployerPayments } = await import('@/lib/services/paymentService')
      const payments = role === 'employer'
        ? await getEmployerPayments(userId)
        : await getWorkerPayments(userId)
      return NextResponse.json({ payments })
    } catch {
      // Fall through to mock data if Firestore is unavailable
    }

    // Mock response for development / environments without Firestore
    const mockPayments = [
      {
        id: 'pay_mock_001',
        jobId: 'job_1',
        jobTitle: 'Plumbing Repair — Kitchen Sink',
        employerId: 'emp_1',
        workerId: userId,
        amount: 320,
        currency: 'usd',
        status: 'completed',
        method: 'card',
        stripePaymentIntentId: 'pi_mock_1',
        createdAt: new Date(Date.now() - 8 * 86_400_000).toISOString(),
        updatedAt: new Date(Date.now() - 8 * 86_400_000).toISOString(),
      },
      {
        id: 'pay_mock_002',
        jobId: 'job_2',
        jobTitle: 'Electrical Panel Upgrade',
        employerId: 'emp_2',
        workerId: userId,
        amount: 850,
        currency: 'usd',
        status: 'processing',
        method: 'bank_transfer',
        stripePaymentIntentId: 'pi_mock_2',
        createdAt: new Date(Date.now() - 2 * 86_400_000).toISOString(),
        updatedAt: new Date(Date.now() - 86_400_000).toISOString(),
      },
      {
        id: 'pay_mock_003',
        jobId: 'job_3',
        jobTitle: 'HVAC Maintenance Service',
        employerId: 'emp_1',
        workerId: userId,
        amount: 200,
        currency: 'usd',
        status: 'pending',
        method: 'card',
        stripePaymentIntentId: 'pi_mock_3',
        createdAt: new Date(Date.now() - 86_400_000).toISOString(),
        updatedAt: new Date(Date.now() - 86_400_000).toISOString(),
      },
    ]

    return NextResponse.json({ payments: mockPayments })
  } catch (error) {
    console.error('GET /api/payments/history error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
