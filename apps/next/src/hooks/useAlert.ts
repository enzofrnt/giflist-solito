'use client';

import { useState } from 'react';

interface AlertOptions {
  title: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  confirmText?: string;
  onConfirm?: () => void | Promise<void>;
  showCancel?: boolean;
  cancelText?: string;
}

export function useAlert() {
  const [alert, setAlert] = useState<AlertOptions | null>(null);

  const showAlert = (options: AlertOptions) => {
    setAlert(options);
  };

  const hideAlert = () => {
    setAlert(null);
  };

  const showSuccess = (title: string, message: string, onConfirm?: () => void | Promise<void>) => {
    showAlert({ title, message, type: 'success', onConfirm });
  };

  const showError = (title: string, message: string, onConfirm?: () => void | Promise<void>) => {
    showAlert({ title, message, type: 'error', onConfirm });
  };

  const showWarning = (title: string, message: string, onConfirm?: () => void | Promise<void>) => {
    showAlert({ title, message, type: 'warning', onConfirm });
  };

  const showInfo = (title: string, message: string, onConfirm?: () => void | Promise<void>) => {
    showAlert({ title, message, type: 'info', onConfirm });
  };

  const showConfirm = (
    title: string, 
    message: string, 
    onConfirm: () => void | Promise<void>,
    confirmText = 'Confirmer',
    cancelText = 'Annuler'
  ) => {
    showAlert({ 
      title, 
      message, 
      type: 'warning', 
      onConfirm, 
      showCancel: true,
      confirmText,
      cancelText
    });
  };

  return {
    alert,
    showAlert,
    hideAlert,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showConfirm
  };
}
