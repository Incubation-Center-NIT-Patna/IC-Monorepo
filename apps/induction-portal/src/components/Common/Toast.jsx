"use client";

import { useEffect } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

const variants = {
  success: {
    icon: CheckCircle2,
    iconColor: "text-emerald-400",
  },
  error: {
    icon: AlertCircle,
    iconColor: "text-red-400",
  },
  info: {
    icon: Info,
    iconColor: "text-cyan-400",
  },
};

export default function Toast({ toast, onClose, duration = 3000 }) {
  useEffect(() => {
    if (!toast?.message) return;

    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [toast, duration, onClose]);

  if (!toast?.message) return null;

  const { icon: Icon, iconColor } =
    variants[toast.type] || variants.info;

  return (
    <div className="pointer-events-none" style={{ position: "fixed", top: "1rem", right: "1rem", zIndex: 9999 }}>
      <div 
        className="pointer-events-auto flex items-start gap-3 max-w-sm rounded-2xl border border-white/10 bg-slate-900/95 backdrop-blur-md px-4 py-3"
        style={{
          boxShadow: "0 8px 30px rgba(0, 0, 0, 0.25)"
        }}
      >
        <Icon size={20} className={`mt-0.5 shrink-0 ${iconColor}`} />

        <div className="flex-1">
          <p className="text-sm font-medium text-white">
            {toast.message}
          </p>
        </div>

        <button
          onClick={onClose}
          className="text-slate-400 transition-colors hover:text-white"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}