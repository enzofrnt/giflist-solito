import { execFile } from 'node:child_process'
import { request as httpRequest } from 'node:http'
import { request as httpsRequest } from 'node:https'
import type { Readable } from 'node:stream'
import { promisify } from 'node:util'
import { createBrotliDecompress, createGunzip, createInflate } from 'node:zlib'
import { NextRequest, NextResponse } from 'next/server'
import {
  botBypassPathVariants,
  extractIsbn,
  isBotBlockedResponse,
  isSafePublicUrl,
  parseProductHtml,
  type ScrapedProduct,
} from '@/lib/product-scraper'

export const runtime = 'nodejs'
const execFileAsync = promisify(execFile)
export const maxDuration = 30

const BROWSER_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.7,en;q=0.6',
  'Cache-Control': 'no-cache',
  'Pragma': 'no-cache',
} as const

const RAW_HEADERS = { ...BROWSER_HEADERS, 'Accept-Encoding': 'gzip, deflate, br' } as const

const MAX_RAW_BYTES = 6 * 1024 * 1024
// Free book aggregator used when a store cannot be read and the URL carries an
// ISBN: in France the retail price of a book is fixed by law, so the price is
// the same as the requested store's.
const ISBN_SOURCE_NAME = 'Place des Libraires'
const ISBN_SOURCE_ORIGIN = 'https://www.placedeslibraires.fr'
// Keep a safety margin under maxDuration (30 s) so slow sites get the friendly
// error instead of a platform timeout.
const MAX_DURATION_MS = 26000

interface RawTarget {
  protocol: string
  hostname: string
  port: number
  path: string
}

interface RawResponse {
  status: number
  location?: string
  body: string
}

interface DirectResult {
  product: ScrapedProduct
  blocked: boolean
}

interface ProductSource {
  vendor: string
  url: string
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  const url = typeof body?.url === 'string' ? body.url.trim() : ''
  const parsedUrl = isSafePublicUrl(url)
  if (!parsedUrl) return NextResponse.json({ error: 'URL invalide ou non accessible.' }, { status: 400 })

  const startedAt = Date.now()
  const remaining = () => Math.max(0, MAX_DURATION_MS - (Date.now() - startedAt))
  const budgetFor = (max: number) => Math.min(max, remaining() - 500)

  try {
    const direct = await scrapeDirect(parsedUrl.toString())
    let product = direct.product
    // A block is a different failure than "this page has no product data": it
    // needs an explicit message so the user knows to copy the fields by hand.
    const blocked = direct.blocked
    let source: ProductSource | undefined

    // Edge bot managers (Akamai, as used by www.casio.com) reject the canonical
    // URL server-side but still serve the page on a raw dot-segment path; try
    // that before spending time on curl/ScrapingBee.
    if (!hasUsefulProduct(product) && direct.blocked) {
      const budget = budgetFor(9000)
      if (budget >= 3000) {
        const bypassed = await scrapeBotBypass(parsedUrl, budget)
        if (hasUsefulProduct(bypassed)) product = bypassed
      }
    }
    if (!hasUsefulProduct(product)) {
      const budget = budgetFor(15000)
      if (budget >= 4000) {
        const curlProduct = await scrapeWithCurl(parsedUrl.toString(), budget)
        if (hasUsefulProduct(curlProduct)) product = curlProduct
      }
    }
    if (!hasUsefulProduct(product)) {
      const isbn = extractIsbn(url)
      if (isbn) {
        const budget = budgetFor(12000)
        if (budget >= 5000) {
          const lookup = await scrapeIsbnLookup(isbn, budget)
          if (hasUsefulProduct(lookup.product)) {
            product = lookup.product
            source = lookup.source
          }
        }
      }
    }
    if (!hasUsefulProduct(product)) {
      const budget = budgetFor(20000)
      if (budget >= 5000) {
        const beeProduct = await scrapeWithScrapingBee(parsedUrl.toString(), budget)
        if (hasUsefulProduct(beeProduct)) product = beeProduct
      }
    }

    if (!hasUsefulProduct(product)) {
      return NextResponse.json(blocked
        ? {
            error: 'Ce site bloque la lecture automatique de ses pages (protection anti-bot). Ouvre le lien pour copier le titre, le prix et l’image, ou remplis les champs manuellement.',
            blocked: true,
          }
        : {
            error: 'Impossible de lire les informations de ce produit. Vérifie le lien ou remplis les champs manuellement.',
          }, { status: 422 })
    }

    return NextResponse.json(source ? { success: true, product, source } : { success: true, product })
  } catch (error) {
    console.error('Scraping error:', error)
    return NextResponse.json({
      error: 'Impossible de récupérer les informations de ce produit pour le moment.',
    }, { status: 502 })
  }
}

