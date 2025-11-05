'use client'

import AlertModal from '@/components/AlertModal'
import EditListModal from '@/components/EditListModal'
import { useAlert } from '@/hooks/useAlert'
import { useAuthContext } from '@/contexts/AuthContext'
import { getAuthToken } from '@/lib/authStorage'
import type { GiftListWithCount } from '@/types'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'

interface DashboardClientProps {
  initialGiftLists?: GiftListWithCount[]
}

export default function DashboardClient({ initialGiftLists = [] }: DashboardClientProps) {
  const [giftLists, setGiftLists] = useState<GiftListWithCount[]>(initialGiftLists)
  const [loading, setLoading] = useState(initialGiftLists.length === 0)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newListTitle, setNewListTitle] = useState('')
  const [newListDescription, setNewListDescription] = useState('')
  const [newListImage, setNewListImage] = useState('')
  const [newListSecret, setNewListSecret] = useState(false)
  const [creating, setCreating] = useState(false)
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
      const token = getAuthToken()
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Contenu principal */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Titre de la page */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Bonjour {user?.name || user?.email} !
          </h1>
          <p className="text-gray-600">Gérez vos listes de cadeaux</p>
        </div>
        {/* Section création de liste - Affichée uniquement s'il y a des listes */}
        {giftLists.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-8">
            <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Mes listes de cadeaux</h2>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                showCreateForm
                  ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {showCreateForm ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Annuler
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Nouvelle liste
                </>
              )}
            </button>
          </div>

          {showCreateForm && (
              <div className="border-t border-gray-200 pt-4 mt-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Titre de la liste *
                  </label>
                  <input
                    type="text"
                    value={newListTitle}
                    onChange={(e) => setNewListTitle(e.target.value)}
                    placeholder="Ex: Cadeaux de Noël 2024"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (optionnel)
                  </label>
                  <textarea
                    value={newListDescription}
                    onChange={(e) => setNewListDescription(e.target.value)}
                    placeholder="Description de votre liste..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none bg-white text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image (optionnel)
                  </label>
                  <input
                    type="url"
                    value={newListImage}
                    onChange={(e) => setNewListImage(e.target.value)}
                    placeholder="https://exemple.com/image.jpg"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                  />
                  {newListImage && (
                    <div className="mt-2">
                      <Image 
                        src={newListImage} 
                        alt="Aperçu" 
                        width={80}
                        height={80}
                        className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                        unoptimized
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mode secret
                    </label>
                    <p className="text-xs text-gray-500">
                      En mode secret, les réservations ne sont pas visibles par défaut. Vous devrez les révéler explicitement.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setNewListSecret(!newListSecret)}
                    className={`ml-4 relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      newListSecret ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                    role="switch"
                    aria-checked={newListSecret}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        newListSecret ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={createGiftList}
                    disabled={!newListTitle.trim() || creating}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {creating ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Création...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Créer la liste
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setShowCreateForm(false)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Annuler
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        )}

        {/* Liste des listes existantes */}
        {giftLists.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune liste créée</h3>
            <p className="text-gray-500 mb-4">Créez votre première liste de cadeaux pour commencer !</p>
            {!showCreateForm ? (
            <button
              onClick={() => setShowCreateForm(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Créer ma première liste
            </button>
            ) : (
              <div className="max-w-md mx-auto mt-6">
                <div className="space-y-4 text-left">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Titre de la liste *
                    </label>
                    <input
                      type="text"
                      value={newListTitle}
                      onChange={(e) => setNewListTitle(e.target.value)}
                      placeholder="Ex: Cadeaux de Noël 2024"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description (optionnel)
                    </label>
                    <textarea
                      value={newListDescription}
                      onChange={(e) => setNewListDescription(e.target.value)}
                      placeholder="Description de votre liste..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none bg-white text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Image (optionnel)
                    </label>
                    <input
                      type="url"
                      value={newListImage}
                      onChange={(e) => setNewListImage(e.target.value)}
                      placeholder="https://exemple.com/image.jpg"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                    />
                    {newListImage && (
                      <div className="mt-2">
                        <Image 
                          src={newListImage} 
                          alt="Aperçu" 
                          width={80}
                          height={80}
                          className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                          unoptimized
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mode secret
                      </label>
                      <p className="text-xs text-gray-500">
                        En mode secret, les réservations ne sont pas visibles par défaut. Vous devrez les révéler explicitement.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setNewListSecret(!newListSecret)}
                      className={`ml-4 relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                        newListSecret ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                      role="switch"
                      aria-checked={newListSecret}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          newListSecret ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={createGiftList}
                      disabled={!newListTitle.trim() || creating}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {creating ? (
                        <>
                          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Création...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          Créer la liste
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => setShowCreateForm(false)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Annuler
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {giftLists.map((list, index) => (
              <div key={list.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                {/* Image de la liste */}
                {list.image && (
                  <div className="mb-4">
                    <Image 
                      src={list.image} 
                      alt={list.title}
                      width={640}
                      height={128}
                      className="w-full h-32 object-cover rounded-lg border border-gray-200"
                      unoptimized
                      priority={index < 3}
                      fetchPriority={index < 3 ? 'high' : 'auto'}
                      loading={index < 3 ? undefined : 'lazy'}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  </div>
                )}
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{list.title}</h3>
                {list.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{list.description}</p>
                )}
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span>{list.giftsCount} cadeau{list.giftsCount > 1 ? 'x' : ''}</span>
                  <span>{new Date(list.createdAt).toLocaleDateString('fr-FR')}</span>
                </div>
                
                {/* Boutons d'action */}
                <div className="space-y-2">
                  <button
                    onClick={() => router.push(`/manage/${list.id}`)}
                    className="inline-flex items-center justify-center gap-2 w-full px-3 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Gérer
                  </button>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(list)}
                      className="inline-flex items-center justify-center gap-2 flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Modifier
                    </button>
                    <button
                      onClick={() => confirmDelete(list)}
                      disabled={deleting === list.id}
                      className="inline-flex items-center justify-center gap-2 flex-1 px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {deleting === list.id ? (
                        <>
                          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Suppression...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Supprimer
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
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

