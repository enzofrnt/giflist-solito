export interface ScrapedProduct {
  title?: string
  price?: string
  image?: string
  description?: string
}

type JsonRecord = Record<string, unknown>

const META_KEYS = {
  title: ['og:title', 'twitter:title', 'product:name', 'name', 'title'],
  description: ['og:description', 'twitter:description', 'description', 'product:description'],
  image: ['og:image:secure_url', 'og:image:url', 'og:image', 'twitter:image', 'twitter:image:src', 'image', 'product:image'],
  price: ['product:price:amount', 'og:price:amount', 'product:price', 'price', 'twitter:data1'],
} as const

export function parseProductHtml(html: string, baseUrl: string): ScrapedProduct {
  const product: ScrapedProduct = {}
  const host = (() => { try { return new URL(baseUrl).hostname.toLowerCase() } catch { return '' } })()
  const amazon = host.includes('amazon.') ? extractAmazonProduct(html) : {}
  const structured = extractStructuredProduct(html)

  product.title = amazon.title || structured.title || pickMeta(html, META_KEYS.title) || extractH1(html) || extractDocumentTitle(html)
  product.description = amazon.description || structured.description || pickMeta(html, META_KEYS.description)
  product.image = amazon.image || structured.image || pickMeta(html, META_KEYS.image) || extractMicrodataImage(html) || extractBestImage(html)
  product.price = amazon.price || structured.price || pickMeta(html, META_KEYS.price) || extractMicrodataPrice(html) || extractDataPrice(html) || extractPriceFromText(html)

  if (product.title) product.title = cleanTitle(product.title)
  if (product.description) product.description = cleanText(product.description, 1200)
  if (product.image) product.image = resolveUrl(product.image, baseUrl)
  if (product.price) product.price = normalizePrice(product.price) || undefined

  for (const key of Object.keys(product) as Array<keyof ScrapedProduct>) {
    if (!product[key]) delete product[key]
  }
  return product
}