async function scrapeDirect(url: string): Promise<DirectResult> {
  try {
    const response = await fetch(url, {
      headers: BROWSER_HEADERS,
      redirect: 'follow',
      signal: AbortSignal.timeout(12000),
      cache: 'no-store',
    })
    const html = await response.text()
    const blocked = isBotBlockedResponse(response.status, html)
    if (!response.ok) return { product: {}, blocked }
    if (!html) return { product: {}, blocked }
    const product = parseProductHtml(html, response.url || url)
    // A 200 challenge page can carry Open Graph tags; do not return it as a product.
    if (!hasUsefulProduct(product) && blocked) return { product: {}, blocked: true }
    return { product, blocked: false }
  } catch (error) {
    console.warn('Direct scrape failed:', error)
    return { product: {}, blocked: false }
  }
}

async function scrapeBotBypass(parsedUrl: URL, timeoutMs: number): Promise<ScrapedProduct> {
  const variants = botBypassPathVariants(parsedUrl.pathname, parsedUrl.search)
  if (!variants.length) return {}
  const origin = `${parsedUrl.protocol}//${parsedUrl.hostname}${parsedUrl.port ? `:${parsedUrl.port}` : ''}`
  for (const path of variants) {
    try {
      const html = await fetchRawPath(`${origin}${path}`, timeoutMs)
      if (!html) continue
      const product = parseProductHtml(html, parsedUrl.toString())
      if (hasUsefulProduct(product)) return product
    } catch (error) {
      console.warn('Bot-bypass scrape failed:', error)
    }
  }
  return {}
}

/**
 * Requests a URL without running it through WHATWG URL parsing, so a raw
 * `%2E` path segment survives to the server. One redirect is followed (and
 * re-validated) only when its target still carries the encoded dot segment.
 */
