import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { OG_IMAGE, SITE_NAME, SITE_URL, pageMetadata } from '@/lib/seo'
import PublicListClient from './PublicListClient'

interface PublicListPageProps {
  params: Promise<{ shareCode: string }>
}

async function getPublicListMetadata(shareCode: string) {
  try {
    return await prisma.giftList.findUnique({
      where: { shareCode },
      select: {
        title: true,
        description: true,
        image: true,
        shareCode: true,
      },
    })
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: PublicListPageProps): Promise<Metadata> {
  const { shareCode } = await params
  const list = await getPublicListMetadata(shareCode)

  if (!list) {
    return pageMetadata({
      title: 'Liste introuvable',
      description: 'Cette liste de cadeaux n’existe pas ou n’est plus disponible.',
      path: `/list/${shareCode}`,
      private: true,
    })
  }

  const title = list.title
  const description = list.description?.trim() || `Découvrez la liste de cadeaux « ${title} » sur Giftlist.`
  const image = list.image || OG_IMAGE.url

  return {
    title,
    description,
    robots: { index: false, follow: false },
    alternates: { canonical: `${SITE_URL}/list/${list.shareCode}` },
    openGraph: {
      type: 'website',
      locale: 'fr_FR',
      siteName: SITE_NAME,
      url: `${SITE_URL}/list/${list.shareCode}`,
      title: `${title} · ${SITE_NAME}`,
      description,
      images: [{ url: image, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} · ${SITE_NAME}`,
      description,
      images: [image],
    },
  }
}

export default async function PublicListPage({ params }: PublicListPageProps) {
  const { shareCode } = await params
  return <PublicListClient shareCode={shareCode} />
}

export const dynamic = 'force-dynamic'
