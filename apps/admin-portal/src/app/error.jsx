'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { RotateCcw, Home, AlertCircle } from '@/components/icons';

export default function GlobalRouteError({ error, reset }) {
  useEffect(() => {
    console.error('Portal Application Error:', error);
  }, [error]);

  return (
    <div
      className="min-h-screen text-slate-900 flex flex-col items-center justify-center p-4 sm:p-6 antialiased relative overflow-hidden"
      style={{ backgroundColor: 'var(--bg-main)' }}
    >
      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-rose-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xl text-center space-y-5 relative z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Error Badge */}
        <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center shadow-inner text-rose-600">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div className="absolute -bottom-1 -right-1 p-1 bg-white rounded-full border border-slate-200 shadow-xs">
            <Image
              src="/ic_logo.webp"
              alt="Incubation Center NIT Patna Logo"
              width={20}
              height={20}
              className="object-contain"
            />
          </div>
        </div>

        {/* Text Header */}
        <div className="space-y-1.5">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Something Went Wrong
          </h1>
          <p className="text-xs text-slate-600 leading-relaxed max-w-xs mx-auto font-medium">
            An unexpected error occurred while rendering this section. You can retry the operation or navigate back to the dashboard.
          </p>

          {error?.message && (
            <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] font-mono text-slate-700 text-left overflow-x-auto max-h-28 leading-relaxed">
              <span className="font-bold text-rose-600 block mb-0.5 font-sans">Error Trace:</span>
              {error.message}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-1">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#1E40AF] hover:bg-[#1E3A8A] text-white font-bold text-xs shadow-md shadow-blue-900/10 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Try Again</span>
          </button>

          <Link
            href="/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-xs transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
          >
            <Home className="w-4 h-4 text-slate-500" />
            <span>Dashboard</span>
          </Link>
        </div>

        {/* Footer Note */}
        <div className="pt-4 border-t border-slate-100 text-[11px] font-semibold text-slate-400">
          © 2026 Incubation Center, NIT Patna. All rights reserved.
        </div>
      </div>
    </div>
  );
}
