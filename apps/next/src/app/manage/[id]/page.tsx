'use client';

import AlertModal from '@/components/AlertModal';
import { DropdownMenu } from '@/components/DropdownMenu';
import EditListModal from '@/components/EditListModal';
import GiftFormModal from '@/components/GiftFormModal';
import GiftStatusBadge from '@/components/GiftStatusBadge';
import { Modal } from '@/components/Modal';
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
  const [scrapeError, setScrapeError] = useState('');
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
    setScrapeError('');
  }, []);

  function openAddModal() {
    setScrapeError('');
    setShowAddModal(true);
  }

  async function scrapeProduct(): Promise<{ title?: string; url?: string; image?: string; price?: string; description?: string } | null> {
    if (!scrapingUrl.trim()) return null;

    setScraping(true);
    setScrapeError('');
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
        const message = data.error || 'Impossible de récupérer les informations du produit';
        setScrapeError(message);
        showError('Erreur', message);
        return null;
      }
    } catch (error) {
      console.error('Erreur scraping:', error);
      setScrapeError('Erreur lors de la récupération des informations');
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
        setScrapeError('');
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
      <div className="ds-page">
        <main className="ds-page__main">
          <div className="ds-empty" role="status" aria-live="polite">
            <span className="ds-spinner" aria-hidden="true" />
            <p className="ds-empty__title">Chargement…</p>
            <p className="ds-empty__message">Récupération de votre liste de cadeaux.</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ds-page">
        <main className="ds-page__main">
          <div className="ds-alert ds-alert--danger" role="alert">
            <span className="ds-alert__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
            </span>
            <div className="ds-alert__content">
              <p className="ds-alert__title">Liste indisponible</p>
              <p className="ds-alert__message">{error}</p>
            </div>
          </div>
          <div className="mt-6 flex justify-center">
            <button className="ds-btn ds-btn--primary" onClick={() => router.push('/dashboard')}>
              Retour à mes listes
            </button>
          </div>
        </main>
      </div>
    );
  }

  const shareUrl = giftList && typeof window !== 'undefined'
    ? `${window.location.origin}/list/${giftList.shareCode}`
    : '';

  return (
    <div className="ds-page">
      <main className="ds-page__main">
        <header className="ds-page-header">
          <div className="flex min-w-0 items-start gap-4">
            {giftList?.image && (
              <div className="ds-card ds-card--flat h-20 w-20 shrink-0 overflow-hidden">
                <Image
                  src={giftList.image}
                  alt={giftList.title}
                  width={80}
                  height={80}
                  className="h-full w-full object-cover"
                  unoptimized
                />
              </div>
            )}
            <div className="ds-page-header__copy min-w-0">
              <p className="ds-page-kicker">Gestion de liste</p>
              <h1 className="ds-page-title break-words">{giftList?.title}</h1>
              <p className="ds-page-subtitle break-words">
                {giftList?.description || 'Ajoutez et suivez les cadeaux de cette liste.'}
              </p>
            </div>
          </div>
          <div className="ds-page-actions">
            <button className="ds-btn ds-btn--secondary" onClick={handleShareClick}>
              <span className="ds-btn__icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
              </span>
              Partager
            </button>
            {gifts.length > 0 && (
              <button className="ds-btn ds-btn--primary" onClick={openAddModal}>
                <span className="ds-btn__icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 4v16m8-8H4" />
                  </svg>
                </span>
                Ajouter un cadeau
              </button>
            )}
          </div>
        </header>

        <div className="ds-toolbar">
          <div className="ds-toolbar__group">
            <h2 className="ds-card__title">Les cadeaux</h2>
            <span className="ds-badge ds-badge--neutral">
              {gifts.length} {gifts.length === 1 ? 'cadeau' : 'cadeaux'}
            </span>
          </div>
          <div className="ds-toolbar__group">
            <button className="ds-btn ds-btn--ghost" onClick={() => router.push('/dashboard')}>
              <span className="ds-btn__icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </span>
              Mes listes
            </button>
            <DropdownMenu
              label="Actions de la liste"
              triggerClassName="ds-icon-btn"
              trigger={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                  <circle cx="5" cy="12" r="1" fill="currentColor" />
                  <circle cx="12" cy="12" r="1" fill="currentColor" />
                  <circle cx="19" cy="12" r="1" fill="currentColor" />
                </svg>
              }
              items={[
                { label: 'Modifier la liste', onSelect: openEditListModal },
                { label: 'Supprimer la liste', danger: true, onSelect: deleteList },
              ]}
            />
          </div>
        </div>

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

        {gifts.length === 0 ? (
          <div className="ds-empty">
            <span className="ds-empty__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </span>
            <h2 className="ds-empty__title">Aucun cadeau pour le moment</h2>
            <p className="ds-empty__message">Commencez par ajouter votre premier cadeau à cette liste.</p>
            <button className="ds-btn ds-btn--primary ds-btn--lg" onClick={openAddModal}>
              <span className="ds-btn__icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 4v16m8-8H4" />
                </svg>
              </span>
              Ajouter le premier cadeau
            </button>
          </div>
        ) : (
          <ul className="ds-list" aria-label="Cadeaux de la liste">
            {gifts.map(gift => {
              const reservationVisible = (!giftList?.secret || hasRevealed) && gift.status === 'reserved';
              const editDisabled = (!giftList?.secret || hasRevealed) && gift.status === 'reserved';

              return (
                <li key={gift.id}>
                  <article className="ds-card">
                    <div className="ds-card__body">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                        <div className="ds-card ds-card--flat mx-auto h-24 w-32 shrink-0 items-center justify-center sm:mx-0">
                          {gift.image ? (
                            <Image
                              src={gift.image}
                              alt={gift.title}
                              width={128}
                              height={96}
                              className="h-full w-full object-contain"
                              unoptimized
                            />
                          ) : (
                            <span className="ds-empty__icon" aria-hidden="true">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                              </svg>
                            </span>
                          )}
                        </div>

                        <div className="ds-stack ds-stack--gap-2 min-w-0 flex-1">
                          <h3 className="ds-card__title break-words">{gift.title}</h3>
                          <div className="ds-cluster">
                            {gift.price != null && (
                              <span className="ds-chip">{gift.price} €</span>
                            )}
                            <GiftStatusBadge
                              status={gift.status}
                              reservedByName={gift.reservedByName}
                              isSecret={giftList?.secret || false}
                              hasRevealed={hasRevealed}
                              variant="default"
                            />
                          </div>
                          {gift.description && (
                            <p className="ds-card__subtitle break-words">{gift.description}</p>
                          )}
                          {gift.url && (
                            <a
                              href={gift.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ds-btn ds-btn--ghost ds-btn--sm min-h-11 self-start"
                            >
                              <span className="ds-btn__icon" aria-hidden="true">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                              </span>
                              Voir le produit
                              <span className="sr-only">(nouvel onglet)</span>
                            </a>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="ds-card__footer">
                      <button
                        className="ds-btn ds-btn--secondary"
                        onClick={() => startEditGift(gift)}
                        disabled={editDisabled}
                      >
                        <span className="ds-btn__icon" aria-hidden="true">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </span>
                        Modifier
                      </button>

                      {reservationVisible && (
                        <button
                          className="ds-btn ds-btn--secondary"
                          onClick={() => cancelReservation(gift.id)}
                          disabled={cancelling === gift.id}
                          aria-busy={cancelling === gift.id || undefined}
                        >
                          {cancelling === gift.id ? (
                            <>
                              <span className="ds-spinner" aria-hidden="true" />
                              Annulation…
                            </>
                          ) : (
                            <>
                              <span className="ds-btn__icon" aria-hidden="true">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                </svg>
                              </span>
                              Annuler la réservation
                            </>
                          )}
                        </button>
                      )}

                      <button
                        className="ds-btn ds-btn--danger"
                        onClick={() => deleteGift(gift.id)}
                      >
                        <span className="ds-btn__icon" aria-hidden="true">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </span>
                        Supprimer
                      </button>
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>
        )}
      </main>

      {/* Modal d'ajout */}
      <GiftFormModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setScrapingUrl('');
          setScrapeError('');
        }}
        onSubmit={handleAddGift}
        isSubmitting={adding}
        mode="add"
        showScraping={true}
        scrapingUrl={scrapingUrl}
        onScrapingUrlChange={(url) => {
          setScrapingUrl(url);
          setScrapeError('');
        }}
        onScrape={scrapeProduct}
        isScraping={scraping}
        scrapeError={scrapeError}
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
        <Modal
          open={showShareModal}
          onClose={cancelEdit}
          title="Partager la liste"
          description="Scannez le QR code ou copiez le lien de partage."
          size="md"
          closeLabel="Fermer la fenêtre de partage"
          footer={
            <>
              <button className="ds-btn ds-btn--ghost" onClick={cancelEdit}>
                Fermer
              </button>
              <button
                className="ds-btn ds-btn--secondary"
                onClick={() => {
                  cancelEdit()
                  router.push(`/list/${giftList.shareCode}`)
                }}
              >
                <span className="ds-btn__icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </span>
                Voir la liste publique
              </button>
            </>
          }
        >
          <QRCodeDisplay shareCode={giftList.shareCode} />

          <div className="ds-field">
            <label className="ds-label" htmlFor="share-link">
              Lien de partage
            </label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                id="share-link"
                type="text"
                value={shareUrl}
                readOnly
                className="ds-input flex-1"
              />
              <button
                className="ds-btn ds-btn--secondary"
                onClick={() => copyToClipboard(shareUrl)}
              >
                Copier
              </button>
            </div>
            <p className="ds-hint">Toute personne disposant de ce lien peut consulter la liste.</p>
          </div>

          <div className="ds-card ds-card--flat">
            <div className="ds-card__header">
              <h3 className="ds-card__title">Informations de la liste</h3>
              <button
                className="ds-btn ds-btn--ghost"
                onClick={() => {
                  setShowShareModal(false);
                  openEditListModal();
                }}
              >
                Modifier
              </button>
            </div>
            <div className="ds-card__body">
              <p className="ds-card__subtitle break-words">
                <strong>Titre :</strong> {giftList.title}
              </p>
              {giftList.description && (
                <p className="ds-card__subtitle break-words">
                  <strong>Description :</strong> {giftList.description}
                </p>
              )}
              <p className="ds-card__subtitle">
                <strong>Code de partage :</strong> {giftList.shareCode}
              </p>
              {giftList.image && (
                <div className="flex items-center gap-3">
                  <div className="ds-avatar ds-avatar--lg">
                    <Image
                      src={giftList.image}
                      alt="Image de la liste"
                      width={56}
                      height={56}
                      className="h-full w-full object-cover"
                      unoptimized
                    />
                  </div>
                  <p className="ds-hint">Image de la liste</p>
                </div>
              )}
            </div>
          </div>
        </Modal>
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
