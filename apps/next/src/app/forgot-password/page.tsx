import type { Metadata } from 'next'
import PasswordRecoveryForm from '@/components/PasswordRecoveryForm'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = {
  ...pageMetadata({
    title: 'Mot de passe oublié',
    description: 'Recevez un lien sécurisé pour réinitialiser votre mot de passe Giftlist.',
    path: '/forgot-password',
    private: true,
  }),
  referrer: 'no-referrer',
}

export default function ForgotPasswordPage() {
  return <PasswordRecoveryForm mode="request" />
}
