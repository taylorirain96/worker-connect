import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

type WriteType =
  | 'job_post'
  | 'worker_bio'
  | 'cover_letter'
  | 'cv'

interface WriteRequest {
  type: WriteType
  userId: string
  userRole: 'worker' | 'employer'
  inputs: Record<string, string>
}

function buildPrompt(type: WriteType, inputs: Record<string, string>): string {
  switch (type) {
    case 'job_post':
      return `You are a professional job listing writer for a trades platform called QuickTrade in New Zealand.
Write a clear, professional job post description based on these details:
- What needs doing: ${inputs.task}
- Job size: ${inputs.size}
- Any special requirements: ${inputs.requirements || 'none mentioned'}
- Category: ${inputs.category || 'general trades'}

Write 3-4 sentences. Be specific, professional, and friendly. Focus on what the worker needs to do and what a good applicant looks like. Do not include budget, location or title — just the description body. Output plain text only, no markdown.`

    case 'worker_bio':
      return `You are helping a trades worker write their professional profile bio for QuickTrade, a trades platform in New Zealand.
Write a short, punchy 2-3 sentence bio based on these details:
- Trade/skill: ${inputs.trade}
- Years experience: ${inputs.years}
- What they're known for: ${inputs.strengths}
- Extra info: ${inputs.extra || 'nothing extra'}

Write in first person. Keep it honest, confident and professional — not over the top. Sound like a real tradie, not a corporate brochure. Output plain text only, no markdown.`

    case 'cover_letter':
      return `You are helping a trades worker write a cover letter for a job application on QuickTrade, a New Zealand trades platform.
Write a short, professional cover letter (3-4 sentences) based on:
- Worker's name: ${inputs.workerName}
- Worker's trade/skills: ${inputs.skills}
- Worker's experience: ${inputs.experience || 'experienced professional'}
- Job they're applying for: ${inputs.jobTitle}
- Job description: ${inputs.jobDescription}

Write in first person. Sound genuine and confident, not generic. Mention the specific job. Output plain text only, no markdown.`

    case 'cv':
      return `You are helping a trades worker write a professional CV for QuickTrade, a New Zealand trades platform.
Write a structured CV based on:
- Name: ${inputs.name}
- Trade/job title: ${inputs.trade}
- Years experience: ${inputs.years}
- Key skills: ${inputs.skills}
- What they're known for / proudest work: ${inputs.strengths}
- Employment type looking for: ${inputs.employmentType || 'any'}
- Location: ${inputs.location || 'New Zealand'}

Format the CV with these sections:
PROFESSIONAL SUMMARY
CORE SKILLS
EXPERIENCE HIGHLIGHTS
WHAT I BRING TO THE ROLE

Keep it under 300 words. Write in first person for the summary, third person for the rest. Sound professional but human. Output plain text only, no markdown, use ALL CAPS for section headings.`

    default:
      return ''
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as WriteRequest
    const { type, userId, userRole, inputs } = body

    if (!userId || !type || !inputs) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // TODO: Verify the Firebase ID token from the Authorization header to authenticate
    // the user server-side and enforce subscription tier checks via adminDb before
    // calling OpenAI. For now, subscription gating is enforced on the client.
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'AI service not configured' }, { status: 503 })
    }

    const prompt = buildPrompt(type, inputs)
    if (!prompt) {
      return NextResponse.json({ error: 'Invalid write type' }, { status: 400 })
    }

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
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      console.error('OpenAI error:', err)
      return NextResponse.json({ error: 'AI generation failed' }, { status: 500 })
    }

    const data = await response.json() as { choices?: Array<{ message?: { content?: string } }> }
    const text = data.choices?.[0]?.message?.content?.trim() ?? ''

    return NextResponse.json({ text, type, userId, userRole })
  } catch (error) {
    console.error('POST /api/ai/write error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
