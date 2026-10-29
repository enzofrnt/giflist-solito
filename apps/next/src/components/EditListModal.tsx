'use client'

import { Modal } from '@/components/Modal'
import { InfoHint } from '@/components/InfoHint'
import Image from 'next/image'
import { ImageUploadButton } from './ImageUploadButton'
import { useEffect, useId, useRef, useState } from 'react'

interface EditListModalProps {
  isOpen: boolean
  onClose: () => void
  initialData: {
    title: string
    description?: string
    image?: string
    secret?: boolean
    isPublic?: boolean
  }
  onSubmit: (data: { title: string; description?: string; image?: string; secret?: boolean; isPublic?: boolean }) => Promise<void>
  isSubmitting?: boolean
}

export default function EditListModal({
  isOpen,
  onClose,
  initialData,
  onSubmit,
  isSubmitting = false
}: EditListModalProps) {
  const [formData, setFormData] = useState({
    title: initialData.title,
    description: initialData.description || '',
    image: initialData.image || '',
    secret: initialData.secret || false,
    isPublic: initialData.isPublic !== false
  })
  const [titleTouched, setTitleTouched] = useState(false)

  const titleId = useId()
  const titleErrorId = useId()
  const descriptionId = useId()
  const imageId = useId()
  const imageHintId = useId()
  const secretHintId = useId()
  const formId = useId()

  const prevIsOpenRef = useRef(isOpen)

  // Synchroniser avec les données initiales uniquement quand le modal s'ouvre (passe de fermé à ouvert)
  useEffect(() => {
    // Ne synchroniser que lors de l'ouverture du modal, pas à chaque changement de initialData
    if (isOpen && !prevIsOpenRef.current) {
      setFormData({
        title: initialData.title,
        description: initialData.description || '',
        image: initialData.image || '',
        secret: initialData.secret || false,
        isPublic: initialData.isPublic !== false
      })
      setTitleTouched(false)
    }
    prevIsOpenRef.current = isOpen
  }, [isOpen, initialData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(formData)
  }

  const titleMissing = formData.title.trim().length === 0
  const showTitleError = titleTouched && titleMissing

  if (!isOpen) return null

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title="Modifier la liste"
      size="md"
      footer={
        <>
          <button type="button" className="ds-btn ds-btn--secondary" onClick={onClose}>
            Annuler
          </button>
          <button
            type="submit"
            form={formId}
            className={`ds-btn ds-btn--primary${isSubmitting ? ' ds-btn--loading' : ''}`}
            disabled={titleMissing || isSubmitting}
            aria-busy={isSubmitting || undefined}
          >
            {isSubmitting ? (
              <span className="ds-spinner" aria-hidden="true" />
            ) : (
              <span className="ds-btn__icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </span>
            )}
            <span className="ds-btn__label">{isSubmitting ? 'Modification…' : 'Modifier'}</span>
          </button>
        </>
      }
    >
      <form id={formId} onSubmit={handleSubmit} className="ds-stack ds-stack--gap-5">
        <div className="ds-field">
          <label className="ds-label" htmlFor={titleId}>
            Titre <span className="ds-label__required">*</span>
          </label>
          <input
            id={titleId}
            type="text"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            onBlur={() => setTitleTouched(true)}
            className="ds-input"
            placeholder="Ex : Cadeaux de Noël 2024"
            aria-invalid={showTitleError || undefined}
            aria-describedby={showTitleError ? titleErrorId : undefined}
            required
          />
          {showTitleError ? (
            <p className="ds-error" id={titleErrorId}>
              Le titre est obligatoire.
            </p>
          ) : null}
        </div>

        <div className="ds-field">
          <label className="ds-label" htmlFor={descriptionId}>
            Description
          </label>
          <textarea
            id={descriptionId}
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="ds-textarea"
            placeholder="Description de votre liste…"
            rows={3}
          />
        </div>

        <div className="ds-field">
          <label className="ds-label" htmlFor={imageId}>
            Image (URL)
          </label>
          <input
            id={imageId}
            type="url"
            value={formData.image}
            onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
            className="ds-input"
            placeholder="https://exemple.com/image.jpg"
            aria-describedby={imageHintId}
          />
          <p className="ds-hint" id={imageHintId}>
            Collez un lien ou téléversez une image (JPG, PNG, WebP, GIF · 5 Mo max).
          </p>
          <ImageUploadButton onChange={(url) => setFormData(prev => ({ ...prev, image: url }))} />
          {formData.image && (
            <div>
              <Image
                src={formData.image}
                alt="Aperçu de l’image de la liste"
                width={80}
                height={80}
                className="h-20 w-20 rounded-lg object-cover"
                unoptimized
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
            </div>
          )}
        </div>

        <div className="ds-field">
          <div className="ds-switch-row">
            <label className="ds-switch min-h-11">
              <input
                type="checkbox"
                checked={formData.isPublic}
                onChange={(e) => setFormData(prev => ({ ...prev, isPublic: e.target.checked }))}
                role="switch"
                aria-checked={formData.isPublic}
                aria-describedby="edit-list-public-hint"
              />
              <span className="ds-switch__track" aria-hidden="true" />
              <span className="ds-switch__text">Liste publique</span>
            </label>
            <InfoHint label="Liste publique">
              Une liste publique apparaît sur votre profil public et peut être trouvée dans la recherche. Une liste privée n’est accessible qu’avec son code complet.
            </InfoHint>
          </div>
          <p className="ds-hint" id="edit-list-public-hint">Publique : visible sur votre profil. Privée : uniquement accessible via son code complet.</p>
        </div>

        <div className="ds-field">
          <label className="ds-switch min-h-11">
            <input
              type="checkbox"
              checked={formData.secret}
              onChange={(e) => setFormData(prev => ({ ...prev, secret: e.target.checked }))}
              role="switch"
              aria-checked={formData.secret}
              aria-describedby={secretHintId}
            />
            <span className="ds-switch__track" aria-hidden="true" />
            <span className="ds-switch__text">Mode secret</span>
          </label>
          <p className="ds-hint" id={secretHintId}>
            En mode secret, les réservations ne sont pas visibles par défaut. Vous devrez les révéler explicitement.
          </p>
        </div>
      </form>
    </Modal>
  )
}
