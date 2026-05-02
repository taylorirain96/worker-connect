import { emailWrapper, ctaButton, infoTable, infoRow, formatNzd } from './_layout'
import { APP_URL } from '../resendClient'

export interface PaymentReleasedTemplateData {
  workerName: string
  jobTitle: string
  grossAmount: number
  commissionAmount: number
  workerAmount: number
  jobId: string
  unsubscribeUrl?: string
}

export function paymentReleasedTemplate(data: PaymentReleasedTemplateData): string {
  const { workerName, jobTitle, grossAmount, commissionAmount, workerAmount, unsubscribeUrl } = data
  const earningsUrl = `${APP_URL}/dashboard/worker`

  return emailWrapper(`
    <h1 style="font-size:22px;font-weight:800;color:#0f172a;margin:0 0 8px;">Payment on its way! 💸</h1>
    <p style="color:#475569;line-height:1.6;margin:0 0 20px;">
      Ka pai, ${workerName}! The payment for your completed job has been released from escrow.
      Here's your breakdown:
    </p>
    ${infoTable(`
      ${infoRow('Job', jobTitle)}
      ${infoRow('Job total', formatNzd(grossAmount))}
      ${infoRow('WorkerConnect fee', `−${formatNzd(commissionAmount)}`)}
      ${infoRow('Your payout', `<span style="color:#16a34a;font-weight:800;">${formatNzd(workerAmount)}</span>`)}
    `)}
    ${ctaButton(earningsUrl, 'View Earnings →')}
    <p style="color:#94a3b8;font-size:13px;text-align:center;margin:0;">
      Funds will appear in your account within 2–3 business days depending on your bank.
    </p>
  `, unsubscribeUrl)
}
