import { NextResponse } from 'next/server'
import { calculateTaxes } from '@/lib/services/taxCalculationService'
import type { EmploymentClassification } from '@/types/global'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const country = searchParams.get('country')
  const grossIncomeStr = searchParams.get('grossIncome')
  const classification = searchParams.get('classification') as EmploymentClassification
  const state = searchParams.get('state') ?? undefined
  const taxYear = searchParams.get('taxYear') ? Number(searchParams.get('taxYear')) : undefined

  if (!country || !grossIncomeStr || !classification) {
    return NextResponse.json(
      { error: 'Missing required params: country, grossIncome, classification' },
      { status: 400 }
    )
  }

  const grossIncome = parseFloat(grossIncomeStr)
  if (isNaN(grossIncome) || grossIncome < 0) {
    return NextResponse.json({ error: 'Invalid grossIncome' }, { status: 400 })
  }

  const result = calculateTaxes({ countryCode: country, grossIncome, classification, state, taxYear })
  return NextResponse.json({ result })
}
