import { NextResponse } from 'next/server'
import { platformFinancialService } from '@/lib/services/platformFinancialService'
import type { ExpenseRecord } from '@/types'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { category, description, amount, date, receipt } = body
    if (!category || !description || !amount) {
      return NextResponse.json({ error: 'category, description, and amount are required' }, { status: 400 })
    }
    const id = await platformFinancialService.trackExpense({
      category,
      description,
      amount: Number(amount),
      date: date || new Date().toISOString(),
      receipt,
      status: 'pending',
    })
    return NextResponse.json({ id }, { status: 201 })
  } catch (error) {
    console.error('Error tracking expense:', error)
    return NextResponse.json({ error: 'Failed to track expense' }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') as ExpenseRecord['category'] | null
    const startDate = searchParams.get('startDate') || undefined
    const endDate = searchParams.get('endDate') || undefined
    const status = searchParams.get('status') as ExpenseRecord['status'] | null

    const expenses = await platformFinancialService.searchExpenses({
      ...(category && { category }),
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
      ...(status && { status }),
    })
    return NextResponse.json({ expenses })
  } catch (error) {
    console.error('Error fetching expenses:', error)
    return NextResponse.json({ error: 'Failed to fetch expenses' }, { status: 500 })
  }
}
