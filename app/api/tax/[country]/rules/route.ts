import { NextResponse } from 'next/server'
import { getTaxRules } from '@/lib/services/countryConfigService'

export async function GET(
  _request: Request,
  { params }: { params: { country: string } }
) {
  const rules = getTaxRules(params.country)
  if (!rules) {
    return NextResponse.json({ error: 'Tax rules not found for this country' }, { status: 404 })
  }
  return NextResponse.json({ rules })
}
