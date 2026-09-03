'use client';

import React from 'react';

export default function GlobalError({ error, reset }) {
  return (
    <html lang="en">
      <body
        className="min-h-screen text-slate-900 flex items-center justify-center p-4 antialiased font-sans"
        style={{ backgroundColor: '#e6ffff' }}
      >
        <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xl text-center space-y-5">
          <div className="mx-auto w-16 h-16 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 font-extrabold text-2xl shadow-inner">
            !
          </div>

          <div className="space-y-1.5">
            <h1 className="text-xl font-black text-slate-900">
              Critical Portal Error
            </h1>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              A unrecoverable system exception occurred. Click below to reload the workspace session.
            </p>
            {error?.message && (
              <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] font-mono text-slate-700 text-left overflow-x-auto max-h-24">
                {error.message}
              </div>
            )}
          </div>

          <div className="pt-2">
            <button
              onClick={() => reset()}
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-[#1E40AF] hover:bg-[#1E3A8A] text-white font-bold text-xs shadow-md transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              Reload Portal Session
            </button>
          </div>

          <div className="pt-4 border-t border-slate-100 text-[11px] font-semibold text-slate-400">
            © 2026 Incubation Center, NIT Patna. All rights reserved.
          </div>
        </div>
      </body>
    </html>
  );
}