function extractAmazonProduct(html: string): ScrapedProduct {
  const product: ScrapedProduct = {}
  const titleMatch = html.match(/<span[^>]*id=["']productTitle["'][^>]*>([\s\S]*?)<\/span>/i)
  if (titleMatch) product.title = cleanText(titleMatch[1], 220)

  const candidates: string[] = []
  const core = html.match(/<(?:div|span)[^>]*id=["'](?:corePrice_feature_div|corePriceDisplay_desktop_feature_div|priceblock_ourprice|price_inside_buybox|priceblock_dealprice)["'][^>]*>([\s\S]*?)<\/(?:div|span)>/i)
  if (core) candidates.push(...(core[1].match(/\d[\d\s.,]*\s*€/g) ?? []))
  const offscreen = [...html.matchAll(/<span[^>]*class=["'][^"']*a-offscreen[^"']*["'][^>]*>([\s\S]*?)<\/span>/gi)].map((match) => cleanText(match[1], 30))
  candidates.push(...offscreen)
  for (const candidate of candidates) {
    const price = normalizePrice(candidate)
    if (price && Number(price) > 0) { product.price = price; break }
  }

  const landing = html.match(/<img[^>]*id=["']landingImage["'][^>]*>/i)?.[0]
  if (landing) {
    const attrs = parseAttributes(landing)
    const dynamic = attrs['data-a-dynamic-image']?.match(/https?:\/\/[^"\s]+/)?.[0]
    product.image = attrs['data-old-hires'] || dynamic || attrs.src
  }
  if (!product.image) {
    const hires = html.match(/data-old-hires=["']([^"']+)["']/i)?.[1]
    if (hires) product.image = hires
  }

  const bullets = html.match(/<div[^>]*id=["']feature-bullets["'][^>]*>([\s\S]*?)<\/div>/i)
  if (bullets) {
    const text = [...bullets[1].matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)].map((match) => cleanText(match[1], 300)).filter(Boolean).slice(0, 3).join(' · ')
    if (text) product.description = text
  }
  return product
}

function cleanTitle(value: string): string {
  return cleanText(value, 220)
    .replace(/\s*:\s*Amazon\.[a-z.]+\s*:.*$/i, '')
    .replace(/\s*[|–—]\s*(?:Amazon|Fnac|Darty|Boulanger|Cdiscount|Decathlon|IKEA|Apple|Etsy|Shopify)[^|–—]*$/i, '')
    .trim()
}

function extractStructuredProduct(html: string): ScrapedProduct {
  const result: ScrapedProduct = {}
  for (const raw of extractJsonLdBlocks(html)) {
    let parsed: unknown
    try {
      parsed = JSON.parse(raw)
    } catch {
      try { parsed = JSON.parse(decodeEntities(raw)) } catch { continue }
    }
    const nodes = flattenJsonLd(parsed)
    const productNodes = nodes.filter(isProductNode)
    for (const node of productNodes) {
      result.title ||= firstText(node.name, node.headline)
      result.description ||= firstText(node.description, node.disambiguatingDescription)
      result.image ||= imageFromValue(node.image)
      result.price ||= priceFromOffers(node.offers) || priceFromSpecification(node.priceSpecification)
    }
    if (result.price) result.price = normalizePrice(result.price) || result.price
  }
  return result
}

function extractJsonLdBlocks(html: string): string[] {
  const blocks: string[] = []
  const regex = /<script\b[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
  let match: RegExpExecArray | null
  while ((match = regex.exec(html))) blocks.push(match[1].trim())
  return blocks
}

function flattenJsonLd(value: unknown): JsonRecord[] {
  if (Array.isArray(value)) return value.flatMap(flattenJsonLd)
  if (!isRecord(value)) return []
  const graph = value['@graph']
  return [value, ...(Array.isArray(graph) ? graph.flatMap(flattenJsonLd) : graph ? flattenJsonLd(graph) : [])]
}

function isProductNode(node: JsonRecord): boolean {
  const type = node['@type']
  const types = Array.isArray(type) ? type : [type]
  return types.some((entry) => typeof entry === 'string' && /(^|\/)(Product|ProductGroup|IndividualProduct)$/i.test(entry))
}

function priceFromOffers(value: unknown): string | undefined {
  const offers = Array.isArray(value) ? value : value ? [value] : []
  for (const offer of offers) {
    if (!isRecord(offer)) continue
    const direct = firstText(offer.price, offer.lowPrice, offer.highPrice)
    if (direct) return direct
    const spec = priceFromSpecification(offer.priceSpecification)
    if (spec) return spec
  }
  return undefined
}

function priceFromSpecification(value: unknown): string | undefined {
  if (Array.isArray(value)) {
    for (const entry of value) {
      const price = priceFromSpecification(entry)
      if (price) return price
    }
    return undefined
  }
  if (!isRecord(value)) return undefined
  return firstText(value.price, value.minPrice, value.maxPrice)
}

function imageFromValue(value: unknown): string | undefined {
  if (typeof value === 'string') return value
  if (Array.isArray(value)) {
    for (const entry of value) {
      const image = imageFromValue(entry)
      if (image) return image
    }
    return undefined
  }
  if (!isRecord(value)) return undefined
  return firstText(value.url, value.contentUrl, value['@id'])
}

function pickMeta(html: string, keys: readonly string[]): string | undefined {
  const metas = parseMetaTags(html)
  for (const key of keys) {
    const value = metas.get(key.toLowerCase())
    if (value) return value
  }
  return undefined
}

function parseMetaTags(html: string): Map<string, string> {
  const metas = new Map<string, string>()
  const tags = html.match(/<meta\b[^>]*>/gi) ?? []
  for (const tag of tags) {
    const attrs = parseAttributes(tag)
    const key = (attrs.property || attrs.name || attrs.itemprop || '').toLowerCase()
    if (key && attrs.content && !metas.has(key)) metas.set(key, attrs.content)
  }
  return metas
}

function extractH1(html: string): string | undefined {
  const match = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)
  return match ? cleanText(match[1], 220) : undefined
}

function extractDocumentTitle(html: string): string | undefined {
  const match = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)
  if (!match) return undefined
  return cleanText(match[1], 220).replace(/\s+[|–—·-]\s+[^|–—·-]{2,40}$/u, '').trim() || undefined
}

function extractMicrodataPrice(html: string): string | undefined {
  const tags = html.match(/<[^>]+itemprop\s*=\s*["']price["'][^>]*>/gi) ?? []
  for (const tag of tags) {
    const attrs = parseAttributes(tag)
    const value = firstText(attrs.content, attrs.value)
    if (value && normalizePrice(value)) return value
  }
  return undefined
}

function extractMicrodataImage(html: string): string | undefined {
  const tags = html.match(/<[^>]+itemprop\s*=\s*["']image["'][^>]*>/gi) ?? []
  for (const tag of tags) {
    const attrs = parseAttributes(tag)
    const value = firstText(attrs.content, attrs.src, attrs.href)
    if (value) return value
  }
  return undefined
}

function extractDataPrice(html: string): string | undefined {
  const tags = html.match(/<[^>]+data-(?:price|product-price|price-amount)\s*=\s*["'][^"']+["'][^>]*>/gi) ?? []
  for (const tag of tags) {
    const attrs = parseAttributes(tag)
    const value = firstText(attrs['data-price'], attrs['data-product-price'], attrs['data-price-amount'])
    if (value && normalizePrice(value)) return value
  }
  return undefined
}

function extractPriceFromText(html: string): string | undefined {
  const text = cleanText(html.replace(/<script\b[\s\S]*?<\/script>/gi, ' ').replace(/<style\b[\s\S]*?<\/style>/gi, ' '), 100000)
  const match = text.match(/(\d{1,3}(?:[ \u00a0.,]\d{3})*(?:[.,]\d{1,2})?)\s*(?:€|EUR|euros?|\$|USD|£|GBP)/i)
  return match?.[1]
}

function extractBestImage(html: string): string | undefined {
  const tags = html.match(/<img\b[^>]*>/gi) ?? []
  let best: { score: number; url: string } | undefined
  for (const tag of tags) {
    const attrs = parseAttributes(tag)
    const source = firstText(attrs['data-old-hires'], attrs['data-a-hires'], attrs['data-src'], attrs.src, attrs.srcset?.split(/\s+/)[0])
    if (!source) continue
    const haystack = `${attrs.class ?? ''} ${attrs.id ?? ''} ${attrs.alt ?? ''} ${source}`.toLowerCase()
    if (/logo|icon|sprite|avatar|placeholder|badge|star|payment|flag|banner/.test(haystack)) continue
    let score = 0
    if (/product|gallery|main|hero|zoom|packshot|media/.test(haystack)) score += 3
    if (/amazon|fnac|darty|boulanger|cdiscount|decathlon|ikea|apple/.test(haystack)) score += 1
    if (attrs.width && Number(attrs.width) >= 400) score += 2
    if (attrs.height && Number(attrs.height) >= 400) score += 2
    if (/\.(jpe?g|png|webp)(\?|$)/i.test(source)) score += 1
    if (!best || score > best.score) best = { score, url: source }
  }
  return best?.url
}

function parseAttributes(tag: string): Record<string, string> {
  const attrs: Record<string, string> = {}
  const regex = /([:\w-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g
  let match: RegExpExecArray | null
  while ((match = regex.exec(tag))) {
    const key = match[1].toLowerCase()
    if (!(key in attrs)) attrs[key] = match[2] ?? match[3] ?? match[4] ?? ''
  }
  return attrs
}

function resolveUrl(value: string, baseUrl: string): string | undefined {
  const raw = decodeEntities(value.trim()).replace(/^['"]|['"]$/g, '')
  if (!raw || raw.startsWith('data:image/svg')) return undefined
  try {
    return new URL(raw, baseUrl).toString()
  } catch {
    return undefined
  }
}

export function normalizePrice(value: string | number): string | undefined {
  let raw = String(value).trim().replace(/\s|\u00a0/g, '').replace(/(?:€|EUR|euros?|\$|USD|£|GBP)/gi, '')
  if (!raw) return undefined
  raw = raw.replace(/[^\d.,-]/g, '')
  if (!/\d/.test(raw)) return undefined

  const lastComma = raw.lastIndexOf(',')
  const lastDot = raw.lastIndexOf('.')
  if (lastComma > -1 && lastDot > -1) {
    const decimal = lastComma > lastDot ? ',' : '.'
    const thousands = decimal === ',' ? '.' : ','
    raw = raw.split(thousands).join('').replace(decimal, '.')
  } else if (lastComma > -1) {
    raw = raw.replace(',', '.')
  } else if ((raw.match(/\./g) ?? []).length > 1) {
    const parts = raw.split('.')
    raw = `${parts.slice(0, -1).join('')}.${parts.at(-1)}`
  }

  const number = Number(raw)
  if (!Number.isFinite(number) || number <= 0) return undefined
  return String(number)
}

function firstText(...values: unknown[]): string | undefined {
  for (const value of values) {
    if (typeof value === 'number' && Number.isFinite(value)) return String(value)
    if (typeof value === 'string' && value.trim()) return cleanText(value, 1200) || undefined
  }
  return undefined
}

function cleanText(value: string, max: number): string {
  return decodeEntities(value)
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max)
}

export function decodeEntities(value: string): string {
  const named: Record<string, string> = {
    amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', euro: '€',
    egrave: 'è', eacute: 'é', ecirc: 'ê', agrave: 'à', ccedil: 'ç', ugrave: 'ù', icirc: 'î', ocirc: 'ô', acirc: 'â',
    euml: 'ë', iuml: 'ï', uuml: 'ü', oelig: 'œ', aelig: 'æ', rsquo: '’', lsquo: '‘', ldquo: '“', rdquo: '”',
    hellip: '…', ndash: '–', mdash: '—', deg: '°', times: '×', middot: '·', laquo: '«', raquo: '»',
  }
  const decoded = value.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (whole, entity: string) => {
    if (entity[0] === '#') {
      const code = entity[1].toLowerCase() === 'x' ? Number.parseInt(entity.slice(2), 16) : Number.parseInt(entity.slice(1), 10)
      return Number.isFinite(code) ? String.fromCodePoint(code) : whole
    }
    return named[entity.toLowerCase()] ?? whole
  })
  // Some CMS/storefronts double-encode entities in meta descriptions.
  return decoded === value ? value : decodeEntities(decoded)
}

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
