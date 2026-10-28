'use client';

import { useId, useState } from 'react';
import { Modal } from '@/components/Modal';
import type { ReservePayload } from 'app/types'

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
  const formId = useId();
  const fieldId = (field: string) => `${formId}-${field}`;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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
    <Modal
      open={open}
      onClose={onClose}
      title="Réserver ce cadeau"
      description={`Vous êtes sur le point de réserver « ${giftTitle} ».`}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="ds-btn ds-btn--secondary ds-btn--md"
            disabled={submitting}
          >
            Annuler
          </button>
          <button
            type="submit"
            form={formId}
            className="ds-btn ds-btn--primary ds-btn--md"
            disabled={!name.trim() || !confirm || submitting}
            aria-busy={submitting || undefined}
          >
            {submitting ? (
              <>
                <span className="ds-spinner" aria-hidden="true" />
                Réservation…
              </>
            ) : (
              'Confirmer la réservation'
            )}
          </button>
        </>
      }
    >
      <form id={formId} onSubmit={handleSubmit} className="ds-stack ds-stack--gap-4">
        <div className="ds-field">
          <label className="ds-label" htmlFor={fieldId('name')}>
            Votre nom <span className="ds-label__required">*</span>
          </label>
          <input
            id={fieldId('name')}
            className="ds-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Entrez votre nom"
            required
            autoComplete="name"
            disabled={submitting}
          />
          <p className="ds-hint">Le nom affiché sur la liste publique de l’organisateur.</p>
        </div>

        <div className="ds-field">
          <label className="ds-label" htmlFor={fieldId('email')}>
            E-mail <span className="ds-hint">(optionnel)</span>
          </label>
          <input
            id={fieldId('email')}
            className="ds-input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="votre@email.com"
            autoComplete="email"
            disabled={submitting}
          />
          <p className="ds-hint">Utilisé uniquement par l’organisateur pour vous remercier.</p>
        </div>

        <div className="ds-field">
          <label className="ds-label" htmlFor={fieldId('message')}>
            Message <span className="ds-hint">(optionnel)</span>
          </label>
          <textarea
            id={fieldId('message')}
            className="ds-textarea"
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Un mot pour l’organisateur…"
            disabled={submitting}
          />
        </div>

        <label className="ds-check min-h-11">
          <input
            type="checkbox"
            checked={anonymous}
            onChange={(e) => setAnonymous(e.target.checked)}
            disabled={submitting}
          />
          <span>
            <strong>Réservation anonyme</strong>
            <span className="ds-caption"> — votre nom ne sera pas affiché publiquement, seul l’organisateur le verra.</span>
          </span>
        </label>

        <label className="ds-check min-h-11">
          <input
            type="checkbox"
            checked={confirm}
            onChange={(e) => setConfirm(e.target.checked)}
            disabled={submitting}
          />
          <span>
            Je confirme réserver ce cadeau : il apparaîtra comme <strong>réservé</strong> pour les autres.
          </span>
        </label>
      </form>
    </Modal>
  );
}
