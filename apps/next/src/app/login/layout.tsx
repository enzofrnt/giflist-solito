import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: 'Connexion',
  description: 'Connectez-vous à votre compte Giftlist pour retrouver vos listes de cadeaux.',
  path: '/login',
  private: true,
})

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children
}
