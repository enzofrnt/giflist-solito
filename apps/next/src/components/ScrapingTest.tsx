'use client';

import Image from 'next/image';
import { useState } from 'react';

interface ScrapeResult {
  title?: string;
  price?: number;
  image?: string;
  description?: string;
  error?: string;
}

export default function ScrapingTest() {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState<ScrapeResult | null>(null);
  const [loading, setLoading] = useState(false);

  const testScraping = async () => {
    if (!url.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/scrape-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });

      const data = await response.json();
      setResult(data);
    } catch {
      setResult({ error: 'Erreur de connexion' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-100 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Test de Scraping</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">URL du produit</label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.amazon.fr/dp/..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
        </div>
        
        <button
          onClick={testScraping}
          disabled={!url.trim() || loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Test en cours...' : 'Tester le scraping'}
        </button>
        
        {result && (
          <div className="mt-4 space-y-4">
            <div className="p-4 bg-white rounded-lg border">
              <h4 className="font-semibold mb-2">Résultat :</h4>
              <pre className="text-sm overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
            
            {result.title && (
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h5 className="font-semibold text-green-800 mb-2">✅ Titre extrait :</h5>
                <p className="text-green-700">{result.title}</p>
              </div>
            )}
            
            {result.price && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h5 className="font-semibold text-blue-800 mb-2">💰 Prix extrait :</h5>
                <p className="text-blue-700 text-lg font-bold">{result.price} €</p>
              </div>
            )}
            
            {result.image && (
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <h5 className="font-semibold text-purple-800 mb-2">🖼️ Image extraite :</h5>
                <div className="flex items-center gap-4">
                  <Image 
                    src={result.image} 
                    alt="Image du produit" 
                    width={80}
                    height={80}
                    className="w-20 h-20 object-cover rounded-lg border"
                    unoptimized
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <p className="text-purple-700 text-sm break-all">{result.image}</p>
                </div>
              </div>
            )}
            
            {result.description && (
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <h5 className="font-semibold text-yellow-800 mb-2">📝 Description extraite :</h5>
                <p className="text-yellow-700 text-sm">{result.description}</p>
              </div>
            )}
            
            {!result.title && !result.price && !result.image && !result.description && (
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <h5 className="font-semibold text-red-800 mb-2">❌ Aucune donnée extraite</h5>
                <p className="text-red-700">Le site pourrait bloquer le scraping ou utiliser des techniques anti-bot.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
