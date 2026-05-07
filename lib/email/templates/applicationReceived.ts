import { emailWrapper, ctaButton, infoTable, infoRow, escapeHtml } from './_layout'
import { APP_URL } from '../resendClient'

export interface ApplicationReceivedTemplateData {
  employerName: string
  applicantName: string
  /** Short excerpt from the cover letter shown in the email. */
  coverLetterPreview: string
  jobTitle: string
  applicationId: string
  unsubscribeUrl?: string
}

export function applicationReceivedTemplate(data: ApplicationReceivedTemplateData): string {
  const { employerName, applicantName, coverLetterPreview, jobTitle, applicationId, unsubscribeUrl } = data
  const viewUrl = `${APP_URL}/dashboard/employer?applicationId=${encodeURIComponent(applicationId)}`
  const safeEmployerName = escapeHtml(employerName)
  const safeApplicantName = escapeHtml(applicantName)
  const safePreview = escapeHtml(coverLetterPreview)
  const safeJobTitle = escapeHtml(jobTitle)

  return emailWrapper(`
    <h1 style="font-size:22px;font-weight:800;color:#0f172a;margin:0 0 8px;">New application received 📩</h1>
    <p style="color:#475569;line-height:1.6;margin:0 0 20px;">
      Hi ${safeEmployerName}, <strong>${safeApplicantName}</strong> has applied for your job posting.
      Review their profile and get back to them quickly.
    </p>
    ${infoTable(`
      ${infoRow('Applicant', safeApplicantName)}
      ${infoRow('Message', safePreview)}
      ${infoRow('Job', safeJobTitle)}
    `)}
    ${ctaButton(viewUrl, 'View Application →')}
    <p style="color:#94a3b8;font-size:13px;text-align:center;margin:0;">
      Great candidates get snapped up fast — respond within 24 hours to stand out.
    </p>
  `, unsubscribeUrl)
}
