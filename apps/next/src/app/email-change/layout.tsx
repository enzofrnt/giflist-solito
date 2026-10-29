import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: 'Confirmation de votre adresse e-mail',
  description: 'Confirmez la nouvelle adresse e-mail de votre compte Giftlist.',
  path: '/email-change',
  private: true,
})

export default function EmailChangeLayout({ children }: { children: React.ReactNode }) {
  return children
}
