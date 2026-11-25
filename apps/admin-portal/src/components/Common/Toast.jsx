'use client';

import React, { useEffect } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  Info,
  X,
} from '@/components/icons';

const VARIANTS = {
  success: {
    icon: CheckCircle2,
    iconWrap: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    border: 'border-emerald-200/90',
    accent: 'bg-emerald-500',
  },
  error: {
    icon: AlertCircle,
    iconWrap: 'bg-rose-50 text-rose-600 border-rose-200',
    border: 'border-rose-200/90',
    accent: 'bg-rose-500',
  },
  warning: {
    icon: AlertCircle,
    iconWrap: 'bg-amber-50 text-amber-600 border-amber-200',
    border: 'border-amber-200/90',
    accent: 'bg-amber-500',
  },
  info: {
    icon: Info,
    iconWrap: 'bg-blue-50 text-[#1E40AF] border-blue-200',
    border: 'border-blue-200/90',
    accent: 'bg-[#1E40AF]',
  },
};

/**
 * Standard Toast Notification
 * Positioned at top-center (just below the laptop camera).
 */
export default function Toast({ toast, onClose, duration = 3000 }) {
  useEffect(() => {
    if (!toast?.message) return;

    const timer = setTimeout(() => {
      if (onClose) onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [toast?.message, toast?.type, duration, onClose]);

  if (!toast?.message) return null;

  const variant = VARIANTS[toast.type] || VARIANTS.info;
  const Icon = variant.icon;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] pointer-events-none px-4 w-full max-w-md flex justify-center">
      <div
        role="alert"
        aria-live="polite"
        className={`pointer-events-auto relative overflow-hidden flex items-center gap-3 pl-3.5 pr-3 py-2.5 rounded-xl border ${variant.border} bg-white/95 backdrop-blur-md shadow-lg shadow-slate-900/10 animate-in fade-in slide-in-from-top-3 duration-200 w-auto min-w-[280px] max-w-md`}
      >
        <span
          className={`absolute left-0 top-0 bottom-0 w-1 ${variant.accent}`}
          aria-hidden="true"
        />
        <span
          className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 ${variant.iconWrap}`}
        >
          <Icon className="w-4 h-4" />
        </span>
        <p className="text-xs sm:text-[13px] font-semibold text-slate-800 flex-1 leading-snug">
          {toast.message}
        </p>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close notification"
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
