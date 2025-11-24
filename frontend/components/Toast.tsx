'use client';

import { useState, useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

let toastId = 0;
const listeners: Set<(toast: ToastMessage) => void> = new Set();

export const showToast = (message: string, type: ToastType = 'info', duration = 3000) => {
  const id = `toast-${toastId++}`;
  const toast: ToastMessage = { id, message, type };
  
  listeners.forEach(listener => listener(toast));
  
  if (duration > 0) {
    setTimeout(() => {
      removeToast(id);
    }, duration);
  }
  
  return id;
};

export const removeToast = (id: string) => {
  listeners.forEach(listener => listener({ id, message: '', type: 'info' }));
};

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const handleToast = (toast: ToastMessage) => {
      if (toast.message) {
        setToasts(prev => [...prev, toast]);
      } else {
        setToasts(prev => prev.filter(t => t.id !== toast.id));
      }
    };

    listeners.add(handleToast);
    return () => listeners.delete(handleToast);
  }, []);

  const getIcon = (type: ToastType) => {
    switch (type) {
      case 'success': return '✓';
      case 'error': return '✕';
      case 'warning': return '⚠';
      case 'info': return 'ℹ';
    }
  };

  const getColors = (type: ToastType) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`border rounded-lg p-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 ${getColors(toast.type)}`}
        >
          <span className="text-lg font-bold flex-shrink-0">{getIcon(toast.type)}</span>
          <p className="text-sm font-medium flex-1">{toast.message}</p>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-lg font-bold opacity-50 hover:opacity-100 transition flex-shrink-0"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
