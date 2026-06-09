'use client';

import { useEffect, useState } from 'react';
import { CloseIcon } from './Icons';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface ToastContainerProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}

export default function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onDismiss(toast.id), 200);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const colors = {
    success: { bg: 'var(--success-muted)', border: 'var(--success)', text: 'var(--success)' },
    error: { bg: 'var(--danger-muted)', border: 'var(--danger)', text: 'var(--danger)' },
    info: { bg: 'var(--accent-muted)', border: 'var(--accent)', text: 'var(--accent)' },
  };

  const color = colors[toast.type];

  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-xl min-w-[280px] max-w-[400px] transition-all duration-200"
      style={{
        background: 'var(--bg-elevated)',
        border: `1px solid ${color.border}`,
        boxShadow: 'var(--shadow-lg)',
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateX(0)' : 'translateX(100%)',
      }}
    >
      <div className="flex-1">
        <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
          {toast.message}
        </p>
      </div>
      <button
        onClick={() => {
          setIsVisible(false);
          setTimeout(() => onDismiss(toast.id), 200);
        }}
        className="p-1 rounded-md transition-colors"
        style={{ color: 'var(--text-muted)' }}
        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-tertiary)'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
      >
        <CloseIcon size={14} />
      </button>
    </div>
  );
}
