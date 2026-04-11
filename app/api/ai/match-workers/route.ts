import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { jobId, jobTitle, jobDescription, jobCategory, jobLocation } = await request.json()

    const workersSnap = await adminDb.collection('users')
      .where('role', '==', 'worker')
      .limit(50)
      .get()

    const workers = workersSnap.docs.map(doc => ({
      id: doc.id,
      name: doc.data().displayName ?? 'Unknown',
      skills: doc.data().skills ?? [],
      bio: doc.data().bio ?? '',
      location: doc.data().location ?? '',
      hourlyRate: doc.data().hourlyRate ?? 0,
      rating: doc.data().averageRating ?? 0,
      reviewCount: doc.data().reviewCount ?? 0,
    }))

    if (workers.length === 0) {
      return NextResponse.json({ matches: [] })
    }

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'AI not configured' }, { status: 503 })
    }

    const prompt = `You are a job matching assistant for QuickTrade, a New Zealand trade platform.

Job details:
- Title: ${jobTitle}
- Category: ${jobCategory ?? 'Trade'}
- Location: ${jobLocation ?? 'New Zealand'}
- Description: ${jobDescription}

Available workers:
${workers.map((w, i) => `${i + 1}. ID: ${w.id} | Name: ${w.name} | Skills: ${Array.isArray(w.skills) ? w.skills.join(', ') : w.skills} | Location: ${w.location} | Rate: $${w.hourlyRate}/hr | Rating: ${w.rating}/5 (${w.reviewCount} reviews) | Bio: ${w.bio?.substring(0, 100)}`).join('\n')}

Return a JSON array of the top 5 best matching worker IDs with a match score (0-100) and a one-sentence reason. Format:
[{"workerId": "...", "score": 95, "reason": "..."}]
Return ONLY the JSON array, nothing else.`

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 500,
        temperature: 0.3,
      }),
    })

    const data = await response.json() as { choices?: Array<{ message?: { content?: string } }> }
    const content = data.choices?.[0]?.message?.content?.trim() ?? '[]'

    let matches: Array<{ workerId: string; score: number; reason: string }> = []
    try {
      matches = JSON.parse(content)
    } catch {
      matches = []
    }

    // Enrich matches with worker data
    const enriched = matches.map((match) => {
      const worker = workers.find(w => w.id === match.workerId)
      return { ...match, worker }
    }).filter((m) => m.worker)

    return NextResponse.json({ matches: enriched })
  } catch (error) {
    console.error('AI match workers error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
