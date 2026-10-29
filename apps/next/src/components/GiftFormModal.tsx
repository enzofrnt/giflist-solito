'use client'

import { Modal } from '@/components/Modal'
import Image from 'next/image'
import { ImageUploadButton } from './ImageUploadButton'
import { useEffect, useId, useRef, useState } from 'react'

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
  /** Optional inline error returned by the scrape endpoint (kept optional for backward compatibility). */
  scrapeError?: string
}

const EMPTY_FORM: GiftFormData = {
  title: '',
  url: '',
  image: '',
  price: '',
  description: ''
}

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value.trim())
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
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
  isScraping = false,
  scrapeError
}: GiftFormModalProps) {
  const [formData, setFormData] = useState<GiftFormData>(EMPTY_FORM)
  const [titleError, setTitleError] = useState('')
  const prevIsOpenRef = useRef(isOpen)
  const formRef = useRef<HTMLFormElement>(null)

  const titleId = useId()
  const titleErrorId = useId()
  const priceId = useId()
  const urlId = useId()
  const imageId = useId()
  const descriptionId = useId()
  const scrapeUrlId = useId()
  const scrapeHintId = useId()
  const scrapeErrorId = useId()

  useEffect(() => {
    // Synchroniser uniquement à l'ouverture pour ne pas écraser la saisie
    // quand le parent se re-rend (ex. isSubmitting).
    if (isOpen && !prevIsOpenRef.current) {
      setFormData(initialData ?? EMPTY_FORM)
      setTitleError('')
    }
    prevIsOpenRef.current = isOpen
  }, [isOpen, initialData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim()) {
      setTitleError('Le titre du cadeau est obligatoire.')
      return
    }
    setTitleError('')
    await onSubmit(formData)
  }

  const handleInputChange = (field: keyof GiftFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (field === 'title' && value.trim()) setTitleError('')
  }

  const isAddMode = mode === 'add'
  const canSubmit = !isSubmitting
  const hasImagePreview = isHttpUrl(formData.image)

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title={isAddMode ? 'Ajouter un nouveau cadeau' : 'Modifier le cadeau'}
      description={
        isAddMode
          ? 'Renseignez les informations du cadeau à ajouter à votre liste.'
          : 'Mettez à jour les informations de ce cadeau.'
      }
      size="lg"
      footer={
        <>
          <button type="button" className="ds-btn ds-btn--secondary" onClick={onClose}>
            Annuler
          </button>
          <button
            type="button"
            className="ds-btn ds-btn--primary"
            onClick={() => formRef.current?.requestSubmit()}
            disabled={!canSubmit}
            aria-busy={isSubmitting || undefined}
          >
            {isSubmitting ? (
              <>
                <span className="ds-spinner" aria-hidden="true" />
                {isAddMode ? 'Ajout…' : 'Modification…'}
              </>
            ) : (
              <>
                <span className="ds-btn__icon" aria-hidden="true">
                  {isAddMode ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 4v16m8-8H4" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  )}
                </span>
                {isAddMode ? 'Ajouter le cadeau' : 'Modifier'}
              </>
            )}
          </button>
        </>
      }
    >
      <form ref={formRef} onSubmit={handleSubmit} className="ds-stack ds-stack--gap-5" noValidate>
        {/* Section de scraping automatique (uniquement en mode ajout) */}
        {showScraping && isAddMode && (
          <div className="ds-alert ds-alert--info">
            <span className="ds-alert__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </span>
            <div className="ds-alert__content">
              <p className="ds-alert__title">
                Récupération automatique des informations{' '}
                <span className="ds-badge ds-badge--warning">BETA</span>
              </p>
              <p className="ds-alert__message">Nous lisons les données publiques du produit. Tu peux corriger les champs avant d’enregistrer.</p>

              <div className="ds-field">
                <label className="ds-label" htmlFor={scrapeUrlId}>
                  URL du produit à récupérer
                </label>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <input
                    id={scrapeUrlId}
                    type="url"
                    value={scrapingUrl}
                    onChange={(e) => onScrapingUrlChange?.(e.target.value)}
                    placeholder="Collez l'URL du produit (Amazon, Fnac, etc.)"
                    className="ds-input flex-1"
                    aria-describedby={scrapeError ? `${scrapeHintId} ${scrapeErrorId}` : scrapeHintId}
                    aria-invalid={scrapeError ? true : undefined}
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
                    aria-busy={isScraping || undefined}
                    className="ds-btn ds-btn--secondary"
                  >
                    {isScraping ? (
                      <>
                        <span className="ds-spinner" aria-hidden="true" />
                        Récupération…
                      </>
                    ) : (
                      <>
                        <span className="ds-btn__icon" aria-hidden="true">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </span>
                        Récupérer
                      </>
                    )}
                  </button>
                </div>
                <p className="ds-hint" id={scrapeHintId}>
                  Cette fonctionnalité récupère automatiquement le nom, l&apos;image et le prix du produit depuis l&apos;URL fournie.
                </p>
                {scrapeError ? (
                  <p className="ds-error" id={scrapeErrorId} role="alert">
                    {scrapeError}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        )}

        <div className="ds-grid">
          <div className="ds-field">
            <label className="ds-label" htmlFor={titleId}>
              Titre du cadeau <span className="ds-label__required" aria-hidden="true">*</span>
            </label>
            <input
              id={titleId}
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Ex : Coque iPhone"
              className="ds-input"
              required
              aria-required="true"
              aria-invalid={titleError ? true : undefined}
              aria-describedby={titleError ? titleErrorId : undefined}
            />
            {titleError ? (
              <p className="ds-error" id={titleErrorId} role="alert">
                {titleError}
              </p>
            ) : null}
          </div>

          <div className="ds-field">
            <label className="ds-label" htmlFor={priceId}>
              Prix (€)
            </label>
            <input
              id={priceId}
              type="number"
              inputMode="decimal"
              step="0.01"
              min={0}
              value={formData.price}
              onChange={(e) => handleInputChange('price', e.target.value)}
              placeholder="29.99"
              className="ds-input"
            />
          </div>

          <div className="ds-field">
            <label className="ds-label" htmlFor={urlId}>
              URL du produit
            </label>
            <input
              id={urlId}
              type="url"
              value={formData.url}
              onChange={(e) => handleInputChange('url', e.target.value)}
              placeholder="https://…"
              className="ds-input"
            />
            <p className="ds-hint">Utilisée pour le bouton « Voir le produit ».</p>
          </div>

          <div className="ds-field">
            <label className="ds-label" htmlFor={imageId}>
              URL de l&apos;image
            </label>
            <input
              id={imageId}
              type="url"
              value={formData.image}
              onChange={(e) => handleInputChange('image', e.target.value)}
              placeholder="https://…"
              className="ds-input"
            />
            {hasImagePreview ? (
              <div className="flex items-center gap-3">
                <div className="ds-avatar ds-avatar--lg">
                  <Image
                    src={formData.image.trim()}
                    alt="Aperçu de l’image du cadeau"
                    width={56}
                    height={56}
                    className="h-full w-full object-cover"
                    unoptimized
                  />
                </div>
                <p className="ds-hint">Aperçu de l’image</p>
              </div>
            ) : (
              <p className="ds-hint">Laissez vide pour utiliser l’icône cadeau par défaut.</p>
            )}
            <ImageUploadButton onChange={(url) => handleInputChange('image', url)} />
          </div>
        </div>

        <div className="ds-field">
          <label className="ds-label" htmlFor={descriptionId}>
            Description
          </label>
          <textarea
            id={descriptionId}
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Description du cadeau…"
            rows={3}
            className="ds-textarea"
          />
        </div>
      </form>
    </Modal>
  )
}
