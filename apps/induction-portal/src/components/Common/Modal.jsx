"use client";

import { useEffect, useId } from "react";
import { X } from "lucide-react";

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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-3 py-6"
      onClick={onClose}
    >
      <div
        className={`w-full ${maxWidth} rounded-2xl border border-white/10 bg-[#05070c] p-4 text-white shadow-2xl sm:p-6`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 id={titleId} className="text-lg font-semibold text-white">
            {title}
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-lg border border-white/10 bg-red-600/50 p-2 text-slate-300 transition hover:bg-red-600/30"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}