import { emailWrapper, ctaButton, infoTable, infoRow, formatNzd, escapeHtml } from './_layout'
import { APP_URL } from '../resendClient'

export interface QuoteReceivedTemplateData {
  homeownerName: string
  workerName: string
  jobTitle: string
  amount: number
  jobId: string
  unsubscribeUrl?: string
}

export function quoteReceivedTemplate(data: QuoteReceivedTemplateData): string {
  const { homeownerName, workerName, jobTitle, amount, jobId, unsubscribeUrl } = data
  const jobUrl = `${APP_URL}/dashboard/homeowner?jobId=${encodeURIComponent(jobId)}`
  const safeHomeownerName = escapeHtml(homeownerName)
  const safeWorkerName = escapeHtml(workerName)
  const safeJobTitle = escapeHtml(jobTitle)

  return emailWrapper(`
    <h1 style="font-size:22px;font-weight:800;color:#0f172a;margin:0 0 8px;">You've received a new quote 📋</h1>
    <p style="color:#475569;line-height:1.6;margin:0 0 20px;">
      Hi ${safeHomeownerName}, <strong>${safeWorkerName}</strong> has submitted a quote for your job.
      Review it and accept when you're ready — payment is only held once you confirm.
    </p>
    ${infoTable(`
      ${infoRow('Job', safeJobTitle)}
      ${infoRow('Worker', safeWorkerName)}
      ${infoRow('Quote amount', formatNzd(amount))}
    `)}
    ${ctaButton(jobUrl, 'View Quote →')}
    <p style="color:#94a3b8;font-size:13px;text-align:center;margin:0;">
      Not the right fit? You can review all quotes and compare workers on your dashboard.
    </p>
  `, unsubscribeUrl)
}
