import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const body = await request.json()
  const { licenseNumber, licenseType, state, expirationDate } = body

  if (!licenseNumber || !licenseType || !state || !expirationDate) {
    return NextResponse.json(
      { error: 'licenseNumber, licenseType, state, and expirationDate are required' },
      { status: 400 }
    )
  }

  // TODO: integrate with state licensing database for real verification
  // For now, mark as verified immediately (mock behaviour)
  const result = {
    licenseNumber,
    licenseType,
    state,
    expirationDate,
    verified: true,
    verifiedAt: new Date().toISOString(),
  }

  return NextResponse.json(result, { status: 201 })
}
