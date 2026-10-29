import type { MetadataRoute } from 'next'

/**
 * Sitemap protocol limit: one sitemap file may contain at most 50 000 URLs.
 * Content is intentionally limited to canonical, indexable pages (see
 * specs/022-sitemap-search-console/spec.md).
 */
export const MAX_SITEMAP_URLS = 50_000

export interface SitemapProfileInput {
  username: string
  updatedAt: Date | string
}

function normalizeSiteUrl(siteUrl: string): string {
  return siteUrl.replace(/\/+$/, '')
}

/**
 * Build the public sitemap: the homepage, then every eligible public profile.
 *
 * - no `lastModified` for the homepage: its content is not modified per request;
 * - profiles use their real `updatedAt` (never `new Date()`);
 * - usernames are lowercased, encoded and de-duplicated;
 * - the result never exceeds the 50 000-URL protocol limit.
 */
export function buildSitemapEntries(
  siteUrl: string,
  profiles: readonly SitemapProfileInput[],
): MetadataRoute.Sitemap {
  const base = normalizeSiteUrl(siteUrl)
  const entries: MetadataRoute.Sitemap = [
    {
      url: `${base}/`,
      changeFrequency: 'weekly',
      priority: 1,
    },
  ]

  const seen = new Set<string>()

  for (const profile of profiles) {
    if (entries.length >= MAX_SITEMAP_URLS) break

    const username = profile.username.trim().toLowerCase()
    if (!username || seen.has(username)) continue
    seen.add(username)

    entries.push({
      url: `${base}/u/${encodeURIComponent(username)}`,
      lastModified: profile.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.6,
    })
  }

  return entries
}
