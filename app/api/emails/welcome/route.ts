import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  const { email, name, role } = await request.json()

  const isWorker = role === 'worker'

  const workerHtml = `
    <div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;background:#0a0f1e;color:#e2e8f0;padding:40px 32px;border-radius:16px;">
      <div style="text-align:center;margin-bottom:32px;">
        <p style="font-size:28px;font-weight:700;color:#fff;margin:0;">⚡ QuickTrade</p>
      </div>
      <h1 style="font-size:24px;font-weight:700;color:#fff;margin:0 0 12px;">Welcome aboard, ${name}! 🎉</h1>
      <p style="color:#94a3b8;line-height:1.6;margin:0 0 24px;">You're now part of QuickTrade — New Zealand's trade platform built for workers like you. Here's how to get the most out of it:</p>
      
      <div style="background:#1e293b;border:1px solid #334155;border-radius:12px;padding:24px;margin-bottom:24px;">
        <p style="color:#fff;font-weight:600;margin:0 0 16px;">✅ Your next steps:</p>
        <div style="display:flex;flex-direction:column;gap:12px;">
          <div style="display:flex;align-items:flex-start;gap:12px;">
            <span style="background:#4f46e5;color:#fff;border-radius:50%;width:24px;height:24px;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;flex-shrink:0;">1</span>
            <div>
              <p style="color:#fff;font-weight:600;margin:0 0 2px;">Complete your profile</p>
              <p style="color:#94a3b8;font-size:13px;margin:0;">Workers with complete profiles get hired 3x more often</p>
            </div>
          </div>
          <div style="display:flex;align-items:flex-start;gap:12px;">
            <span style="background:#4f46e5;color:#fff;border-radius:50%;width:24px;height:24px;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;flex-shrink:0;">2</span>
            <div>
              <p style="color:#fff;font-weight:600;margin:0 0 2px;">Browse jobs near you</p>
              <p style="color:#94a3b8;font-size:13px;margin:0;">New jobs posted daily in Marlborough, Nelson &amp; Wellington</p>
            </div>
          </div>
          <div style="display:flex;align-items:flex-start;gap:12px;">
            <span style="background:#4f46e5;color:#fff;border-radius:50%;width:24px;height:24px;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;flex-shrink:0;">3</span>
            <div>
              <p style="color:#fff;font-weight:600;margin:0 0 2px;">Apply with one click</p>
              <p style="color:#94a3b8;font-size:13px;margin:0;">No cover letter needed — just apply and employers will reach out</p>
            </div>
          </div>
        </div>
      </div>

      <div style="text-align:center;margin-bottom:32px;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL ?? 'https://quicktrade.co.nz'}/dashboard/worker" style="display:inline-block;background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:700;font-size:16px;">Browse Jobs Now →</a>
      </div>

      <p style="color:#475569;font-size:13px;text-align:center;margin:0;">You're on the free plan — always free to browse and apply. <br/>Upgrade anytime when it makes sense for you.</p>
    </div>
  `

  const employerHtml = `
    <div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;background:#0a0f1e;color:#e2e8f0;padding:40px 32px;border-radius:16px;">
      <div style="text-align:center;margin-bottom:32px;">
        <p style="font-size:28px;font-weight:700;color:#fff;margin:0;">⚡ QuickTrade</p>
      </div>
      <h1 style="font-size:24px;font-weight:700;color:#fff;margin:0 0 12px;">Welcome to QuickTrade, ${name}! 🎉</h1>
      <p style="color:#94a3b8;line-height:1.6;margin:0 0 24px;">Find vetted, reviewed trade workers in Marlborough and beyond — faster and cheaper than any recruiter.</p>
      
      <div style="background:#1e293b;border:1px solid #334155;border-radius:12px;padding:24px;margin-bottom:24px;">
        <p style="color:#fff;font-weight:600;margin:0 0 16px;">✅ Get your first hire in 3 steps:</p>
        <div style="display:flex;flex-direction:column;gap:12px;">
          <div style="display:flex;align-items:flex-start;gap:12px;">
            <span style="background:#4f46e5;color:#fff;border-radius:50%;width:24px;height:24px;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;flex-shrink:0;">1</span>
            <p style="color:#e2e8f0;margin:0;line-height:1.5;">Post your job — takes less than 2 minutes</p>
          </div>
          <div style="display:flex;align-items:flex-start;gap:12px;">
            <span style="background:#4f46e5;color:#fff;border-radius:50%;width:24px;height:24px;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;flex-shrink:0;">2</span>
            <p style="color:#e2e8f0;margin:0;line-height:1.5;">Review applicants and their verified ratings</p>
          </div>
          <div style="display:flex;align-items:flex-start;gap:12px;">
            <span style="background:#4f46e5;color:#fff;border-radius:50%;width:24px;height:24px;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;flex-shrink:0;">3</span>
            <p style="color:#e2e8f0;margin:0;line-height:1.5;">Hire — payment is held in escrow until the job is done</p>
          </div>
        </div>
      </div>

      <div style="text-align:center;margin-bottom:32px;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL ?? 'https://quicktrade.co.nz'}/jobs/create" style="display:inline-block;background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:700;font-size:16px;">Post Your First Job →</a>
      </div>

      <p style="color:#475569;font-size:13px;text-align:center;margin:0;">No subscription needed to get started. You only pay when you post.</p>
    </div>
  `

  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? 'QuickTrade <hello@quicktrade.co.nz>',
      to: email,
      subject: isWorker ? `Welcome to QuickTrade, ${name}! 👷` : `Welcome to QuickTrade — post your first job today`,
      html: isWorker ? workerHtml : employerHtml,
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Welcome email failed:', error)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
