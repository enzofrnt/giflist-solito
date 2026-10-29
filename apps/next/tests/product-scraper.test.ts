import { describe, expect, test } from 'bun:test'
import { normalizePrice, parseProductHtml } from '../src/lib/product-scraper'

const base = 'https://shop.example.com/produit/123'

describe('product scraper — JSON-LD merchants', () => {
  test('Fnac @graph product with relative image', () => {
    const html = `<html><head>
      <script type="application/ld+json">{"@context":"https://schema.org","@graph":[{"@type":"Product","name":"Casque Sony WH-1000XM5","description":"Casque Bluetooth à réduction de bruit","image":"/media/casque.jpg","offers":{"@type":"Offer","price":"299.99","priceCurrency":"EUR"}}]}</script>
    </head></html>`
    expect(parseProductHtml(html, 'https://www.fnac.com/a1')).toMatchObject({
      title: 'Casque Sony WH-1000XM5',
      price: '299.99',
      image: 'https://www.fnac.com/media/casque.jpg',
    })
  })

  test('Darty product with protocol-relative image', () => {
    const html = `<script type="application/ld+json">{"@type":"Product","name":"Lave-linge Bosch","image":"//cdn.darty.com/lave-linge.jpg","offers":{"@type":"Offer","price":"549.00"}}</script>`
    expect(parseProductHtml(html, 'https://www.darty.com/produit')).toMatchObject({
      title: 'Lave-linge Bosch',
      price: '549',
      image: 'https://cdn.darty.com/lave-linge.jpg',
    })
  })

  test('Boulanger, Cdiscount, Decathlon, IKEA and Apple product data', () => {
    const cases = [
      ['https://www.boulanger.com/x', 'Boulanger', 'Micro-ondes Samsung', '129.90'],
      ['https://www.cdiscount.com/x', 'Cdiscount', 'TV LG OLED 55', '999.99'],
      ['https://www.decathlon.fr/x', 'Decathlon', 'Vélo Riverside 500', '449.00'],
      ['https://www.ikea.com/x', 'IKEA', 'Bibliothèque Billy', '79.99'],
      ['https://www.apple.com/x', 'Apple', 'AirPods Pro', '279.00'],
    ] as const
    for (const [url, merchant, title, price] of cases) {
      const html = `<script type="application/ld+json">{"@type":"Product","name":"${title}","image":"${url}/image.jpg","offers":[{"@type":"Offer","price":"${price}"}]}</script>`
      const result = parseProductHtml(html, url)
      expect(result.title, merchant).toBe(title)
      expect(result.price, merchant).toBe(String(Number(price)))
      expect(result.image, merchant).toBe(`${url}/image.jpg`)
    }
  })

  test('Etsy and Shopify structured products', () => {
    for (const [url, title] of [['https://www.etsy.com/fr/listing/1', 'Bougie artisanale'], ['https://boutique.myshopify.com/products/1', 'Mug céramique']]) {
      const html = `<script type="application/ld+json">{"@type":"Product","name":"${title}","image":{"url":"https://cdn.shop.com/p.jpg"},"offers":{"@type":"AggregateOffer","lowPrice":"24.50"}}</script>`
      expect(parseProductHtml(html, url)).toMatchObject({ title, price: '24.5', image: 'https://cdn.shop.com/p.jpg' })
    }
  })
})

