import { NextRequest, NextResponse } from 'next/server';

interface ScrapedProduct {
  title?: string;
  price?: string;
  image?: string;
  description?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Validation de l'URL
    try {
      new URL(url);
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
    }

    // Utilisation d'un service de scraping gratuit
    // Pour une solution gratuite, on peut utiliser des APIs comme:
    // - ScrapingBee (gratuit jusqu'à 1000 requêtes/mois)
    // - ScraperAPI (gratuit jusqu'à 5000 requêtes/mois)
    // - ou une solution self-hosted avec Puppeteer

    const scrapingResult = await scrapeProduct(url);

    return NextResponse.json({ 
      success: true, 
      product: scrapingResult 
    });

  } catch (error) {
    console.error('Scraping error:', error);
    return NextResponse.json({ 
      error: 'Failed to scrape product information' 
    }, { status: 500 });
  }
}

async function scrapeProduct(url: string): Promise<ScrapedProduct> {
  // Pour une solution gratuite et simple, on peut utiliser:
  // 1. Un service de scraping comme ScrapingBee
  // 2. Ou une solution avec Puppeteer (nécessite un serveur)
  
  // Ici, je vais implémenter une solution avec ScrapingBee (gratuit)
  // Vous devrez vous inscrire sur https://www.scrapingbee.com/ et obtenir une clé API
  
  const SCRAPINGBEE_API_KEY = process.env.SCRAPINGBEE_API_KEY;
  
  if (!SCRAPINGBEE_API_KEY) {
    // Fallback: essayer de récupérer les métadonnées Open Graph
    return await scrapeWithOpenGraph(url);
  }

  try {
    const params = new URLSearchParams({
      api_key: SCRAPINGBEE_API_KEY,
      url: url,
      render_js: 'false', // Plus rapide, pas besoin de JS pour la plupart des sites
      premium_proxy: 'false', // Utilise le proxy gratuit
      country_code: 'fr', // Proxy français pour de meilleurs résultats
    });

    const response = await fetch(`https://app.scrapingbee.com/api/v1/?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'text/html',
      },
    });

    if (!response.ok) {
      throw new Error(`ScrapingBee API error: ${response.status}`);
    }

    const html = await response.text();
    return parseProductFromHTML(html, url);
  } catch (error) {
    console.error('ScrapingBee error:', error);
    // Fallback vers Open Graph
    return await scrapeWithOpenGraph(url);
  }
}

async function scrapeWithOpenGraph(url: string): Promise<ScrapedProduct> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    const html = await response.text();
    return parseProductFromHTML(html, url);
  } catch (error) {
    console.error('Open Graph scraping error:', error);
    return {};
  }
}

function parseProductFromHTML(html: string, baseUrl: string): ScrapedProduct {
  const product: ScrapedProduct = {};

  // Extraction du titre - Priorité aux métadonnées Open Graph
  const titlePatterns = [
    /<meta[^>]*property="og:title"[^>]*content="([^"]*)"[^>]*>/i,
    /<meta[^>]*name="twitter:title"[^>]*content="([^"]*)"[^>]*>/i,
    /<meta[^>]*property="product:name"[^>]*content="([^"]*)"[^>]*>/i,
    /<h1[^>]*class="[^"]*title[^"]*"[^>]*>([^<]*)<\/h1>/i,
    /<h1[^>]*class="[^"]*product[^"]*"[^>]*>([^<]*)<\/h1>/i,
    /<h1[^>]*class="[^"]*name[^"]*"[^>]*>([^<]*)<\/h1>/i,
    /<title[^>]*>([^<]*)<\/title>/i
  ];

  for (const pattern of titlePatterns) {
    const match = html.match(pattern);
    if (match && match[1]) {
      product.title = cleanText(match[1]);
      break;
    }
  }

  // Extraction du prix - Patterns beaucoup plus robustes
  const pricePatterns = [
    // Métadonnées
    /<meta[^>]*property="product:price:amount"[^>]*content="([^"]*)"[^>]*>/i,
    /<meta[^>]*property="og:price:amount"[^>]*content="([^"]*)"[^>]*>/i,
    /<meta[^>]*name="price"[^>]*content="([^"]*)"[^>]*>/i,
    /<meta[^>]*itemprop="price"[^>]*content="([^"]*)"[^>]*>/i,
    
    // Amazon spécifique
    /<span[^>]*class="[^"]*a-price-whole"[^>]*>([^<]*)<\/span>/i,
    /<span[^>]*class="[^"]*a-offscreen"[^>]*>([^<]*)<\/span>/i,
    /<span[^>]*class="[^"]*a-price[^"]*"[^>]*>([^<]*)<\/span>/i,
    /<span[^>]*id="[^"]*price[^"]*"[^>]*>([^<]*)<\/span>/i,
    
    // Fnac spécifique
    /<span[^>]*class="[^"]*f-price[^"]*"[^>]*>([^<]*)<\/span>/i,
    /<div[^>]*class="[^"]*f-price[^"]*"[^>]*>([^<]*)<\/div>/i,
    
    // Darty spécifique
    /<span[^>]*class="[^"]*darty_price[^"]*"[^>]*>([^<]*)<\/span>/i,
    /<div[^>]*class="[^"]*darty_price[^"]*"[^>]*>([^<]*)<\/div>/i,
    
    // Boulanger spécifique
    /<span[^>]*class="[^"]*boulanger_price[^"]*"[^>]*>([^<]*)<\/span>/i,
    /<div[^>]*class="[^"]*boulanger_price[^"]*"[^>]*>([^<]*)<\/div>/i,
    
    // Cdiscount spécifique
    /<span[^>]*class="[^"]*price[^"]*"[^>]*>([^<]*)<\/span>/i,
    /<div[^>]*class="[^"]*price[^"]*"[^>]*>([^<]*)<\/div>/i,
    
    // Patterns génériques plus larges
    /<span[^>]*class="[^"]*price[^"]*"[^>]*>([^<]*)<\/span>/i,
    /<div[^>]*class="[^"]*price[^"]*"[^>]*>([^<]*)<\/div>/i,
    /<span[^>]*class="[^"]*current[^"]*price[^"]*"[^>]*>([^<]*)<\/span>/i,
    /<span[^>]*class="[^"]*now[^"]*price[^"]*"[^>]*>([^<]*)<\/span>/i,
    /<span[^>]*class="[^"]*value[^"]*price[^"]*"[^>]*>([^<]*)<\/span>/i,
    /<span[^>]*class="[^"]*amount[^"]*"[^>]*>([^<]*)<\/span>/i,
    /<span[^>]*class="[^"]*cost[^"]*"[^>]*>([^<]*)<\/span>/i,
    /<span[^>]*class="[^"]*prix[^"]*"[^>]*>([^<]*)<\/span>/i,
    /<div[^>]*class="[^"]*prix[^"]*"[^>]*>([^<]*)<\/div>/i,
    
    // Data attributes
    /<span[^>]*data-testid="[^"]*price[^"]*"[^>]*>([^<]*)<\/span>/i,
    /<div[^>]*data-testid="[^"]*price[^"]*"[^>]*>([^<]*)<\/div>/i,
    /<span[^>]*data-price="([^"]*)"[^>]*>/i,
    /<div[^>]*data-price="([^"]*)"[^>]*>/i,
    
    // JSON-LD structured data
    /"price":\s*"([^"]*)"/i,
    /"offers":\s*{[^}]*"price":\s*"([^"]*)"/i,
    /"lowPrice":\s*"([^"]*)"/i,
    /"highPrice":\s*"([^"]*)"/i,
    
    // Patterns avec € ou $ dans le texte
    /<[^>]*>([^<]*€[^<]*)<\/[^>]*>/i,
    /<[^>]*>([^<]*\$[^<]*)<\/[^>]*>/i,
    /<[^>]*>([^<]*EUR[^<]*)<\/[^>]*>/i,
    /<[^>]*>([^<]*USD[^<]*)<\/[^>]*>/i,
  ];

  // Essayer tous les patterns
  for (const pattern of pricePatterns) {
    const match = html.match(pattern);
    if (match && match[1]) {
      const priceText = extractPrice(match[1]);
      if (priceText) {
        product.price = priceText;
        break;
      }
    }
  }

  // Si aucun prix trouvé, essayer une recherche plus large
  if (!product.price) {
    const broadPriceMatch = html.match(/(\d+[.,]\d{2})\s*[€$£¥]/i);
    if (broadPriceMatch) {
      product.price = broadPriceMatch[1].replace(',', '.');
    }
  }

  // Nettoyer la description si elle est "undefined"
  if (product.description === 'undefined' || product.description === 'null') {
    product.description = undefined;
  }

  // Debug: logger les informations extraites (à supprimer en production)
  if (process.env.NODE_ENV === 'development') {
    console.log('Scraping debug:', {
      title: product.title,
      price: product.price,
      image: product.image,
      description: product.description?.substring(0, 100) + '...'
    });
  }

  // Extraction de l'image - Patterns beaucoup plus robustes
  const imagePatterns = [
    // Métadonnées Open Graph et Twitter
    /<meta[^>]*property="og:image"[^>]*content="([^"]*)"[^>]*>/i,
    /<meta[^>]*name="twitter:image"[^>]*content="([^"]*)"[^>]*>/i,
    /<meta[^>]*property="twitter:image"[^>]*content="([^"]*)"[^>]*>/i,
    /<meta[^>]*property="og:image:url"[^>]*content="([^"]*)"[^>]*>/i,
    /<meta[^>]*name="image"[^>]*content="([^"]*)"[^>]*>/i,
    /<meta[^>]*itemprop="image"[^>]*content="([^"]*)"[^>]*>/i,
    
    // Amazon spécifique - Images principales
    /<img[^>]*id="landingImage"[^>]*src="([^"]*)"[^>]*>/i,
    /<img[^>]*id="imgBlkFront"[^>]*src="([^"]*)"[^>]*>/i,
    /<img[^>]*class="[^"]*a-dynamic-image[^"]*"[^>]*src="([^"]*)"[^>]*>/i,
    /<img[^>]*class="[^"]*a-dynamic-image[^"]*"[^>]*data-src="([^"]*)"[^>]*>/i,
    /<img[^>]*class="[^"]*a-dynamic-image[^"]*"[^>]*data-old-hires="([^"]*)"[^>]*>/i,
    /<img[^>]*class="[^"]*a-dynamic-image[^"]*"[^>]*data-a-dynamic-image="([^"]*)"[^>]*>/i,
    /<img[^>]*class="[^"]*a-dynamic-image[^"]*"[^>]*data-a-hires="([^"]*)"[^>]*>/i,
    
    // Amazon - Images de produit avec data attributes
    /<img[^>]*class="[^"]*a-dynamic-image[^"]*"[^>]*data-a-dynamic-image="([^"]*)"[^>]*>/i,
    /<img[^>]*class="[^"]*a-dynamic-image[^"]*"[^>]*data-a-hires="([^"]*)"[^>]*>/i,
    /<img[^>]*class="[^"]*a-dynamic-image[^"]*"[^>]*data-old-hires="([^"]*)"[^>]*>/i,
    
    // Fnac spécifique
    /<img[^>]*class="[^"]*f-product-image[^"]*"[^>]*src="([^"]*)"[^>]*>/i,
    /<img[^>]*class="[^"]*f-product-image[^"]*"[^>]*data-src="([^"]*)"[^>]*>/i,
    /<img[^>]*class="[^"]*f-product-image[^"]*"[^>]*data-lazy="([^"]*)"[^>]*>/i,
    
    // Darty spécifique
    /<img[^>]*class="[^"]*darty_product_image[^"]*"[^>]*src="([^"]*)"[^>]*>/i,
    /<img[^>]*class="[^"]*darty_product_image[^"]*"[^>]*data-src="([^"]*)"[^>]*>/i,
    
    // Boulanger spécifique
    /<img[^>]*class="[^"]*boulanger_product_image[^"]*"[^>]*src="([^"]*)"[^>]*>/i,
    /<img[^>]*class="[^"]*boulanger_product_image[^"]*"[^>]*data-src="([^"]*)"[^>]*>/i,
    
    // Cdiscount spécifique
    /<img[^>]*class="[^"]*product_image[^"]*"[^>]*src="([^"]*)"[^>]*>/i,
    /<img[^>]*class="[^"]*product_image[^"]*"[^>]*data-src="([^"]*)"[^>]*>/i,
    
    // Patterns génériques
    /<img[^>]*class="[^"]*product[^"]*image[^"]*"[^>]*src="([^"]*)"[^>]*>/i,
    /<img[^>]*class="[^"]*main[^"]*image[^"]*"[^>]*src="([^"]*)"[^>]*>/i,
    /<img[^>]*class="[^"]*hero[^"]*image[^"]*"[^>]*src="([^"]*)"[^>]*>/i,
    /<img[^>]*class="[^"]*primary[^"]*image[^"]*"[^>]*src="([^"]*)"[^>]*>/i,
    /<img[^>]*class="[^"]*featured[^"]*image[^"]*"[^>]*src="([^"]*)"[^>]*>/i,
    /<img[^>]*id="[^"]*product[^"]*image[^"]*"[^>]*src="([^"]*)"[^>]*>/i,
    /<img[^>]*id="[^"]*main[^"]*image[^"]*"[^>]*src="([^"]*)"[^>]*>/i,
    /<img[^>]*data-testid="[^"]*image[^"]*"[^>]*src="([^"]*)"[^>]*>/i,
    /<img[^>]*data-testid="[^"]*product[^"]*image[^"]*"[^>]*src="([^"]*)"[^>]*>/i,
    
    // Data attributes pour images lazy loading
    /<img[^>]*data-src="([^"]*)"[^>]*>/i,
    /<img[^>]*data-lazy="([^"]*)"[^>]*>/i,
    /<img[^>]*data-original="([^"]*)"[^>]*>/i,
    /<img[^>]*data-lazy-src="([^"]*)"[^>]*>/i,
    
    // JSON-LD structured data
    /"image":\s*"([^"]*)"/i,
    /"image":\s*\["([^"]*)"\]/i,
    /"offers":\s*{[^}]*"image":\s*"([^"]*)"/i,
  ];

  // Essayer d'abord les patterns normaux
  for (const pattern of imagePatterns) {
    const match = html.match(pattern);
    if (match && match[1]) {
      const imageUrl = resolveImageUrl(match[1], baseUrl);
      if (imageUrl) {
        product.image = imageUrl;
        break;
      }
    }
  }

  // Debug pour comprendre pourquoi extractAmazonImage n'est pas appelée
  if (baseUrl.includes('amazon')) {
    console.log('🔍 Debug Amazon - État de product.image:', product.image);
    console.log('🔍 Debug Amazon - Type de product.image:', typeof product.image);
    console.log('🔍 Debug Amazon - Condition pour extractAmazonImage:', (!product.image || product.image === 'undefined' || product.image === 'null'));
  }

  // Si pas d'image trouvée et que c'est Amazon, essayer une approche spéciale
  if ((!product.image || product.image === 'undefined' || product.image === 'null') && baseUrl.includes('amazon')) {
    console.log('🔍 Appel de extractAmazonImage...');
    product.image = extractAmazonImage(html, baseUrl) ?? undefined;
    console.log('📸 Résultat extractAmazonImage:', product.image);
  }

  // Debug supplémentaire pour Amazon
  if (baseUrl.includes('amazon') && process.env.NODE_ENV === 'development') {
    console.log('🔍 Debug Amazon - Recherche d\'images...');
    
    // Chercher toutes les balises img
    const imgTags = html.match(/<img[^>]*>/gi);
    if (imgTags) {
      console.log(`📊 Nombre total d'images trouvées: ${imgTags.length}`);
      
      // Chercher les images avec des classes Amazon
      const amazonImages = imgTags.filter(img => 
        img.includes('a-dynamic-image') || 
        img.includes('landingImage') || 
        img.includes('imgBlkFront')
      );
      
      console.log(`📊 Images Amazon trouvées: ${amazonImages.length}`);
      
      if (amazonImages.length > 0) {
        console.log('📸 Première image Amazon:', amazonImages[0]);
      }
    }
    
    // Chercher les data attributes
    const dataAttributes = html.match(/data-[a-zA-Z-]*="[^"]*"/gi);
    if (dataAttributes) {
      const imageDataAttrs = dataAttributes.filter(attr => 
        attr.includes('image') || attr.includes('src') || attr.includes('hires')
      );
      console.log('📊 Data attributes d\'images:', imageDataAttrs.slice(0, 5));
    }
  }

  // Extraction de la description
  const descriptionPatterns = [
    /<meta[^>]*property="og:description"[^>]*content="([^"]*)"[^>]*>/i,
    /<meta[^>]*name="description"[^>]*content="([^"]*)"[^>]*>/i,
    /<meta[^>]*name="twitter:description"[^>]*content="([^"]*)"[^>]*>/i,
    /<div[^>]*class="[^"]*product[^"]*description[^"]*"[^>]*>([^<]*)<\/div>/i,
    /<div[^>]*class="[^"]*product[^"]*summary[^"]*"[^>]*>([^<]*)<\/div>/i,
    /<p[^>]*class="[^"]*product[^"]*description[^"]*"[^>]*>([^<]*)<\/p>/i,
  ];

  for (const pattern of descriptionPatterns) {
    const match = html.match(pattern);
    if (match && match[1]) {
      product.description = cleanText(match[1]);
      break;
    }
  }

  return product;
}

