'use client';

import AlertModal from '@/components/AlertModal';
import GiftStatusBadge from '@/components/GiftStatusBadge';
import { Modal } from '@/components/Modal';
import QRCodeDisplay from '@/components/QRCodeDisplay';
import ReserveDialog, { type ReservePayload } from '@/components/ReserveDialog';
import SecretModeToggle from '@/components/SecretModeToggle';
import { useAlert } from '@/hooks/useAlert';
import { useAuthContext } from '@/contexts/AuthContext';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import type { Gift, GiftList } from 'app/types'

interface PublicListClientProps {
  shareCode: string;
}

function GiftIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  )
}

function ErrorIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 8v5M12 16.5h.01M10.3 3.9 2.6 17.2A1.8 1.8 0 0 0 4.2 20h15.6a1.8 1.8 0 0 0 1.6-2.8L13.7 3.9a1.9 1.9 0 0 0-3.4 0Z" />
    </svg>
  )
}

export default function PublicListClient({ shareCode }: PublicListClientProps) {
  const [giftList, setGiftList] = useState<GiftList | null>(null);
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogFor, setDialogFor] = useState<Gift | null>(null);
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareFeedback, setShareFeedback] = useState<{ tone: 'success' | 'danger'; message: string } | null>(null);
  const [hasRevealed, setHasRevealed] = useState(false); // Par défaut, masquer les réservations sur liste secrète
  const router = useRouter();
  const { alert, showSuccess, showError, showConfirm, hideAlert } = useAlert();

  const { user } = useAuthContext();

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
            showError('Erreur', json.error || 'Impossible d’annuler la réservation');
            return;
          }
          setGifts(g =>
            g.map(it => it.id === giftId ? { ...it, status: 'available', reservedByName: undefined } : it)
          );
          showSuccess('Succès', 'Réservation annulée !');
        } catch (error) {
          console.error('Erreur annulation:', error);
          showError('Erreur', 'Erreur lors de l’annulation de la réservation');
        } finally {
          setCancellingId(null);
        }
      }
    );
  }

  const handleShareClick = () => {
    if (giftList) {
      setShareFeedback(null);
      setShowShareModal(true);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setShareFeedback({ tone: 'success', message: 'Lien copié dans le presse-papiers !' });
    } catch (error) {
      console.error('Erreur copie:', error);
      setShareFeedback({ tone: 'danger', message: 'Copie impossible. Sélectionnez le lien puis copiez-le manuellement.' });
    }
  };

  const isOwner = Boolean(user && giftList && user.id === giftList.user.id);

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
  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/list/${shareCode}` : '';

  if (loading) {
    return (
      <div className="ds-page">
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
          <span className="ds-spinner" role="status" aria-label="Chargement de la liste" />
          <p className="ds-body-sm ds-text-muted">Chargement…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ds-page">
        <main className="ds-page__main">
          <div className="ds-alert ds-alert--danger" role="alert">
            <span className="ds-alert__icon"><ErrorIcon /></span>
            <div className="ds-alert__content">
              <p className="ds-alert__title">Liste inaccessible</p>
              <p className="ds-alert__message">{error}</p>
            </div>
          </div>
          <div className="ds-page-actions mt-6">
            <button type="button" onClick={() => router.push('/')} className="ds-btn ds-btn--primary ds-btn--md">
              Retour à l’accueil
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="ds-home">
      <main className="ds-home__main">
        <section className={`ds-home__hero${giftList?.image ? '' : ' ds-home__hero--single'}`} aria-labelledby="list-title">
          <div className="ds-home__copy">
            <div className="ds-home__actions">
              <button type="button" onClick={handleBackClick} className="ds-btn ds-btn--ghost ds-btn--md">
                <svg className="ds-btn__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span className="hidden sm:inline">{backButtonText.desktop}</span>
                <span className="sm:hidden">{backButtonText.mobile}</span>
              </button>
            </div>

            <span className="ds-overline">Liste de cadeaux</span>
            <h1 className="ds-home__title break-words" id="list-title">{giftList?.title}</h1>
            {giftList?.description ? (
              <p className="ds-home__lead">{giftList.description}</p>
            ) : null}

            <div className="ds-home__meta">
              <span>Par {giftList?.user.username ? `@${giftList.user.username}` : 'un proche'}</span>
              <span aria-hidden="true">·</span>
              <span>{gifts.length} {gifts.length > 1 ? 'cadeaux' : 'cadeau'}</span>
              <span aria-hidden="true">·</span>
              <span>Partage sans compte</span>
              {giftList?.secret ? (
                <>
                  <span aria-hidden="true">·</span>
                  <span>Mode secret</span>
                </>
              ) : null}
            </div>

            {isOwner ? (
              <div className="ds-home__actions">
                <button type="button" onClick={handleShareClick} className="ds-btn ds-btn--primary ds-btn--md">
                  <svg className="ds-btn__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M8.6 13.4 15.4 9.2M8.6 10.6l6.8 4.2" />
                    <circle cx="6" cy="12" r="2.5" />
                    <circle cx="18" cy="7" r="2.5" />
                    <circle cx="18" cy="17" r="2.5" />
                  </svg>
                  Partager
                </button>
                <button type="button" onClick={() => router.push(`/manage/${giftList?.id}`)} className="ds-btn ds-btn--secondary ds-btn--md">
                  Gérer la liste
                </button>
                <button type="button" onClick={() => router.push('/dashboard')} className="ds-btn ds-btn--ghost ds-btn--md">
                  Mes listes
                </button>
              </div>
            ) : null}
          </div>

          {giftList?.image ? (
            <div className="ds-home__art">
              <Image
                src={giftList.image}
                alt={giftList.title}
                width={640}
                height={480}
                className="h-auto w-full object-contain"
                unoptimized
                priority
              />
            </div>
          ) : null}
        </section>

        {giftList?.secret ? (
          <div className="mt-8">
            <SecretModeToggle
              hasRevealed={hasRevealed}
              onToggle={() => {
                if (!hasRevealed) {
                  showConfirm(
                    'Révéler les réservations',
                    'Voulez-vous afficher l’état des réservations ? Cela vous permettra de voir qui a réservé chaque cadeau.',
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
          </div>
        ) : null}

        {gifts.length === 0 ? (
          <div className="ds-empty mt-8">
            <span className="ds-empty__icon"><GiftIcon /></span>
            <h2 className="ds-empty__title">Aucun cadeau pour le moment</h2>
            <p className="ds-empty__message">La liste de cadeaux sera bientôt disponible !</p>
          </div>
        ) : (
          <>
            <div className="ds-toolbar mt-10">
              <h2 className="ds-h3">Les cadeaux</h2>
              <div className="ds-toolbar__group">
                <span className="ds-chip">{gifts.length} {gifts.length > 1 ? 'cadeaux' : 'cadeau'}</span>
              </div>
            </div>

            <ul className="ds-grid">
              {gifts.map(g => {
                const showReserve = g.status === 'available' || (giftList?.secret && !hasRevealed);
                const showCancel = isOwner && !showReserve;

                return (
                  <li key={g.id}>
                    <article className="ds-card h-full">
                      <div className="ds-card__body flex-1">
                        {g.image ? (
                          <Image
                            src={g.image}
                            alt={g.title}
                            width={480}
                            height={320}
                            className="h-36 w-full rounded-md bg-[var(--ds-color-surface-muted)] object-contain p-2"
                            unoptimized
                          />
                        ) : (
                          <div className="flex h-24 items-center justify-center rounded-md bg-[var(--ds-color-surface-muted)]" aria-hidden="true">
                            <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                          </div>
                        )}

                        <h3 className="ds-card__title">{g.title}</h3>

                        <div className="ds-cluster">
                          {g.price != null ? (
                            <span className="ds-badge ds-badge--neutral">{g.price} €</span>
                          ) : null}
                          <GiftStatusBadge
                            status={g.status}
                            reservedByName={g.reservedByName}
                            isSecret={giftList?.secret || false}
                            hasRevealed={hasRevealed}
                            variant="public"
                          />
                        </div>

                        {g.description ? (
                          <p className="ds-body-sm line-clamp-3">{g.description}</p>
                        ) : null}

                        {g.url ? (
                          <div>
                            <a
                              href={g.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ds-btn ds-btn--secondary ds-btn--md"
                            >
                              <svg className="ds-btn__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                              Voir le produit
                            </a>
                          </div>
                        ) : null}
                      </div>

                      {showReserve || showCancel ? (
                        <div className="ds-card__footer">
                          {showReserve ? (
                            <button
                              type="button"
                              onClick={() => setDialogFor(g)}
                              disabled={loadingId === g.id}
                              aria-busy={loadingId === g.id || undefined}
                              aria-label={`Réserver ${g.title}`}
                              className="ds-btn ds-btn--primary ds-btn--md ds-btn--block"
                            >
                              {loadingId === g.id ? (
                                <>
                                  <span className="ds-spinner" aria-hidden="true" />
                                  Réservation…
                                </>
                              ) : (
                                'Réserver ce cadeau'
                              )}
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => cancelReservation(g.id)}
                              disabled={cancellingId === g.id}
                              aria-busy={cancellingId === g.id || undefined}
                              aria-label={`Annuler la réservation de ${g.title}`}
                              className="ds-btn ds-btn--danger ds-btn--md"
                            >
                              {cancellingId === g.id ? (
                                <>
                                  <span className="ds-spinner" aria-hidden="true" />
                                  Annulation…
                                </>
                              ) : (
                                'Annuler la réservation'
                              )}
                            </button>
                          )}
                        </div>
                      ) : null}
                    </article>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </main>

      <ReserveDialog
        open={!!dialogFor}
        giftTitle={dialogFor?.title || ''}
        onClose={() => setDialogFor(null)}
        onConfirm={(payload) => dialogFor ? submitReservation(dialogFor.id, payload) : undefined}
      />

      {giftList ? (
        <Modal
          open={showShareModal}
          onClose={() => {
            setShowShareModal(false);
            setShareFeedback(null);
          }}
          title="Partager la liste"
          description="Envoyez ce lien ou faites scanner le QR code."
          footer={
            <button
              type="button"
              onClick={() => {
                setShowShareModal(false);
                setShareFeedback(null);
              }}
              className="ds-btn ds-btn--secondary ds-btn--md"
            >
              Fermer
            </button>
          }
        >
          <QRCodeDisplay shareCode={giftList.shareCode} />

          <div className="ds-field">
            <label htmlFor="share-link" className="ds-label">Lien de partage</label>
            <div className="flex flex-wrap gap-2">
              <input
                id="share-link"
                type="text"
                value={shareUrl}
                readOnly
                className="ds-input flex-1"
              />
              <button
                type="button"
                onClick={() => copyToClipboard(shareUrl)}
                className="ds-btn ds-btn--primary ds-btn--md"
              >
                Copier
              </button>
            </div>
          </div>

          {shareFeedback ? (
            <div className={`ds-alert ds-alert--${shareFeedback.tone}`} role={shareFeedback.tone === 'danger' ? 'alert' : 'status'}>
              <span className="ds-alert__icon">
                {shareFeedback.tone === 'success' ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="m5 12 4.5 4.5L19 7" />
                  </svg>
                ) : (
                  <ErrorIcon />
                )}
              </span>
              <div className="ds-alert__content">
                <p className="ds-alert__message">{shareFeedback.message}</p>
              </div>
            </div>
          ) : null}

          <div className="ds-stack ds-stack--gap-1">
            <h3 className="ds-card__title">Informations de la liste</h3>
            <p className="ds-body-sm"><strong>Titre :</strong> {giftList.title}</p>
            {giftList.description ? (
              <p className="ds-body-sm"><strong>Description :</strong> {giftList.description}</p>
            ) : null}
            <p className="ds-body-sm"><strong>Code de partage :</strong> {giftList.shareCode}</p>
          </div>
        </Modal>
      ) : null}

      {/* Alert Modal */}
      {alert ? (
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
      ) : null}
    </div>
  );
}
