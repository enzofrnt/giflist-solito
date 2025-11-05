'use client'

import { useEffect, useState } from 'react'

interface GiftFormData {
  title: string
  url: string
  image: string
  price: string
  description: string
}

interface GiftFormModalProps {
  isOpen: boolean
  onClose: () => void
  initialData?: GiftFormData
  onSubmit: (data: GiftFormData) => Promise<void>
  isSubmitting?: boolean
  mode?: 'add' | 'edit'
  showScraping?: boolean
  scrapingUrl?: string
  onScrapingUrlChange?: (url: string) => void
  onScrape?: () => Promise<{ title?: string; url?: string; image?: string; price?: string; description?: string } | null>
  isScraping?: boolean
}

export default function GiftFormModal({
  isOpen,
  onClose,
  initialData,
  onSubmit,
  isSubmitting = false,
  mode = 'add',
  showScraping = false,
  scrapingUrl = '',
  onScrapingUrlChange,
  onScrape,
  isScraping = false
}: GiftFormModalProps) {
  const [formData, setFormData] = useState<GiftFormData>({
    title: '',
    url: '',
    image: '',
    price: '',
    description: ''
  })

  useEffect(() => {
    if (isOpen && initialData) {
      setFormData(initialData)
    } else if (isOpen && !initialData) {
      setFormData({
        title: '',
        url: '',
        image: '',
        price: '',
        description: ''
      })
    }
  }, [isOpen, initialData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(formData)
  }

  const handleInputChange = (field: keyof GiftFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (!isOpen) return null

  const isAddMode = mode === 'add'
  const submitButtonColor = isAddMode ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-2 sm:p-4">
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose}></div>
        <div className="relative bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 rounded-t-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                {isAddMode ? 'Ajouter un nouveau cadeau' : 'Modifier le cadeau'}
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 text-gray-900">
            {/* Section de scraping automatique (uniquement en mode ajout) */}
            {showScraping && isAddMode && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-blue-900 mb-1 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Récupération automatique des informations <span className="text-orange-600 ml-1 tracking-wide">BETA*</span>
                </h4>
                <p className="text-xs text-orange-600 opacity-75 mb-3">*Cette fonctionnalité peut ne pas fonctionner.</p>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={scrapingUrl}
                    onChange={(e) => onScrapingUrlChange?.(e.target.value)}
                    placeholder="Collez l'URL du produit (Amazon, Fnac, etc.)"
                    className="flex-1 px-3 py-2 text-sm border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      if (!onScrape) return
                      const result = await onScrape()
                      if (result) {
                        setFormData(prev => ({
                          ...prev,
                          title: result.title || prev.title,
                          url: result.url || prev.url,
                          image: result.image || prev.image,
                          price: result.price || prev.price,
                          description: result.description || prev.description
                        }))
                      }
                    }}
                    disabled={!scrapingUrl.trim() || isScraping || !onScrape}
                    className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    {isScraping ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Récupération...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Récupérer
                      </>
                    )}
                  </button>
                </div>
                <p className="text-xs text-blue-700 mt-2">
                  Cette fonctionnalité récupère automatiquement le nom, l&apos;image et le prix du produit depuis l&apos;URL fournie.
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  Titre du cadeau *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Ex: Coque iPhone"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                  required
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  Prix (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  placeholder="29.99"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  URL du produit
                </label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => handleInputChange('url', e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  URL de l&apos;image
                </label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => handleInputChange('image', e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Description du cadeau..."
                rows={3}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none bg-white text-gray-900"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4 border-t border-gray-200">
              <button
                type="submit"
                disabled={!formData.title.trim() || isSubmitting}
                className={`inline-flex items-center justify-center gap-2 px-4 py-2 sm:px-6 sm:py-2 text-sm ${submitButtonColor} text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-1 sm:flex-none`}
              >
                {isSubmitting ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {isAddMode ? 'Ajout...' : 'Modification...'}
                  </>
                ) : (
                  <>
                    {isAddMode ? (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Ajouter le cadeau
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Modifier
                      </>
                    )}
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 sm:px-6 sm:py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex-1 sm:flex-none"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Annuler
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

