import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: 'Administration',
  description: 'Espace d’administration Giftlist.',
  path: '/admin',
  private: true,
})

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children
}
