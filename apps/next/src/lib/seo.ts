import type { Metadata } from 'next'

export const SITE_NAME = 'Giftlist'

const vercelUrl = process.env.VERCEL_URL
const isProduction = process.env.VERCEL_ENV === 'production' || !process.env.VERCEL_ENV

export const SITE_URL = (
  process.env.NEXT_PUBLIC_APP_URL ||
  (isProduction ? 'https://giftlist.fr' : vercelUrl ? `https://${vercelUrl}` : 'http://localhost:3000')
).replace(/\/$/, '')

export const DEFAULT_DESCRIPTION =
  'Créez et partagez vos listes de cadeaux en quelques secondes. Vos proches réservent via un lien ou un QR code, sans créer de compte.'

export const OG_IMAGE = {
  url: '/og/giftlist-og.png',
  width: 1200,
  height: 630,
  alt: 'Giftlist — des listes de cadeaux à partager',
} as const

interface PageMetadataOptions {
  title: string
  description?: string
  path?: string
  private?: boolean
}

/**
 * Shared page metadata. Keeps canonical, social previews and robots
 * consistent while the root layout owns the title template.
 */
export function pageMetadata({
  title,
  description = DEFAULT_DESCRIPTION,
  path,
  private: isPrivate = false,
}: PageMetadataOptions): Metadata {
  const url = path ? `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}` : undefined

  return {
    title,
    description,
    ...(url ? { alternates: { canonical: url } } : {}),
    ...(isPrivate ? { robots: { index: false, follow: false } } : {}),
    openGraph: {
      title: `${title} · ${SITE_NAME}`,
      description,
      siteName: SITE_NAME,
      locale: 'fr_FR',
      type: 'website',
      ...(url ? { url } : {}),
      images: [OG_IMAGE],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} · ${SITE_NAME}`,
      description,
      images: [OG_IMAGE.url],
    },
  }
}
