import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // In production, fetch from Firestore
    return NextResponse.json({ error: 'Worker not found' }, { status: 404 })
  } catch (error) {
    console.error('Get worker error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
