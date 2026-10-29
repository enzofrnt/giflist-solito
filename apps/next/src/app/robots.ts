import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/seo'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/dashboard',
          '/profile',
          '/admin',
          '/manage',
          '/login',
          '/register',
          '/setup-passkey',
          '/forgot-password',
          '/reset-password',
          '/email-change',
          '/design-system',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
