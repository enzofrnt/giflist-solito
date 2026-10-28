'use client'

import AlertModal from '@/components/AlertModal'
import { DropdownMenu } from '@/components/DropdownMenu'
import EditListModal from '@/components/EditListModal'
import { useAlert } from '@/hooks/useAlert'
import { useAuthContext } from '@/contexts/AuthContext'
import { getAuthToken } from 'app/lib/authStorage'
import type { GiftListWithCount } from 'app/types'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'

interface DashboardClientProps {
  initialGiftLists?: GiftListWithCount[]
}

const PLUS_ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 4v16m8-8H4" />
  </svg>
)

const CLOSE_ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 18L18 6M6 6l12 12" />
  </svg>
)

const GEAR_ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

const BOX_ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </svg>
)

export default function DashboardClient({ initialGiftLists = [] }: DashboardClientProps) {
  const [giftLists, setGiftLists] = useState<GiftListWithCount[]>(initialGiftLists)
  const [loading, setLoading] = useState(initialGiftLists.length === 0)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newListTitle, setNewListTitle] = useState('')
  const [newListDescription, setNewListDescription] = useState('')
  const [newListImage, setNewListImage] = useState('')
  const [newListSecret, setNewListSecret] = useState(false)
  const [creating, setCreating] = useState(false)
  const [createTitleTouched, setCreateTitleTouched] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingList, setEditingList] = useState<GiftListWithCount | null>(null)
  const [updating, setUpdating] = useState(false)
  const [deleting, setDeleting] = useState<number | null>(null)

  const router = useRouter()
  const { alert, showSuccess, showError, showConfirm, hideAlert } = useAlert()
  const { user } = useAuthContext()

  const loadGiftLists = useCallback(async (token: string) => {
    try {
      const response = await fetch('/api/gift-lists', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setGiftLists(data.giftLists)
      }
    } catch (error) {
      console.error('Erreur chargement listes:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  const hasLoadedRef = useRef(false)

  // Charger les listes dès que le token est disponible, en parallèle avec l'auth
  useEffect(() => {
    if (!initialGiftLists.length && !hasLoadedRef.current) {
      const tokenResult = getAuthToken()
      const token = tokenResult instanceof Promise ? null : tokenResult
      if (token) {
        hasLoadedRef.current = true
        // Charger les données en parallèle avec la vérification d'auth
        loadGiftLists(token)
      }
    } else if (initialGiftLists.length > 0) {
      setLoading(false)
      hasLoadedRef.current = true
    }
  }, [initialGiftLists, loadGiftLists])

  async function createGiftList() {
    if (!newListTitle.trim()) return

    setCreating(true)
    try {
      const token = getAuthToken()
      if (!token) {
        showError('Erreur', 'Non authentifié')
        return
      }
      const response = await fetch('/api/gift-lists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: newListTitle.trim(),
          description: newListDescription.trim() || undefined,
          image: newListImage.trim() || undefined,
          secret: newListSecret
        })
      })

      if (response.ok) {
        const data = await response.json()
        setGiftLists(prev => [data.giftList, ...prev])
        setNewListTitle('')
        setNewListDescription('')
        setNewListImage('')
        setNewListSecret(false)
        setShowCreateForm(false)
        showSuccess('Succès', 'Liste créée avec succès !')
      } else {
        showError('Erreur', 'Erreur lors de la création de la liste')
      }
    } catch (error) {
      console.error('Erreur création liste:', error)
      showError('Erreur', 'Erreur lors de la création de la liste')
    } finally {
      setCreating(false)
    }
  }

  function openCreateForm() {
    setCreateTitleTouched(false)
    setShowCreateForm(true)
  }

  function closeCreateForm() {
    setCreateTitleTouched(false)
    setShowCreateForm(false)
  }

  function openEditModal(list: GiftListWithCount) {
    setEditingList(list)
    setShowEditModal(true)
  }

  function closeEditModal() {
    setEditingList(null)
    setShowEditModal(false)
  }

  async function handleUpdateGiftList(data: { title: string; description?: string; image?: string; secret?: boolean }) {
    if (!editingList) return

    setUpdating(true)
    try {
      const token = getAuthToken()
      if (!token) {
        showError('Erreur', 'Non authentifié')
        return
      }
      const response = await fetch(`/api/gift-lists/${editingList.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: data.title.trim(),
          description: data.description?.trim() || undefined,
          image: data.image?.trim() || undefined,
          secret: data.secret
        })
      })

      if (response.ok) {
        const responseData = await response.json()
        setGiftLists(prev => prev.map(list =>
          list.id === editingList.id ? { ...list, ...responseData.giftList } : list
        ))
        closeEditModal()
        showSuccess('Succès', 'Liste modifiée avec succès !')
      } else {
        showError('Erreur', 'Erreur lors de la modification de la liste')
      }
    } catch (error) {
      console.error('Erreur modification liste:', error)
      showError('Erreur', 'Erreur lors de la modification de la liste')
    } finally {
      setUpdating(false)
    }
  }

  async function deleteGiftList(listId: number) {
    setDeleting(listId)
    try {
      const token = getAuthToken()
      if (!token) {
        showError('Erreur', 'Non authentifié')
        return
      }
      const response = await fetch(`/api/gift-lists/${listId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        setGiftLists(prev => prev.filter(list => list.id !== listId))
        showSuccess('Succès', 'Liste supprimée avec succès !')
      } else {
        showError('Erreur', 'Erreur lors de la suppression de la liste')
      }
    } catch (error) {
      console.error('Erreur suppression liste:', error)
      showError('Erreur', 'Erreur lors de la suppression de la liste')
    } finally {
      setDeleting(null)
    }
  }

  function confirmDelete(list: GiftListWithCount) {
    showConfirm(
      'Supprimer la liste',
      `Êtes-vous sûr de vouloir supprimer la liste "${list.title}" ? Cette action est irréversible et supprimera tous les cadeaux associés.`,
      () => deleteGiftList(list.id)
    )
  }

  if (loading) {
    return (
      <div className="ds-page">
        <main className="ds-page__main">
          <div className="ds-stack ds-stack--gap-3 items-center" role="status" aria-live="polite">
            <span className="ds-spinner" aria-hidden="true" />
            <p className="ds-page-subtitle">Chargement…</p>
          </div>
        </main>
      </div>
    )
  }

  const totalGifts = giftLists.reduce((total, list) => total + list.giftsCount, 0)
  const showCreateTitleError = createTitleTouched && !newListTitle.trim()

  return (
    <div className="ds-page">
      <main className="ds-page__main">
        <header className="ds-page-header">
          <div className="ds-page-header__copy">
            <p className="ds-page-kicker">Bonjour {user?.name || user?.email} !</p>
            <h1 className="ds-page-title">Mes listes</h1>
            <p className="ds-page-subtitle">
              Créez, partagez et gérez vos listes de cadeaux en un seul endroit.
            </p>
          </div>
          <div className="ds-page-actions">
            {showCreateForm ? (
              <button type="button" className="ds-btn ds-btn--secondary" onClick={closeCreateForm}>
                <span className="ds-btn__icon" aria-hidden="true">
                  {CLOSE_ICON}
                </span>
                Annuler
              </button>
            ) : (
              <button type="button" className="ds-btn ds-btn--primary" onClick={openCreateForm}>
                <span className="ds-btn__icon" aria-hidden="true">
                  {PLUS_ICON}
                </span>
                Créer une liste
              </button>
            )}
          </div>
        </header>

        <div className="ds-toolbar">
          <div className="ds-toolbar__group">
            <h2 className="ds-card__title">Mes listes de cadeaux</h2>
            <span className="ds-badge ds-badge--neutral">
              {giftLists.length} liste{giftLists.length > 1 ? 's' : ''}
            </span>
          </div>
          {giftLists.length > 0 ? (
            <div className="ds-toolbar__group">
              <span className="ds-badge ds-badge--info">
                {totalGifts} cadeau{totalGifts > 1 ? 'x' : ''}
              </span>
            </div>
          ) : null}
        </div>

        <div className="ds-stack ds-stack--gap-6">
          {showCreateForm ? (
            <section className="ds-card" aria-labelledby="create-list-heading">
              <div className="ds-card__header">
                <div>
                  <h2 className="ds-card__title" id="create-list-heading">
                    Nouvelle liste
                  </h2>
                  <p className="ds-card__subtitle">
                    Renseignez un titre, puis ajoutez si vous le souhaitez une description et une image.
                  </p>
                </div>
              </div>
              <div className="ds-card__body">
                <div className="ds-field">
                  <label className="ds-label" htmlFor="create-list-title">
                    Titre de la liste <span className="ds-label__required">*</span>
                  </label>
                  <input
                    id="create-list-title"
                    type="text"
                    value={newListTitle}
                    onChange={(e) => setNewListTitle(e.target.value)}
                    onBlur={() => setCreateTitleTouched(true)}
                    placeholder="Ex : Cadeaux de Noël 2024"
                    className="ds-input"
                    aria-invalid={showCreateTitleError || undefined}
                    aria-describedby={showCreateTitleError ? 'create-list-title-error' : undefined}
                    required
                  />
                  {showCreateTitleError ? (
                    <p className="ds-error" id="create-list-title-error">
                      Le titre est obligatoire.
                    </p>
                  ) : null}
                </div>

                <div className="ds-field">
                  <label className="ds-label" htmlFor="create-list-description">
                    Description (optionnel)
                  </label>
                  <textarea
                    id="create-list-description"
                    value={newListDescription}
                    onChange={(e) => setNewListDescription(e.target.value)}
                    placeholder="Description de votre liste…"
                    rows={3}
                    className="ds-textarea"
                  />
                </div>

                <div className="ds-field">
                  <label className="ds-label" htmlFor="create-list-image">
                    Image (optionnel)
                  </label>
                  <input
                    id="create-list-image"
                    type="url"
                    value={newListImage}
                    onChange={(e) => setNewListImage(e.target.value)}
                    placeholder="https://exemple.com/image.jpg"
                    className="ds-input"
                    aria-describedby="create-list-image-hint"
                  />
                  <p className="ds-hint" id="create-list-image-hint">
                    Lien direct vers une image (JPG, PNG ou WebP).
                  </p>
                  {newListImage && (
                    <div>
                      <Image
                        src={newListImage}
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
                  <label className="ds-switch min-h-11">
                    <input
                      type="checkbox"
                      checked={newListSecret}
                      onChange={(e) => setNewListSecret(e.target.checked)}
                      role="switch"
                      aria-checked={newListSecret}
                      aria-describedby="create-list-secret-hint"
                    />
                    <span className="ds-switch__track" aria-hidden="true" />
                    <span className="ds-switch__text">Mode secret</span>
                  </label>
                  <p className="ds-hint" id="create-list-secret-hint">
                    En mode secret, les réservations ne sont pas visibles par défaut. Vous devrez les révéler explicitement.
                  </p>
                </div>

                <div className="ds-cluster">
                  <button
                    type="button"
                    className={`ds-btn ds-btn--primary${creating ? ' ds-btn--loading' : ''}`}
                    onClick={createGiftList}
                    disabled={!newListTitle.trim() || creating}
                    aria-busy={creating || undefined}
                  >
                    {creating ? (
                      <span className="ds-spinner" aria-hidden="true" />
                    ) : (
                      <span className="ds-btn__icon" aria-hidden="true">
                        {PLUS_ICON}
                      </span>
                    )}
                    <span className="ds-btn__label">{creating ? 'Création…' : 'Créer la liste'}</span>
                  </button>
                  <button type="button" className="ds-btn ds-btn--secondary" onClick={closeCreateForm}>
                    Annuler
                  </button>
                </div>
              </div>
            </section>
          ) : null}

          {giftLists.length === 0 ? (
            showCreateForm ? null : (
              <div className="ds-empty">
                <span className="ds-empty__icon" aria-hidden="true">
                  {BOX_ICON}
                </span>
                <h2 className="ds-empty__title">Aucune liste créée</h2>
                <p className="ds-empty__message">
                  Créez votre première liste de cadeaux pour commencer à la partager avec vos proches.
                </p>
                <button type="button" className="ds-btn ds-btn--primary" onClick={openCreateForm}>
                  <span className="ds-btn__icon" aria-hidden="true">
                    {PLUS_ICON}
                  </span>
                  Créer ma première liste
                </button>
              </div>
            )
          ) : (
            <div className="ds-grid">
              {giftLists.map((list, index) => (
                <article key={list.id} className="ds-card">
                  {list.image && (
                    <Image
                      src={list.image}
                      alt={list.title}
                      width={640}
                      height={128}
                      className="h-32 w-full object-cover"
                      unoptimized
                      priority={index < 3}
                      fetchPriority={index < 3 ? 'high' : 'auto'}
                      loading={index < 3 ? undefined : 'lazy'}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  )}
                  <div className="ds-card__body">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <h3 className="ds-card__title">{list.title}</h3>
                      <span className={`ds-badge ds-badge--dot ${list.secret ? 'ds-badge--warning' : 'ds-badge--success'}`}>
                        {list.secret ? 'Mode secret' : 'Visible'}
                      </span>
                    </div>
                    {list.description && (
                      <p className="ds-card__subtitle line-clamp-2">{list.description}</p>
                    )}
                    <div className="ds-hint flex flex-wrap items-center justify-between gap-2">
                      <span>{list.giftsCount} cadeau{list.giftsCount > 1 ? 'x' : ''}</span>
                      <span>Créée le {new Date(list.createdAt).toLocaleDateString('fr-FR')}</span>
                    </div>
                  </div>
                  <div className="ds-card__footer ds-card__footer--split">
                    <Link href={`/manage/${list.id}`} className="ds-btn ds-btn--primary">
                      <span className="ds-btn__icon" aria-hidden="true">
                        {GEAR_ICON}
                      </span>
                      Gérer
                    </Link>
                    <DropdownMenu
                      label={`Actions pour ${list.title}`}
                      triggerClassName="ds-icon-btn"
                      trigger={
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                          <circle cx="5" cy="12" r="1" fill="currentColor" />
                          <circle cx="12" cy="12" r="1" fill="currentColor" />
                          <circle cx="19" cy="12" r="1" fill="currentColor" />
                        </svg>
                      }
                      items={[
                        { label: 'Modifier la liste', onSelect: () => openEditModal(list) },
                        {
                          label: deleting === list.id ? 'Suppression…' : 'Supprimer la liste',
                          danger: true,
                          disabled: deleting === list.id,
                          onSelect: () => confirmDelete(list),
                        },
                      ]}
                    />
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Modal de modification de liste */}
      {showEditModal && editingList && (
        <EditListModal
          isOpen={showEditModal}
          onClose={closeEditModal}
          initialData={{
            title: editingList.title,
            description: editingList.description,
            image: editingList.image,
            secret: editingList.secret
          }}
          onSubmit={handleUpdateGiftList}
          isSubmitting={updating}
        />
      )}

      {/* Alert Modal */}
      {alert && (
        <AlertModal
          isOpen={!!alert}
          onClose={hideAlert}
          title={alert.title}
          message={alert.message}
          type={alert.type}
          confirmText={alert.confirmText}
          onConfirm={alert.onConfirm}
          showCancel={alert.showCancel}
          cancelText={alert.cancelText}
        />
      )}
    </div>
  )
}
