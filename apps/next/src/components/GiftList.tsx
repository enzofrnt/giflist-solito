'use client';
import { useState } from 'react';
import Image from 'next/image';
import ReserveDialog, { type ReservePayload } from './ReserveDialog';
import AlertModal from './AlertModal';
import { useAlert } from '@/hooks/useAlert';
import type { Gift } from 'app/types'

// Type pour les cadeaux dans ce composant (peut avoir price en string ou number)
type GiftWithFlexiblePrice = Omit<Gift, 'price'> & {
  price?: string | number | null;
  url?: string | null;
  image?: string | null;
  reservedByName?: string | null;
};

export default function GiftList({ initialGifts }: { initialGifts: GiftWithFlexiblePrice[] }) {
  const [gifts, setGifts] = useState<GiftWithFlexiblePrice[]>(initialGifts);
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [dialogFor, setDialogFor] = useState<GiftWithFlexiblePrice | null>(null);
  const { alert, showSuccess, showError, hideAlert } = useAlert();

  async function submitReservation(giftId: number, payload: ReservePayload) {
    setLoadingId(giftId);
    try {
      const res = await fetch('/api/reserve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ giftId, ...payload }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        showError('Erreur', json.error || 'Impossible de réserver (déjà pris ?)');
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

  return (
    <>
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
              {/* Image avec ratio libre */}
              <div className="flex-shrink-0 order-first sm:order-none">
                {g.image ? (
                  <div className="w-full sm:w-32 h-48 sm:h-24 rounded-xl border-2 border-gray-200 overflow-hidden shadow-sm bg-gray-50 flex items-center justify-center">
                    <Image 
                      src={g.image} 
                      alt={g.title} 
                      width={512}
                      height={320}
                      className="w-full h-full object-contain" 
                    />
                  </div>
                ) : (
                  <div className="w-full sm:w-32 h-48 sm:h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl border-2 border-gray-200 flex items-center justify-center shadow-sm">
                    <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                )}
              </div>
              
              {/* Contenu principal */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-bold text-gray-900 mb-2">{g.title}</h2>
                    <div className="flex items-center gap-3 mb-3">
                      {g.price != null && (
                        <span className="px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                          {g.price} €
                        </span>
                      )}
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${
                        g.status === 'available' 
                          ? 'bg-green-50 text-green-700 border border-green-200' 
                          : 'bg-orange-50 text-orange-700 border border-orange-200'
                      }`}>
                        {g.status === 'available' ? (
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
                  </div>
                </div>
                
                {g.description && (
                  <div className="mb-4">
                    <p className="text-gray-700 text-sm leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-200">
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
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-md hover:shadow-lg w-full sm:w-auto justify-center"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      Voir le produit
                    </a>
                  </div>
                )}
              </div>
              
              {/* Action */}
              <div className="flex-shrink-0 w-full sm:w-auto">
                {g.status === 'available' ? (
                  <button
                    onClick={() => setDialogFor(g)}
                    disabled={loadingId === g.id}
                    className="inline-flex items-center gap-2 px-5 sm:px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-green-600 to-green-700 rounded-xl hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl w-full sm:w-auto justify-center"
                  >
                    {loadingId === g.id ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Réservation...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Je m&apos;en occupe
                      </>
                    )}
                  </button>
                ) : (
                  <div className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-orange-100 to-orange-200 border-2 border-orange-300 w-full sm:w-auto justify-center">
                    <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <div className="text-sm font-semibold text-orange-800">
                      <div>Réservé</div>
                      {g.reservedByName && (
                        <div className="text-xs text-orange-600">par {g.reservedByName}</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          ))}
        </div>
      )}

      <ReserveDialog
        open={!!dialogFor}
        giftTitle={dialogFor?.title || ''}
        onClose={() => setDialogFor(null)}
        onConfirm={(payload) => dialogFor ? submitReservation(dialogFor.id, payload) : undefined}
      />

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
    </>
  );
}