import { emailWrapper, ctaButton, infoTable, infoRow } from './_layout'
import { APP_URL } from '../resendClient'

export interface NewMessageTemplateData {
  recipientName: string
  senderName: string
  messagePreview: string
  conversationId: string
  unsubscribeUrl?: string
}

export function newMessageTemplate(data: NewMessageTemplateData): string {
  const { recipientName, senderName, messagePreview, conversationId, unsubscribeUrl } = data
  const replyUrl = `${APP_URL}/messages?conversationId=${conversationId}`

  // Truncate the preview to 120 chars so it looks clean in the email
  const preview = messagePreview.length > 120
    ? messagePreview.slice(0, 117) + '…'
    : messagePreview

  return emailWrapper(`
    <h1 style="font-size:22px;font-weight:800;color:#0f172a;margin:0 0 8px;">You have a new message 💬</h1>
    <p style="color:#475569;line-height:1.6;margin:0 0 20px;">
      Hi ${recipientName}, <strong>${senderName}</strong> sent you a message on WorkerConnect.
    </p>
    ${infoTable(`
      ${infoRow('From', senderName)}
      ${infoRow('Message', `<span style="font-style:italic;">"${preview}"</span>`)}
    `)}
    ${ctaButton(replyUrl, 'Reply Now →')}
    <p style="color:#94a3b8;font-size:13px;text-align:center;margin:0;">
      Reply quickly — clients typically choose the worker who responds fastest.
    </p>
  `, unsubscribeUrl)
}
