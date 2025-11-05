'use client';

import AlertModal from '@/components/AlertModal';
import GiftStatusBadge from '@/components/GiftStatusBadge';
import QRCodeDisplay from '@/components/QRCodeDisplay';
import ReserveDialog, { type ReservePayload } from '@/components/ReserveDialog';
import SecretModeToggle from '@/components/SecretModeToggle';
import { useAlert } from '@/hooks/useAlert';
import { useAuth } from '@/hooks/useAuth';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import type { Gift, GiftList } from '@/types';

interface PublicListClientProps {
  shareCode: string;
}

export default function PublicListClient({ shareCode }: PublicListClientProps) {
  const [giftList, setGiftList] = useState<GiftList | null>(null);
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogFor, setDialogFor] = useState<Gift | null>(null);
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [user, setUser] = useState<{ id: number; email: string } | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [hasRevealed, setHasRevealed] = useState(false); // Par défaut, masquer les réservations sur liste secrète
  const router = useRouter();
  const { alert, showSuccess, showError, showConfirm, hideAlert } = useAlert();

  const { user: authUser } = useAuth({
    noRedirect: true
  });

  useEffect(() => {
    if (authUser) {
      setUser(authUser);
    }
  }, [authUser]);

  const loadGiftList = useCallback(async () => {
    try {
      const response = await fetch(`/api/public/gift-lists/${shareCode}`);

      if (response.ok) {
        const data = await response.json();
        setGiftList(data.giftList);
        setGifts(data.gifts);
      } else {
        setError('Liste non trouvée');
      }
    } catch (error) {
      console.error('Erreur chargement liste:', error);
      setError('Erreur lors du chargement de la liste');
    } finally {
      setLoading(false);
    }
  }, [shareCode]);

  useEffect(() => {
    loadGiftList();
  }, [loadGiftList]);

  // Pour les listes secrètes, les réservations sont toujours masquées par défaut
  // Le propriétaire peut les révéler en cliquant sur le bouton
  // Si la liste n'est pas secrète, hasRevealed n'a pas d'impact (on affiche toujours tout)

  // Gestion de la touche Échap pour fermer la modal
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showShareModal) {
        setShowShareModal(false);
      }
    };

    if (showShareModal) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [showShareModal]);

  async function submitReservation(giftId: number, payload: ReservePayload) {
    setLoadingId(giftId);
    try {
      const res = await fetch(`/api/public/gift-lists/${shareCode}/gifts/${giftId}/reserve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        if (res.status === 409) {
          // Si la liste est secrète et qu'on n'a pas révélé, proposer de révéler
          if (giftList?.secret && !hasRevealed) {
            showConfirm(
              'Cadeau déjà réservé',
              'Ce cadeau est déjà réservé par quelqu\'un d\'autre. Voulez-vous afficher les cadeaux réservés pour voir ce qui est déjà pris ?',
              () => {
                setHasRevealed(true);
              }
            );
          } else {
            showError('Cadeau déjà réservé', 'Ce cadeau est déjà réservé par quelqu\'un d\'autre.');
          }
        } else {
          showError('Erreur', json.error || 'Impossible de réserver');
        }
        return;
      }
      setGifts(g =>
        g.map(it => it.id === giftId ? { ...it, status: 'reserved', reservedByName: payload.anonymous ? 'Anonyme' : payload.name } : it)
      );
      showSuccess('Succès', 'Réservation confirmée ! Merci 🙏');
    } finally {
      setLoadingId(null);
    }
  }

  async function cancelReservation(giftId: number) {
    showConfirm(
      'Annuler la réservation',
      'Êtes-vous sûr de vouloir annuler cette réservation ?',
      async () => {
        setCancellingId(giftId);
        try {
          const res = await fetch(`/api/public/gift-lists/${shareCode}/gifts/${giftId}/cancel`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          });
          const json = await res.json();
          if (!res.ok || !json.ok) {
            showError('Erreur', json.error || 'Impossible d&apos;annuler la réservation');
            return;
          }
          setGifts(g =>
            g.map(it => it.id === giftId ? { ...it, status: 'available', reservedByName: undefined } : it)
          );
          showSuccess('Succès', 'Réservation annulée !');
        } catch (error) {
          console.error('Erreur annulation:', error);
          showError('Erreur', 'Erreur lors de l&apos;annulation de la réservation');
        } finally {
          setCancellingId(null);
        }
      }
    );
  }

  const handleShareClick = () => {
    if (giftList) {
      setShowShareModal(true);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showSuccess('Succès', 'Lien copié dans le presse-papiers !');
    } catch (error) {
      console.error('Erreur copie:', error);
      showError('Erreur', 'Erreur lors de la copie');
    }
  };

  const isOwner = user && giftList && user.id === giftList.user.id;

  // Fonction pour déterminer où retourner selon le contexte
  const handleBackClick = () => {
    if (isOwner && giftList) {
      // Si c'est la liste de l'utilisateur, aller à la page de gestion
      router.push(`/manage/${giftList.id}`);
    } else if (user) {
      // Si l'utilisateur est connecté mais ce n'est pas sa liste, aller au dashboard
      router.push('/dashboard');
    } else {
      // Sinon, retourner à l'accueil
      router.push('/');
    }
  };

  const getBackButtonText = () => {
    if (isOwner) {
      return { desktop: 'Gérer la liste', mobile: 'Gérer' };
    } else if (user) {
      return { desktop: 'Mes listes', mobile: 'Listes' };
    } else {
      return { desktop: 'Retour à l\'accueil', mobile: 'Retour' };
    }
  };

  const backButtonText = getBackButtonText();

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
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retour à l&apos;accueil
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-br from-blue-50 via-white to-purple-50 shadow-lg border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
          {/* Navigation */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <button
              onClick={handleBackClick}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm sm:text-base text-gray-600 hover:text-gray-900 hover:bg-white/50 rounded-lg transition-all duration-200"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="hidden sm:inline">{backButtonText.desktop}</span>
              <span className="sm:hidden">{backButtonText.mobile}</span>
            </button>
            
            {/* Boutons de gestion si propriétaire */}
            {isOwner && (
              <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                <button
                  onClick={handleShareClick}
                  className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all duration-200 shadow-md hover:shadow-lg flex-1 sm:flex-none justify-center"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                  </svg>
                  <span className="hidden sm:inline">Partager</span>
                  <span className="sm:hidden">Partager</span>
                </button>
                <button
                  onClick={() => router.push(`/manage/${giftList?.id}`)}
                  className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg flex-1 sm:flex-none justify-center"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="hidden sm:inline">Gérer</span>
                  <span className="sm:hidden">Gérer</span>
                </button>
                <button
                  onClick={() => router.push('/dashboard')}
                  className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg flex-1 sm:flex-none justify-center"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <span className="hidden sm:inline">Mes listes</span>
                  <span className="sm:hidden">Listes</span>
                </button>
              </div>
            )}
          </div>

          {/* Contenu principal du header */}
          <div className="text-center">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4">
              {giftList?.image ? (
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-xl overflow-hidden shadow-lg border-2 border-white/70 flex-shrink-0">
                  <Image 
                    src={giftList.image} 
                    alt={giftList.title} 
                    fill
                    className="object-cover"
                    unoptimized
                    priority
                  />
                </div>
              ) : (
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              )}
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
                {giftList?.title}
              </h1>
            </div>
            
            <div className="inline-flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-white/70 backdrop-blur-sm rounded-full border border-gray-200 shadow-sm mb-4">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-xs sm:text-sm font-medium text-gray-700">
                Liste créée par <span className="font-semibold text-gray-900">{giftList?.user.name || giftList?.user.email}</span>
              </span>
            </div>
            
            {giftList?.description && (
              <p className="text-sm sm:text-base lg:text-lg text-gray-600 mb-4 sm:mb-6 max-w-2xl mx-auto leading-relaxed px-4">
                {giftList.description}
              </p>
            )}
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Bouton révéler pour liste secrète */}
        {giftList?.secret && (
          <SecretModeToggle
            hasRevealed={hasRevealed}
            onToggle={() => {
              if (!hasRevealed) {
                showConfirm(
                  'Révéler les réservations',
                  'Voulez-vous afficher l&apos;état des réservations ? Cela vous permettra de voir qui a réservé chaque cadeau.',
                  () => {
                    setHasRevealed(true);
                  }
                );
              } else {
                setHasRevealed(false);
              }
            }}
            variant="public"
          />
        )}

        {gifts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun cadeau pour le moment</h3>
            <p className="text-gray-500">La liste de cadeaux sera bientôt disponible !</p>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {gifts.map(g => (
              <div key={g.id} className="bg-white border-2 border-gray-200 rounded-xl p-4 sm:p-6 hover:border-blue-300 hover:shadow-lg transition-all duration-200">
                <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
                  {/* Image */}
                  <div className="flex-shrink-0 order-first sm:order-none w-full sm:w-auto">
                    {g.image ? (
                      <div className="w-full sm:w-32 h-40 sm:h-24 rounded-xl border-2 border-gray-200 overflow-hidden shadow-sm bg-gray-50 flex items-center justify-center">
                        <Image 
                          src={g.image} 
                          alt={g.title} 
                          width={128}
                          height={96}
                          className="w-full h-full object-contain"
                          unoptimized 
                        />
                      </div>
                    ) : (
                      <div className="w-full sm:w-32 h-40 sm:h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl border-2 border-gray-200 flex items-center justify-center shadow-sm">
                        <svg className="w-6 h-6 sm:w-8 sm:h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </div>
                    )}
                  </div>
                  
                  {/* Contenu principal */}
                  <div className="flex-1 min-w-0 w-full">
                    <div className="flex flex-col sm:flex-row items-start justify-between mb-3 gap-2">
                      <div className="flex-1 min-w-0">
                        <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 leading-tight">{g.title}</h2>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3">
                          {g.price != null && (
                            <span className="px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                              {g.price} €
                            </span>
                          )}
                          <GiftStatusBadge
                            status={g.status}
                            reservedByName={g.reservedByName}
                            isSecret={giftList?.secret || false}
                            hasRevealed={hasRevealed}
                            variant="public"
                          />
                        </div>
                      </div>
                    </div>
                    
                    {g.description && (
                      <div className="mb-4">
                        <p className="text-gray-700 text-xs sm:text-sm leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-200">
                          {g.description}
                        </p>
                      </div>
                    )}
                    
                    {g.url && (
                      <div className="mb-4">
                        <a 
                          href={g.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-md hover:shadow-lg w-full sm:w-auto justify-center"
                        >
                          <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          Voir le produit
                        </a>
                      </div>
                    )}
                  </div>
                  
                  {/* Action */}
                  <div className="flex-shrink-0 w-full sm:w-auto">
                    {g.status === 'available' || (giftList?.secret && !hasRevealed) ? (
                      <button
                        onClick={() => setDialogFor(g)}
                        disabled={loadingId === g.id || ((!giftList?.secret || hasRevealed) && g.status === 'reserved')}
                        className="inline-flex items-center gap-2 px-4 py-3 sm:px-5 sm:px-6 text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-green-600 to-green-700 rounded-xl hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl w-full sm:w-auto justify-center"
                      >
                        {loadingId === g.id ? (
                          <>
                            <svg className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span className="hidden sm:inline">Réservation...</span>
                            <span className="sm:hidden">En cours...</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="hidden sm:inline">Je m&apos;en occupe</span>
                            <span className="sm:hidden">Réserver</span>
                          </>
                        )}
                      </button>
                    ) : (giftList?.secret && hasRevealed) || (!giftList?.secret && g.status === 'reserved') ? (
                      <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                        <div className="inline-flex items-center gap-2 px-3 py-3 sm:px-4 rounded-xl bg-gradient-to-r from-orange-100 to-orange-200 border-2 border-orange-300 justify-center">
                          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                          <div className="text-xs sm:text-sm font-semibold text-orange-800">
                            <div>Réservé</div>
                            {hasRevealed && g.reservedByName && g.reservedByName !== 'Anonyme' && (
                              <div className="text-xs text-orange-600">par {g.reservedByName}</div>
                            )}
                          </div>
                        </div>
                        {/* Bouton d'annulation uniquement pour le propriétaire */}
                        {isOwner && (
                          <button
                            onClick={() => cancelReservation(g.id)}
                            disabled={cancellingId === g.id}
                            className="inline-flex items-center gap-2 px-3 py-3 sm:px-4 text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-red-600 to-red-700 rounded-xl hover:from-red-700 hover:to-red-800 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl justify-center"
                          >
                            {cancellingId === g.id ? (
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
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                <span className="hidden sm:inline">Annuler</span>
                                <span className="sm:hidden">Annuler</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <ReserveDialog
        open={!!dialogFor}
        giftTitle={dialogFor?.title || ''}
        onClose={() => setDialogFor(null)}
        onConfirm={(payload) => dialogFor ? submitReservation(dialogFor.id, payload) : undefined}
      />

      {/* Modal de partage */}
      {showShareModal && giftList && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setShowShareModal(false)}></div>
            <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Partager la liste</h3>
                  <button
                    onClick={() => setShowShareModal(false)}
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
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Informations de la liste</h4>
                  <p className="text-sm text-gray-600">
                    <strong>Titre :</strong> {giftList.title}
                  </p>
                  {giftList.description && (
                    <p className="text-sm text-gray-600 mt-1">
                      <strong>Description :</strong> {giftList.description}
                    </p>
                  )}
                  <p className="text-sm text-gray-600 mt-1">
                    <strong>Code de partage :</strong> {giftList.shareCode}
                  </p>
                </div>

                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setShowShareModal(false)}
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