async function fetchRawPath(rawUrl: string, timeoutMs: number, redirects = 1): Promise<string> {
  const target = rawTargetFromUrl(rawUrl)
  if (!target) return ''
  const deadline = Date.now() + timeoutMs
  const response = await rawGet(target, timeoutMs)

  if (response.location && response.status >= 300 && response.status < 400) {
    if (redirects <= 0) return ''
    const origin = rawUrl.replace(/^(https?:\/\/[^/?#]+)[\s\S]*$/i, '$1')
    const next = /^https?:\/\//i.test(response.location)
      ? response.location
      : `${origin}${response.location.startsWith('/') ? '' : '/'}${response.location}`
    if (!/\/%2e(?:\/|$|\?)/i.test(next)) return ''
    // Never follow a redirect to a local/private host (SSRF).
    if (!isSafePublicUrl(next)) return ''
    const left = deadline - Date.now()
    if (left < 1000) return ''
    return fetchRawPath(next, left, redirects - 1)
  }

  if (response.status < 200 || response.status >= 300) return ''
  return response.body
}

function rawTargetFromUrl(rawUrl: string): RawTarget | null {
  const match = /^(https?):\/\/([^/?#]+)([^#]*)/i.exec(rawUrl.trim())
  if (!match) return null
  const protocol = `${match[1].toLowerCase()}:`
  const authority = match[2]
  const rawPath = match[3] || '/'
  try {
    const parsed = new URL(`${protocol}//${authority}`)
    const port = parsed.port ? Number(parsed.port) : protocol === 'https:' ? 443 : 80
    if (!parsed.hostname) return null
    return { protocol, hostname: parsed.hostname, port, path: rawPath }
  } catch {
    return null
  }
}

function rawGet(target: RawTarget, timeoutMs: number): Promise<RawResponse> {
  return new Promise((resolve) => {
    let settled = false
    let timer: ReturnType<typeof setTimeout> | undefined
    const finish = (value: RawResponse) => {
      if (settled) return
      settled = true
      if (timer) {
        clearTimeout(timer)
        timer = undefined
      }
      resolve(value)
    }

    const request = (target.protocol === 'https:' ? httpsRequest : httpRequest)({
      protocol: target.protocol,
      hostname: target.hostname,
      port: target.port,
      path: target.path,
      method: 'GET',
      headers: RAW_HEADERS,
    }, (response) => {
      const status = response.statusCode ?? 0
      const location = typeof response.headers.location === 'string' ? response.headers.location : undefined
      if (status < 200 || status >= 300) {
        response.resume()
        finish({ status, location, body: '' })
        return
      }

      const encoding = String(response.headers['content-encoding'] ?? '').toLowerCase()
      let stream: Readable = response
      if (encoding.includes('br')) stream = response.pipe(createBrotliDecompress())
      else if (encoding.includes('gzip')) stream = response.pipe(createGunzip())
      else if (encoding.includes('deflate')) stream = response.pipe(createInflate())

      const chunks: Buffer[] = []
      let bytes = 0
      stream.on('data', (chunk: Buffer) => {
        bytes += chunk.length
        if (bytes > MAX_RAW_BYTES) {
          response.destroy()
          request.destroy()
          finish({ status, body: '' })
          return
        }
        chunks.push(chunk)
      })
      stream.on('end', () => finish({ status, body: Buffer.concat(chunks).toString('utf8') }))
      stream.on('error', () => {
        response.destroy()
        finish({ status, body: '' })
      })
    })

    // The socket timeout is an inactivity timeout; also enforce a hard deadline
    // so a slow-drip response cannot outlive the request budget.
    timer = setTimeout(() => {
      request.destroy()
      finish({ status: 0, body: '' })
    }, timeoutMs + 500)

    request.on('error', () => finish({ status: 0, body: '' }))
    request.setTimeout(timeoutMs, () => {
      request.destroy()
      finish({ status: 0, body: '' })
    })
    request.end()
  })
}

async function fetchText(url: string, timeoutMs: number): Promise<string> {
  const response = await fetch(url, {
    headers: BROWSER_HEADERS,
    redirect: 'follow',
    signal: AbortSignal.timeout(timeoutMs),
    cache: 'no-store',
  })
  return response.ok ? response.text() : ''
}

/**
 * Free fallback for blocked stores: look the ISBN up on a small book aggregator
 * that serves plain HTML, then parse the product page with the same parser.
 */
async function scrapeIsbnLookup(isbn: string, timeoutMs: number): Promise<{ product: ScrapedProduct; source?: ProductSource }> {
  const perRequest = Math.max(2500, Math.floor(timeoutMs / 2))
  try {
    const searchHtml = await fetchText(`${ISBN_SOURCE_ORIGIN}/listeliv.php?mots_recherche=${isbn}&base=allbooks`, perRequest)
    if (!searchHtml) return { product: {} }
    const link = searchHtml.match(new RegExp(`href="((?:https?:\\/\\/[^"]+)?\\/livre\\/${isbn}-[^"]+)"`, 'i'))
    if (!link) return { product: {} }
    const productUrl = new URL(link[1], ISBN_SOURCE_ORIGIN).toString()
    const productHtml = await fetchText(productUrl, perRequest)
    if (!productHtml) return { product: {} }
    const product = parseProductHtml(productHtml, productUrl)
    if (!hasUsefulProduct(product)) return { product: {} }
    return { product, source: { vendor: ISBN_SOURCE_NAME, url: productUrl } }
  } catch (error) {
    console.warn('ISBN lookup failed:', error)
    return { product: {} }
  }
}

async function scrapeWithCurl(url: string, timeoutMs: number): Promise<ScrapedProduct> {
  // Some French retailers accept curl's HTTP/TLS fingerprint but reject undici
  // in Node. execFile keeps the URL as an argument (no shell interpolation).
  const seconds = Math.max(3, Math.floor(timeoutMs / 1000))
  try {
    const { stdout } = await execFileAsync('curl', [
      '-L', '--compressed', '--max-time', String(seconds),
      '-A', BROWSER_HEADERS['User-Agent'],
      '-H', `Accept: ${BROWSER_HEADERS.Accept}`,
      '-H', `Accept-Language: ${BROWSER_HEADERS['Accept-Language']}`,
      '--', url,
    ], { maxBuffer: 12 * 1024 * 1024, timeout: timeoutMs + 1000 })
    return stdout ? parseProductHtml(stdout, url) : {}
  } catch (error) {
    console.warn('Curl scrape failed:', error)
    return {}
  }
}

async function scrapeWithScrapingBee(url: string, timeoutMs: number): Promise<ScrapedProduct> {
  const apiKey = process.env.SCRAPINGBEE_API_KEY
  if (!apiKey) return {}
  const key = apiKey
  const perRequest = Math.max(3000, Math.floor(timeoutMs / 2))

  async function request(renderJs: boolean): Promise<ScrapedProduct> {
    const params = new URLSearchParams({
      api_key: key,
      url,
      render_js: renderJs ? 'true' : 'false',
      premium_proxy: 'false',
      country_code: 'fr',
      block_resources: renderJs ? 'true' : 'false',
    })
    const response = await fetch(`https://app.scrapingbee.com/api/v1/?${params}`, {
      signal: AbortSignal.timeout(perRequest),
      cache: 'no-store',
    })
    if (!response.ok) return {}
    return parseProductHtml(await response.text(), url)
  }

  try {
    const lightweight = await request(false)
    if (hasUsefulProduct(lightweight)) return lightweight
    return await request(true)
  } catch (error) {
    console.warn('ScrapingBee failed:', error)
    return {}
  }
}

function hasUsefulProduct(product: ScrapedProduct): boolean {
  return Boolean(product.title && (product.price || product.image || product.description))
}
