import { NextRequest, NextResponse } from 'next/server'
import { rateLimit } from '@/lib/rateLimit'

function isValidEmail(email: string) {
  const trimmed = email.trim()
  const atIndex = trimmed.indexOf('@')
  if (atIndex <= 0 || atIndex !== trimmed.lastIndexOf('@')) return false

  const local = trimmed.slice(0, atIndex)
  const domain = trimmed.slice(atIndex + 1)

  if (!local || !domain || domain.startsWith('.') || domain.endsWith('.')) return false
  if (domain.includes('..')) return false

  const labels = domain.split('.')
  if (labels.length < 2 || labels.some((label) => label.length === 0)) return false

  return true
}

/**
 * POST /api/contact
 * Sends a contact form message via email.
 * Requires RESEND_API_KEY and CONTACT_EMAIL_TO environment variables.
 * Falls back to logging the message when not configured.
 */
export async function POST(req: NextRequest) {
  if (rateLimit(req, { max: 5, windowMs: 60_000, key: 'contact' })) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait a moment before trying again.' },
      { status: 429 }
    )
  }
  let body: { name?: string; email?: string; message?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { name, email, message } = body

  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
  }

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
  }

  if (message.trim().length < 10) {
    return NextResponse.json({ error: 'Message must be at least 10 characters' }, { status: 400 })
  }

  const resendApiKey = process.env.RESEND_API_KEY
  const contactEmailTo = process.env.CONTACT_EMAIL_TO ?? 'support@quicktrade.co.nz'

  if (resendApiKey) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'QuickTrade Contact <noreply@quicktrade.co.nz>',
          to: [contactEmailTo],
          reply_to: email,
          subject: `Contact form message from ${name}`,
          text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
          html: `<p><strong>Name:</strong> ${name}</p><p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p><p><strong>Message:</strong></p><p>${message.replace(/\n/g, '<br>')}</p>`,
        }),
      })

      if (!res.ok) {
        const err = await res.text()
        console.error('Resend contact email error:', err)
        return NextResponse.json({ error: 'Failed to send message' }, { status: 502 })
      }
    } catch (err) {
      console.error('Contact API error:', err)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  } else {
    // Log the message when email is not yet configured
    console.info('[Contact Form]', { name, email, message: message.slice(0, 200), timestamp: new Date().toISOString() })
  }

  return NextResponse.json({ success: true })
}
