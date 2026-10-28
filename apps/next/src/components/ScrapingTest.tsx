'use client'

import Image from 'next/image'
import { useState } from 'react'

interface ScrapeResult {
  title?: string
  price?: number
  image?: string
  description?: string
  error?: string
}

export default function ScrapingTest() {
  const [url, setUrl] = useState('')
  const [result, setResult] = useState<ScrapeResult | null>(null)
  const [loading, setLoading] = useState(false)

  async function testScraping() {
    if (!url.trim()) return
    setLoading(true)
    try {
      const response = await fetch('/api/scrape-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })
      setResult(await response.json())
    } catch {
      setResult({ error: 'Erreur de connexion' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="ds-card">
      <div className="ds-card__header">
        <div>
          <h3 className="ds-card__title">Test de scraping</h3>
          <p className="ds-card__subtitle">Vérifiez ce que l’API extrait d’une URL produit.</p>
        </div>
      </div>
      <div className="ds-card__body ds-stack ds-stack--gap-4">
        <div className="ds-field">
          <label className="ds-label" htmlFor="scraping-test-url">URL du produit</label>
          <input
            id="scraping-test-url"
            type="url"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="https://www.amazon.fr/dp/..."
            className="ds-input"
          />
        </div>
        <button
          type="button"
          onClick={testScraping}
          disabled={!url.trim() || loading}
          className="ds-btn ds-btn--primary ds-btn--sm self-start"
          aria-busy={loading || undefined}
        >
          {loading ? <span className="ds-spinner" aria-hidden="true" /> : null}
          {loading ? 'Test en cours…' : 'Tester le scraping'}
        </button>

        {result ? (
          <div className="ds-stack ds-stack--gap-3">
            <div className="ds-card ds-card--flat">
              <div className="ds-card__body">
                <p className="ds-label">Résultat complet</p>
                <pre className="ds-code" style={{ overflow: 'auto' }}>{JSON.stringify(result, null, 2)}</pre>
              </div>
            </div>

            {result.title ? (
              <div className="ds-alert ds-alert--success" role="status">
                <span className="ds-alert__icon" aria-hidden="true">✓</span>
                <div className="ds-alert__content">
                  <p className="ds-alert__title">Titre extrait</p>
                  <p className="ds-alert__message">{result.title}</p>
                </div>
              </div>
            ) : null}

            {result.price ? (
              <div className="ds-alert ds-alert--info" role="status">
                <span className="ds-alert__icon" aria-hidden="true">€</span>
                <div className="ds-alert__content">
                  <p className="ds-alert__title">Prix extrait</p>
                  <p className="ds-alert__message">{result.price} €</p>
                </div>
              </div>
            ) : null}

            {result.image ? (
              <div className="ds-alert ds-alert--info">
                <span className="ds-alert__icon" aria-hidden="true">▣</span>
                <div className="ds-alert__content">
                  <p className="ds-alert__title">Image extraite</p>
                  <div className="ds-cluster">
                    <Image
                      src={result.image}
                      alt="Image du produit"
                      width={80}
                      height={80}
                      className="h-20 w-20 rounded object-cover"
                      unoptimized
                      onError={(event) => { event.currentTarget.style.display = 'none' }}
                    />
                    <p className="ds-alert__message break-all">{result.image}</p>
                  </div>
                </div>
              </div>
            ) : null}

            {result.description ? (
              <div className="ds-alert ds-alert--warning">
                <span className="ds-alert__icon" aria-hidden="true">≡</span>
                <div className="ds-alert__content">
                  <p className="ds-alert__title">Description extraite</p>
                  <p className="ds-alert__message">{result.description}</p>
                </div>
              </div>
            ) : null}

            {!result.title && !result.price && !result.image && !result.description ? (
              <div className="ds-alert ds-alert--danger" role="alert">
                <span className="ds-alert__icon" aria-hidden="true">!</span>
                <div className="ds-alert__content">
                  <p className="ds-alert__title">Aucune donnée extraite</p>
                  <p className="ds-alert__message">Le site peut bloquer le scraping ou utiliser des techniques anti-bot.</p>
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  )
}
