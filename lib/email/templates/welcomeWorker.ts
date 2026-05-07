import { emailWrapper, ctaButton, escapeHtml } from './_layout'
import { APP_URL } from '../resendClient'

export interface WelcomeWorkerTemplateData {
  name: string
  unsubscribeUrl?: string
}

export function welcomeWorkerTemplate(data: WelcomeWorkerTemplateData): string {
  const { name, unsubscribeUrl } = data
  const profileUrl = `${APP_URL}/dashboard/worker`
  const safeName = escapeHtml(name)

  return emailWrapper(`
    <h1 style="font-size:22px;font-weight:800;color:#0f172a;margin:0 0 8px;">Welcome to WorkerConnect, ${safeName}! 👷</h1>
    <p style="color:#475569;line-height:1.7;margin:0 0 16px;">
      You're now part of New Zealand's fastest-growing platform for skilled workers. Jobs are posted every day — get your profile ready to start winning work.
    </p>
    <p style="color:#475569;line-height:1.7;margin:0 0 20px;">
      Complete your profile to unlock more opportunities:
    </p>
    <ul style="color:#475569;line-height:1.8;margin:0 0 24px;padding-left:20px;">
      <li>Add your skills and trade category</li>
      <li>Upload a profile photo so clients can put a face to your name</li>
      <li>Write a short bio explaining your experience</li>
      <li>Set your location to get matched with nearby jobs</li>
    </ul>
    ${ctaButton(profileUrl, 'Complete Your Profile →')}
    <p style="color:#94a3b8;font-size:13px;text-align:center;margin:0;">
      Workers with a complete profile win 5× more jobs than those without one.
    </p>
  `, unsubscribeUrl)
}
