import { NextRequest, NextResponse } from 'next/server'
import { getMoverOpportunities } from '@/lib/services/moverService'

export async function GET(request: NextRequest) {
  try {
    const city = request.nextUrl.searchParams.get('city') ?? ''
    const jobTypesParam = request.nextUrl.searchParams.get('jobTypes') ?? ''
    const jobTypes = jobTypesParam ? jobTypesParam.split(',') : []

    if (!city) {
      return NextResponse.json({ error: 'city query param is required' }, { status: 400 })
    }

    const jobs = await getMoverOpportunities(city, jobTypes)
    return NextResponse.json(jobs)
  } catch (err) {
    console.error('[jobs/mover-opportunities]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
