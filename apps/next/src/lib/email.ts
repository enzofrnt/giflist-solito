import { setTimeout as delay } from 'node:timers/promises'

type Email = { to: string; subject: string; text: string; html?: string }

export function getEmailConfig() {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.EMAIL_FROM
  const appUrl = process.env.APP_URL
  if (!apiKey || !from || !appUrl) throw new Error('Email configuration missing')
  const url = new URL(appUrl)
  if (url.protocol !== 'https:' && !(process.env.NODE_ENV !== 'production' && url.hostname === 'localhost')) {
    throw new Error('APP_URL must use HTTPS')
  }
  return { apiKey, from, origin: url.origin }
}

// Use the provider API directly; secrets and recovery links never enter logs.
export async function sendEmail(email: Email, idempotencyKey: string) {
  const { apiKey, from } = getEmailConfig()
  const body = JSON.stringify({ from, to: [email.to], subject: email.subject, text: email.text, html: email.html })
  for (let attempt = 0; attempt < 3; attempt++) {
    let response: Response
    try {
      response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'Idempotency-Key': idempotencyKey,
        },
        body,
        signal: AbortSignal.timeout(10_000),
        cache: 'no-store',
      })
    } catch {
      if (attempt === 2) throw new Error('Email provider unreachable')
      await delay(500 * 2 ** attempt)
      continue
    }
    if (response.ok) return
    if (attempt === 2 || response.status !== 429 && response.status < 500) {
      throw new Error(`Email provider error (${response.status})`)
    }
    const retryAfter = Number(response.headers.get('Retry-After'))
    await delay(Math.max(500 * 2 ** attempt, Math.min(5000, retryAfter * 1000 || 0)))
  }
}
