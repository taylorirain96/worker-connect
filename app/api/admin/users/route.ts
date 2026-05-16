import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const role = searchParams.get('role')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search')?.toLowerCase()

    let q = adminDb.collection('users') as FirebaseFirestore.Query
    if (role) q = q.where('role', '==', role)
    q = q.orderBy('createdAt', 'desc')

    const snap = await q.get()
    type UserRow = { id: string; name: string; email: string; role: string; createdAt: string }
    let users: UserRow[] = snap.docs.map((doc) => {
      const d = doc.data()
      return {
        id: doc.id,
        name: (d.displayName ?? d.name ?? '') as string,
        email: (d.email ?? '') as string,
        role: (d.role ?? '') as string,
        createdAt: d.createdAt?.toDate?.()?.toISOString?.() ?? (d.createdAt as string | undefined) ?? '',
      }
    })

    if (search) {
      users = users.filter(
        (u) => u.name.toLowerCase().includes(search) || u.email.toLowerCase().includes(search)
      )
    }

    const total = users.length
    const offset = (page - 1) * limit
    const paginated = users.slice(offset, offset + limit)

    return NextResponse.json({ users: paginated, total, page, limit, filters: { role, search } })
  } catch (error) {
    console.error('Get admin users error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, action } = body

    if (!userId || !action) {
      return NextResponse.json({ error: 'userId and action required' }, { status: 400 })
    }

    if (!['suspend', 'activate', 'verify', 'delete'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    const update: Record<string, unknown> = { updatedAt: FieldValue.serverTimestamp() }
    if (action === 'suspend') update.isActive = false
    else if (action === 'activate') update.isActive = true
    else if (action === 'verify') update.verificationStatus = 'verified'
    else if (action === 'delete') update.deletedAt = FieldValue.serverTimestamp()

    await adminDb.collection('users').doc(userId).update(update)
    return NextResponse.json({ userId, action, success: true })
  } catch (error) {
    console.error('Admin user action error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
