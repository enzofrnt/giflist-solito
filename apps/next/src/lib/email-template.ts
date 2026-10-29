export type EmailCta = { label: string; href: string }

export type BrandedEmailInput = {
  origin: string
  preheader: string
  title: string
  bodyHtml: string
  bodyText: string
  cta?: EmailCta
  footnoteHtml?: string
  footnoteText?: string
}

export function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

/**
 * Email-client-safe branded layout. Inline styles + a table shell; no external
 * CSS. The logo is an absolute HTTPS URL so Gmail/Apple Mail can load it.
 */
export function renderBrandedEmail(input: BrandedEmailInput): { html: string; text: string } {
  const logoUrl = `${input.origin}/email-logo.png`
  const ctaHtml = input.cta
    ? `<p style="margin:28px 0 8px"><a href="${escapeHtml(input.cta.href)}" style="display:inline-block;padding:14px 24px;border-radius:10px;background:#2563eb;color:#ffffff;text-decoration:none;font-size:16px;font-weight:700">${escapeHtml(input.cta.label)}</a></p>`
    : ''
  const fallbackHtml = input.cta
    ? `<p style="margin:18px 0 0;font-size:13px;line-height:1.6;color:#6b655e">Le bouton ne fonctionne pas ? Copiez ce lien dans votre navigateur :<br><a href="${escapeHtml(input.cta.href)}" style="color:#2563eb;word-break:break-all">${escapeHtml(input.cta.href)}</a></p>`
    : ''
  const footnoteHtml = input.footnoteHtml
    ? `<p style="margin:24px 0 0;font-size:13px;line-height:1.6;color:#6b655e">${input.footnoteHtml}</p>`
    : ''

  const html = `<!doctype html>
<html lang="fr">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(input.title)}</title></head>
<body style="margin:0;padding:0;background:#f4f1ec;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;color:#1b1917">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent">${escapeHtml(input.preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f1ec;padding:32px 16px">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #e7e2da">
<tr><td style="padding:26px 32px 18px;background:#faf9f7;border-bottom:1px solid #e7e2da">
<a href="${escapeHtml(input.origin)}" style="text-decoration:none;color:#1b1917"><img src="${escapeHtml(logoUrl)}" width="42" height="42" alt="Giftlist" style="vertical-align:middle;border-radius:10px"><span style="display:inline-block;margin-left:10px;font-size:20px;font-weight:800;vertical-align:middle;letter-spacing:-0.3px">Giftlist</span></a>
</td></tr>
<tr><td style="padding:32px">
<h1 style="margin:0 0 18px;font-size:24px;line-height:1.25;color:#1b1917">${escapeHtml(input.title)}</h1>
<div style="font-size:16px;line-height:1.65;color:#444039">${input.bodyHtml}</div>
${ctaHtml}
${fallbackHtml}
${footnoteHtml}
</td></tr>
<tr><td style="padding:20px 32px;background:#faf9f7;border-top:1px solid #e7e2da;font-size:12px;line-height:1.6;color:#8b857d">
Giftlist — des listes de cadeaux simples à partager.<br>
<a href="${escapeHtml(input.origin)}" style="color:#2563eb;text-decoration:none">giftlist.fr</a>
</td></tr>
</table>
</td></tr>
</table>
</body></html>`

  const text = [
    input.title,
    '',
    input.bodyText,
    '',
    input.cta ? `${input.cta.label} : ${input.cta.href}` : '',
    input.footnoteText ?? '',
    '',
    'Giftlist — giftlist.fr',
  ].filter((line) => line !== '').join('\n')

  return { html, text }
}
