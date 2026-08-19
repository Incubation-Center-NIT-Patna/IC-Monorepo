'use client';

import React from 'react';
import { motion } from 'motion/react';

export default function GalleryLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen w-full bg-[#000000] opacity-95 bg-[radial-gradient(#142850_1px,#000000_1px)] [background-size:16px_16px] text-white font-['Poppins',sans-serif] select-none">
      <header className="w-full pt-22 sm:pt-24 pb-1 text-center bg-transparent shrink-0">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-wider"
        >
          ALL EVENT <span className="text-[#0ef]">PHOTOS</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="text-sm sm:text-base text-white/70 max-w-[650px] mx-auto mt-1.5 px-4 leading-relaxed"
        >
          Capturing moments of innovation, workshops, pitch sessions, and celebrations at the NIT Patna Incubation Center.
        </motion.p>
      </header>

      <main className="flex-grow w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-1 pb-10">
        {children}
      </main>
    </div>
  );
}