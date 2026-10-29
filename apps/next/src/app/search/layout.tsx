import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/seo'

/**
 * Internal search results must never compete with real content in Search
 * Console: noindex, but still crawlable so the signal is read and the profile
 * links it exposes are followed. Excluded from the sitemap on purpose.
 */
export const metadata: Metadata = {
  ...pageMetadata({
    title: 'Rechercher un pseudo ou une liste',
    description:
      'Trouvez un compte public Giftlist par pseudo, ou ouvrez une liste de cadeaux avec son code de partage.',
    path: '/search',
  }),
  robots: { index: false, follow: true },
}

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return children
}
