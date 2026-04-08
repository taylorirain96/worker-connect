import { NextResponse } from 'next/server'
import { setUserLanguage } from '@/lib/services/localizationService'

export async function POST(request: Request) {
  const userId = request.headers.get('x-user-id')
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json() as { languageCode?: string }
  const { languageCode } = body

  if (!languageCode) {
    return NextResponse.json({ error: 'Missing required field: languageCode' }, { status: 400 })
  }

  await setUserLanguage(userId, languageCode)
  return NextResponse.json({ success: true, languageCode })
}
