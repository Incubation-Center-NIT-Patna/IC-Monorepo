'use client';

import React from 'react';
import { AlertCircle, X } from '@/components/icons';
import Button from './Button';

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmText = 'Delete',
  confirmVariant = 'danger',
  isLoading = false,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-sm rounded-xl bg-white border border-[#E2E8F0] p-5 shadow-xl space-y-4 animate-in zoom-in-95 font-sans">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
          <div className="flex items-center gap-2 text-rose-600 font-bold text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>{title}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">{message}</p>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E2E8F0]">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant={confirmVariant}
            size="sm"
            isLoading={isLoading}
            onClick={onConfirm}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}
