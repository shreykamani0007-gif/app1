import React, { createContext, useState, useCallback } from 'react';
import { ToastContainer } from '../components/ui/Toast';

export const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ message, type = 'info', duration = 3500 }) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    info: (msg, dur) => addToast({ message: msg, type: 'info', duration: dur }),
    success: (msg, dur) => addToast({ message: msg, type: 'success', duration: dur }),
    error: (msg, dur) => addToast({ message: msg, type: 'error', duration: dur }),
    warning: (msg, dur) => addToast({ message: msg, type: 'warning', duration: dur }),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </ToastContext.Provider>
  );
}
