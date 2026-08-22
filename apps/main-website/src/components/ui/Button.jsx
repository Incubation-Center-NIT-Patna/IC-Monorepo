'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';

const MotionLink = motion.create(Link);

export default function Button({
  variant = 'primary',
  size = 'md',
  href,
  isExternal = false,
  isLoading = false,
  children,
  className = '',
  onClick,
  ...props
}) {
  const sizeClasses = {
    sm: 'px-4 py-2 text-xs font-semibold',
    md: 'px-6 py-3 text-[0.95rem] font-bold',
    lg: 'px-8 py-3.5 text-base font-bold',
  };

  const variantClasses = {
    primary:
      'primary-button',
    outline:
      'inline-flex items-center justify-center rounded-full border border-[#0ef] bg-transparent text-[#0ef] transition-all duration-300 hover:bg-[#0ef] hover:text-[#0b111e]',
    glass:
      'inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 text-white backdrop-blur-md transition-all duration-300 hover:bg-white/15 hover:border-white/30',
    ghost:
      'inline-flex items-center justify-center text-white/80 transition-colors hover:text-[#0ef]',
  };

  const combinedClasses = `cursor-pointer select-none transition-all duration-200 ${sizeClasses[size] || sizeClasses.md} ${
    variantClasses[variant] || variantClasses.primary
  } ${className}`;

  if (href) {
    if (isExternal) {
      return (
        <motion.a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          suppressHydrationWarning
          className={combinedClasses}
          {...props}
        >
          {children}
        </motion.a>
      );
    }
    return (
      <MotionLink
        href={href}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        suppressHydrationWarning
        className={combinedClasses}
        {...props}
      >
        {children}
      </MotionLink>
    );
  }

  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      disabled={isLoading || props.disabled}
      suppressHydrationWarning
      className={`${combinedClasses} ${props.disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          <span>Loading...</span>
        </span>
      ) : (
        children
      )}
    </motion.button>
  );
}
