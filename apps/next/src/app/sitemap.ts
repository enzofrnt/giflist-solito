import type { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'
import { SITE_URL } from '@/lib/seo'
import { MAX_SITEMAP_URLS, buildSitemapEntries } from '@/lib/sitemap'

/**
 * Refresh the sitemap at most once per hour so new public profiles appear
 * without a redeploy (spec FR-007).
 */
export const revalidate = 3600

type SitemapProfile = { username: string; updatedAt: Date }

/**
 * Only public accounts that actually hold a public list are eligible: a profile
 * with nothing to browse is a thin page and stays out of the sitemap.
 * A database failure must never break the sitemap, so it degrades to the
 * homepage-only variant instead of returning a 500 (spec US5).
 */
async function loadSitemapProfiles(): Promise<SitemapProfile[]> {
  try {
    return await prisma.user.findMany({
      where: {
        isPublic: true,
        giftLists: { some: { isPublic: true } },
      },
      select: { username: true, updatedAt: true },
      orderBy: { updatedAt: 'desc' },
      take: MAX_SITEMAP_URLS,
    })
  } catch (error) {
    console.error('[sitemap] public profile query failed; serving homepage only', error)
    return []
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const profiles = await loadSitemapProfiles()
  return buildSitemapEntries(SITE_URL, profiles)
}
