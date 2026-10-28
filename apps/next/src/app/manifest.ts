import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/seo'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Giftlist — listes de cadeaux à partager',
    short_name: 'Giftlist',
    description:
      'Créez et partagez vos listes de cadeaux. Vos proches réservent via un lien ou un QR code, sans créer de compte.',
    start_url: '/',
    display: 'standalone',
    background_color: '#faf9f7',
    theme_color: '#2563eb',
    lang: 'fr',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}
