import { emailWrapper, ctaButton, infoTable, infoRow, formatNzd } from './_layout'
import { APP_URL } from '../resendClient'

export interface QuoteAcceptedTemplateData {
  workerName: string
  homeownerName: string
  jobTitle: string
  amount: number
  jobId: string
  unsubscribeUrl?: string
}

export function quoteAcceptedTemplate(data: QuoteAcceptedTemplateData): string {
  const { workerName, homeownerName, jobTitle, amount, jobId, unsubscribeUrl } = data
  const jobUrl = `${APP_URL}/dashboard/worker?jobId=${jobId}`

  return emailWrapper(`
    <h1 style="font-size:22px;font-weight:800;color:#0f172a;margin:0 0 8px;">Your quote's been accepted! 🎉</h1>
    <p style="color:#475569;line-height:1.6;margin:0 0 20px;">
      Great news, ${workerName} — <strong>${homeownerName}</strong> has accepted your quote.
      Get in touch to confirm a start date and get stuck in.
    </p>
    ${infoTable(`
      ${infoRow('Job', jobTitle)}
      ${infoRow('Homeowner', homeownerName)}
      ${infoRow('Accepted amount', formatNzd(amount))}
    `)}
    ${ctaButton(jobUrl, 'View Job →')}
    <p style="color:#94a3b8;font-size:13px;text-align:center;margin:0;">
      Payment is held securely in escrow and will be released once the job is completed.
    </p>
  `, unsubscribeUrl)
}
