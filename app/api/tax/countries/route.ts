import { NextResponse } from 'next/server'
import { getSupportedCountries } from '@/lib/services/countryConfigService'

export async function GET() {
  const countries = getSupportedCountries()
  return NextResponse.json({ countries })
}
