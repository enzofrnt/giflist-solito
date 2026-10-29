import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { NextRequest, NextResponse } from 'next/server'
import { parseProductHtml, type ScrapedProduct } from '@/lib/product-scraper'

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

function isSafePublicUrl(value: string): URL | null {
  try {
    const url = new URL(value)
    if (!['http:', 'https:'].includes(url.protocol)) return null
    const host = url.hostname.toLowerCase()
    if (host === 'localhost' || host.endsWith('.local') || host === '0.0.0.0' || host === '::1') return null
    if (/^(127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.)/.test(host)) return null
    return url
  } catch {
    return null
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  const url = typeof body?.url === 'string' ? body.url.trim() : ''
  const parsedUrl = isSafePublicUrl(url)
  if (!parsedUrl) return NextResponse.json({ error: 'URL invalide ou non accessible.' }, { status: 400 })

  try {
    let product = await scrapeDirect(parsedUrl.toString())
    if (!hasUsefulProduct(product)) {
      const curlProduct = await scrapeWithCurl(parsedUrl.toString())
      if (hasUsefulProduct(curlProduct)) product = curlProduct
    }
    if (!hasUsefulProduct(product)) {
      const beeProduct = await scrapeWithScrapingBee(parsedUrl.toString())
      if (hasUsefulProduct(beeProduct)) product = beeProduct
    }

    if (!hasUsefulProduct(product)) {
      return NextResponse.json({
        error: 'Impossible de lire les informations de ce produit. Vérifie le lien ou remplis les champs manuellement.',
      }, { status: 422 })
    }

    return NextResponse.json({ success: true, product })
  } catch (error) {
    console.error('Scraping error:', error)
    return NextResponse.json({
      error: 'Impossible de récupérer les informations de ce produit pour le moment.',
    }, { status: 502 })
  }
}

async function scrapeDirect(url: string): Promise<ScrapedProduct> {
  try {
    const response = await fetch(url, {
      headers: BROWSER_HEADERS,
      redirect: 'follow',
      signal: AbortSignal.timeout(12000),
      cache: 'no-store',
    })
    if (!response.ok) return {}
    const html = await response.text()
    if (!html) return {}
    return parseProductHtml(html, response.url || url)
  } catch (error) {
    console.warn('Direct scrape failed:', error)
    return {}
  }
}

async function scrapeWithCurl(url: string): Promise<ScrapedProduct> {
  // Some French retailers accept curl's HTTP/TLS fingerprint but reject undici
  // in Node. execFile keeps the URL as an argument (no shell interpolation).
  try {
    const { stdout } = await execFileAsync('curl', [
      '-L', '--compressed', '--max-time', '15',
      '-A', BROWSER_HEADERS['User-Agent'],
      '-H', `Accept: ${BROWSER_HEADERS.Accept}`,
      '-H', `Accept-Language: ${BROWSER_HEADERS['Accept-Language']}`,
      '--', url,
    ], { maxBuffer: 12 * 1024 * 1024, timeout: 16000 })
    return stdout ? parseProductHtml(stdout, url) : {}
  } catch (error) {
    console.warn('Curl scrape failed:', error)
    return {}
  }
}

async function scrapeWithScrapingBee(url: string): Promise<ScrapedProduct> {
  const apiKey = process.env.SCRAPINGBEE_API_KEY
  if (!apiKey) return {}
  const key = apiKey

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
      signal: AbortSignal.timeout(20000),
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
