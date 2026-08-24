'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Home, ArrowLeft, ShieldAlert } from '@/components/icons';

export default function NotFound() {
  return (
    <div
      className="min-h-screen text-slate-900 flex flex-col items-center justify-center p-4 sm:p-6 antialiased relative overflow-hidden"
      style={{ backgroundColor: 'var(--bg-main)' }}
    >
      {/* Ambient background blur glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xl text-center space-y-6 relative z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Institutional Logo & 404 Ring */}
        <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-2 border-dashed border-[#1E40AF]/40 animate-spin-slow" />
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 flex items-center justify-center shadow-inner">
            <Image
              src="/ic_logo.webp"
              alt="Incubation Center NIT Patna Logo"
              width={40}
              height={40}
              className="object-contain"
              priority
            />
          </div>
          <span className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full bg-[#1E40AF] text-white font-extrabold text-[10px] shadow-sm">
            404
          </span>
        </div>

        {/* Text Details */}
        <div className="space-y-2">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Page Not Found
          </h1>
          <p className="text-xs text-slate-600 leading-relaxed max-w-xs mx-auto font-medium">
            The administrative section or resource you requested could not be located or may have been moved.
          </p>
        </div>

        {/* Quick Action Navigation Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-1">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#1E40AF] hover:bg-[#1E3A8A] text-white font-bold text-xs shadow-md shadow-blue-900/10 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
          >
            <Home className="w-4 h-4" />
            <span>Dashboard</span>
          </Link>

          <button
            type="button"
            onClick={() => window.history.back()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-xs transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
          >
            <ArrowLeft className="w-4 h-4 text-slate-500" />
            <span>Go Back</span>
          </button>
        </div>

        {/* Institutional Footer Copyright Notice */}
        <div className="pt-4 border-t border-slate-100 text-[11px] font-semibold text-slate-400">
          © 2026 Incubation Center, NIT Patna. All rights reserved.
        </div>
      </div>
    </div>
  );
}
