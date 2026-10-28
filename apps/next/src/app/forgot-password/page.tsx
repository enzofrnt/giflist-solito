import type { Metadata } from 'next'
import PasswordRecoveryForm from '@/components/PasswordRecoveryForm'

export const metadata: Metadata = {
  title: 'Mot de passe oublié | Giftlist',
  robots: { index: false, follow: false },
  referrer: 'no-referrer',
}

export default function ForgotPasswordPage() {
  return <PasswordRecoveryForm mode="request" />
}
