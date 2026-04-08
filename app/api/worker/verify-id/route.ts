import { NextResponse } from 'next/server'
import { verifyTaxId } from '@/lib/services/taxIdVerificationService'

export async function POST(request: Request) {
  const body = await request.json() as { countryCode?: string; taxId?: string }
  const { countryCode, taxId } = body

  if (!countryCode || !taxId) {
    return NextResponse.json(
      { error: 'Missing required fields: countryCode, taxId' },
      { status: 400 }
    )
  }

  const result = verifyTaxId(countryCode, taxId)
  return NextResponse.json(result)
}
