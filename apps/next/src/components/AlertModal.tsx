'use client';

import { Modal } from '@/components/Modal';
import type { ReactNode } from 'react';

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  confirmText?: string;
  onConfirm?: () => void | Promise<void>;
  showCancel?: boolean;
  cancelText?: string;
}

type AlertType = NonNullable<AlertModalProps['type']>;

const ALERT_TONE: Record<AlertType, 'success' | 'danger' | 'warning' | 'info'> = {
  success: 'success',
  error: 'danger',
  warning: 'warning',
  info: 'info'
};

const ALERT_ICONS: Record<AlertType, ReactNode> = {
  success: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  error: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
    </svg>
  ),
  warning: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
    </svg>
  ),
  info: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
};

/**
 * Cross-page feedback dialog. Public API unchanged (manage, public list,
 * profile, admin, dashboard) — visuals and a11y now come from Modal + ds-alert.
 */
export default function AlertModal({
  isOpen,
  onClose,
  title,
  message,
  type = 'info',
  confirmText = 'OK',
  onConfirm,
  showCancel = false,
  cancelText = 'Annuler'
}: AlertModalProps) {
  const handleConfirm = async () => {
    if (onConfirm) {
      await onConfirm();
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          {showCancel && (
            <button type="button" className="ds-btn ds-btn--secondary flex-1" onClick={onClose}>
              {cancelText}
            </button>
          )}
          <button type="button" className="ds-btn ds-btn--primary flex-1" onClick={handleConfirm}>
            {confirmText}
          </button>
        </>
      }
    >
      <div className={`ds-alert ds-alert--${ALERT_TONE[type]}`} role={type === 'error' ? 'alert' : 'status'}>
        <span className="ds-alert__icon" aria-hidden="true">
          {ALERT_ICONS[type]}
        </span>
        <div className="ds-alert__content">
          <p className="ds-alert__message">{message}</p>
        </div>
      </div>
    </Modal>
  );
}
