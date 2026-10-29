import bcrypt from 'bcryptjs'
import { createHash } from 'node:crypto'
import { prisma } from './prisma'
import { generateToken, signEmailChangeToken, verifyEmailChangeToken } from './auth'
import { getEmailConfig, sendEmail } from './email'
import { escapeHtml, renderBrandedEmail } from './email-template'
import { takeAuthQuota } from './password-reset'

const LIFETIME_MS = 30 * 60 * 1000

export class EmailChangeError extends Error {
  status: number
  constructor(message: string, status = 400) {
    super(message)
    this.status = status
  }
}

function tokenKey(token: string) {
  return createHash('sha256').update(token).digest('hex')
}

export async function requestEmailChange(userId: number, currentPassword: string, rawNewEmail: string) {
  const newEmail = rawNewEmail.trim().toLowerCase()
  const { origin } = getEmailConfig()
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, password: true, authVersion: true },
  })
  if (!user) throw new EmailChangeError('Compte introuvable.', 404)
  if (!await bcrypt.compare(currentPassword, user.password)) {
    throw new EmailChangeError('Le mot de passe actuel est incorrect.')
  }
  if (newEmail === user.email.toLowerCase()) {
    throw new EmailChangeError('Cette adresse est déjà celle de votre compte.')
  }

  const existing = await prisma.user.findFirst({
    where: { email: { equals: newEmail, mode: 'insensitive' } },
    select: { id: true },
  })
  if (existing) throw new EmailChangeError('Cette adresse e-mail est déjà utilisée.', 409)

  if (!await takeAuthQuota('email-change', `${user.id}:${newEmail}`, 3, LIFETIME_MS)) {
    throw new EmailChangeError('Trop de demandes. Réessayez dans quelques minutes.', 429)
  }

  const token = signEmailChangeToken({
    userId: user.id,
    currentEmail: user.email,
    newEmail,
    authVersion: user.authVersion,
  })
  const link = `${origin}/email-change#token=${token}`
  const mail = renderBrandedEmail({
    origin,
    preheader: `Confirmez votre nouvelle adresse e-mail Giftlist (${newEmail}).`,
    title: 'Confirmez votre nouvelle adresse e-mail',
    bodyHtml: `<p style="margin:0 0 14px">Bonjour ${escapeHtml(user.name || '')},</p>
      <p style="margin:0 0 14px">Vous avez demandé à associer l’adresse <strong>${escapeHtml(newEmail)}</strong> à votre compte Giftlist (actuellement ${escapeHtml(user.email)}).</p>
      <p style="margin:0 0 14px">Ce lien est valable <strong>30 minutes</strong> et utilisable une seule fois. Votre adresse actuelle reste active jusqu’à confirmation.</p>`,
    bodyText: `Bonjour ${user.name || ''},\n\nVous avez demandé à associer ${newEmail} à votre compte Giftlist (actuellement ${user.email}).\n\nCe lien est valable 30 minutes et utilisable une seule fois. Votre adresse actuelle reste active jusqu’à confirmation.`,
    cta: { label: 'Confirmer ma nouvelle adresse', href: link },
    footnoteHtml: 'Si vous n’êtes pas à l’origine de cette demande, ignorez cet e-mail : votre adresse actuelle reste inchangée.',
    footnoteText: 'Si vous n’êtes pas à l’origine de cette demande, ignorez cet e-mail : votre adresse actuelle reste inchangée.',
  })

  await sendEmail({
    to: newEmail,
    subject: 'Confirmez votre nouvelle adresse e-mail Giftlist',
    html: mail.html,
    text: mail.text,
  }, `email-change-${tokenKey(token)}`)

  return { message: `Un e-mail de confirmation a été envoyé à ${newEmail}.` }
}

export async function confirmEmailChange(token: string) {
  const claims = verifyEmailChangeToken(token)
  if (!claims) throw new EmailChangeError('Ce lien est invalide ou a expiré.', 400)

  const user = await prisma.user.findUnique({
    where: { id: claims.userId },
    select: { id: true, email: true, name: true, authVersion: true },
  })
  if (
    !user ||
    user.authVersion !== claims.authVersion ||
    user.email.toLowerCase() !== claims.currentEmail.toLowerCase()
  ) {
    throw new EmailChangeError('Ce lien n’est plus valide. Demandez une nouvelle confirmation.', 400)
  }

  const existing = await prisma.user.findFirst({
    where: {
      email: { equals: claims.newEmail, mode: 'insensitive' },
      id: { not: user.id },
    },
    select: { id: true },
  })
  if (existing) throw new EmailChangeError('Cette adresse e-mail est déjà utilisée.', 409)

  let updated = 0
  try {
    const result = await prisma.user.updateMany({
      where: { id: user.id, email: user.email, authVersion: user.authVersion },
      data: { email: claims.newEmail, authVersion: { increment: 1 } },
    })
    updated = result.count
  } catch {
    throw new EmailChangeError('Cette adresse e-mail est déjà utilisée.', 409)
  }
  if (updated !== 1) {
    throw new EmailChangeError('Ce lien n’est plus valide. Demandez une nouvelle confirmation.', 400)
  }

  const nextAuthVersion = user.authVersion + 1
  const nextUser = { id: user.id, email: claims.newEmail, name: user.name }
  const sessionToken = generateToken(nextUser, nextAuthVersion)

  // Security notice to the old address. A mail failure must not undo the change.
  try {
    const { origin } = getEmailConfig()
    const notice = renderBrandedEmail({
      origin,
      preheader: 'Votre adresse e-mail Giftlist a été modifiée.',
      title: 'Votre adresse e-mail a été modifiée',
      bodyHtml: `<p style="margin:0 0 14px">L’adresse de votre compte Giftlist est maintenant <strong>${escapeHtml(claims.newEmail)}</strong>.</p>
        <p style="margin:0 0 14px">L’ancienne adresse ${escapeHtml(user.email)} ne permet plus de se connecter. Toutes les sessions existantes ont été déconnectées.</p>
        <p style="margin:0 0 14px">Si vous n’êtes pas à l’origine de ce changement, réinitialisez immédiatement votre mot de passe depuis Giftlist.</p>`,
      bodyText: `L’adresse de votre compte Giftlist est maintenant ${claims.newEmail}.\n\nL’ancienne adresse ${user.email} ne permet plus de se connecter. Toutes les sessions existantes ont été déconnectées.\n\nSi vous n’êtes pas à l’origine de ce changement, réinitialisez immédiatement votre mot de passe depuis Giftlist.`,
      cta: { label: 'Ouvrir Giftlist', href: origin },
    })
    await sendEmail({
      to: user.email,
      subject: 'Votre adresse e-mail Giftlist a été modifiée',
      html: notice.html,
      text: notice.text,
    }, `email-change-notice-${tokenKey(token)}`)
  } catch {
    console.error('Email change notice could not be sent.')
  }

  return { user: nextUser, token: sessionToken }
}