function cleanText(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function extractPrice(text: string): string | null {
  if (!text) return null;
  
  // Nettoyer le texte
  const cleanText = text.trim();
  
  // Patterns de prix plus intelligents
  const pricePatterns = [
    // Format français: 29,99 €
    /(\d+[.,]\d{2})\s*€/i,
    // Format américain: $29.99
    /\$(\d+\.\d{2})/i,
    // Format britannique: £29.99
    /£(\d+\.\d{2})/i,
    // Format japonais: ¥2999
    /¥(\d+)/i,
    // Format simple: 29.99 ou 29,99
    /(\d+[.,]\d{2})/,
    // Format avec espaces: 29 99 €
    /(\d+)\s+(\d{2})\s*€/i,
    // Format avec virgule comme séparateur de milliers: 1,299.99
    /(\d{1,3}(?:,\d{3})*\.\d{2})/,
    // Format européen: 1.299,99
    /(\d{1,3}(?:\.\d{3})*,\d{2})/,
    // Prix simple sans décimales: 29 €
    /(\d+)\s*€/i,
    // Prix avec "EUR" ou "USD"
    /(\d+[.,]\d{2})\s*(?:EUR|USD)/i,
  ];
  
  for (const pattern of pricePatterns) {
    const match = cleanText.match(pattern);
    if (match) {
      let price = match[1];
      
      // Si c'est le format avec espaces (29 99 €)
      if (match[2]) {
        price = match[1] + '.' + match[2];
      }
      
      // Nettoyer le prix
      price = price
        .replace(/\s/g, '') // Supprimer les espaces
        .replace(/,/g, '.') // Remplacer virgule par point
        .replace(/[^\d.]/g, ''); // Garder seulement chiffres et points
      
      // Vérifier que c'est un prix valide
      if (isValidPrice(price)) {
        return price;
      }
    }
  }
  
  // Fallback: recherche de n'importe quel nombre avec décimales
  const fallbackMatch = cleanText.match(/(\d+[.,]\d{2})/);
  if (fallbackMatch) {
    const price = fallbackMatch[1].replace(',', '.');
    if (isValidPrice(price)) {
      return price;
    }
  }
  
  return null;
}

function isValidPrice(price: string): boolean {
  if (!price) return false;
  
  // Vérifier que c'est un nombre valide
  const num = parseFloat(price);
  if (isNaN(num)) return false;
  
  // Vérifier que le prix est raisonnable (entre 0.01 et 999999.99)
  if (num < 0.01 || num > 999999.99) return false;
  
  // Vérifier le format (au moins 2 caractères, max 10)
  if (price.length < 2 || price.length > 10) return false;
  
  // Vérifier qu'il y a au moins un point et des décimales
  if (price.includes('.')) {
    const parts = price.split('.');
    if (parts.length !== 2 || parts[1].length !== 2) {
      return false;
    }
  }
  
  return true;
}

function extractAmazonImage(html: string, baseUrl: string): string | null {
  try {
    console.log('🔍 Extraction d\'image Amazon en cours...');
    
    // 1. Recherche dans les scripts JSON-LD
    const jsonLdMatches = html.match(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi);
    if (jsonLdMatches) {
      for (const jsonLdMatch of jsonLdMatches) {
        try {
          const jsonData = JSON.parse(jsonLdMatch);
          if (jsonData.image) {
            const image = Array.isArray(jsonData.image) ? jsonData.image[0] : jsonData.image;
            console.log('📸 Image trouvée dans JSON-LD:', image);
            return image;
          }
          if (jsonData.offers && jsonData.offers.image) {
            const image = Array.isArray(jsonData.offers.image) ? jsonData.offers.image[0] : jsonData.offers.image;
            console.log('📸 Image trouvée dans JSON-LD offers:', image);
            return image;
          }
        } catch {
          // Ignorer les erreurs de parsing JSON
        }
      }
    }

    // 2. Recherche dans les métadonnées Open Graph
    const ogImageMatch = html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]*)"[^>]*>/i);
    if (ogImageMatch && ogImageMatch[1]) {
      console.log('📸 Image trouvée dans og:image:', ogImageMatch[1]);
      return ogImageMatch[1];
    }

    // 3. Recherche dans les data attributes Amazon
    const amazonImagePatterns = [
      // Patterns pour data-a-hires (PRIORITÉ)
      /data-a-hires="([^"]*)"/g,
      /data-a-hires='([^']*)'/g,
      // Patterns pour data-old-hires
      /data-old-hires="([^"]*)"/g,
      /data-old-hires='([^']*)'/g,
      // Patterns pour data-a-dynamic-image
      /data-a-dynamic-image='([^']*)'/g,
      /data-a-dynamic-image="([^"]*)"/g,
      // Patterns pour data-src avec classes Amazon
      /data-src="([^"]*)"[^>]*class="[^"]*a-dynamic-image[^"]*"/g,
      /data-src="([^"]*)"[^>]*class="[^"]*a-dynamic-image[^"]*"[^>]*>/g,
      // Patterns pour src avec classes Amazon
      /src="([^"]*)"[^>]*class="[^"]*a-dynamic-image[^"]*"/g,
      /src="([^"]*)"[^>]*class="[^"]*a-dynamic-image[^"]*"[^>]*>/g,
    ];

    for (const pattern of amazonImagePatterns) {
      let match;
      while ((match = pattern.exec(html)) !== null) {
        if (match[1] && match[1].trim()) {
          console.log('📸 Pattern Amazon trouvé:', pattern.source, '->', match[1]);
          
          try {
            // Si c'est un JSON (data-a-dynamic-image)
            if (match[1].includes('{') && match[1].includes('}')) {
              const imageData = JSON.parse(match[1]);
              if (imageData && typeof imageData === 'object') {
                const firstKey = Object.keys(imageData)[0];
                if (firstKey) {
                  console.log('📸 Image JSON extraite:', firstKey);
                  return firstKey;
                }
              }
            } else {
              // URL directe
              const imageUrl = resolveImageUrl(match[1], baseUrl);
              if (imageUrl) {
                console.log('📸 Image URL directe:', imageUrl);
                return imageUrl;
              }
            }
          } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'Erreur inconnue';
            console.log('❌ Erreur parsing:', errorMessage);
            continue;
          }
        }
      }
    }

    // 4. Recherche dans les IDs spécifiques Amazon
    const idPatterns = [
      /id="landingImage"[^>]*src="([^"]*)"/i,
      /id="imgBlkFront"[^>]*src="([^"]*)"/i,
      /id="landingImage"[^>]*data-src="([^"]*)"/i,
      /id="imgBlkFront"[^>]*data-src="([^"]*)"/i,
    ];

    for (const pattern of idPatterns) {
      const match = html.match(pattern);
      if (match && match[1]) {
        console.log('📸 Image trouvée par ID:', match[1]);
        const imageUrl = resolveImageUrl(match[1], baseUrl);
        if (imageUrl) return imageUrl;
      }
    }

    // 5. Recherche directe dans les data attributes (méthode simple)
    const dataHiresMatch = html.match(/data-a-hires="([^"]*)"/i);
    if (dataHiresMatch && dataHiresMatch[1]) {
      console.log('📸 Image trouvée par data-a-hires direct:', dataHiresMatch[1]);
      return dataHiresMatch[1];
    }

    const dataOldHiresMatch = html.match(/data-old-hires="([^"]*)"/i);
    if (dataOldHiresMatch && dataOldHiresMatch[1]) {
      console.log('📸 Image trouvée par data-old-hires direct:', dataOldHiresMatch[1]);
      return dataOldHiresMatch[1];
    }

    // 6. Recherche large dans toutes les images
    const allImages = html.match(/<img[^>]*>/gi);
    if (allImages) {
      for (const imgTag of allImages) {
        // Chercher des images qui contiennent des mots-clés Amazon
        if (imgTag.includes('amazon') || imgTag.includes('a-dynamic-image') || imgTag.includes('product')) {
          const srcMatch = imgTag.match(/src="([^"]*)"/i);
          const dataSrcMatch = imgTag.match(/data-src="([^"]*)"/i);
          const dataHiresMatch = imgTag.match(/data-a-hires="([^"]*)"/i);
          
          if (dataHiresMatch && dataHiresMatch[1]) {
            console.log('📸 Image Amazon trouvée (data-a-hires):', dataHiresMatch[1]);
            return dataHiresMatch[1];
          }
          
          if (srcMatch && srcMatch[1]) {
            console.log('📸 Image Amazon trouvée (src):', srcMatch[1]);
            const imageUrl = resolveImageUrl(srcMatch[1], baseUrl);
            if (imageUrl) return imageUrl;
          }
          
          if (dataSrcMatch && dataSrcMatch[1]) {
            console.log('📸 Image Amazon trouvée (data-src):', dataSrcMatch[1]);
            const imageUrl = resolveImageUrl(dataSrcMatch[1], baseUrl);
            if (imageUrl) return imageUrl;
          }
        }
      }
    }

    console.log('❌ Aucune image Amazon trouvée');
    return null;
  } catch (error) {
    console.error('Erreur lors de l\'extraction d\'image Amazon:', error);
    return null;
  }
}

function resolveImageUrl(imageUrl: string, baseUrl: string): string | null {
  if (!imageUrl) return null;
  
  try {
    // URL absolue
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    
    // URL avec protocole
    if (imageUrl.startsWith('//')) {
      return 'https:' + imageUrl;
    }
    
    // URL relative
    if (imageUrl.startsWith('/')) {
      const base = new URL(baseUrl);
      return base.origin + imageUrl;
    }
    
    // URL relative sans slash
    const base = new URL(baseUrl);
    return base.origin + '/' + imageUrl;
  } catch (error) {
    console.error('Error resolving image URL:', error);
    return null;
  }
}