'use client';

import AlertModal from '@/components/AlertModal';
import EditListModal from '@/components/EditListModal';
import GiftFormModal from '@/components/GiftFormModal';
import GiftStatusBadge from '@/components/GiftStatusBadge';
import QRCodeDisplay from '@/components/QRCodeDisplay';
import SecretModeToggle from '@/components/SecretModeToggle';
import { useAuthContext } from '@/contexts/AuthContext';
import { useAlert } from '@/hooks/useAlert';
import { getAuthToken } from 'app/lib/authStorage'
import type { Gift, GiftList } from 'app/types'
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { use, useCallback, useEffect, useRef, useState } from 'react';

export default function ManageListPage({ params }: { params: Promise<{ id: string }> }) {
  const [giftList, setGiftList] = useState<GiftList | null>(null);
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showEditListModal, setShowEditListModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [editingGift, setEditingGift] = useState<Gift | null>(null);
  const { alert, showSuccess, showError, showConfirm, hideAlert } = useAlert();
  const [scrapingUrl, setScrapingUrl] = useState('');
  const [scraping, setScraping] = useState(false);
  const [adding, setAdding] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [cancelling, setCancelling] = useState<number | null>(null);
  const [hasRevealed, setHasRevealed] = useState(false);
  
  const router = useRouter();
  const { id: listId } = use(params);
  const { user, loading: authLoading } = useAuthContext();

  const loadGiftList = useCallback(async (token: string) => {
    try {
      const response = await fetch(`/api/gift-lists/${listId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setGiftList(data.giftList);
        setGifts(data.gifts);
      } else {
        setError('Liste non trouvée ou accès refusé');
      }
    } catch (error) {
      console.error('Erreur chargement liste:', error);
      setError('Erreur lors du chargement de la liste');
    } finally {
      setLoading(false);
    }
  }, [listId]);

  const hasLoadedRef = useRef(false);
  
  // Charger la liste dès que le token est disponible, en parallèle avec l'auth
  useEffect(() => {
    if (!hasLoadedRef.current) {
      const tokenResult = getAuthToken()
      const token = tokenResult instanceof Promise ? null : tokenResult
      if (token) {
        hasLoadedRef.current = true
        // Charger les données en parallèle avec la vérification d'auth
        loadGiftList(token);
      }
    }
  }, [loadGiftList]);

  const cancelEdit = useCallback(() => {
    setEditingGift(null);
    setShowAddModal(false);
    setShowEditModal(false);
    setShowEditListModal(false);
    setShowShareModal(false);
    setScrapingUrl('');
  }, []);

  // Gestion de la touche Échap pour fermer les modals
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && (showAddModal || showEditModal || showShareModal)) {
        cancelEdit();
      }
    };

    if (showAddModal || showEditModal || showShareModal) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [showAddModal, showEditModal, showShareModal, cancelEdit]);


  async function scrapeProduct(): Promise<{ title?: string; url?: string; image?: string; price?: string; description?: string } | null> {
    if (!scrapingUrl.trim()) return null;

    setScraping(true);
    try {
      const response = await fetch('/api/scrape-product', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: scrapingUrl })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const product = data.product;
        setScrapingUrl('');
        showSuccess('Succès', 'Informations du produit récupérées !');
        return {
          title: product.title ? String(product.title) : undefined,
          url: scrapingUrl,
          image: product.image ? String(product.image) : undefined,
          price: product.price ? String(product.price) : undefined,
          description: product.description ? String(product.description) : undefined
        };
      } else {
        showError('Erreur', data.error || 'Impossible de récupérer les informations du produit');
        return null;
      }
    } catch (error) {
      console.error('Erreur scraping:', error);
      showError('Erreur', 'Erreur lors de la récupération des informations');
      return null;
    } finally {
      setScraping(false);
    }
  }

  async function handleAddGift(data: { title: string; url: string; image: string; price: string; description: string }) {
    if (!data.title.trim()) return;

    setAdding(true);
    try {
      const token = getAuthToken();
      if (!token) return;
      const response = await fetch(`/api/gift-lists/${listId}/gifts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...data,
          price: data.price ? parseFloat(data.price) : undefined
        })
      });

      if (response.ok) {
        const responseData = await response.json();
        setGifts(prev => [...prev, responseData.gift]);
        setScrapingUrl('');
        setShowAddModal(false);
        showSuccess('Succès', 'Cadeau ajouté avec succès !');
      } else {
        showError('Erreur', 'Erreur lors de l\'ajout du cadeau');
      }
    } catch (error) {
      console.error('Erreur ajout cadeau:', error);
      showError('Erreur', 'Erreur lors de l\'ajout du cadeau');
    } finally {
      setAdding(false);
    }
  }

  async function handleUpdateGift(data: { title: string; url: string; image: string; price: string; description: string }) {
    if (!editingGift || !data.title.trim()) return;

    setUpdating(true);
    try {
      const token = getAuthToken();
      if (!token) return;
      const response = await fetch(`/api/gift-lists/${listId}/gifts/${editingGift.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...data,
          price: data.price ? parseFloat(data.price) : undefined
        })
      });

      if (response.ok) {
            const responseData = await response.json();
            setGifts(prev => prev.map(g => g.id === editingGift.id ? responseData.gift : g));
        setEditingGift(null);
        setShowEditModal(false);
        showSuccess('Succès', 'Cadeau modifié avec succès !');
      } else {
        showError('Erreur', 'Erreur lors de la modification du cadeau');
      }
    } catch (error) {
      console.error('Erreur modification cadeau:', error);
      showError('Erreur', 'Erreur lors de la modification du cadeau');
    } finally {
      setUpdating(false);
    }
  }

  function startEditGift(gift: Gift) {
    // Vérifier si le cadeau est réservé
    if (gift.status === 'reserved') {
      showError(
        'Modification impossible',
        'Vous ne pouvez pas modifier un cadeau déjà réservé. Annulez d\'abord la réservation si nécessaire.'
      );
      return;
    }

    setEditingGift(gift);
    setShowEditModal(true);
  }

  // cancelEdit est défini plus haut avec useCallback

  function openEditListModal() {
    if (giftList) {
      setShowEditListModal(true);
    }
  }

  async function handleUpdateList(data: { title: string; description?: string; image?: string; secret?: boolean }) {
    if (!giftList) return;
    
    setUpdating(true);
    try {
      const response = await fetch(`/api/gift-lists/${giftList.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken() || ''}`
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        const responseData: { giftList: GiftList } = await response.json();
        setGiftList(responseData.giftList);
        setShowEditListModal(false);
        showSuccess('Succès', 'Liste modifiée avec succès !');
      } else {
        const err = (await response.json().catch(() => ({}))) as { error?: string };
        showError('Erreur', err.error || 'Erreur lors de la modification');
      }
    } catch (error) {
      console.error('Erreur modification liste:', error);
      showError('Erreur', 'Erreur lors de la modification');
    } finally {
      setUpdating(false);
    }
  }

  async function cancelReservation(giftId: number) {
    showConfirm(
      'Annuler la réservation',
      'Êtes-vous sûr de vouloir annuler cette réservation ?',
      async () => {
        setCancelling(giftId);
        try {
          const token = getAuthToken();
      if (!token) return;
          const response = await fetch(`/api/gift-lists/${listId}/gifts/${giftId}/cancel`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (response.ok) {
            setGifts(prev => prev.map(g => 
              g.id === giftId 
                ? { ...g, status: 'available', reservedByName: undefined, reservedByEmail: undefined, reservedAt: undefined }
                : g
            ));
            showSuccess('Succès', 'Réservation annulée !');
          } else {
            showError('Erreur', 'Erreur lors de l\'annulation de la réservation');
          }
        } catch (error) {
          console.error('Erreur annulation:', error);
          showError('Erreur', 'Erreur lors de l\'annulation de la réservation');
        } finally {
          setCancelling(null);
        }
      }
    );
  }

  async function deleteGift(giftId: number) {
    showConfirm(
      'Supprimer le cadeau',
      'Êtes-vous sûr de vouloir supprimer ce cadeau ? Cette action est irréversible.',
      async () => {
        try {
          const token = getAuthToken();
      if (!token) return;
          const response = await fetch(`/api/gift-lists/${listId}/gifts/${giftId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (response.ok) {
            setGifts(prev => prev.filter(g => g.id !== giftId));
            showSuccess('Succès', 'Cadeau supprimé avec succès !');
          } else {
            showError('Erreur', 'Erreur lors de la suppression du cadeau');
          }
        } catch (error) {
          console.error('Erreur suppression cadeau:', error);
          showError('Erreur', 'Erreur lors de la suppression du cadeau');
        }
      }
    );
  }

  const handleShareClick = () => {
    if (giftList) {
      setShowShareModal(true);
    }
  };

  function deleteList() {
    if (!giftList) return;
    showConfirm(
      'Supprimer la liste',
      'Êtes-vous sûr de vouloir supprimer cette liste ? Cette action est irréversible et supprimera tous les cadeaux associés.',
      async () => {
        try {
          const token = getAuthToken();
      if (!token) return;
          if (!token) {
            showError('Erreur', 'Authentification requise');
            return;
          }
          const response = await fetch(`/api/gift-lists/${giftList.id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (response.ok) {
            showSuccess('Succès', 'Liste supprimée avec succès !');
            router.push('/dashboard');
          } else {
            const err = (await response.json().catch(() => ({}))) as { error?: string };
            showError('Erreur', err.error || 'Erreur lors de la suppression de la liste');
          }
        } catch (error) {
          console.error('Erreur suppression liste:', error);
          showError('Erreur', 'Erreur lors de la suppression de la liste');
        }
      }
    );
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showSuccess('Succès', 'Lien copié dans le presse-papiers !');
    } catch (error) {
      console.error('Erreur copie:', error);
      showError('Erreur', 'Erreur lors de la copie');
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/')
    }
  }, [user, authLoading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Erreur</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retour à mes listes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Contenu principal */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Titre et actions de la page */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-start gap-4 flex-1">
              {giftList?.image && (
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden shadow-md border-2 border-gray-200 flex-shrink-0">
                  <Image 
                    src={giftList.image} 
                    alt={giftList.title} 
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900 leading-tight">{giftList?.title}</h1>
                {giftList?.description && (
                  <p className="text-gray-600 mt-1">{giftList.description}</p>
                )}
                <p className="text-gray-600 text-sm mt-1">Gestion de la liste</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <button
                onClick={() => router.push('/dashboard')}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gray-600 rounded-lg hover:bg-gray-700 flex-1 sm:flex-none justify-center transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                Mes listes
              </button>
              <button
                onClick={openEditListModal}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex-1 sm:flex-none justify-center transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Modifier la liste
              </button>
              <button
                onClick={deleteList}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 flex-1 sm:flex-none justify-center transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Supprimer
              </button>
            </div>
          </div>
        </div>
        {/* Section ajout de cadeau - Affichée uniquement s'il y a des cadeaux */}
        {gifts.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900">Gérer les cadeaux</h2>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <button
                onClick={handleShareClick}
                  className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex-1 sm:flex-none justify-center"
              >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                  </svg>
                Partager
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex-1 sm:flex-none justify-center"
              >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                Ajouter un cadeau
              </button>
            </div>
          </div>
        </div>
        )}

        {/* Bouton révéler pour liste secrète */}
        {giftList?.secret && (
          <SecretModeToggle
            hasRevealed={hasRevealed}
            onToggle={async () => {
              if (!hasRevealed) {
                showConfirm(
                  'Révéler les réservations',
                  'Êtes-vous sûr de vouloir révéler l\'état des réservations ? Cette action affichera qui a réservé chaque cadeau.',
                  async () => {
                    try {
                      const token = getAuthToken();
                      if (!token) return;
                      const response = await fetch(`/api/gift-lists/${listId}/reveal`, {
                        method: 'POST',
                        headers: {
                          'Authorization': `Bearer ${token}`
                        }
                      });
                      if (response.ok) {
                        setHasRevealed(true);
                      } else {
                        showError('Erreur', 'Erreur lors de la révélation');
                      }
                    } catch (error) {
                      console.error('Erreur révélation:', error);
                      showError('Erreur', 'Erreur lors de la révélation');
                    }
                  }
                );
              } else {
                setHasRevealed(false);
              }
            }}
            variant="manage"
          />
        )}

        {/* Liste des cadeaux */}
        {gifts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun cadeau trouvé</h3>
            <p className="text-gray-500 mb-6">Commencez par ajouter votre premier cadeau</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Ajouter le premier cadeau
            </button>
          </div>
        ) : (
          <div className="grid gap-4 sm:gap-6">
            {gifts.map(gift => (
              <div key={gift.id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200">
                {/* Image et titre - Mobile first */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-4 sm:p-6">
                  {/* Image centrée sur mobile */}
                  <div className="flex-shrink-0 w-full sm:w-auto flex justify-center">
                    {gift.image ? (
                      <div className="w-28 h-20 sm:w-24 sm:h-20 rounded-xl border-2 border-gray-200 overflow-hidden shadow-sm">
                        <Image 
                          src={gift.image} 
                          alt={gift.title} 
                          width={96}
                          height={80}
                          className="w-full h-full object-contain bg-gray-50" 
                          unoptimized 
                        />
                      </div>
                    ) : (
                      <div className="w-28 h-20 sm:w-24 sm:h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl border-2 border-gray-200 flex items-center justify-center shadow-sm">
                        <svg className="w-6 h-6 sm:w-6 sm:h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </div>
                    )}
                  </div>
                  
                  {/* Contenu principal */}
                  <div className="flex-1 min-w-0 w-full text-center sm:text-left">
                    <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 mb-2 leading-tight">{gift.title}</h3>
                    
                    {/* Prix et statut */}
                    <div className="flex flex-wrap justify-center sm:justify-start items-center gap-2 mb-3">
                      {gift.price && (
                        <span className="text-xs sm:text-sm font-semibold text-blue-600 bg-blue-50 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full border border-blue-200">
                          {gift.price} €
                        </span>
                      )}
                      <GiftStatusBadge
                        status={gift.status}
                        reservedByName={gift.reservedByName}
                        isSecret={giftList?.secret || false}
                        hasRevealed={hasRevealed}
                        variant="default"
                      />
                    </div>
                    
                    {/* Description */}
                    {gift.description && (
                      <p className="text-xs sm:text-sm text-gray-600 mb-4 leading-relaxed">{gift.description}</p>
                    )}
                    
                    {/* Lien produit */}
                    {gift.url && (
                      <a 
                        href={gift.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 px-3 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-sm hover:shadow-md w-full sm:w-auto"
                      >
                        <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        Voir le produit
                      </a>
                    )}
                  </div>
                </div>
                
                {/* Actions - Séparées par une bordure */}
                <div className="border-t border-gray-100 p-4 sm:p-6 pt-4">
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:justify-end">
                    <button
                      onClick={() => startEditGift(gift)}
                      disabled={(!giftList?.secret || hasRevealed) && gift.status === 'reserved'}
                      className={`inline-flex items-center justify-center gap-2 px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm font-semibold rounded-lg focus:outline-none focus:ring-2 transition-colors w-full sm:w-auto ${
                        (!giftList?.secret || hasRevealed) && gift.status === 'reserved'
                          ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                          : 'text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                      }`}
                    >
                      <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Modifier
                    </button>
                    
                    {(!giftList?.secret || hasRevealed) && gift.status === 'reserved' && (
                      <button
                        onClick={() => cancelReservation(gift.id)}
                        disabled={cancelling === gift.id}
                        className="inline-flex items-center justify-center gap-2 px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm font-semibold text-red-700 bg-red-50 rounded-lg hover:bg-red-100 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors w-full sm:w-auto"
                      >
                        {cancelling === gift.id ? (
                          <>
                            <svg className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span className="hidden sm:inline">Annulation...</span>
                            <span className="sm:hidden">En cours...</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                            </svg>
                            <span className="hidden sm:inline">Annuler la réservation</span>
                            <span className="sm:hidden">Annuler</span>
                          </>
                        )}
                      </button>
                    )}
                    
                    <button
                      onClick={() => deleteGift(gift.id)}
                      className="inline-flex items-center justify-center gap-2 px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors w-full sm:w-auto"
                    >
                      <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal d'ajout */}
      <GiftFormModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setScrapingUrl('');
        }}
        onSubmit={handleAddGift}
        isSubmitting={adding}
        mode="add"
        showScraping={true}
        scrapingUrl={scrapingUrl}
        onScrapingUrlChange={setScrapingUrl}
        onScrape={scrapeProduct}
        isScraping={scraping}
      />

      {/* Modal d'édition */}
      <GiftFormModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingGift(null);
        }}
        initialData={editingGift ? {
          title: editingGift.title,
          url: editingGift.url || '',
          image: editingGift.image || '',
          price: editingGift.price?.toString() || '',
          description: editingGift.description || ''
        } : undefined}
        onSubmit={handleUpdateGift}
        isSubmitting={updating}
        mode="edit"
      />


      {/* Modal de partage */}
      {showShareModal && giftList && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" onClick={cancelEdit}></div>
            <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Partager la liste</h3>
                  <button
                    onClick={cancelEdit}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* QR Code */}
                <QRCodeDisplay shareCode={giftList.shareCode} listImage={giftList.image} />

                {/* Lien de partage */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Lien de partage</h4>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={`${typeof window !== 'undefined' ? window.location.origin : ''}/list/${giftList.shareCode}`}
                      readOnly
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 text-sm"
                    />
                    <button
                      onClick={() => copyToClipboard(`${typeof window !== 'undefined' ? window.location.origin : ''}/list/${giftList.shareCode}`)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      Copier
                    </button>
                  </div>
                </div>

                {/* Informations de la liste */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-700">Informations de la liste</h4>
                    <button
                      onClick={openEditListModal}
                      className="text-xs text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      Modifier
                    </button>
                  </div>
                  <p className="text-sm text-gray-600">
                    <strong>Titre :</strong> {giftList.title}
                  </p>
                  {giftList.description && (
                    <p className="text-sm text-gray-600 mt-1">
                      <strong>Description :</strong> {giftList.description}
                    </p>
                  )}
                  {giftList.image && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600 mb-1">
                        <strong>Image :</strong>
                      </p>
                      <Image 
                        src={giftList.image} 
                        alt="Image de la liste" 
                        width={64}
                        height={64}
                        className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                        unoptimized
                      />
                    </div>
                  )}
                  <p className="text-sm text-gray-600 mt-1">
                    <strong>Code de partage :</strong> {giftList.shareCode}
                  </p>
                </div>

                <div className="flex flex-col gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      cancelEdit()
                      router.push(`/list/${giftList.shareCode}`)
                    }}
                    className="inline-flex items-center justify-center gap-2 px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors w-full"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Voir la liste publique
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors w-full"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de modification de liste */}
      {showEditListModal && giftList && (
        <EditListModal
          isOpen={showEditListModal}
          onClose={() => {
                  setShowEditListModal(false);
          }}
          initialData={{
            title: giftList.title,
            description: giftList.description,
            image: giftList.image,
            secret: giftList.secret
          }}
          onSubmit={handleUpdateList}
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
  );
}
