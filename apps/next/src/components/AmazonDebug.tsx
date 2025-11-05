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

export default function AmazonDebug() {
  const [url, setUrl] = useState('https://www.amazon.fr/dp/B08H5VH5Z8');
  const [result, setResult] = useState<ScrapeResult | null>(null);
  const [loading, setLoading] = useState(false);

  const testAmazon = async () => {
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
    <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
      <h3 className="text-lg font-semibold mb-4 text-red-800">🐛 Debug Amazon</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">URL Amazon</label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.amazon.fr/dp/..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
        </div>
        
        <button
          onClick={testAmazon}
          disabled={!url.trim() || loading}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
        >
          {loading ? 'Debug en cours...' : 'Debug Amazon'}
        </button>
        
        {result && (
          <div className="mt-4 space-y-4">
            <div className="p-4 bg-white rounded-lg border">
              <h4 className="font-semibold mb-2">Résultat complet :</h4>
              <pre className="text-xs overflow-auto max-h-96">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h5 className="font-semibold text-green-800 mb-2">✅ Titre</h5>
                <p className="text-green-700 text-sm">{result.title || 'Non trouvé'}</p>
              </div>
              
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h5 className="font-semibold text-blue-800 mb-2">💰 Prix</h5>
                <p className="text-blue-700 text-sm font-bold">{result.price || 'Non trouvé'}</p>
              </div>
              
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <h5 className="font-semibold text-purple-800 mb-2">🖼️ Image</h5>
                <p className="text-purple-700 text-sm break-all">{result.image || 'Non trouvée'}</p>
                {result.image && (
                  <Image 
                    src={result.image} 
                    alt="Test" 
                    width={64}
                    height={64}
                    className="w-16 h-16 object-cover rounded mt-2"
                    unoptimized
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                )}
              </div>
              
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <h5 className="font-semibold text-yellow-800 mb-2">📝 Description</h5>
                <p className="text-yellow-700 text-sm">{result.description || 'Non trouvée'}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
