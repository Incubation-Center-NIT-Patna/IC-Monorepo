'use client';

import React from 'react';

export default function Badge({
  variant = 'cyan',
  children,
  className = '',
}) {
  const variantStyles = {
    cyan: 'bg-[#0ef]/10 text-[#0ef] border-[#0ef]/30',
    purple: 'bg-purple-500/10 text-purple-300 border-purple-500/30',
    amber: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
    emerald: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
    rose: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
  };

  return (
    <span
      className={`inline-flex items-center text-[0.75rem] font-semibold uppercase tracking-wider px-3 py-1 rounded-full border ${
        variantStyles[variant] || variantStyles.cyan
      } ${className}`}
    >
      {children}
    </span>
  );
}
