import { createHash, randomBytes } from 'node:crypto'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'
import { getEmailConfig, sendEmail } from './email'

const RESET_LIFETIME_MS = 30 * 60 * 1000
export const RESET_MESSAGE = 'Si un compte correspond à cette adresse, un e-mail de réinitialisation a été envoyé.'
export const INVALID_RESET_MESSAGE = 'Ce lien est invalide ou a expiré. Demandez un nouveau lien.'

export function hashResetToken(token: string) {
  return createHash('sha256').update(token).digest('hex')
}

// Atomic counters in Postgres work across Vercel instances and cold starts.
export async function takeAuthQuota(scope: string, value: string, limit: number, windowMs: number) {
  const key = hashResetToken(`${scope}:${value}`)
  const now = new Date()
  const expiresAt = new Date(now.getTime() + windowMs)
  const rows = await prisma.$queryRaw<{ count: number }[]>`
    INSERT INTO public."AuthRateLimit" ("key", "count", "expiresAt")
    VALUES (${key}, 1, ${expiresAt})
    ON CONFLICT ("key") DO UPDATE SET
      "count" = CASE WHEN "AuthRateLimit"."expiresAt" <= ${now} THEN 1 ELSE "AuthRateLimit"."count" + 1 END,
      "expiresAt" = CASE WHEN "AuthRateLimit"."expiresAt" <= ${now} THEN ${expiresAt} ELSE "AuthRateLimit"."expiresAt" END
    WHERE "AuthRateLimit"."expiresAt" <= ${now} OR "AuthRateLimit"."count" < ${limit}
    RETURNING "count"
  `
  return rows.length === 1
}

export async function requestPasswordReset(email: string) {
  const { origin } = getEmailConfig()
  // Never disclose whether a registered account exists. Email work runs after
  // the route's generic response, including for unknown and throttled accounts.
  if (!await takeAuthQuota('reset-email', email.toLowerCase(), 3, RESET_LIFETIME_MS)) return

  const users = await prisma.user.findMany({
    where: { email: { equals: email, mode: 'insensitive' } },
    select: { id: true, email: true, authVersion: true },
    take: 2,
  })
  // Legacy accounts may differ only by case: never pick one arbitrarily.
  const user = users.find(user => user.email === email) ?? (users.length === 1 ? users[0] : undefined)
  if (!user) return
  // Reserve room below Resend's 100/day free quota for notifications.
  const day = new Date().toISOString().slice(0, 10)
  if (!await takeAuthQuota('reset-daily', day, 40, 24 * 60 * 60 * 1000)) return

  const token = randomBytes(32).toString('hex')
  const tokenHash = hashResetToken(token)
  await prisma.passwordResetToken.upsert({
    where: { userId: user.id },
    create: { tokenHash, userId: user.id, authVersion: user.authVersion, expiresAt: new Date(Date.now() + RESET_LIFETIME_MS) },
    update: { tokenHash, authVersion: user.authVersion, expiresAt: new Date(Date.now() + RESET_LIFETIME_MS) },
  })

  // A fragment keeps the bearer secret out of server/access logs and referrers.
  const link = `${origin}/reset-password#token=${token}`
  try {
    await sendEmail({
      to: user.email,
      subject: 'Réinitialisez votre mot de passe Giftlist',
      html: `<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>Réinitialisez votre mot de passe Giftlist</title></head><body style="margin:0;background:#f9fafb;font-family:Arial,sans-serif;color:#111827"><div style="max-width:520px;margin:32px auto;padding:32px;background:white;border-radius:12px"><h1 style="font-size:24px">Un nouveau mot de passe pour Giftlist</h1><p style="font-size:16px;line-height:1.6">Vous avez demandé à réinitialiser votre mot de passe. Ce lien est valable <strong>30 minutes</strong> et utilisable une seule fois.</p><p style="margin:28px 0"><a href="${link}" style="display:inline-block;padding:16px 24px;border-radius:8px;background:#2563eb;color:white;text-decoration:none;font-size:16px;font-weight:bold">Choisir mon nouveau mot de passe</a></p><p style="font-size:16px;line-height:1.6">Si vous n’êtes pas à l’origine de cette demande, ignorez cet e-mail. Votre mot de passe reste inchangé.</p><p style="font-size:14px;color:#4b5563">Le bouton ne fonctionne pas ? Copiez ce lien dans votre navigateur :</p><p style="font-size:14px;word-break:break-all"><a href="${link}">${link}</a></p><p style="font-size:14px;color:#4b5563">L’équipe Giftlist</p></div></body></html>`,
      text: `Bonjour,\n\nPour choisir un nouveau mot de passe Giftlist, ouvrez ce lien :\n${link}\n\nCe lien est valable 30 minutes et utilisable une seule fois. Un nouveau lien remplace le précédent.\n\nSi vous n’êtes pas à l’origine de cette demande, ignorez cet e-mail : votre mot de passe reste inchangé.\n\nL’équipe Giftlist`,
    }, `password-reset-${tokenHash}`)
  } catch {
    // Don't remove a newer request's token when an earlier send fails.
    await prisma.passwordResetToken.deleteMany({ where: { tokenHash } })
    throw new Error('Password reset email could not be sent')
  }
}

class InvalidResetToken extends Error {}

export async function resetPassword(token: string, password: string) {
  const tokenHash = hashResetToken(token)
  const pending = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
    include: { user: { select: { email: true, authVersion: true } } },
  })
  if (!pending || pending.expiresAt.getTime() <= Date.now() || pending.authVersion !== pending.user.authVersion) return false
  const passwordHash = await bcrypt.hash(password, 12)
  try {
    await prisma.$transaction(async tx => {
      // Compare-and-delete guarantees that simultaneous submissions cannot reuse
      // a token. A failure below rolls the deletion back with the password write.
      const consumed = await tx.passwordResetToken.deleteMany({
        where: { tokenHash, expiresAt: { gt: new Date() } },
      })
      if (consumed.count !== 1) throw new InvalidResetToken()
      const updated = await tx.user.updateMany({
        where: { id: pending.userId, authVersion: pending.authVersion, email: pending.user.email },
        data: { password: passwordHash, authVersion: { increment: 1 } },
      })
      if (updated.count !== 1) throw new InvalidResetToken()
      await tx.passwordResetToken.deleteMany({ where: { userId: pending.userId } })
    })
  } catch (error) {
    if (error instanceof InvalidResetToken) return false
    throw error
  }
  return { email: pending.user.email, tokenHash }
}

export async function notifyPasswordReset(email: string, tokenHash: string) {
  await sendEmail({
    to: email,
    subject: 'Votre mot de passe Giftlist a été modifié',
    text: 'Bonjour,\n\nVotre mot de passe Giftlist vient d’être réinitialisé. Vos anciennes sessions ont été déconnectées.\n\nSi vous n’êtes pas à l’origine de ce changement, demandez immédiatement une nouvelle réinitialisation depuis Giftlist.\n\nL’équipe Giftlist',
  }, `password-reset-confirmation-${tokenHash}`)
}
