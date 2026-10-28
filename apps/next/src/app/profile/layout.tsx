import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: 'Mon profil',
  description: 'Gérez vos informations, votre mot de passe et vos clés d’accès Giftlist.',
  path: '/profile',
  private: true,
})

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return children
}
