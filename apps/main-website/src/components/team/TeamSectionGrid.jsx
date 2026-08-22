'use client';

import React from 'react';
import { motion } from 'motion/react';

export default function TeamSectionGrid({
  title,
  isPast = false,
  children,
  className = '',
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className={`mb-16 flex flex-col items-center text-center ${className}`}
    >
      <div className="flex items-center justify-center gap-4 mb-8 w-full max-w-[800px] px-4">
        <div className={`h-[1px] flex-1 bg-gradient-to-r from-transparent ${isPast ? 'to-purple-400/40' : 'to-[#0ef]/40'}`} />
        <span className="text-base sm:text-lg font-bold tracking-wider uppercase text-white shrink-0">
          {title}
        </span>
        <div className={`h-[1px] flex-1 bg-gradient-to-l from-transparent ${isPast ? 'to-purple-400/40' : 'to-[#0ef]/40'}`} />
      </div>

      <div className="flex flex-wrap justify-center gap-6 sm:gap-8 w-full max-w-[1240px]">
        {children}
      </div>
    </motion.div>
  );
}
