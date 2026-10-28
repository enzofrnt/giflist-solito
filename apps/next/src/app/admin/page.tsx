'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { FlickeringGrid } from 'app/components/FlickeringGrid';
import AlertModal from '@/components/AlertModal';
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
  const router = useRouter();
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

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;

    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
      localStorage.setItem('admin_authenticated', 'true');
      setIsAuthenticated(true);
      fetchGifts();
    } else {
      showError('Erreur', 'Identifiants incorrects');
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
      showError('Erreur', 'Erreur lors de l&apos;enregistrement du cadeau');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 relative">
        <div className="fixed inset-0 z-0">
          <FlickeringGrid
            style={{ width: '100%', height: '100%' }}
            squareSize={3}
            gridGap={8}
            color="#9CA3AF"
            maxOpacity={0.15}
            flickerChance={0.05}
          />
        </div>
        <div className="text-center relative z-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-gray-600">Chargement...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 relative">
        <div className="fixed inset-0 z-0">
          <FlickeringGrid
            style={{ width: '100%', height: '100%' }}
            squareSize={3}
            gridGap={8}
            color="#9CA3AF"
            maxOpacity={0.15}
            flickerChance={0.05}
          />
        </div>
        <div className="max-w-md w-full mx-4 relative z-10">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Connexion Admin</h1>
              <p className="text-gray-600 mt-2">Accédez à l&apos;administration des cadeaux</p>
            </div>
            
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                  Nom d&apos;utilisateur
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 bg-white placeholder-gray-500"
                  placeholder="Entrez votre nom d'utilisateur"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Mot de passe
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 bg-white placeholder-gray-500"
                  placeholder="Entrez votre mot de passe"
                />
              </div>
              <div className="space-y-3">
                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                >
                  Se connecter
                </button>
                <button
                  type="button"
                  onClick={() => router.push('/')}
                  className="w-full py-3 px-4 text-gray-700 bg-gray-100 font-medium rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                >
                  ← Retour à la liste publique
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Arrière-plan FlickeringGrid */}
      <div className="fixed inset-0 z-0">
        <FlickeringGrid
          style={{ width: '100%', height: '100%' }}
          squareSize={3}
          gridGap={8}
          color="#9CA3AF"
          maxOpacity={0.15}
          flickerChance={0.05}
        />
      </div>
      
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm shadow-sm border-b border-gray-200 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <h1 className="text-lg sm:text-xl font-semibold text-gray-900">Administration des cadeaux</h1>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                onClick={() => router.push('/')}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Voir la liste publique
              </button>
              <button
                onClick={() => setShowForm(true)}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                + Nouveau cadeau
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 relative z-10">
        {/* Test de Scraping */}
        <div className="mb-8">
          <ScrapingTest />
        </div>
        
        {/* Debug Amazon */}
        <div className="mb-8">
          <AmazonDebug />
        </div>
        {showForm ? (
          /* Formulaire */
          <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 p-4 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6 sm:mb-8">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                {editingGift ? 'Modifier le cadeau' : 'Ajouter un nouveau cadeau'}
              </h2>
              <button
                onClick={resetForm}
                className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors w-full sm:w-auto"
              >
                Annuler
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-bold text-gray-800 mb-3">
                    Titre du cadeau *
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    required
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-500"
                    placeholder="Ex: PlayStation 5"
                  />
                </div>

                <div>
                  <label htmlFor="price" className="block text-sm font-bold text-gray-800 mb-3">
                    Prix (€)
                  </label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    step="0.01"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-500"
                    placeholder="299.99"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="url" className="block text-sm font-bold text-gray-800 mb-3">
                  URL du produit
                </label>
                <input
                  type="url"
                  id="url"
                  name="url"
                  value={formData.url}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-500"
                  placeholder="https://example.com/produit"
                />
              </div>

              <div>
                <label htmlFor="image" className="block text-sm font-bold text-gray-800 mb-3">
                  URL de l&apos;image
                </label>
                <input
                  type="url"
                  id="image"
                  name="image"
                  value={formData.image}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-500"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-bold text-gray-800 mb-3">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-500 resize-vertical"
                  placeholder="Informations supplémentaires..."
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:justify-end gap-3 sm:gap-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 text-sm font-semibold text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors w-full sm:w-auto"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 text-sm font-semibold text-white bg-blue-600 border border-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors w-full sm:w-auto"
                >
                  {isSubmitting ? 'Enregistrement...' : (editingGift ? 'Modifier' : 'Ajouter')}
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Liste des cadeaux */
          <div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4 sm:mb-6">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                Liste des cadeaux ({gifts.length})
              </h2>
            </div>
            
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
                  onClick={() => setShowForm(true)}
                  className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
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
                          <div className="w-32 h-24 sm:w-24 sm:h-20 rounded-xl border-2 border-gray-200 overflow-hidden shadow-sm">
                            <Image 
                              src={gift.image} 
                              alt={gift.title} 
                              width={128}
                              height={96}
                              className="w-full h-full object-contain bg-gray-50" 
                            />
                          </div>
                        ) : (
                          <div className="w-32 h-24 sm:w-24 sm:h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl border-2 border-gray-200 flex items-center justify-center shadow-sm">
                            <svg className="w-8 h-8 sm:w-6 sm:h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                          </div>
                        )}
                      </div>
                      
                      {/* Contenu principal */}
                      <div className="flex-1 min-w-0 w-full text-center sm:text-left">
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">{gift.title}</h3>
                        
                        {/* Prix et statut */}
                        <div className="flex flex-wrap justify-center sm:justify-start items-center gap-2 mb-3">
                          {gift.price && (
                            <span className="text-sm font-semibold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-200">
                              {gift.price} €
                            </span>
                          )}
                          <span className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium ${
                            gift.status === 'available' 
                              ? 'bg-green-50 text-green-700 border border-green-200' 
                              : 'bg-orange-50 text-orange-700 border border-orange-200'
                          }`}>
                            {gift.status === 'available' ? (
                              <>
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                Disponible
                              </>
                            ) : (
                              <>
                                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                Réservé
                              </>
                            )}
                          </span>
                        </div>
                        
                        {/* Description */}
                        {gift.description && (
                          <p className="text-sm text-gray-600 mb-4 leading-relaxed">{gift.description}</p>
                        )}
                        
                        {/* Lien produit */}
                        {gift.url && (
                          <a 
                            href={gift.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-sm hover:shadow-md w-full sm:w-auto"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                            Voir le produit
                          </a>
                        )}
                      </div>
                    </div>
                    
                    {/* Actions - Séparées par une bordure */}
                    <div className="border-t border-gray-100 p-4 sm:p-6 pt-4">
                      <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
                        <button
                          onClick={() => handleEdit(gift)}
                          className="inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors w-full sm:w-auto"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Modifier
                        </button>
                        
                        {gift.status === 'reserved' && (
                          <button
                            onClick={() => handleUnreserve(gift.id)}
                            disabled={isUnreserving === gift.id}
                            className="inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-orange-700 bg-orange-50 rounded-lg hover:bg-orange-100 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors w-full sm:w-auto"
                          >
                            {isUnreserving === gift.id ? (
                              <>
                                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Retrait...
                              </>
                            ) : (
                              <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 12a2 2 0 11-4 0 2 2 0 014 0zm0 0c0 1.306.835 2.417 2 2.83M9 12a2 2 0 11-4 0 2 2 0 014 0zm0 0c0-1.306.835-2.417 2-2.83M9 12a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                Retirer la réservation
                              </>
                            )}
                          </button>
                        )}
                        
                        <button
                          onClick={() => handleDelete(gift.id)}
                          disabled={isDeleting === gift.id}
                          className="inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-red-700 bg-red-50 rounded-lg hover:bg-red-100 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors w-full sm:w-auto"
                        >
                          {isDeleting === gift.id ? (
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
          </div>
        )}
      </div>

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
