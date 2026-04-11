import { NextResponse } from 'next/server'
import { Resend } from 'resend'

export const dynamic = 'force-dynamic'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function GET(request: Request) {
  // Verify cron secret to prevent unauthorized calls
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { adminDb } = await import('@/lib/firebase-admin')

    // Get all workers with email notifications enabled (or all workers)
    const workersSnap = await adminDb.collection('users')
      .where('role', '==', 'worker')
      .where('emailNotifications', '!=', false)
      .limit(500)
      .get()

    // Get jobs posted in the last 7 days
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const jobsSnap = await adminDb.collection('jobs')
      .where('status', '==', 'open')
      .where('createdAt', '>=', sevenDaysAgo.toISOString())
      .orderBy('createdAt', 'desc')
      .limit(10)
      .get()

    const jobs = jobsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Array<{
      id: string
      title: string
      location?: string
      category?: string
      budgetMin?: number
      budgetMax?: number
      budget?: number
    }>

    if (jobs.length === 0) {
      return NextResponse.json({ message: 'No new jobs this week, skipping digest' })
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://quicktrade.co.nz'

    const jobsHtml = jobs.map(job => `
      <div style="border:1px solid #334155;border-radius:10px;padding:16px;margin-bottom:12px;background:#1e293b;">
        <p style="color:#fff;font-weight:600;margin:0 0 4px;">${job.title}</p>
        <p style="color:#94a3b8;font-size:13px;margin:0 0 8px;">${job.location ?? 'Location TBC'} ${job.category ? `· ${job.category}` : ''}</p>
        ${job.budgetMin || job.budgetMax || job.budget ? `<p style="color:#34d399;font-size:13px;font-weight:600;margin:0 0 8px;">$${job.budgetMin ?? job.budget ?? '?'}${job.budgetMax ? `–$${job.budgetMax}` : ''}</p>` : ''}
        <a href="${appUrl}/jobs/${job.id}" style="color:#818cf8;font-size:13px;text-decoration:none;font-weight:500;">View job →</a>
      </div>
    `).join('')

    let sent = 0
    let failed = 0

    // Send in batches to respect Resend rate limits
    for (const workerDoc of workersSnap.docs) {
      const worker = workerDoc.data() as { email?: string; displayName?: string }
      if (!worker.email) continue

      const html = `
        <div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;background:#0a0f1e;color:#e2e8f0;padding:40px 32px;border-radius:16px;">
          <div style="text-align:center;margin-bottom:24px;">
            <p style="font-size:24px;font-weight:700;color:#fff;margin:0;">⚡ QuickTrade</p>
            <p style="color:#94a3b8;font-size:14px;margin:4px 0 0;">Your weekly job digest</p>
          </div>
          <h2 style="color:#fff;font-size:20px;font-weight:700;margin:0 0 8px;">🔥 ${jobs.length} new job${jobs.length !== 1 ? 's' : ''} this week</h2>
          <p style="color:#94a3b8;margin:0 0 24px;line-height:1.6;">Hi ${worker.displayName ?? 'there'}, here are the latest jobs on QuickTrade. Apply early — jobs fill fast.</p>
          ${jobsHtml}
          <div style="text-align:center;margin:32px 0 24px;">
            <a href="${appUrl}/jobs" style="display:inline-block;background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:700;">See All Jobs →</a>
          </div>
          <p style="color:#475569;font-size:12px;text-align:center;margin:0;">You're getting this because you're a QuickTrade worker. <a href="${appUrl}/settings/notifications" style="color:#6366f1;">Unsubscribe</a></p>
        </div>
      `

      try {
        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL ?? 'QuickTrade <hello@quicktrade.co.nz>',
          to: worker.email,
          subject: `🔥 ${jobs.length} new trade jobs this week — QuickTrade`,
          html,
        })
        sent++
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100))
      } catch {
        failed++
      }
    }

    return NextResponse.json({ success: true, sent, failed, jobCount: jobs.length })
  } catch (error) {
    console.error('Weekly digest cron failed:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
