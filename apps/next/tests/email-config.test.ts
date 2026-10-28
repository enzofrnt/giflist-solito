import { test } from 'node:test'
import assert from 'node:assert/strict'
import { getAppOrigin } from '../src/lib/email'

test('every Git preview links to its own branch even if APP_URL points to production', () => {
  assert.equal(getAppOrigin({ VERCEL_ENV: 'preview', VERCEL_BRANCH_URL: 'giftlist-git-feature.vercel.app', VERCEL_URL: 'giftlist-unique.vercel.app', APP_URL: 'https://giftlist.fr' }), 'https://giftlist-git-feature.vercel.app')
})

test('previews without a branch alias use the generated deployment URL', () => {
  assert.equal(getAppOrigin({ VERCEL_ENV: 'preview', VERCEL_URL: 'giftlist-unique.vercel.app' }), 'https://giftlist-unique.vercel.app')
})

test('previews never silently send users to production when Vercel URLs are missing or malformed', () => {
  for (const host of [undefined, 'https://giftlist.vercel.app', 'giftlist.vercel.app.evil.example', 'giftlist.vercel.app/path']) {
    assert.throws(() => getAppOrigin({ VERCEL_ENV: 'preview', VERCEL_BRANCH_URL: host, APP_URL: 'https://giftlist.fr' }), /Preview URL/)
  }
})

test('production uses only the explicitly configured HTTPS application origin', () => {
  assert.equal(getAppOrigin({ VERCEL_ENV: 'production', NODE_ENV: 'production', APP_URL: 'https://giftlist.fr/path', VERCEL_URL: 'giftlist-other.vercel.app' }), 'https://giftlist.fr')
  assert.throws(() => getAppOrigin({ NODE_ENV: 'production', APP_URL: 'http://giftlist.fr' }), /HTTPS/)
  assert.throws(() => getAppOrigin({ VERCEL_ENV: 'production', VERCEL_URL: 'giftlist-other.vercel.app' }), /APP_URL/)
})

test('local development can use HTTP on localhost', () => {
  assert.equal(getAppOrigin({ NODE_ENV: 'development', APP_URL: 'http://localhost:3000' }), 'http://localhost:3000')
})
