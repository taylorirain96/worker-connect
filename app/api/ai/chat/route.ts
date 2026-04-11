import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const SYSTEM_PROMPT = `You are QuickTrade's friendly support assistant. QuickTrade is a New Zealand trade platform connecting employers with verified trade workers across Marlborough, Nelson, Blenheim and Wellington.

You help users with:
- How to post a job or find work
- Pricing (Free: browse only, Pro $29/mo: unlimited posts, Premium $79/mo: featured + analytics)
- How payments work (escrow — held until job complete, then released to worker)
- AI writing tools (CV builder, bio writer, cover letters — available on paid plans)
- Reviews and ratings system
- Account and profile questions

Keep answers concise (2-3 sentences). Be friendly. If unsure, say "Contact us at hello@quicktrade.co.nz".`

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json() as { messages: ChatMessage[] }

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ reply: 'AI not configured. Please email hello@quicktrade.co.nz' })
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages.slice(-10), // keep last 10 messages for context
        ],
        max_tokens: 200,
        temperature: 0.7,
      }),
    })

    const data = await response.json() as { choices?: Array<{ message?: { content?: string } }> }
    const reply = data.choices?.[0]?.message?.content?.trim() ?? 'Sorry, I could not process that.'

    return NextResponse.json({ reply })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json({ reply: 'Something went wrong. Email hello@quicktrade.co.nz' })
  }
}
