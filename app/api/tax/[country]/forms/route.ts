import { NextResponse } from 'next/server'
import { getTaxRules, getCountryByCode } from '@/lib/services/countryConfigService'

export async function POST(
  _request: Request,
  { params }: { params: { country: string } }
) {
  const country = params.country.toUpperCase()
  const rules = getTaxRules(country)
  const countryInfo = getCountryByCode(country)

  if (!rules || !countryInfo) {
    return NextResponse.json({ error: 'Country not found' }, { status: 404 })
  }

  return NextResponse.json({
    country: countryInfo,
    forms: rules.forms,
    filingDeadline: rules.filingDeadline,
    currency: rules.currency,
  })
}
