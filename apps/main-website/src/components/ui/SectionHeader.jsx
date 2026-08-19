'use client';

import React from 'react';
import { motion } from 'motion/react';

export default function SectionHeader({
  title,
  accentWord,
  subtitle,
  align = 'center',
  className = '',
}) {
  const alignmentClass =
    align === 'left'
      ? 'text-left items-start'
      : align === 'right'
      ? 'text-right items-end'
      : 'text-center items-center';

  const renderTitle = () => {
    if (!accentWord || !title.includes(accentWord)) {
      return title;
    }
    const parts = title.split(accentWord);
    return (
      <>
        {parts[0]}
        <span className="text-[#0ef]">{accentWord}</span>
        {parts.slice(1).join(accentWord)}
      </>
    );
  };

  return (
    <div className={`site-container flex flex-col ${alignmentClass} mb-10 sm:mb-12 ${className}`}>
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.2 }}
        transition={{ duration: 0.6 }}
        className="section-title mb-3"
      >
        {renderTitle()}
      </motion.h2>

      {subtitle && (
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="section-copy max-w-[760px]"
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  );
}
