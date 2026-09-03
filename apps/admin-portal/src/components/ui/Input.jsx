'use client';

import React from 'react';

export default function Input({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  readOnly = false,
  disabled = false,
  error,
  helperText,
  icon: Icon = null,
  className = '',
  ...props
}) {
  return (
    <div className="space-y-1 text-xs">
      {label && (
        <label className="block text-slate-700 font-semibold">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3 text-slate-400 pointer-events-none">
            <Icon className="w-3.5 h-3.5" />
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          readOnly={readOnly}
          disabled={disabled}
          className={`w-full py-1.5 rounded-md border text-xs text-slate-900 placeholder-slate-400 transition-all focus:outline-none ${
            Icon ? 'pl-8 pr-3' : 'px-3'
          } ${
            readOnly || disabled
              ? 'bg-slate-100 border-[#E2E8F0] text-slate-500 cursor-not-allowed'
              : error
              ? 'bg-rose-50/40 border-rose-300 focus:border-rose-500'
              : 'bg-[#F8FAFC] border-[#E2E8F0] focus:border-[#1E40AF] focus:bg-white'
          } ${className}`}
          {...props}
        />
      </div>
      {error && <p className="text-[11px] text-rose-600 font-medium">{error}</p>}
      {helperText && !error && <p className="text-[10px] text-slate-400">{helperText}</p>}
    </div>
  );
}
