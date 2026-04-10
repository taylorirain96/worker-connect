import { NextResponse } from 'next/server'
import { getCountryRequirements } from '@/lib/services/complianceService'

export async function GET(
  _request: Request,
  context: { params: Promise<{ country: string }> }
) {
  const params = await context.params
  const requirements = getCountryRequirements(params.country)
  return NextResponse.json({ requirements })
}
