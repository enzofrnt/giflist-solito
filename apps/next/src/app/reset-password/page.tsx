import type { Metadata } from 'next'
import PasswordRecoveryForm from '@/components/PasswordRecoveryForm'

export const metadata: Metadata = {
  title: 'Nouveau mot de passe | Giftlist',
  robots: { index: false, follow: false },
  referrer: 'no-referrer',
}

export default function ResetPasswordPage() {
  return <PasswordRecoveryForm mode="reset" />
}
