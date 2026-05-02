import { emailWrapper, ctaButton, escapeHtml } from './_layout'
import { APP_URL } from '../resendClient'

export interface WelcomeHomeownerTemplateData {
  name: string
  unsubscribeUrl?: string
}

export function welcomeHomeownerTemplate(data: WelcomeHomeownerTemplateData): string {
  const { name, unsubscribeUrl } = data
  const postJobUrl = `${APP_URL}/jobs/post`
  const safeName = escapeHtml(name)

  return emailWrapper(`
    <h1 style="font-size:22px;font-weight:800;color:#0f172a;margin:0 0 8px;">Welcome to WorkerConnect, ${safeName}! 🏠</h1>
    <p style="color:#475569;line-height:1.7;margin:0 0 16px;">
      You've just joined New Zealand's fastest-growing platform for finding trusted local tradies and skilled workers.
    </p>
    <p style="color:#475569;line-height:1.7;margin:0 0 20px;">
      Here's how it works:
    </p>
    <ol style="color:#475569;line-height:1.8;margin:0 0 24px;padding-left:20px;">
      <li>Post your job for free — describe what you need done</li>
      <li>Workers send you quotes — compare prices and profiles</li>
      <li>Accept the best quote — payment is held securely in escrow</li>
      <li>Job done — release payment when you're happy with the work</li>
    </ol>
    ${ctaButton(postJobUrl, 'Post Your First Job →')}
    <p style="color:#94a3b8;font-size:13px;text-align:center;margin:0;">
      Most jobs receive 3–5 quotes within the first 24 hours.
    </p>
  `, unsubscribeUrl)
}
