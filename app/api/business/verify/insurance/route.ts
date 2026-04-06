import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const body = await request.json()
  const {
    hasGeneralLiability,
    generalLiabilityPolicyNumber,
    generalLiabilityExpiration,
    generalLiabilityCoverage,
    hasWorkersComp,
    workersCompPolicyNumber,
    workersCompExpiration,
  } = body

  if (!hasGeneralLiability && !hasWorkersComp) {
    return NextResponse.json(
      { error: 'At least one insurance type must be provided' },
      { status: 400 }
    )
  }

  // TODO: integrate with insurance verification provider
  const result = {
    hasGeneralLiability: Boolean(hasGeneralLiability),
    generalLiabilityPolicyNumber: generalLiabilityPolicyNumber ?? null,
    generalLiabilityExpiration: generalLiabilityExpiration ?? null,
    generalLiabilityCoverage: generalLiabilityCoverage ?? null,
    hasWorkersComp: Boolean(hasWorkersComp),
    workersCompPolicyNumber: workersCompPolicyNumber ?? null,
    workersCompExpiration: workersCompExpiration ?? null,
    verified: true,
    verifiedAt: new Date().toISOString(),
  }

  return NextResponse.json(result, { status: 201 })
}
