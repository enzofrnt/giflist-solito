import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: 'Configurer une clé d’accès',
  description: 'Ajoutez une clé d’accès à votre compte Giftlist pour vous connecter plus vite.',
  path: '/setup-passkey',
  private: true,
})

export default function SetupPasskeyLayout({ children }: { children: React.ReactNode }) {
  return children
}
