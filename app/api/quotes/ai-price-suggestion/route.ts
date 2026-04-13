import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

const NZ_MARKET_BASELINES: Record<string, { min: number; max: number }> = {
  plumbing: { min: 180, max: 350 },
  electrical: { min: 150, max: 400 },
  building: { min: 400, max: 1200 },
  builder: { min: 400, max: 1200 },
  carpentry: { min: 400, max: 1200 },
  cleaning: { min: 80, max: 200 },
  handyman: { min: 80, max: 180 },
  general: { min: 80, max: 180 },
  painting: { min: 200, max: 600 },
  landscaping: { min: 150, max: 400 },
  roofing: { min: 300, max: 800 },
  'heat pump': { min: 200, max: 500 },
  hvac: { min: 200, max: 500 },
  moving: { min: 200, max: 600 },
}

function getBaseline(category?: string): { min: number; max: number } {
  if (!category) return { min: 100, max: 500 }
  const key = category.toLowerCase()
  for (const [k, v] of Object.entries(NZ_MARKET_BASELINES)) {
    if (key.includes(k)) return v
  }
  return { min: 100, max: 500 }
}

/**
 * POST /api/quotes/ai-price-suggestion
 * Returns a suggested price range based on historical accepted quotes or NZ market baselines.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      jobTitle?: string
      jobDescription?: string
      category?: string
      location?: string
      workerId?: string
    }

    const { jobTitle, jobDescription, category, location, workerId } = body

    const { db } = await import('@/lib/firebase')
    if (!db) {
      const baseline = getBaseline(category)
      return NextResponse.json({
        suggestedMin: baseline.min,
        suggestedMax: baseline.max,
        averageAccepted: Math.round((baseline.min + baseline.max) / 2),
        confidence: 'low' as const,
        tip: 'Based on NZ market estimates. Add more jobs to get personalised suggestions.',
      })
    }

    const {
      collection,
      getDocs,
      query,
      where,
      orderBy,
      limit,
    } = await import('firebase/firestore')

    // Fetch accepted quotes — try category match first
    const constraints = [
      where('status', '==', 'accepted'),
      orderBy('createdAt', 'desc'),
      limit(50),
    ]

    if (category) {
      constraints.splice(1, 0, where('category', '==', category))
    }

    const q = query(collection(db, 'quotes'), ...constraints)
    const snap = await getDocs(q)

    let prices: number[] = snap.docs.map((d) => d.data().totalPrice as number).filter(Boolean)

    // Also filter by title and description keywords if available
    if ((jobTitle || jobDescription) && prices.length < 3) {
      const titleWords = (jobTitle ?? '').toLowerCase().split(/\s+/).filter((w) => w.length > 3)
      const descWords = (jobDescription ?? '').toLowerCase().split(/\s+/).filter((w) => w.length > 4).slice(0, 5)
      const keywords = Array.from(new Set([...titleWords, ...descWords]))
      const titleSnap = await getDocs(
        query(collection(db, 'quotes'), where('status', '==', 'accepted'), orderBy('createdAt', 'desc'), limit(100))
      )
      const titlePrices = titleSnap.docs
        .filter((d) => {
          const t = [(d.data().jobTitle as string ?? ''), (d.data().description as string ?? '')].join(' ').toLowerCase()
          return keywords.some((w) => t.includes(w))
        })
        .map((d) => d.data().totalPrice as number)
        .filter(Boolean)
      prices = Array.from(new Set([...prices, ...titlePrices]))
    }

    // Personalise with worker's own accepted quotes
    let workerPrices: number[] = []
    if (workerId) {
      const wSnap = await getDocs(
        query(
          collection(db, 'quotes'),
          where('workerId', '==', workerId),
          where('status', '==', 'accepted'),
          orderBy('createdAt', 'desc'),
          limit(20)
        )
      )
      workerPrices = wSnap.docs.map((d) => d.data().totalPrice as number).filter(Boolean)
    }

    const allPrices = [...workerPrices, ...prices]

    if (allPrices.length < 3) {
      const baseline = getBaseline(category)
      const tip = workerPrices.length > 0
        ? `Your past accepted quotes average $${Math.round(workerPrices.reduce((a, b) => a + b, 0) / workerPrices.length)}. Market baseline shown.`
        : 'Based on NZ market rates. Submit more quotes to unlock personalised pricing.'
      return NextResponse.json({
        suggestedMin: baseline.min,
        suggestedMax: baseline.max,
        averageAccepted: Math.round((baseline.min + baseline.max) / 2),
        confidence: 'low' as const,
        tip,
      })
    }

    allPrices.sort((a, b) => a - b)
    const p10 = allPrices[Math.floor(allPrices.length * 0.1)]
    const p90 = allPrices[Math.floor(allPrices.length * 0.9)]
    const average = Math.round(allPrices.reduce((a, b) => a + b, 0) / allPrices.length)
    const confidence = allPrices.length >= 10 ? 'high' : allPrices.length >= 5 ? 'medium' : 'low'

    const tip = workerPrices.length > 0
      ? `Your accepted quotes average $${Math.round(workerPrices.reduce((a, b) => a + b, 0) / workerPrices.length)}. QuickTrade data from ${allPrices.length} similar jobs${location ? ` in ${location}` : ''}.`
      : `Based on ${allPrices.length} accepted quotes for similar jobs on QuickTrade NZ${location ? ` in ${location}` : ''}.`

    return NextResponse.json({
      suggestedMin: Math.round(p10),
      suggestedMax: Math.round(p90),
      averageAccepted: average,
      confidence,
      tip,
    })
  } catch (err) {
    console.error('POST /api/quotes/ai-price-suggestion error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
