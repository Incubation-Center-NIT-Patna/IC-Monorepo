'use client';

import React from 'react';
import { motion } from 'motion/react';

export default function GlassCard({
  children,
  className = '',
  hoverEffect = true,
  animationProps = {},
  onClick,
  ...props
}) {
  const defaultAnimation = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: false, amount: 0.2 },
    transition: { duration: 0.5, ease: 'easeOut' },
  };

  const hoverMotion = hoverEffect
    ? {
        whileHover: { y: -4, transition: { duration: 0.2 } },
      }
    : {};

  return (
    <motion.div
      {...defaultAnimation}
      {...hoverMotion}
      {...animationProps}
      onClick={onClick}
      className={`glass-panel rounded-xl transition-colors duration-300 ${
        hoverEffect ? 'hover:border-[#0ef]/40' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}
