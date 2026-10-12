import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import clsx from 'clsx';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastContextValue {
  showToast: (type: ToastType, title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((type: ToastType, title: string, message?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => {
          const typeClasses = {
            success: 'border-emerald-200 bg-emerald-50 text-emerald-900',
            error: 'border-red-200 bg-red-50 text-red-900',
            warning: 'border-amber-200 bg-amber-50 text-amber-900',
            info: 'border-sky-200 bg-sky-50 text-sky-900',
          }[toast.type];

          const icon = {
            success: '✓',
            error: '✕',
            warning: '!',
            info: 'ℹ',
          }[toast.type];

          return (
            <div
              key={toast.id}
              className={clsx(
                'pointer-events-auto flex items-start gap-3 rounded-lg border p-4 shadow-lg transition-all animate-in slide-in-from-right duration-200',
                typeClasses
              )}
              role="status"
            >
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/70 text-xs font-bold shadow-xs">
                {icon}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold">{toast.title}</p>
                {toast.message && <p className="mt-0.5 text-xs opacity-90">{toast.message}</p>}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="shrink-0 text-xs opacity-60 hover:opacity-100 p-0.5"
                aria-label="Close notification"
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
