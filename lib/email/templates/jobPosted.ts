import { emailWrapper, ctaButton, infoTable, infoRow, formatNzd, escapeHtml } from './_layout'
import { APP_URL } from '../resendClient'

export interface JobPostedTemplateData {
  workerName: string
  jobTitle: string
  location: string
  budget: number
  jobId: string
  unsubscribeUrl?: string
}

export function jobPostedTemplate(data: JobPostedTemplateData): string {
  const { workerName, jobTitle, location, budget, jobId, unsubscribeUrl } = data
  const jobUrl = `${APP_URL}/jobs/${encodeURIComponent(jobId)}`
  const safeWorkerName = escapeHtml(workerName)
  const safeJobTitle = escapeHtml(jobTitle)
  const safeLocation = escapeHtml(location)

  return emailWrapper(`
    <h1 style="font-size:22px;font-weight:800;color:#0f172a;margin:0 0 8px;">New job in your area 🔔</h1>
    <p style="color:#475569;line-height:1.6;margin:0 0 20px;">
      Hi ${safeWorkerName}, a new job matching your skills has just been posted. Be one of the first to send a quote!
    </p>
    ${infoTable(`
      ${infoRow('Job', safeJobTitle)}
      ${infoRow('Location', safeLocation)}
      ${infoRow('Budget', formatNzd(budget))}
    `)}
    ${ctaButton(jobUrl, 'View Job →')}
    <p style="color:#94a3b8;font-size:13px;text-align:center;margin:0;">
      Workers who quote early are 3× more likely to win the job.
    </p>
  `, unsubscribeUrl)
}
