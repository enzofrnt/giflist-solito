import { after, before, beforeEach, test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile, readdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { PGlite } from '@electric-sql/pglite'
import { PGLiteSocketServer } from '@electric-sql/pglite-socket'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'
import { getClientAddress, isSameOrigin } from '../src/lib/auth-request'

// All tests use a disposable in-memory Postgres, never .env or a hosted DB.
let db: PGlite
let server: PGLiteSocketServer
let prisma: typeof import('../src/lib/prisma').prisma
let recovery: typeof import('../src/lib/password-reset')
let auth: typeof import('../src/lib/auth')
const originalFetch = globalThis.fetch
const emails: { to: string[]; text: string; subject: string }[] = []
let rejectEmail = false

before(async () => {
  db = await PGlite.create()
  // Reproduce Supabase's default Data API grants before applying migrations.
  await db.exec('CREATE ROLE anon; CREATE ROLE authenticated; ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated;')
  const migrations = path.resolve('prisma/migrations')
  for (const name of (await readdir(migrations)).sort()) {
    if (name === 'migration_lock.toml') continue
    await db.exec(await readFile(path.join(migrations, name, 'migration.sql'), 'utf8'))
  }
  server = new PGLiteSocketServer({ db, host: '127.0.0.1', port: 0 })
  await server.start()
  process.env.POSTGRES_PRISMA_URL = `postgresql://postgres@${server.getServerConn()}/postgres?connection_limit=1&sslmode=disable`
  process.env.JWT_SECRET = 'test-secret-not-for-production'
  process.env.RESEND_API_KEY = 'test-only-key'
  process.env.EMAIL_FROM = 'Giftlist <noreply@giftlist.fr>'
  process.env.APP_URL = 'https://giftlist.fr'
  process.env.VERCEL_ENV = 'development'
  ;({ prisma } = await import('../src/lib/prisma'))
  recovery = await import('../src/lib/password-reset')
  auth = await import('../src/lib/auth')
  globalThis.fetch = (async (input: Parameters<typeof fetch>[0], init?: Parameters<typeof fetch>[1]) => {
    assert.equal(input, 'https://api.resend.com/emails')
    assert.equal(new Headers(init?.headers).get('Authorization'), 'Bearer test-only-key')
    if (rejectEmail) return new Response('{}', { status: 503 })
    emails.push(JSON.parse(String(init?.body)))
    return Response.json({ id: 'test-email' })
  }) as typeof fetch
})

beforeEach(async () => {
  await prisma.passwordResetToken.deleteMany()
  await prisma.authRateLimit.deleteMany()
  await prisma.user.deleteMany()
  emails.length = 0
  rejectEmail = false
})

after(async () => {
  globalThis.fetch = originalFetch
  await prisma?.$disconnect()
  await server?.stop()
  await db?.close()
})

async function user(email = 'someone@example.com') {
  return prisma.user.create({ data: { email, name: 'Test', password: await bcrypt.hash('OldPassword!1', 4) } })
}

function lastToken() {
  const match = emails.at(-1)?.text.match(/#token=([a-f0-9]{64})/)
  assert.ok(match)
  return match[1]
}

test('unknown email does not send anything or create a recovery token', async () => {
  await recovery.requestPasswordReset('missing@example.com')
  assert.equal(emails.length, 0)
  assert.equal(await prisma.passwordResetToken.count(), 0)
})

test('same-origin checks support www and reject foreign origins without trusting spoofed IPs locally', () => {
  assert.equal(isSameOrigin(new NextRequest('https://www.giftlist.fr/api/auth/forgot-password', { headers: { origin: 'https://www.giftlist.fr' } })), true)
  assert.equal(isSameOrigin(new NextRequest('https://giftlist.fr/api/auth/forgot-password', { headers: { origin: 'https://unrelated.example' } })), false)
  const vercel = process.env.VERCEL
  delete process.env.VERCEL
  try {
    assert.equal(getClientAddress(new NextRequest('https://giftlist.fr/', { headers: { 'x-forwarded-for': '203.0.113.1' } })), 'local')
  } finally {
    if (vercel !== undefined) process.env.VERCEL = vercel
  }
})

test('recovery updates only the intended password, consumes the link and revokes old sessions', async () => {
  const account = await user()
  const other = await user('other@example.com')
  const oldSession = auth.generateToken(account)
  // Tokens issued before this feature are accepted at version zero.
  const legacySession = jwt.sign({ userId: account.id, email: account.email }, process.env.JWT_SECRET!)
  assert.ok(await auth.getCurrentUser(legacySession))
  await recovery.requestPasswordReset('SOMEONE@example.com')
  const token = lastToken()
  const pending = await prisma.passwordResetToken.findUniqueOrThrow({ where: { userId: account.id } })
  assert.equal(pending.tokenHash, recovery.hashResetToken(token))
  assert.notEqual(pending.tokenHash, token)
  assert.ok(pending.expiresAt.getTime() > Date.now() + 29 * 60 * 1000)
  assert.match(emails[0].text, /https:\/\/giftlist.fr\/reset-password#token=/)
  assert.ok(await recovery.resetPassword(token, 'NewPassword!2'))
  assert.equal(await recovery.resetPassword(token, 'OtherPassword!3'), false)
  assert.equal(await auth.getCurrentUser(oldSession), null)
  assert.equal(await auth.getCurrentUser(legacySession), null)
  assert.equal((await auth.loginUser(account.email, 'OldPassword!1')).success, false)
  const login = await auth.loginUser(account.email, 'NewPassword!2')
  assert.equal(login.success, true)
  assert.ok(await auth.getCurrentUser(login.token!))
  assert.ok(await auth.getCurrentUser(auth.generateToken(other)))
  assert.equal(await prisma.passwordResetToken.count(), 0)
})

test('expired or tampered links cannot change the password', async () => {
  const account = await user()
  await recovery.requestPasswordReset(account.email)
  const token = lastToken()
  assert.equal(await recovery.resetPassword('0'.repeat(64), 'NewPassword!2'), false)
  await prisma.passwordResetToken.updateMany({ data: { expiresAt: new Date(Date.now() - 1) } })
  assert.equal(await recovery.resetPassword(token, 'NewPassword!2'), false)
  assert.equal((await auth.loginUser(account.email, 'OldPassword!1')).success, true)
})

test('a newer request replaces the previous link; a password change invalidates pending links', async () => {
  const account = await user()
  await recovery.requestPasswordReset(account.email)
  const oldToken = lastToken()
  await recovery.requestPasswordReset(account.email)
  const newToken = lastToken()
  assert.notEqual(oldToken, newToken)
  assert.equal(await recovery.resetPassword(oldToken, 'NewPassword!2'), false)
  await prisma.user.update({ where: { id: account.id }, data: { authVersion: { increment: 1 } } })
  assert.equal(await recovery.resetPassword(newToken, 'NewPassword!2'), false)
})

test('simultaneous use of a link succeeds exactly once', async () => {
  const account = await user()
  await recovery.requestPasswordReset(account.email)
  const token = lastToken()
  const results = await Promise.all([
    recovery.resetPassword(token, 'NewPassword!2'),
    recovery.resetPassword(token, 'OtherPassword!3'),
  ])
  assert.equal(results.filter(Boolean).length, 1)
  assert.equal((await prisma.user.findUniqueOrThrow({ where: { id: account.id } })).authVersion, 1)
})

test('email quota is shared and enforced atomically, including concurrent requests', async () => {
  const results = await Promise.all(Array.from({ length: 8 }, () => recovery.takeAuthQuota('test', 'same-address', 3, 60_000)))
  assert.equal(results.filter(Boolean).length, 3)
  await prisma.authRateLimit.updateMany({ data: { expiresAt: new Date(Date.now() - 1) } })
  assert.equal(await recovery.takeAuthQuota('test', 'same-address', 3, 60_000), true)
})

test('per-account limits stop excessive emails and delivery failure leaves no valid secret', async () => {
  const account = await user()
  for (let i = 0; i < 4; i++) await recovery.requestPasswordReset(account.email)
  assert.equal(emails.length, 3)
  await prisma.authRateLimit.deleteMany()
  rejectEmail = true
  await assert.rejects(recovery.requestPasswordReset(account.email), /could not be sent/)
  assert.equal(await prisma.passwordResetToken.count(), 0)
})

test('password hashes and recovery data are inaccessible to public Data API roles', async () => {
  const rows = await prisma.$queryRaw<{ relrowsecurity: boolean }[]>`SELECT relrowsecurity FROM pg_class WHERE relname IN ('User', 'PasswordResetToken', 'AuthRateLimit')`
  assert.equal(rows.length, 3)
  assert.ok(rows.every(row => row.relrowsecurity))
  const grants = await prisma.$queryRaw<{ allowed: boolean }[]>`SELECT has_table_privilege(role, tablename, 'SELECT') OR has_table_privilege(role, tablename, 'UPDATE') AS allowed FROM unnest(ARRAY['anon', 'authenticated']) role CROSS JOIN unnest(ARRAY['public."User"', 'public."PasswordResetToken"', 'public."AuthRateLimit"']) tablename`
  assert.equal(grants.length, 6)
  assert.ok(grants.every(grant => !grant.allowed))
})

test('passkey registration requires a valid session and challenges are single-use and origin-bound', async () => {
  const account = await user('passkeys@example.com')
  const token = auth.generateToken(account)
  const { POST: options } = await import('../src/app/api/auth/passkeys/register-options/route')
  const { consumeChallenge } = await import('../src/lib/passkeys')
  const makeRequest = (bearer = token, origin = 'http://localhost:3000') => new NextRequest('http://localhost:3000/api/auth/passkeys/register-options', {
    method: 'POST', headers: { origin, authorization: `Bearer ${bearer}` },
  })
  assert.equal((await options(makeRequest('invalid-token'))).status, 401)
  assert.equal((await options(makeRequest(token, 'https://evil.example'))).status, 400)
  const response = await options(makeRequest())
  assert.equal(response.status, 200)
  const cookie = response.headers.get('set-cookie')!.split(';')[0]
  const request = () => new NextRequest('http://localhost:3000/api/auth/passkeys/register-verify', { method: 'POST', headers: { origin: 'http://localhost:3000', cookie } })
  const attempts = await Promise.allSettled([consumeChallenge(request(), 'register'), consumeChallenge(request(), 'register')])
  assert.equal(attempts.filter(result => result.status === 'fulfilled').length, 1)
  assert.equal(attempts.filter(result => result.status === 'rejected').length, 1)
})

test('passkeys are private to the owning account and removed during password recovery', async () => {
  const account = await user('passkey-owner@example.com')
  const other = await user('passkey-other@example.com')
  await prisma.passkey.create({ data: { id: 'test-credential', userId: account.id, rpId: 'localhost', publicKey: Buffer.from([1]), counter: 0, transports: [], deviceType: 'singleDevice', backedUp: false } })
  const { POST: list, DELETE: remove } = await import('../src/app/api/auth/passkeys/manage/route')
  const request = (method: string, who: typeof account, body?: object) => new NextRequest('http://localhost:3000/api/auth/passkeys/manage', { method, headers: { origin: 'http://localhost:3000', authorization: `Bearer ${auth.generateToken(who)}`, 'content-type': 'application/json' }, ...(body ? { body: JSON.stringify(body) } : {}) })
  const otherKeys = await (await list(request('POST', other))).json()
  assert.equal(otherKeys.keys.length, 0)
  assert.equal(otherKeys.hasPasskeyForCurrentOrigin, false)
  assert.equal((await remove(request('DELETE', other, { id: 'test-credential' }))).status, 404)
  const ownerKeys = await (await list(request('POST', account))).json()
  assert.equal(ownerKeys.keys.length, 1)
  assert.equal(ownerKeys.hasPasskeyForCurrentOrigin, true)
  await recovery.requestPasswordReset(account.email)
  assert.ok(await recovery.resetPassword(lastToken(), 'NewPassword!1'))
  assert.equal(await prisma.passkey.count({ where: { userId: account.id } }), 0)
  for (const role of ['anon', 'authenticated']) {
    const grants = await db.query<{ passkeys: boolean; challenges: boolean }>(`SELECT has_table_privilege('${role}', '"Passkey"', 'SELECT') AS passkeys, has_table_privilege('${role}', '"PasskeyChallenge"', 'SELECT') AS challenges`)
    assert.equal(grants.rows[0].passkeys, false)
    assert.equal(grants.rows[0].challenges, false)
  }
})

const chromePath = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
// Set CHROME_PATH to run the browser integration test on another machine.
test('a virtual authenticator can register, log in, and cannot replay its assertion', { timeout: 30000, skip: !existsSync(chromePath) }, async () => {
  const puppeteer = await import('puppeteer')
  const registerOptions = await import('../src/app/api/auth/passkeys/register-options/route')
  const registerVerify = await import('../src/app/api/auth/passkeys/register-verify/route')
  const loginOptions = await import('../src/app/api/auth/passkeys/login-options/route')
  const loginVerify = await import('../src/app/api/auth/passkeys/login-verify/route')
  const routes: Record<string, (request: NextRequest) => Promise<Response>> = {
    '/api/auth/passkeys/register-options': registerOptions.POST,
    '/api/auth/passkeys/register-verify': registerVerify.POST,
    '/api/auth/passkeys/login-options': loginOptions.POST,
    '/api/auth/passkeys/login-verify': loginVerify.POST,
  }
  const account = await user('virtual-key@example.com')
  const token = auth.generateToken(account)
  const server = Bun.serve({ hostname: 'localhost', port: 0, async fetch(req) {
    const url = new URL(req.url)
    const handler = routes[url.pathname]
    if (!handler) return new Response('<!doctype html><title>Passkey test</title>', { headers: { 'Content-Type': 'text/html' } })
    const nextReq = new NextRequest(req.url, { method: req.method, headers: req.headers, ...(req.method !== 'GET' ? { body: await req.text() } : {}) })
    return handler(nextReq)
  } })
  const browser = await puppeteer.default.launch({ headless: true, executablePath: chromePath, args: ['--no-sandbox'] })
  try {
    const page = await browser.newPage()
    const cdp = await page.createCDPSession()
    await cdp.send('WebAuthn.enable')
    await cdp.send('WebAuthn.addVirtualAuthenticator', { options: { protocol: 'ctap2', transport: 'internal', hasResidentKey: true, hasUserVerification: true, isUserVerified: true, automaticPresenceSimulation: true } })
    await page.goto(`http://localhost:${server.port}/`)
    const registration = await page.evaluate(async (authToken) => {
      const headers = { authorization: `Bearer ${authToken}`, 'content-type': 'application/json' }
      const opts = await (await fetch('/api/auth/passkeys/register-options', { method: 'POST', headers })).json()
      const publicKey = PublicKeyCredential.parseCreationOptionsFromJSON(opts)
      const credential = await navigator.credentials.create({ publicKey }) as PublicKeyCredential
      const response = await fetch('/api/auth/passkeys/register-verify', { method: 'POST', headers, body: JSON.stringify(credential.toJSON()) })
      return response.status
    }, token)
    assert.equal(registration, 200)
    assert.equal(await prisma.passkey.count({ where: { userId: account.id } }), 1)
    const login = await page.evaluate(async () => {
      const options = await (await fetch('/api/auth/passkeys/login-options', { method: 'POST' })).json()
      const publicKey = PublicKeyCredential.parseRequestOptionsFromJSON(options)
      const credential = await navigator.credentials.get({ publicKey }) as PublicKeyCredential
      const body = JSON.stringify(credential.toJSON())
      const send = () => fetch('/api/auth/passkeys/login-verify', { method: 'POST', headers: { 'content-type': 'application/json' }, body })
      const first = await send()
      const result = await first.json()
      const replay = await send()
      return { status: first.status, token: result.token, replay: replay.status }
    })
    assert.equal(login.status, 200)
    assert.equal(login.replay, 401)
    assert.equal((await auth.getCurrentUser(login.token))?.id, account.id)
  } finally {
    await browser.close()
    server.stop(true)
  }
})
