import { createHash, randomBytes } from 'node:crypto'
import { prisma } from './prisma'
import { getEmailConfig, sendEmail } from './email'
import { renderBrandedEmail } from './email-template'
import { takeAuthQuota } from './password-reset'

const VERIFICATION_LIFETIME_MS = 24 * 60 * 60 * 1000

export function hashVerificationToken(token: string) {
  return createHash('sha256').update(token).digest('hex')
}

export async function sendVerificationEmail(user: { id: number; email: string }) {
  const { origin } = getEmailConfig()
  const token = randomBytes(32).toString('hex')
  const tokenHash = hashVerificationToken(token)
  const expiresAt = new Date(Date.now() + VERIFICATION_LIFETIME_MS)
  await prisma.emailVerificationToken.upsert({
    where: { userId: user.id },
    create: { tokenHash, userId: user.id, expiresAt },
    update: { tokenHash, expiresAt },
  })

  // A fragment keeps the bearer secret out of server/access logs and referrers.
  const link = `${origin}/verify-email?email=${encodeURIComponent(user.email)}#token=${token}`
  const mail = renderBrandedEmail({
    origin,
    preheader: 'Confirmez votre adresse e-mail pour activer votre compte Giftlist.',
    title: 'Bienvenue sur Giftlist',
    bodyHtml: `<p style="margin:0 0 14px">Il ne reste qu’une étape pour activer votre compte et commencer votre première liste.</p>
      <p style="margin:0 0 14px">Cliquez sur le bouton ci-dessous pour confirmer votre adresse e-mail. Ce lien est valable <strong>24 heures</strong>.</p>`,
    bodyText: `Bienvenue sur Giftlist !\n\nIl ne reste qu’une étape pour activer votre compte. Confirmez votre adresse e-mail avec le lien ci-dessous, valable 24 heures.`,
    cta: { label: 'Confirmer mon adresse e-mail', href: link },
    footnoteHtml: 'Si vous n’êtes pas à l’origine de cette inscription, ignorez cet e-mail : aucun compte ne sera activé.',
    footnoteText: 'Si vous n’êtes pas à l’origine de cette inscription, ignorez cet e-mail : aucun compte ne sera activé.',
  })
  try {
    await sendEmail({
      to: user.email,
      subject: 'Confirmez votre adresse e-mail Giftlist',
      html: mail.html,
      text: mail.text,
    }, `email-verification-${tokenHash}`)
  } catch {
    await prisma.emailVerificationToken.deleteMany({ where: { tokenHash } })
    throw new Error('Verification email could not be sent')
  }
}

export async function resendVerificationEmail(email: string) {
  // Generic outcome: never disclose whether an unverified account exists.
  if (!await takeAuthQuota('verify-resend', email.toLowerCase(), 3, 15 * 60 * 1000)) return
  const users = await prisma.user.findMany({
    where: { email: { equals: email, mode: 'insensitive' }, emailVerified: false },
    select: { id: true, email: true },
    take: 2,
  })
  const user = users.find(user => user.email === email) ?? (users.length === 1 ? users[0] : undefined)
  if (!user) return
  await sendVerificationEmail(user)
}

export async function verifyEmailToken(token: string) {
  const tokenHash = hashVerificationToken(token)
  const pending = await prisma.emailVerificationToken.findUnique({
    where: { tokenHash },
    select: { userId: true, expiresAt: true },
  })
  if (!pending || pending.expiresAt.getTime() <= Date.now()) return false

  try {
    await prisma.$transaction(async tx => {
      // The compare-and-delete/update pair makes the link single-use even if
      // two confirmation requests arrive together.
      const consumed = await tx.emailVerificationToken.deleteMany({
        where: { tokenHash, expiresAt: { gt: new Date() } },
      })
      if (consumed.count !== 1) throw new Error('verification-consumed')
      const updated = await tx.user.updateMany({
        where: { id: pending.userId, emailVerified: false },
        data: { emailVerified: true },
      })
      if (updated.count !== 1) throw new Error('verification-consumed')
      await tx.emailVerificationToken.deleteMany({ where: { userId: pending.userId } })
    })
  } catch {
    return false
  }
  return true
}
