'use client';

import React from 'react';

const VARIANTS = {
  blue: 'bg-blue-50 text-[#1E40AF] border-blue-200 dot-blue-600',
  emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200 dot-emerald-600',
  purple: 'bg-purple-50 text-purple-700 border-purple-200 dot-purple-600',
  amber: 'bg-amber-50 text-amber-700 border-amber-200 dot-amber-600',
  rose: 'bg-rose-50 text-rose-700 border-rose-200 dot-rose-600',
  slate: 'bg-slate-100 text-slate-700 border-slate-200 dot-slate-500',
};

const DOT_COLORS = {
  blue: 'bg-[#1E40AF]',
  emerald: 'bg-emerald-600',
  purple: 'bg-purple-600',
  amber: 'bg-amber-600',
  rose: 'bg-rose-600',
  slate: 'bg-slate-500',
};

export default function Badge({
  children,
  variant = 'blue',
  showDot = false,
  className = '',
  icon: Icon = null,
}) {
  const baseVariant = VARIANTS[variant] || VARIANTS.blue;
  const dotColor = DOT_COLORS[variant] || DOT_COLORS.blue;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-[10px] font-semibold border ${baseVariant} ${className}`}
    >
      {showDot && <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />}
      {Icon && <Icon className="w-3 h-3 shrink-0" />}
      <span>{children}</span>
    </span>
  );
}
