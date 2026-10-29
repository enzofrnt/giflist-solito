'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import AlertModal from '@/components/AlertModal';
import PasswordInput from '@/components/PasswordInput';
import ScrapingTest from '@/components/ScrapingTest';
import AmazonDebug from '@/components/AmazonDebug';
import { useAlert } from '@/hooks/useAlert';

const ADMIN_CREDENTIALS = {
  username: 'enzo',
  password: 'enzo'
};

type Gift = {
  id: number;
  title: string;
  url?: string | null;
  image?: string | null;
  price?: string | number | null;
  description?: string | null;
  status: 'available' | 'reserved';
  reservedByName?: string | null;
};

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  );
}

function GiftIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  );
}

function PencilIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  );
}

function UndoIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3a4 4 0 118 0v4m-4 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 12a2 2 0 11-4 0 2 2 0 014 0zm0 0c0 1.306.835 2.417 2 2.83" />
    </svg>
  );
}

function ExternalIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
  );
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingGift, setEditingGift] = useState<Gift | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    image: '',
    price: '',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [isUnreserving, setIsUnreserving] = useState<number | null>(null);
  const [loginError, setLoginError] = useState('');
  const { alert, showSuccess, showError, showConfirm, hideAlert } = useAlert();

  const fetchGifts = async () => {
    try {
      const response = await fetch('/api/gift');
      const result = await response.json();
      if (result.ok) {
        setGifts(result.data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des cadeaux:', error);
    }
  };

  useEffect(() => {
    const authStatus = localStorage.getItem('admin_authenticated');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
      fetchGifts();
    }
    setIsLoading(false);
  }, []);

  const [adminPassword, setAdminPassword] = useState('');
  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const username = formData.get('username') as string;
    const password = adminPassword;

    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
      localStorage.setItem('admin_authenticated', 'true');
      setLoginError('');
      setIsAuthenticated(true);
      fetchGifts();
    } else {
      setLoginError('Identifiants incorrects. Vérifiez votre nom d’utilisateur et votre mot de passe.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_authenticated');
    setIsAuthenticated(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      title: '',
      url: '',
      image: '',
      price: '',
      description: ''
    });
    setEditingGift(null);
    setShowForm(false);
  };

  const handleEdit = (gift: Gift) => {
    setEditingGift(gift);
    setFormData({
      title: gift.title,
      url: gift.url || '',
      image: gift.image || '',
      price: gift.price?.toString() || '',
      description: gift.description || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (giftId: number) => {
    showConfirm(
      'Supprimer le cadeau',
      'Êtes-vous sûr de vouloir supprimer ce cadeau ? Cette action est irréversible.',
      async () => {
        setIsDeleting(giftId);
        try {
          const response = await fetch(`/api/gift?id=${giftId}`, {
            method: 'DELETE',
          });
          const result = await response.json();

          if (result.ok) {
            setGifts(gifts.filter(g => g.id !== giftId));
            showSuccess('Succès', 'Cadeau supprimé avec succès !');
          } else {
            showError('Erreur', 'Erreur lors de la suppression: ' + result.error);
          }
        } catch (error) {
          console.error('Erreur lors de la suppression:', error);
          showError('Erreur', 'Erreur lors de la suppression du cadeau');
        } finally {
          setIsDeleting(null);
        }
      }
    );
  };

  const handleUnreserve = async (giftId: number) => {
    showConfirm(
      'Retirer la réservation',
      'Êtes-vous sûr de vouloir retirer la réservation de ce cadeau ?',
      async () => {
        setIsUnreserving(giftId);
        try {
          const response = await fetch('/api/gift', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              id: giftId,
              status: 'available',
              reservedBy: null,
              reservedByName: null,
              reservedByEmail: null,
              reservedAt: null
            }),
          });
          const result = await response.json();

          if (result.ok) {
            setGifts(gifts.map(g => 
              g.id === giftId 
                ? { ...g, status: 'available' as const, reservedByName: null, reservedBy: null, reservedByEmail: null, reservedAt: null }
                : g
            ));
            showSuccess('Succès', 'Réservation retirée avec succès !');
          } else {
            showError('Erreur', 'Erreur lors du retrait de la réservation: ' + result.error);
          }
        } catch (error) {
          console.error('Erreur lors du retrait de la réservation:', error);
          showError('Erreur', 'Erreur lors du retrait de la réservation');
        } finally {
          setIsUnreserving(null);
        }
      }
    );
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const url = editingGift ? '/api/gift' : '/api/gift';
      const method = editingGift ? 'PUT' : 'POST';
      const body = editingGift 
        ? { id: editingGift.id, ...formData, price: formData.price ? parseFloat(formData.price) : undefined }
        : { ...formData, price: formData.price ? parseFloat(formData.price) : undefined };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const result = await response.json();

      if (result.ok) {
        showSuccess('Succès', editingGift ? 'Cadeau modifié avec succès !' : 'Cadeau ajouté avec succès !');
        resetForm();
        fetchGifts();
      } else {
        showError('Erreur', 'Erreur: ' + result.error);
      }
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement:', error);
      showError('Erreur', 'Erreur lors de l’enregistrement du cadeau');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="ds-page">
        <main className="ds-page__main">
          <div className="ds-empty" role="status" aria-live="polite">
            <span className="ds-empty__icon">
              <span className="ds-spinner" aria-hidden="true" />
            </span>
            <p className="ds-empty__title">Chargement de l’administration…</p>
            <p className="ds-empty__message">Vérification de votre accès en cours.</p>
          </div>
        </main>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="ds-auth">
        <div className="ds-auth__card">
          <div className="ds-auth__header">
            <span className="ds-avatar ds-avatar--lg" aria-hidden="true">
              <LockIcon />
            </span>
            <h1 className="ds-auth__title">Connexion administrateur</h1>
            <p className="ds-auth__lead">Accédez à l’administration des cadeaux.</p>
          </div>

          <form onSubmit={handleLogin} className="ds-auth__form">
            <div className="ds-field">
              <label htmlFor="username" className="ds-label">
                Nom d’utilisateur <span className="ds-label__required">*</span>
              </label>
              <input
                type="text"
                id="username"
                name="username"
                required
                autoComplete="username"
                className="ds-input"
                placeholder="Votre nom d’utilisateur"
              />
            </div>

            <div className="ds-field">
              <label htmlFor="password" className="ds-label">
                Mot de passe <span className="ds-label__required">*</span>
              </label>
              <PasswordInput
                id="password"
                name="password"
                required
                value={adminPassword}
                onChange={(event) => setAdminPassword(event.target.value)}
                autoComplete="current-password"
                placeholder="Votre mot de passe"
              />
            </div>

            {loginError ? (
              <div className="ds-alert ds-alert--danger" role="alert">
                <span className="ds-alert__icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <circle cx="12" cy="12" r="9" />
                    <path strokeLinecap="round" d="M12 8v4m0 3.5h.01" />
                  </svg>
                </span>
                <div className="ds-alert__content">
                  <p className="ds-alert__title">Identifiants incorrects</p>
                  <p className="ds-alert__message">{loginError}</p>
                </div>
              </div>
            ) : null}

            <button type="submit" className="ds-btn ds-btn--primary ds-btn--lg ds-btn--block">
              Se connecter
            </button>
          </form>

          <div className="ds-auth__footer">
            <Link href="/" className="ds-btn ds-btn--secondary ds-btn--block">
              Retour à la liste publique
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ds-page">
      <main className="ds-page__main ds-stack ds-stack--gap-6">
        <header className="ds-page-header">
          <div className="ds-page-header__copy">
            <p className="ds-page-kicker">Espace administrateur</p>
            <h1 className="ds-page-title">Administration des cadeaux</h1>
            <p className="ds-page-subtitle">
              Ajoutez, modifiez et retirez les cadeaux de votre liste. Les changements sont visibles
              immédiatement sur la liste publique.
            </p>
          </div>
          <div className="ds-page-actions">
            <Link href="/" className="ds-btn ds-btn--secondary">
              Voir la liste publique
            </Link>
            <button type="button" onClick={handleLogout} className="ds-btn ds-btn--ghost">
              Déconnexion
            </button>
          </div>
        </header>

        {/* Outils de développement, repliés par défaut. */}
        <details className="ds-card" style={{ marginBottom: 'var(--ds-space-6)' }}>
          <summary className="ds-card__header" style={{ cursor: 'pointer' }}>
            <span className="ds-card__title">Outils de développement</span>
          </summary>
          <div className="ds-card__body">
            <ScrapingTest />
            <AmazonDebug />
          </div>
        </details>

        {showForm ? (
          /* Formulaire */
          <section className="ds-card" aria-labelledby="admin-form-title">
            <div className="ds-card__header">
              <div>
                <h2 className="ds-card__title" id="admin-form-title">
                  {editingGift ? 'Modifier le cadeau' : 'Ajouter un nouveau cadeau'}
                </h2>
                <p className="ds-card__subtitle">
                  {editingGift
                    ? 'Mettez à jour les informations du cadeau sélectionné.'
                    : 'Renseignez les informations du cadeau à ajouter à votre liste.'}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="ds-card__body">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="ds-field">
                    <label htmlFor="title" className="ds-label">
                      Titre du cadeau <span className="ds-label__required">*</span>
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      required
                      value={formData.title}
                      onChange={handleInputChange}
                      className="ds-input"
                      placeholder="Ex : PlayStation 5"
                    />
                  </div>

                  <div className="ds-field">
                    <label htmlFor="price" className="ds-label">
                      Prix (€)
                    </label>
                    <input
                      type="number"
                      id="price"
                      name="price"
                      step="0.01"
                      inputMode="decimal"
                      value={formData.price}
                      onChange={handleInputChange}
                      aria-describedby="price-hint"
                      className="ds-input"
                      placeholder="299.99"
                    />
                    <p className="ds-hint" id="price-hint">
                      Facultatif, en euros.
                    </p>
                  </div>
                </div>

                <div className="ds-field">
                  <label htmlFor="url" className="ds-label">
                    URL du produit
                  </label>
                  <input
                    type="url"
                    id="url"
                    name="url"
                    value={formData.url}
                    onChange={handleInputChange}
                    aria-describedby="url-hint"
                    className="ds-input"
                    placeholder="https://example.com/produit"
                  />
                  <p className="ds-hint" id="url-hint">
                    Lien vers la fiche produit, utilisé par le bouton « Voir le produit ».
                  </p>
                </div>

                <div className="ds-field">
                  <label htmlFor="image" className="ds-label">
                    URL de l’image
                  </label>
                  <input
                    type="url"
                    id="image"
                    name="image"
                    value={formData.image}
                    onChange={handleInputChange}
                    aria-describedby="image-hint"
                    className="ds-input"
                    placeholder="https://example.com/image.jpg"
                  />
                  <p className="ds-hint" id="image-hint">
                    Lien direct vers une image (facultatif).
                  </p>
                </div>

                <div className="ds-field">
                  <label htmlFor="description" className="ds-label">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={4}
                    value={formData.description}
                    onChange={handleInputChange}
                    className="ds-textarea"
                    placeholder="Informations supplémentaires…"
                  />
                </div>
              </div>

              <div className="ds-card__footer">
                <button
                  type="button"
                  onClick={resetForm}
                  className="ds-btn ds-btn--secondary"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  aria-busy={isSubmitting ? true : undefined}
                  className={isSubmitting ? 'ds-btn ds-btn--primary ds-btn--loading' : 'ds-btn ds-btn--primary'}
                >
                  {isSubmitting ? (
                    <>
                      <span className="ds-btn__spinner" aria-hidden="true" />
                      <span className="ds-btn__label">Enregistrement…</span>
                    </>
                  ) : (
                    <span className="ds-btn__label">
                      {editingGift ? 'Enregistrer les modifications' : 'Ajouter le cadeau'}
                    </span>
                  )}
                </button>
              </div>
            </form>
          </section>
        ) : (
          /* Liste des cadeaux */
          <section aria-labelledby="admin-list-title">
            <div className="ds-toolbar">
              <div className="ds-toolbar__group">
                <h2 className="ds-h3" id="admin-list-title">
                  Liste des cadeaux
                </h2>
                <span className="ds-badge ds-badge--neutral">{gifts.length}</span>
              </div>
              <div className="ds-toolbar__group">
                <button
                  type="button"
                  onClick={() => setShowForm(true)}
                  className="ds-btn ds-btn--primary"
                >
                  <span className="ds-btn__icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m-7-7h14" />
                    </svg>
                  </span>
                  <span className="ds-btn__label">Nouveau cadeau</span>
                </button>
              </div>
            </div>

            {gifts.length === 0 ? (
              <div className="ds-empty">
                <span className="ds-empty__icon">
                  <GiftIcon />
                </span>
                <p className="ds-empty__title">Aucun cadeau pour le moment</p>
                <p className="ds-empty__message">
                  Commencez par ajouter votre premier cadeau à la liste.
                </p>
                <button
                  type="button"
                  onClick={() => setShowForm(true)}
                  className="ds-btn ds-btn--primary"
                >
                  <span className="ds-btn__label">Ajouter le premier cadeau</span>
                </button>
              </div>
            ) : (
              <div className="ds-table" role="table" aria-label="Cadeaux de la liste">
                <div className="ds-table__row hidden md:grid" role="row">
                  <span role="columnheader">Cadeau</span>
                  <span role="columnheader">Prix et statut</span>
                  <span role="columnheader">Actions</span>
                </div>

                {gifts.map((gift, index) => (
                  <div
                    key={gift.id}
                    role="row"
                    className={`ds-table__row grid-cols-1 gap-3 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_auto] md:items-center${
                      index === 0 ? ' border-t-0 md:border-t' : ''
                    }`}
                  >
                    <div role="cell" className="flex min-w-0 items-start gap-3">
                      <span className="ds-avatar ds-avatar--lg">
                        {gift.image ? (
                          <Image
                            src={gift.image}
                            alt=""
                            width={64}
                            height={64}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <GiftIcon className="h-6 w-6" />
                        )}
                      </span>

                      <div className="min-w-0 break-words">
                        <h3 className="ds-h4">{gift.title}</h3>
                        {gift.description ? (
                          <p className="ds-body-sm mt-1">{gift.description}</p>
                        ) : null}
                        {gift.url ? (
                          <a
                            href={gift.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ds-link mt-2 inline-flex items-center gap-1"
                          >
                            Voir le produit
                            <ExternalIcon />
                          </a>
                        ) : null}
                      </div>
                    </div>

                    <div role="cell" className="ds-cluster">
                      {gift.price ? (
                        <span className="ds-badge ds-badge--primary">{gift.price} €</span>
                      ) : null}
                      <span
                        className={`ds-badge ds-badge--dot ${
                          gift.status === 'available' ? 'ds-badge--success' : 'ds-badge--warning'
                        }`}
                      >
                        {gift.status === 'available' ? 'Disponible' : 'Réservé'}
                      </span>
                    </div>

                    <div role="cell" className="ds-cluster md:justify-end">
                      <button
                        type="button"
                        onClick={() => handleEdit(gift)}
                        className="ds-btn ds-btn--secondary"
                      >
                        <span className="ds-btn__icon" aria-hidden="true">
                          <PencilIcon />
                        </span>
                        <span className="ds-btn__label">Modifier</span>
                      </button>

                      {gift.status === 'reserved' ? (
                        <button
                          type="button"
                          onClick={() => handleUnreserve(gift.id)}
                          disabled={isUnreserving === gift.id}
                          aria-busy={isUnreserving === gift.id ? true : undefined}
                          aria-label={`Retirer la réservation du cadeau « ${gift.title} »`}
                          className={
                            isUnreserving === gift.id
                              ? 'ds-btn ds-btn--ghost ds-btn--loading'
                              : 'ds-btn ds-btn--ghost'
                          }
                        >
                          {isUnreserving === gift.id ? (
                            <>
                              <span className="ds-btn__spinner" aria-hidden="true" />
                              <span className="ds-btn__label">Retrait…</span>
                            </>
                          ) : (
                            <>
                              <span className="ds-btn__icon" aria-hidden="true">
                                <UndoIcon />
                              </span>
                              <span className="ds-btn__label">Retirer</span>
                            </>
                          )}
                        </button>
                      ) : null}

                      <button
                        type="button"
                        onClick={() => handleDelete(gift.id)}
                        disabled={isDeleting === gift.id}
                        aria-busy={isDeleting === gift.id ? true : undefined}
                        aria-label={`Supprimer le cadeau « ${gift.title} »`}
                        className={
                          isDeleting === gift.id
                            ? 'ds-btn ds-btn--danger ds-btn--loading'
                            : 'ds-btn ds-btn--danger'
                        }
                      >
                        {isDeleting === gift.id ? (
                          <>
                            <span className="ds-btn__spinner" aria-hidden="true" />
                            <span className="ds-btn__label">Suppression…</span>
                          </>
                        ) : (
                          <>
                            <span className="ds-btn__icon" aria-hidden="true">
                              <TrashIcon />
                            </span>
                            <span className="ds-btn__label">Supprimer</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </main>

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
