'use client';

import React from "react";

/**
 * AppPageLayout
 * 
 * Reusable layout wrapper for all pages inside the admin shell.
 * Handles:
 *  - Top spacing (clears 52px fixed navbar)
 *  - Bottom spacing (clears 60px fixed footer + iOS safe area)
 *  - Responsive horizontal padding
 *  - Max-width constraint & centering for tablet/desktop
 */
export default function AppPageLayout({ children, className = "" }) {
  return (
    <div
      className={`
        w-full min-h-screen bg-[#020817] text-white
        pt-[72px] /* 52px navbar + 20px top margin */
        px-4 md:px-8 lg:px-12
        ${className}
      `}
      style={{
        // 60px footer + 20px margin + iOS safe area
        paddingBottom: "max(80px, calc(60px + env(safe-area-inset-bottom, 20px)))",
      }}
    >
      {/* 
        Responsive Container:
        - Mobile (<768px): full width
        - Tablet (768px+): max-w-2xl
        - Desktop (1024px+): max-w-5xl 
      */}
      <div className="mx-auto w-full max-w-xl md:max-w-2xl lg:max-w-5xl flex flex-col items-center">
        {children}
      </div>
    </div>
  );
}
