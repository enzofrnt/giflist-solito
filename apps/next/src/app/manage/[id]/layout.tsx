import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/seo'

interface ManageListLayoutProps {
  children: React.ReactNode
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Pick<ManageListLayoutProps, 'params'>): Promise<Metadata> {
  const { id } = await params
  return pageMetadata({
    title: 'Gestion de liste',
    description: 'Gérez les cadeaux, le partage et les réservations de votre liste Giftlist.',
    path: `/manage/${id}`,
    private: true,
  })
}

export default function ManageListLayout({ children }: ManageListLayoutProps) {
  return children
}