describe('product scraper — French merchants', () => {
  test.each([
    ['Etam', 'https://www.etam.com/p/655719680.html', '<script type="application/ld+json">{"@type":"Product","name":"Soutien-gorge N.4","image":"https://www.etam.com/img/655719680_x.jpg","offers":{"@type":"Offer","price":"32.99"}}</script>', '32.99'],
    ['Petit Bateau', 'https://www.petit-bateau.fr/p/A0EUT02.html', '<meta property="og:title" content="Crème mains apaisante - 30 ML" /><meta property="og:image" content="https://www.petit-bateau.fr/img/A0EUT01F2.jpg" /><meta property="product:price:amount" content="8.50" />', '8.5'],
    ['King Jouet', 'https://www.king-jouet.com/p/ref-955084.htm', '<script type="application/ld+json">{"@type":"Product","name":"Kinetic Sand - Machine à glaces","image":"https://images.king-jouet.com/6/gu955084_6.jpg","offers":{"@type":"Offer","price":22.99}}</script>', '22.99'],
    ['JouéClub', 'https://www.joueclub.fr/p/multiactivites.html', '<script type="application/ld+json">{"@type":"Product","name":"MULTIACTIVITES","image":"https://joueclub.example/image.jpg","offers":{"@type":"Offer","price":"18.99"}}</script>', '18.99'],
    ['Concorde Love', 'https://www.concordelove.fr/p/597007.html', '<meta property="og:title" content="Jeu érotique Hasard et Plaisir" /><meta property="og:image" content="https://www.concordelove.fr/img/597007.jpg" /><meta property="product:price:amount" content="19.90" />', '19.9'],
  ] as const)('%s fixture returns title, image and price', (merchant, url, html, price) => {
    const product = parseProductHtml(html, url)
    expect(product.title, merchant).toBeTruthy()
    expect(product.image, merchant).toMatch(/^https:\/\//)
    expect(product.price, merchant).toBe(price)
  })
})

describe('product scraper — fallbacks', () => {
  test('Amazon metadata and visible price', () => {
    const html = `<html><head><title>Echo Dot (5e génération)</title>
      <meta property="og:title" content="Echo Dot (5e génération) — Charcoal" />
      <meta property="og:image" content="https://m.media-amazon.com/images/I/echo.jpg" />
      <meta name="description" content="Enceinte connectée avec Alexa" />
    </head><body><span class="a-offscreen">59,99 €</span><img id="landingImage" data-old-hires="https://m.media-amazon.com/images/I/echo-hires.jpg" /></body></html>`
    expect(parseProductHtml(html, 'https://www.amazon.fr/dp/B09')).toMatchObject({
      title: 'Echo Dot (5e génération) — Charcoal',
      price: '59.99',
      image: 'https://m.media-amazon.com/images/I/echo-hires.jpg',
      description: 'Enceinte connectée avec Alexa',
    })
  })

  test('WooCommerce microdata', () => {
    const html = `<h1 class="product_title">Tapis berbère</h1>
      <div itemscope itemtype="https://schema.org/Product">
        <span itemprop="price" content="89.90">89,90 €</span>
        <meta itemprop="image" content="/uploads/tapis.jpg" />
      </div>`
    expect(parseProductHtml(html, 'https://shop.example.com/tapis')).toMatchObject({
      title: 'Tapis berbère',
      price: '89.9',
      image: 'https://shop.example.com/uploads/tapis.jpg',
    })
  })

  test('Generic Open Graph with entities and relative image', () => {
    const html = `<meta property="og:title" content="Lampe &amp; ampoule" />
      <meta property="og:description" content="Une lampe pour &quot;lire&quot;." />
      <meta property="og:image" content="/images/lampe.webp" />
      <meta property="product:price:amount" content="1 299,00" />`
    expect(parseProductHtml(html, base)).toMatchObject({
      title: 'Lampe & ampoule',
      price: '1299',
      image: 'https://shop.example.com/images/lampe.webp',
      description: 'Une lampe pour "lire".',
    })
  })

  test('decodes French named entities in descriptions', () => {
    const html = '<meta property="og:title" content="Crème mains" /><meta property="og:description" content="Cr&egrave;me &amp; soin" />'
    expect(parseProductHtml(html, base).description).toBe('Crème & soin')
  })

  test('returns partial data and no invented fields', () => {
    expect(parseProductHtml('<html><body>Aucun produit</body></html>', base)).toEqual({})
    expect(parseProductHtml('<meta property="og:title" content="Produit seul" />', base)).toEqual({ title: 'Produit seul' })
  })
})

describe('price normalization', () => {
  test.each([
    ['29,99 €', '29.99'],
    ['1 299,00 €', '1299'],
    ['EUR 1.299,50', '1299.5'],
    ['$24.90', '24.9'],
    ['12.345,67', '12345.67'],
    ['0,00 €', undefined],
    ['gratuit', undefined],
  ])('%s → %s', (input, expected) => {
    expect(normalizePrice(input)).toBe(expected)
  })
})

const liveTest = process.env.SCRAPER_LIVE_TESTS === '1' ? test : test.skip
liveTest('live smoke — Amazon.fr', async () => {
  const response = await fetch('https://www.amazon.fr/dp/B0CHWZ9TZS', {
    headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36' },
  })
  expect(response.ok).toBe(true)
  const product = parseProductHtml(await response.text(), response.url)
  expect(product.title?.toLowerCase()).toContain('airpods')
  expect(product.image).toContain('media-amazon.com')
  expect(Number(product.price)).toBeGreaterThan(0)
}, 20000)

liveTest('live smoke — Apple France', async () => {
  const response = await fetch('https://www.apple.com/fr/airpods-pro/', {
    headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36' },
  })
  expect(response.ok).toBe(true)
  const product = parseProductHtml(await response.text(), response.url)
  expect(product.title?.toLowerCase()).toContain('airpods')
  expect(product.image).toMatch(/^https:\/\//)
}, 20000)

const liveFrenchMerchants = [
  ['Etam', 'https://www.etam.com/p/soutien-gorge-n.4---le-coques-fines-en-microfibre-avec-details-en-dentelle-655719680.html', 'soutien-gorge'],
  ['Petit Bateau', 'https://www.petit-bateau.fr/creme-mains-apaisante---30-ml-floral-citrus-musc/A0EUT02.html', 'crème mains'],
  ['King Jouet', 'https://www.king-jouet.com/jeu-jouet/jeux-creatifs/mosaique-sable-paillettes/ref-955084-kinetic-sand-machine-a-glaces-sable-magique-a-modeler.htm', 'kinetic sand'],
  ['JouéClub', 'https://www.joueclub.fr/activites-creatives-et-manuelles/multiactivites-3700217377472.html', 'multiactivites'],
  ['Concorde Love', 'https://www.concordelove.fr/jeux-sexy/1580-jeu-erotique-hasard-et-plaisir-597007.html', 'hasard et plaisir'],
] as const

const liveFrenchTest = process.env.SCRAPER_LIVE_TESTS === '1' ? test : test.skip
for (const [merchant, url, expected] of liveFrenchMerchants) {
  liveFrenchTest(`live smoke — ${merchant}`, async () => {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36' },
    })
    if (!response.ok) {
      // King Jouet and some Cloudflare sites reject undici; use curl like the API fallback.
      const { execFileSync } = await import('node:child_process')
      const html = execFileSync('curl', ['-s', '-L', '--compressed', '--max-time', '20', '-A', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '-H', 'Accept-Language: fr-FR,fr;q=0.9', '--', url], { encoding: 'utf8', maxBuffer: 12 * 1024 * 1024 })
      const product = parseProductHtml(html, url)
      expect(product.title?.toLowerCase()).toContain(expected)
      expect(Number(product.price)).toBeGreaterThan(0)
      expect(product.image).toMatch(/^https:\/\//)
      return
    }
    const product = parseProductHtml(await response.text(), response.url)
    expect(product.title?.toLowerCase()).toContain(expected)
    expect(Number(product.price)).toBeGreaterThan(0)
    expect(product.image).toMatch(/^https:\/\//)
  }, 25000)
}
