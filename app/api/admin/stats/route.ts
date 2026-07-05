import type { QueryDocumentSnapshot } from 'firebase-admin/firestore'
import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const [usersSnap, jobsSnap, revenueSnap, disputesSnap] = await Promise.all([
      adminDb.collection('users').get(),
      adminDb.collection('jobs').get(),
      adminDb.collection('escrowPayments').where('status', '==', 'released').get(),
      adminDb.collection('disputes').where('status', '==', 'open').get(),
    ])

    const users = usersSnap.docs.map((d: QueryDocumentSnapshot) => d.data() as { role?: string })
    const totalUsers = users.length
    const totalWorkers = users.filter((u) => u.role === 'worker').length
    const totalEmployers = users.filter((u) => u.role === 'employer').length

    const jobs = jobsSnap.docs.map((d: QueryDocumentSnapshot) => d.data() as { status?: string })
    const totalJobs = jobs.length
    const openJobs = jobs.filter((j) => j.status === 'open').length
    const completedJobs = jobs.filter((j) => j.status === 'completed').length
    const pendingApplications = jobs.filter((j) => j.status === 'pending').length

    const totalRevenue = revenueSnap.docs.reduce((sum, d) => {
      const amount = (d.data() as { amount?: number }).amount ?? 0
      return sum + amount
    }, 0)

    // Monthly revenue: sum of escrow payments released in the current month
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const monthlyRevenue = revenueSnap.docs.reduce((sum, d) => {
      const data = d.data() as { amount?: number; releasedAt?: string }
      if (data.releasedAt && data.releasedAt >= startOfMonth) {
        return sum + (data.amount ?? 0)
      }
      return sum
    }, 0)

    // Conversation counts are not yet aggregated into a dedicated collection,
    // so this endpoint exposes 0 until messaging analytics are implemented.
    const activeConversations = 0

    return NextResponse.json({
      totalUsers,
      totalWorkers,
      totalEmployers,
      totalJobs,
      openJobs,
      completedJobs,
      totalRevenue,
      monthlyRevenue,
      pendingApplications,
      activeConversations,
      openDisputes: disputesSnap.size,
    })
  } catch (error) {
    console.error('Get admin stats error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
