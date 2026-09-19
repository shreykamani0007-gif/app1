import React from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const toastStyles = {
  success: {
    bg: 'bg-emerald-50 border-emerald-200 text-emerald-900',
    icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
  },
  error: {
    bg: 'bg-rose-50 border-rose-200 text-rose-900',
    icon: <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />,
  },
  warning: {
    bg: 'bg-amber-50 border-amber-200 text-amber-900',
    icon: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />,
  },
  info: {
    bg: 'bg-indigo-50 border-indigo-200 text-indigo-900',
    icon: <Info className="w-5 h-5 text-indigo-600 shrink-0" />,
  },
};

export function ToastContainer({ toasts, onDismiss }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full">
      {toasts.map((toast) => {
        const style = toastStyles[toast.type] || toastStyles.info;
        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border shadow-lg backdrop-blur-sm transition-all duration-200 animate-in fade-in slide-in-from-bottom-2 ${style.bg}`}
          >
            {style.icon}
            <div className="flex-1 text-sm font-medium leading-5 pt-0.5">{toast.message}</div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="p-1 rounded-lg hover:bg-black/5 text-slate-500 hover:text-slate-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
