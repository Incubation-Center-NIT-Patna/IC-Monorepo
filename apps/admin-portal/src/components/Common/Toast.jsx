"use client";

import React, { useEffect } from "react";
import { CheckCircle2, AlertCircle, Info } from "@/components/icons";

const variants = {
  success: {
    icon: CheckCircle2,
    iconColor: "text-emerald-600",
    bgColor: "bg-white border-emerald-300 text-gray-900 shadow-xl",
  },
  error: {
    icon: AlertCircle,
    iconColor: "text-rose-600",
    bgColor: "bg-white border-rose-300 text-gray-900 shadow-xl",
  },
  info: {
    icon: Info,
    iconColor: "text-[#1F3BB3]",
    bgColor: "bg-white border-[#1F3BB3]/30 text-gray-900 shadow-xl",
  },
};

/**
 * Toast Notification
 * Centered at bottom, no close button, auto-hides in 2 seconds by default.
 */
export default function Toast({ toast, onClose, duration = 2000 }) {
  useEffect(() => {
    if (!toast?.message) return;

    const timer = setTimeout(() => {
      if (onClose) onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [toast?.message, duration, onClose]);

  if (!toast?.message) return null;

  const { icon: Icon, iconColor, bgColor } =
    variants[toast.type] || variants.info;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] pointer-events-none transition-all">
      <div
        role="alert"
        className={`pointer-events-auto flex items-center gap-3 px-4 py-2.5 rounded-md border ${bgColor} shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-200 min-w-[260px] max-w-md`}
      >
        <Icon size={16} className={`shrink-0 ${iconColor}`} />
        <p className="text-xs sm:text-sm font-semibold text-slate-900 flex-1">
          {toast.message}
        </p>
      </div>
    </div>
  );
}