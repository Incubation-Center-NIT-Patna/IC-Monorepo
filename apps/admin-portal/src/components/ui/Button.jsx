'use client';

import React from 'react';
import { Loader2 } from '@/components/icons';

const VARIANTS = {
  primary: 'bg-[#1E40AF] hover:bg-[#1E3A8A] text-white shadow-xs',
  emerald: 'bg-[#00a884] hover:bg-[#008f6f] text-white shadow-xs',
  secondary: 'bg-[#F8FAFC] hover:bg-slate-200/80 text-slate-700 border border-[#E2E8F0]',
  outline: 'bg-white hover:bg-slate-50 text-slate-700 border border-[#E2E8F0] shadow-2xs',
  danger: 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs',
  ghost: 'bg-transparent hover:bg-slate-100 text-slate-600',
};

const SIZES = {
  xs: 'px-2.5 py-1 text-[11px]',
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-xs',
  lg: 'px-5 py-2.5 text-sm',
};

export default function Button({
  children,
  type = 'button',
  variant = 'primary',
  size = 'sm',
  isLoading = false,
  isDisabled = false,
  icon: Icon = null,
  iconRight: IconRight = null,
  className = '',
  onClick,
  ...props
}) {
  const baseVariant = VARIANTS[variant] || VARIANTS.primary;
  const baseSize = SIZES[size] || SIZES.sm;

  return (
    <button
      type={type}
      disabled={isDisabled || isLoading}
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-1.5 font-semibold rounded-md transition-all cursor-pointer active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ${baseVariant} ${baseSize} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : Icon ? (
        <Icon className="w-3.5 h-3.5 shrink-0" />
      ) : null}
      {children && <span>{children}</span>}
      {!isLoading && IconRight && <IconRight className="w-3.5 h-3.5 shrink-0" />}
    </button>
  );
}
