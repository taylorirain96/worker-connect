import { NextResponse } from 'next/server'
import { gstService } from '@/lib/services/gstService'

export async function GET() {
  try {
    const isRegistered = await gstService.isGSTRegistered()
    const registeredDate = isRegistered ? await gstService.getRegistrationDate() : null
    return NextResponse.json({ isRegistered, registeredDate })
  } catch (error) {
    console.error('Error fetching GST registration status:', error)
    return NextResponse.json({ error: 'Failed to fetch GST registration status' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { registrationDate } = await request.json()
    if (!registrationDate) {
      return NextResponse.json({ error: 'registrationDate is required' }, { status: 400 })
    }
    await gstService.registerForGST(registrationDate)
    return NextResponse.json({ success: true, registeredDate: registrationDate })
  } catch (error) {
    console.error('Error registering for GST:', error)
    return NextResponse.json({ error: 'Failed to register for GST' }, { status: 500 })
  }
}
