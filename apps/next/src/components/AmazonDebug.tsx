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

export default function AmazonDebug() {
  const [url, setUrl] = useState('https://www.amazon.fr/dp/B08H5VH5Z8')
  const [result, setResult] = useState<ScrapeResult | null>(null)
  const [loading, setLoading] = useState(false)

  async function testAmazon() {
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
    <div className="ds-card ds-card--flat">
      <div className="ds-card__header">
        <div>
          <h3 className="ds-card__title">Debug Amazon</h3>
          <p className="ds-card__subtitle">Inspecte la réponse brute du parser Amazon.</p>
        </div>
      </div>
      <div className="ds-card__body ds-stack ds-stack--gap-4">
        <div className="ds-field">
          <label className="ds-label" htmlFor="amazon-debug-url">URL Amazon</label>
          <input
            id="amazon-debug-url"
            type="url"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="https://www.amazon.fr/dp/..."
            className="ds-input"
          />
        </div>
        <button
          type="button"
          onClick={testAmazon}
          disabled={!url.trim() || loading}
          className="ds-btn ds-btn--secondary ds-btn--sm self-start"
          aria-busy={loading || undefined}
        >
          {loading ? <span className="ds-spinner" aria-hidden="true" /> : null}
          {loading ? 'Debug en cours…' : 'Debug Amazon'}
        </button>

        {result ? (
          <div className="ds-stack ds-stack--gap-3">
            <div className="ds-card ds-card--flat">
              <div className="ds-card__body">
                <p className="ds-label">Résultat complet</p>
                <pre className="ds-code" style={{ overflow: 'auto', maxHeight: '24rem' }}>{JSON.stringify(result, null, 2)}</pre>
              </div>
            </div>

            <div className="ds-grid">
              <div className="ds-card ds-card--flat">
                <div className="ds-card__body">
                  <p className="ds-label">Titre</p>
                  <p className="ds-body-sm">{result.title || 'Non trouvé'}</p>
                </div>
              </div>
              <div className="ds-card ds-card--flat">
                <div className="ds-card__body">
                  <p className="ds-label">Prix</p>
                  <p className="ds-body-sm">{result.price ? `${result.price} €` : 'Non trouvé'}</p>
                </div>
              </div>
              <div className="ds-card ds-card--flat">
                <div className="ds-card__body">
                  <p className="ds-label">Image</p>
                  <p className="ds-body-sm break-all">{result.image || 'Non trouvée'}</p>
                  {result.image ? (
                    <Image
                      src={result.image}
                      alt="Image test"
                      width={64}
                      height={64}
                      className="h-16 w-16 rounded object-cover"
                      unoptimized
                      onError={(event) => { event.currentTarget.style.display = 'none' }}
                    />
                  ) : null}
                </div>
              </div>
              <div className="ds-card ds-card--flat">
                <div className="ds-card__body">
                  <p className="ds-label">Description</p>
                  <p className="ds-body-sm">{result.description || 'Non trouvée'}</p>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
