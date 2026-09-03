'use client';

import React from 'react';

export default function Select({
  label,
  value,
  onChange,
  options = [],
  required = false,
  disabled = false,
  error,
  helperText,
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
      <select
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className={`w-full px-3 py-1.5 rounded-md border text-xs text-slate-900 focus:outline-none transition-all ${
          disabled
            ? 'bg-slate-100 border-[#E2E8F0] text-slate-500 cursor-not-allowed'
            : error
            ? 'bg-rose-50/40 border-rose-300 focus:border-rose-500'
            : 'bg-[#F8FAFC] border-[#E2E8F0] focus:border-[#1E40AF] focus:bg-white'
        } ${className}`}
        {...props}
      >
        {options.map((opt) => {
          const val = typeof opt === 'object' ? opt.value : opt;
          const lbl = typeof opt === 'object' ? opt.label : opt;
          return (
            <option key={val} value={val}>
              {lbl}
            </option>
          );
        })}
      </select>
      {error && <p className="text-[11px] text-rose-600 font-medium">{error}</p>}
      {helperText && !error && <p className="text-[10px] text-slate-400">{helperText}</p>}
    </div>
  );
}
