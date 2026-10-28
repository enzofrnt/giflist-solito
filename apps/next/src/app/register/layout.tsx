import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: 'Créer un compte',
  description: 'Créez votre compte Giftlist et commencez votre première liste de cadeaux.',
  path: '/register',
  private: true,
})

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children
}
