import { NextResponse } from 'next/server'
import { platformFinancialService } from '@/lib/services/platformFinancialService'
import { db } from '@/lib/firebase'
import { doc, updateDoc, getDoc } from 'firebase/firestore'

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  const params = await context.params
  try {
    const body = await request.json()
    const { approve, ...updates } = body

    if (approve) {
      await platformFinancialService.approveExpense(params.id)
    } else {
      await updateDoc(doc(db!, 'expenses', params.id), {
        ...updates,
        updatedAt: new Date().toISOString(),
      })
    }

    const snap = await getDoc(doc(db!, 'expenses', params.id))
    return NextResponse.json({ id: snap.id, ...snap.data() })
  } catch (error) {
    console.error('Error updating expense:', error)
    return NextResponse.json({ error: 'Failed to update expense' }, { status: 500 })
  }
}
