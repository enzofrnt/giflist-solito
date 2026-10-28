import type { Metadata } from 'next'
import PasswordRecoveryForm from '@/components/PasswordRecoveryForm'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = {
  ...pageMetadata({
    title: 'Nouveau mot de passe',
    description: 'Choisissez un nouveau mot de passe pour votre compte Giftlist.',
    path: '/reset-password',
    private: true,
  }),
  referrer: 'no-referrer',
}

export default function ResetPasswordPage() {
  return <PasswordRecoveryForm mode="reset" />
}
