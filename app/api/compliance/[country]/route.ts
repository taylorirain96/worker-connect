import { NextResponse } from 'next/server'
import { getCountryRequirements } from '@/lib/services/complianceService'

export async function GET(
  _request: Request,
  { params }: { params: { country: string } }
) {
  const requirements = getCountryRequirements(params.country)
  return NextResponse.json({ requirements })
}
