import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // In production, aggregate stats from Firestore
    const stats = {
      totalUsers: 12483,
      totalWorkers: 8921,
      totalEmployers: 3562,
      totalJobs: 45892,
      openJobs: 1243,
      completedJobs: 38765,
      totalRevenue: 2850000,
      monthlyRevenue: 185000,
      pendingApplications: 342,
      activeConversations: 891,
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Get admin stats error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
