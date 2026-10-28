import { setTimeout as delay } from 'node:timers/promises'

type Email = { to: string; subject: string; text: string; html?: string }

export function getAppOrigin(env: Record<string, string | undefined> = process.env) {
  if (env.VERCEL_ENV === 'preview') {
    // These URLs come from Vercel, never from an incoming Host header.
    // Prefer the branch alias, which also works with Deployment Protection.
    const host = env.VERCEL_BRANCH_URL || env.VERCEL_URL
    if (!host || !/^[a-z0-9][a-z0-9.-]*\.vercel\.app$/i.test(host)) {
      throw new Error('Vercel Preview URL missing or invalid')
    }
    return `https://${host}`
  }
  if (!env.APP_URL) throw new Error('APP_URL must be configured')
  const url = new URL(env.APP_URL)
  if (url.protocol !== 'https:' && !(env.NODE_ENV !== 'production' && url.hostname === 'localhost')) {
    throw new Error('APP_URL must use HTTPS')
  }
  return url.origin
}

export function getEmailConfig() {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.EMAIL_FROM
  if (!apiKey || !from) throw new Error('Email configuration missing')
  return { apiKey, from, origin: getAppOrigin() }
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
