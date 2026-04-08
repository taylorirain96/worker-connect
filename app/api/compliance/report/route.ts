import { NextResponse } from 'next/server'
import { generateComplianceReport } from '@/lib/services/complianceService'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const userId = request.headers.get('x-user-id')
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const report = await generateComplianceReport(userId)
  return NextResponse.json({ report })
}
