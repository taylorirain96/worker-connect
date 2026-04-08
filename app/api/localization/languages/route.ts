import { NextResponse } from 'next/server'
import { getSupportedLanguages } from '@/lib/services/localizationService'

export async function GET() {
  const languages = getSupportedLanguages()
  return NextResponse.json({ languages })
}
