'use client';

import { useState } from 'react';
import type { ReservePayload } from '@/types';

// Réexporter pour compatibilité
export type { ReservePayload };

export default function ReserveDialog({
  open,
  onClose,
  onConfirm,
  giftTitle,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: (payload: ReservePayload) => Promise<void> | void;
  giftTitle: string;
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !confirm) return;
    setSubmitting(true);
    try {
      await onConfirm({ 
        name: name.trim(), 
        email: email.trim() || undefined, 
        message: message.trim() || undefined,
        anonymous: anonymous
      });
      onClose();
      // reset
      setName(''); setEmail(''); setMessage(''); setAnonymous(false); setConfirm(false);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4" 
      style={{ 
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        paddingLeft: 'env(safe-area-inset-left)',
        paddingRight: 'env(safe-area-inset-right)'
      }}
    >
      <div 
        className="w-full max-w-md rounded-t-3xl sm:rounded-2xl bg-white p-4 sm:p-6 shadow-xl overflow-y-auto" 
        style={{ 
          maxHeight: 'calc(90vh - env(safe-area-inset-top) - env(safe-area-inset-bottom))',
          marginBottom: 'env(safe-area-inset-bottom)'
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Réserver ce cadeau</h3>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 sm:hidden"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <p className="text-sm sm:text-base text-gray-600 mb-6">Vous êtes sur le point de réserver&nbsp;: <span className="font-medium text-gray-800">{giftTitle}</span></p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">Votre nom *</label>
            <input
              className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-500 transition-colors"
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="Entrez votre nom"
              required
              autoComplete="name"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">Email (optionnel)</label>
            <input
              className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-500 transition-colors"
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.com"
              autoComplete="email"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">Message (optionnel)</label>
            <textarea
              className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-500 resize-none min-h-[100px] transition-colors"
              rows={4} 
              value={message} 
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Message pour l'organisateur..."
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <label className="flex items-start gap-3 text-sm cursor-pointer">
              <input 
                type="checkbox" 
                className="mt-1 w-5 h-5 text-blue-600 border-2 border-gray-400 rounded focus:ring-blue-500 focus:ring-2 bg-white" 
                checked={anonymous} 
                onChange={(e) => setAnonymous(e.target.checked)} 
              />
              <span className="text-gray-700">
                <strong className="text-blue-800">Réservation anonyme</strong><br />
                <span className="text-xs text-gray-600">Votre nom ne sera pas affiché publiquement, seul l&apos;organisateur le verra</span>
              </span>
            </label>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <label className="flex items-start gap-3 text-sm cursor-pointer">
              <input 
                type="checkbox" 
                className="mt-1 w-5 h-5 text-blue-600 border-2 border-gray-400 rounded focus:ring-blue-500 focus:ring-2 bg-white" 
                checked={confirm} 
                onChange={(e) => setConfirm(e.target.checked)} 
              />
              <span className="text-gray-700">
                Je confirme que je réserve ce cadeau. Il apparaîtra comme <strong className="text-gray-900">réservé</strong> pour les autres.
              </span>
            </label>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
            <button 
              type="button" 
              onClick={onClose} 
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 text-base font-semibold text-gray-700 bg-gray-100 border border-gray-300 rounded-xl hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Annuler
            </button>
            <button
              type="submit"
              disabled={!name.trim() || !confirm || submitting}
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 text-base font-semibold text-white bg-green-600 border border-green-600 rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
            >
              {submitting ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Réservation…
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Confirmer la réservation
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}