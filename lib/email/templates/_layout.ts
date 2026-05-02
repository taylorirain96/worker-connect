/**
 * Shared HTML layout helpers for WorkerConnect branded emails.
 * All templates import from here so visual changes only need one edit.
 */

export const APP_NAME = 'WorkerConnect'

/** Escape characters that have special meaning in HTML to prevent XSS. */
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

// ── Layout wrapper ────────────────────────────────────────────────────────────

export function emailWrapper(body: string, unsubscribeUrl?: string): string {
  const escapedUnsubUrl = unsubscribeUrl ? escapeHtml(unsubscribeUrl) : undefined
  const footer = escapedUnsubUrl
    ? `<p style="color:#475569;font-size:12px;text-align:center;margin:8px 0 0;">
         Don't want these emails?
         <a href="${escapedUnsubUrl}">Unsubscribe</a>
       </p>`
    : ''

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${APP_NAME}</title>
</head>
<body style="margin:0;padding:16px;background:#f1f5f9;">
  <div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto;">
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#0f172a 0%,#1e1b4b 100%);border-radius:16px 16px 0 0;padding:28px 32px;text-align:center;">
      <p style="font-size:22px;font-weight:800;color:#fff;margin:0;letter-spacing:-0.5px;">
        ⚡ WorkerConnect
      </p>
    </div>
    <!-- Body -->
    <div style="background:#ffffff;padding:32px;border-left:1px solid #e2e8f0;border-right:1px solid #e2e8f0;">
      ${body}
    </div>
    <!-- Footer -->
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 16px 16px;padding:16px 32px;text-align:center;">
      <p style="color:#94a3b8;font-size:11px;margin:0;">
        © ${new Date().getFullYear()} WorkerConnect · New Zealand
      </p>
      <p style="color:#94a3b8;font-size:11px;margin:4px 0 0;">
        Questions? <a href="mailto:hello@workerconnect.co.nz" style="color:#6366f1;">hello@workerconnect.co.nz</a>
      </p>
      ${footer}
    </div>
  </div>
</body>
</html>`
}

// ── CTA button ─────────────────────────────────────────────────────────────────

export function ctaButton(href: string, label: string): string {
  return `
    <div style="text-align:center;margin:28px 0 20px;">
      <a href="${escapeHtml(href)}"
         style="display:inline-block;background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;padding:14px 36px;border-radius:10px;text-decoration:none;font-weight:700;font-size:16px;letter-spacing:0.3px;">
        ${escapeHtml(label)}
      </a>
    </div>`
}

// ── Info table ─────────────────────────────────────────────────────────────────

export function infoRow(label: string, value: string): string {
  return `
    <tr>
      <td style="padding:9px 0;color:#64748b;font-size:14px;width:45%;vertical-align:top;">${label}</td>
      <td style="padding:9px 0;color:#0f172a;font-size:14px;font-weight:600;vertical-align:top;">${value}</td>
    </tr>`
}

export function infoTable(rows: string): string {
  return `
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:16px 20px;margin:20px 0;">
      <table style="width:100%;border-collapse:collapse;">
        ${rows}
      </table>
    </div>`
}

// ── Currency ──────────────────────────────────────────────────────────────────

const nzdFormatter = new Intl.NumberFormat('en-NZ', { style: 'currency', currency: 'NZD' })
export function formatNzd(amount: number): string {
  return nzdFormatter.format(amount)
}
