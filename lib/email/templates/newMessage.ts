import { emailWrapper, ctaButton, infoTable, infoRow, escapeHtml } from './_layout'
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
  const replyUrl = `${APP_URL}/messages?conversationId=${encodeURIComponent(conversationId)}`
  const safeRecipientName = escapeHtml(recipientName)
  const safeSenderName = escapeHtml(senderName)

  // Truncate the preview to 120 chars then escape HTML special characters
  const rawPreview = messagePreview.length > 120
    ? messagePreview.slice(0, 117) + '…'
    : messagePreview
  const safePreview = escapeHtml(rawPreview)

  return emailWrapper(`
    <h1 style="font-size:22px;font-weight:800;color:#0f172a;margin:0 0 8px;">You have a new message 💬</h1>
    <p style="color:#475569;line-height:1.6;margin:0 0 20px;">
      Hi ${safeRecipientName}, <strong>${safeSenderName}</strong> sent you a message on WorkerConnect.
    </p>
    ${infoTable(`
      ${infoRow('From', safeSenderName)}
      ${infoRow('Message', `<span style="font-style:italic;">&ldquo;${safePreview}&rdquo;</span>`)}
    `)}
    ${ctaButton(replyUrl, 'Reply Now →')}
    <p style="color:#94a3b8;font-size:13px;text-align:center;margin:0;">
      Reply quickly — clients typically choose the worker who responds fastest.
    </p>
  `, unsubscribeUrl)
}
