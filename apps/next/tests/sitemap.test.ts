import { test } from 'node:test'
import assert from 'node:assert/strict'
import { MAX_SITEMAP_URLS, buildSitemapEntries } from '../src/lib/sitemap'

const SITE = 'https://giftlist.fr'

test('sitemap always starts with the homepage and does not invent a lastmod', () => {
  const entries = buildSitemapEntries(SITE, [])

  assert.equal(entries.length, 1)
  assert.equal(entries[0].url, 'https://giftlist.fr/')
  assert.equal(entries[0].lastModified, undefined)
})

test('public profiles are listed once, lowercased, with their real updatedAt', () => {
  const updatedAt = new Date('2026-10-01T10:00:00.000Z')
  const entries = buildSitemapEntries(SITE, [
    { username: 'Enzo_Frnt', updatedAt },
    { username: 'enzo_frnt', updatedAt },
  ])

  const profileEntries = entries.filter((entry) => entry.url.includes('/u/'))
  assert.equal(profileEntries.length, 1)
  assert.equal(profileEntries[0].url, 'https://giftlist.fr/u/enzo_frnt')
  assert.equal(profileEntries[0].lastModified, updatedAt)
})

test('the sitemap never contains share, internal-search or www URLs', () => {
  const entries = buildSitemapEntries(SITE, [{ username: 'enzo', updatedAt: new Date() }])

  for (const entry of entries) {
    assert.ok(entry.url.startsWith('https://giftlist.fr'), entry.url)
    assert.ok(!entry.url.includes('/list/'), entry.url)
    assert.ok(!entry.url.includes('/search'), entry.url)
    assert.ok(!entry.url.includes('www.'), entry.url)
    assert.ok(!entry.url.includes('/api/'), entry.url)
    assert.ok(!entry.url.includes('?'), entry.url)
  }
})

test('the site URL is normalized even with a trailing slash', () => {
  const entries = buildSitemapEntries('https://giftlist.fr/', [{ username: 'enzo', updatedAt: new Date() }])

  assert.equal(entries[0].url, 'https://giftlist.fr/')
  assert.equal(entries[1].url, 'https://giftlist.fr/u/enzo')
})

test('the sitemap is capped at the 50 000-URL protocol limit', () => {
  const profiles = Array.from({ length: MAX_SITEMAP_URLS + 25 }, (_, index) => ({
    username: `user_${index}`,
    updatedAt: new Date(0),
  }))

  const entries = buildSitemapEntries(SITE, profiles)

  assert.equal(entries.length, MAX_SITEMAP_URLS)
  assert.equal(entries.at(-1)?.url, `https://giftlist.fr/u/user_${MAX_SITEMAP_URLS - 2}`)
})

test('blank usernames are ignored', () => {
  const entries = buildSitemapEntries(SITE, [
    { username: '   ', updatedAt: new Date() },
    { username: 'enzo', updatedAt: new Date() },
  ])

  assert.deepEqual(
    entries.map((entry) => entry.url),
    ['https://giftlist.fr/', 'https://giftlist.fr/u/enzo'],
  )
})
