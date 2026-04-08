import { NextResponse } from 'next/server'
import { gstService } from '@/lib/services/gstService'
import { platformFinancialService } from '@/lib/services/platformFinancialService'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const currentYear = new Date().getFullYear()
    const currentMonth = new Date().getMonth() + 1
    const monthly = await platformFinancialService.getMonthlyFinancials(currentYear, currentMonth)
    const annualRunRate = monthly.gst.annualRunRateTowardThreshold
    const progress = await gstService.getGSTThresholdProgress(annualRunRate)
    return NextResponse.json(progress)
  } catch (error) {
    console.error('Error getting GST threshold:', error)
    return NextResponse.json({ error: 'Failed to get GST threshold' }, { status: 500 })
  }
}
