import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: 'Mes listes',
  description: 'Retrouvez, créez et partagez vos listes de cadeaux Giftlist.',
  path: '/dashboard',
  private: true,
})

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return children
}
