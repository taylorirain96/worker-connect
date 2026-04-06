import { NextRequest, NextResponse } from 'next/server'
import { calculateNetWithdrawal, MIN_WITHDRAWAL } from '@/lib/earnings/calculateEarnings'

interface WithdrawRequestBody {
  amount: number
  transferType: 'standard' | 'instant'
  bankAccountId: string
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as WithdrawRequestBody
    const { amount, transferType, bankAccountId } = body

    // Basic validation
    if (!amount || !transferType || !bankAccountId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (amount < MIN_WITHDRAWAL) {
      return NextResponse.json(
        { error: `Minimum withdrawal is $${MIN_WITHDRAWAL.toFixed(2)}` },
        { status: 400 }
      )
    }

    const { fee, instantFee, netAmount } = calculateNetWithdrawal(amount, transferType)

    // TODO: Authenticate user session (e.g. verify Firebase ID token from Authorization header)
    // TODO: Check worker's available balance in Firestore
    // TODO: Create Stripe payout via Stripe Connect
    // TODO: Record withdrawal in Firestore `withdrawals` collection
    // TODO: Send confirmation email via SendGrid

    const withdrawal = {
      id: `wd_${Date.now()}`,
      amount,
      fee,
      instantFee,
      netAmount,
      transferType,
      bankAccountId,
      status: 'pending',
      createdAt: new Date().toISOString(),
    }

    return NextResponse.json({ success: true, withdrawal }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
