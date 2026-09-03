"use client";

import { useEffect, useId } from "react";
import { X } from '@/components/icons';

export default function Modal({ isOpen, title, onClose, children, maxWidth = "max-w-2xl" }) {
  const titleId = useId();

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose?.();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs px-3 py-6 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className={`w-full ${maxWidth} rounded-md border border-[#E2E8F0] bg-white p-5 text-[#0F172A] shadow-xl sm:p-6 animate-in zoom-in-95`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between gap-4 border-b border-[#E2E8F0] pb-3">
          <h2 id={titleId} className="text-base font-bold text-[#0F172A]">
            {title}
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-md border border-slate-200 bg-slate-50 p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            aria-label="Close modal"
          >
            <X size={16} />
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}