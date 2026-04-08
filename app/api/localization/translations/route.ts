import { NextResponse } from 'next/server'
import { getTranslations } from '@/lib/services/localizationService'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const lang = searchParams.get('lang') ?? 'en-US'
  const translations = getTranslations(lang)
  return NextResponse.json({ language: lang, translations })
}
