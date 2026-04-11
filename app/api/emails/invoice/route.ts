import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const {
      email,
      name,
      invoiceNumber,
      amount,
      description,
      jobTitle,
      date,
      stripePaymentId,
    } = await request.json()

    const resend = new Resend(process.env.RESEND_API_KEY)

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://quicktrade.co.nz'
    const formattedAmount = new Intl.NumberFormat('en-NZ', { style: 'currency', currency: 'NZD' }).format(amount / 100)
    const formattedDate = new Date(date ?? Date.now()).toLocaleDateString('en-NZ', { day: 'numeric', month: 'long', year: 'numeric' })

    const html = `
      <div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;background:#0a0f1e;color:#e2e8f0;padding:40px 32px;border-radius:16px;">
        <div style="text-align:center;margin-bottom:32px;">
          <p style="font-size:28px;font-weight:700;color:#fff;margin:0;">⚡ QuickTrade</p>
          <p style="color:#6366f1;font-size:14px;margin:4px 0 0;font-weight:500;">Payment Receipt</p>
        </div>

        <div style="background:#1e293b;border:1px solid #334155;border-radius:12px;padding:24px;margin-bottom:24px;">
          <p style="color:#94a3b8;font-size:13px;margin:0 0 4px;">Receipt for</p>
          <p style="color:#fff;font-weight:700;font-size:20px;margin:0 0 16px;">${name}</p>
          
          <div style="border-top:1px solid #334155;padding-top:16px;">
            <table style="width:100%;border-collapse:collapse;">
              <tr>
                <td style="color:#94a3b8;font-size:13px;padding:6px 0;">Invoice Number</td>
                <td style="color:#e2e8f0;font-size:13px;text-align:right;padding:6px 0;">${invoiceNumber ?? `QT-${Date.now()}`}</td>
              </tr>
              <tr>
                <td style="color:#94a3b8;font-size:13px;padding:6px 0;">Date</td>
                <td style="color:#e2e8f0;font-size:13px;text-align:right;padding:6px 0;">${formattedDate}</td>
              </tr>
              <tr>
                <td style="color:#94a3b8;font-size:13px;padding:6px 0;">Description</td>
                <td style="color:#e2e8f0;font-size:13px;text-align:right;padding:6px 0;">${description ?? jobTitle ?? 'QuickTrade Service'}</td>
              </tr>
              ${stripePaymentId ? `
              <tr>
                <td style="color:#94a3b8;font-size:13px;padding:6px 0;">Payment ID</td>
                <td style="color:#e2e8f0;font-size:13px;text-align:right;padding:6px 0;font-family:monospace;">${String(stripePaymentId).substring(0, 20)}...</td>
              </tr>` : ''}
            </table>
          </div>

          <div style="border-top:1px solid #334155;margin-top:16px;padding-top:16px;display:flex;justify-content:space-between;align-items:center;">
            <p style="color:#fff;font-weight:700;font-size:16px;margin:0;">Total Paid</p>
            <p style="color:#34d399;font-weight:700;font-size:24px;margin:0;">${formattedAmount}</p>
          </div>
        </div>

        <div style="background:#1e293b;border:1px solid #059669;border-radius:12px;padding:16px;margin-bottom:24px;text-align:center;">
          <p style="color:#34d399;font-weight:600;margin:0 0 4px;">✅ Payment Successful</p>
          <p style="color:#94a3b8;font-size:13px;margin:0;">Funds are held securely in escrow until the job is complete.</p>
        </div>

        <div style="text-align:center;margin-bottom:32px;">
          <a href="${appUrl}/dashboard/employer" style="display:inline-block;background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;padding:12px 28px;border-radius:10px;text-decoration:none;font-weight:600;font-size:14px;">View Dashboard →</a>
        </div>

        <p style="color:#475569;font-size:12px;text-align:center;margin:0;">Questions? Email us at <a href="mailto:hello@quicktrade.co.nz" style="color:#6366f1;">hello@quicktrade.co.nz</a></p>
      </div>
    `

    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? 'QuickTrade <hello@quicktrade.co.nz>',
      to: email,
      subject: `Receipt for ${formattedAmount} — QuickTrade`,
      html,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Invoice email error:', error)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
