'use client';

import React from 'react';

export default function Loader({
  size = 'default',
  text = 'Loading...',
  fullPage = false,
  showLogo = true,
  className = '',
}) {
  if (fullPage) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#F4F5F7]/95 backdrop-blur-md transition-all font-sans">
        <div className="flex flex-col items-center space-y-4 text-center animate-in fade-in zoom-in-95 duration-300">
          {/* Outer Ring & Pulsing IC Logo */}
          <div className="relative flex items-center justify-center w-24 h-24">
            {/* Outer Primary Blue Spinning Ring */}
            <div className="absolute inset-0 rounded-full border-4 border-[#1E40AF]/15 border-t-[#1E40AF] border-r-[#1E40AF] animate-spin" />
            
            {/* Inner Counter-Spinning Cyan Accent Ring */}
            <div className="absolute inset-1 rounded-full border-2 border-transparent border-b-[#0284C7] animate-spin opacity-70" />
            
            {/* Center Logo */}
            {showLogo && (
              <div className="relative w-12 h-12 bg-white rounded-full p-1.5 shadow-md flex items-center justify-center border border-slate-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/ic_logo.webp"
                  alt="IC Logo"
                  className="w-full h-full object-contain animate-pulse"
                />
              </div>
            )}
          </div>

          {/* Title & Subtitle */}
          <div className="space-y-1">
            <h3 className="text-sm font-bold tracking-wider text-slate-900 uppercase">
              Incubation Center
            </h3>
            <p className="text-xs font-bold text-[#1E40AF] tracking-widest uppercase">
              NIT Patna
            </p>
            {text && (
              <p className="text-[11px] font-medium text-slate-500 pt-1 animate-pulse">
                {text}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Medium / Big Inline Card Loader
  const sizeMap = {
    sm: 'w-6 h-6 border-2',
    default: 'w-10 h-10 border-3',
    lg: 'w-16 h-16 border-4',
    xl: 'w-20 h-20 border-4',
  };

  const ringSize = sizeMap[size] || sizeMap.default;

  return (
    <div className={`flex flex-col items-center justify-center p-6 gap-3 ${className}`}>
      <div className="relative flex items-center justify-center">
        <div
          className={`${ringSize} rounded-full border-[#1E40AF]/20 border-t-[#1E40AF] border-r-[#1E40AF] animate-spin`}
        />
        {showLogo && size !== 'sm' && (
          <div className="absolute inset-0 flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/ic_logo.webp" alt="Logo" className="w-5 h-5 object-contain animate-pulse" />
          </div>
        )}
      </div>
      {text && (
        <span className="text-xs font-semibold text-slate-600 animate-pulse tracking-wide">
          {text}
        </span>
      )}
    </div>
  );
}
