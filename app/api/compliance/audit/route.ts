import { NextResponse } from 'next/server'
import { auditUserCompliance } from '@/lib/services/complianceService'

export async function POST(request: Request) {
  const userId = request.headers.get('x-user-id')
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json() as { countryCode?: string }
  const { countryCode } = body

  if (!countryCode) {
    return NextResponse.json({ error: 'Missing required field: countryCode' }, { status: 400 })
  }

  const result = await auditUserCompliance(userId, countryCode)
  return NextResponse.json({ result })
}
